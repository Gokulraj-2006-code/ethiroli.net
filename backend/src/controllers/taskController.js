import crypto from 'crypto';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';
import pool from '../config/database.js';
import { broadcastToUser } from '../services/socketService.js';
import { createNotification } from './notificationController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors.js';
import { assertManagerTargetInScope } from './organizationController.js';
import { canEmployeeTransition, canManagerTransition } from '../services/taskWorkflow.js';
import { getProject, assertProjectAccess, assertProjectManager, logProjectActivity, recomputeProjectProgress } from '../services/companyProjectService.js';
import { notifyOversight } from '../services/notificationTargets.js';

const ALLOWED_STATUSES = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED'];
const isAdmin = (user) => ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
const isWorker = (user) => ['EMPLOYEE', 'INTERN'].includes(user?.role);

const findTask = async (id, connection = pool) => {
  const [rows] = await connection.execute('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

/**
 * Task access follows the real project assignment. A Manager can act only on
 * their own projects (or legacy in-scope assignments); an employee can only see
 * work assigned to them.
 */
export const assertTaskAccess = async (user, task, { write = false } = {}) => {
  if (!task) throw new NotFoundError('Task not found');
  if (isAdmin(user)) return true;
  if (isWorker(user)) {
    if (task.assigned_to !== user.id) throw new AuthorizationError('You are not assigned to this task.');
    return true;
  }
  if (task.project_id) {
    const project = await getProject(task.project_id);
    await assertProjectAccess(user, project, { write });
    if (user.role === 'PROJECT_MANAGER' && write) assertProjectManager(user, project);
    return true;
  }
  if (user.role === 'PROJECT_MANAGER') {
    if (!task.assigned_to) throw new AuthorizationError('This task is not in your scope.');
    await assertManagerTargetInScope(user.id, task.assigned_to);
    return true;
  }
  throw new AuthorizationError('Your role cannot access this task.');
};

const reviewRecipients = async (task, actorId, connection = pool) => {
  const recipients = new Set();
  if (task.assigned_to && task.assigned_to !== actorId) recipients.add(task.assigned_to);
  if (task.project_id) {
    const project = await getProject(task.project_id, connection);
    if (project?.manager_id && project.manager_id !== actorId) recipients.add(project.manager_id);
  }
  if (task.created_by && task.created_by !== actorId) recipients.add(task.created_by);
  return [...recipients];
};

const notifyManagerOfSubmission = async (task, actor) => {
  const actionUrl = task.id ? `/app/manager/tasks/${task.id}` : null;
  let recipients = [];
  if (task.project_id) {
    const project = await getProject(task.project_id);
    if (project?.manager_id) recipients = [project.manager_id];
  }
  if (!recipients.length && task.created_by) {
    const [rows] = await pool.execute('SELECT role FROM users WHERE id = ? LIMIT 1', [task.created_by]);
    if (rows[0]?.role === 'PROJECT_MANAGER') recipients = [task.created_by];
  }
  if (!recipients.length) {
    const [managerRows] = await pool.execute("SELECT id FROM users WHERE role = 'PROJECT_MANAGER' AND is_active = 1");
    recipients = managerRows.map((r) => r.id);
  }
  for (const recipient of recipients) {
    if (recipient === actor.id) continue;
    await createNotification(
      recipient, 'TASK_SUBMITTED', 'Task submitted for review',
      `${actor.full_name || 'A team member'} submitted “${task.description}” for review.`,
      'TASK', task.id,
      { senderUserId: actor.id, actionUrl, projectId: task.project_id, taskId: task.id }
    );
  }
  await notifyOversight(createNotification, {
    type: 'TASK_SUBMITTED',
    title: 'Task awaiting manager review',
    message: `“${task.description}” has been submitted for review.`,
    entityType: 'TASK',
    entityId: task.id,
    senderUserId: actor.id,
    actionUrl,
    projectId: task.project_id,
    taskId: task.id,
    excludeUserId: actor.id
  });
};

const writeHistory = async (connection, taskId, actorId, eventType, from, to, note) => {
  await connection.execute(
    `INSERT INTO task_history (task_id, actor_user_id, event_type, from_status, to_status, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [taskId, actorId, eventType, from, to, note || null]
  );
};

const postTransition = async (task, previousStatus, nextStatus, actor) => {
  if (task.project_id) {
    await recomputeProjectProgress(task.project_id);
    await logProjectActivity(
      task.project_id, actor.id,
      nextStatus === 'COMPLETED' ? 'TASK_COMPLETED' : nextStatus === 'UNDER_REVIEW' ? 'TASK_SUBMITTED' : 'TASK_STATUS_CHANGED',
      `Task “${task.description}” moved from ${previousStatus} to ${nextStatus}.`,
      { taskId: task.id }
    );
  }
  await AuditLog.create({
    user_id: actor.id,
    action: 'UPDATE_TASK_STATUS',
    entity_type: 'TASK',
    entity_id: task.id,
    old_value: { status: previousStatus },
    new_value: { status: nextStatus },
    ip_address: actor.ip || actor.headers?.['x-forwarded-for'] || 'unknown',
    user_agent: actor.headers?.['user-agent']
  });
};

export const listTasks = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let rows;
  if (isAdmin(req.user)) {
    rows = await Task.list({ assigned_to: req.query.assigned_to, subscription_id: req.query.subscription_id, limit: 500 });
  } else if (isWorker(req.user)) {
    rows = await Task.list({ assigned_to: req.user.id, status: req.query.status, limit: 500 });
  } else if (role === 'PROJECT_MANAGER') {
    [rows] = await pool.execute(
      `SELECT DISTINCT t.* FROM tasks t
         LEFT JOIN manager_scopes s ON s.manager_user_id = ?
         LEFT JOIN employees e ON e.user_id = t.assigned_to
         LEFT JOIN interns i ON i.user_id = t.assigned_to
         LEFT JOIN student_projects p ON p.id = t.project_id
        WHERE (p.manager_id = ?
              OR (t.assigned_to IS NOT NULL
                  AND COALESCE(e.branch_id, i.branch_id) = s.branch_id
                  AND (s.department_id IS NULL OR COALESCE(e.department_id, i.department_id) = s.department_id)))
        ORDER BY t.due_date ASC LIMIT 500`,
      [req.user.id, req.user.id]
    );
  } else {
    rows = [];
  }
  if (req.query.status && role !== 'PROJECT_MANAGER' && !isWorker(req.user)) {
    rows = rows.filter((task) => task.status === req.query.status);
  }
  return success(res, 200, rows);
});

export const createTask = asyncHandler(async (req, res) => {
  const description = String(req.body.description || '').trim();
  if (!description) throw new ValidationError('A task description is required.');
  if (!req.body.due_date) throw new ValidationError('A due date is required.');
  const assignedTo = req.body.assigned_to || null;
  if (!assignedTo) throw new ValidationError('A team member must be assigned');

  let project = null;
  if (req.body.project_id) {
    project = await getProject(req.body.project_id);
    await assertTaskAccess(req.user, { project_id: project?.id, assigned_to: assignedTo }, { write: true });
  } else if (req.user.role === 'PROJECT_MANAGER') {
    await assertManagerTargetInScope(req.user.id, assignedTo);
  }
  if (req.user.role === 'SALES') throw new AuthorizationError('Sales cannot create delivery tasks.');
  if (req.body.due_date) {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    if (req.body.due_date < todayStr) throw new ValidationError('Due date cannot be in the past');
  }
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO tasks
       (id, description, due_date, status, assigned_to, project_id, task_list_id, priority, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, description, String(req.body.due_date).slice(0, 10),
      ALLOWED_STATUSES.includes(req.body.status) ? req.body.status : 'PENDING',
      assignedTo, project?.id || null, req.body.task_list_id || null,
      String(req.body.priority || 'MEDIUM').toUpperCase(), req.user.id
    ]
  );
  await writeHistory(pool, id, req.user.id, 'TASK_CREATED', null, 'PENDING', assignedTo);
  await AuditLog.create({
    user_id: req.user.id,
    action: 'CREATE_TASK',
    entity_type: 'TASK',
    entity_id: id,
    new_value: req.body,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  broadcastToUser(assignedTo, 'task_assigned', { id, description });
  await createNotification(
    assignedTo, 'TASK_ASSIGNED', 'New task assigned', `A new task has been assigned to you: ${description}`,
    'TASK', id,
    { senderUserId: req.user.id, actionUrl: `/app/employee/tasks/${id}`, projectId: project?.id || null, taskId: id }
  );
  if (project) {
    await logProjectActivity(project.id, req.user.id, 'TASK_CREATED', `Task created: ${description}`, { taskId: id });
  }
  return success(res, 201, { id }, 'Task created successfully');
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task);
  return success(res, 200, task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task, { write: true });
  if (isWorker(req.user)) throw new ValidationError('Use the employee task workflow to update assigned work');
  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    throw new ValidationError('Use the review workflow to change task status');
  }
  const parts = [];
  const values = [];
  for (const field of ['description', 'due_date', 'assigned_to', 'priority', 'project_id', 'task_list_id']) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      parts.push(`${field} = ?`);
      values.push(req.body[field] || null);
    }
  }
  if (!parts.length) throw new ValidationError('No changes supplied.');
  values.push(req.params.id);
  await pool.execute(`UPDATE tasks SET ${parts.join(', ')} WHERE id = ?`, values);
  if (req.body.assigned_to && req.body.assigned_to !== task.assigned_to) {
    await writeHistory(pool, req.params.id, req.user.id, 'TASK_REASSIGNED', null, null, `${task.assigned_to || 'unassigned'} -> ${req.body.assigned_to}`);
    await createNotification(
      req.body.assigned_to, 'TASK_ASSIGNED', 'Task reassigned to you', `You were assigned: ${req.body.description || task.description}`,
      'TASK', task.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/tasks/${task.id}`, projectId: task.project_id, taskId: task.id }
    );
  }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'UPDATE_TASK',
    entity_type: 'TASK',
    entity_id: req.params.id,
    old_value: task,
    new_value: req.body,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  return success(res, 200, null, 'Task updated');
});

export const bulkUpdateTasks = asyncHandler(async (req, res) => {
  if (req.user.role === 'PROJECT_MANAGER') throw new ValidationError('Bulk task updates are disabled; use the scoped review workflow');
  const { ids, updates } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) throw new ValidationError('No task ids provided for bulk update');
  const updated = [];
  for (const id of ids) {
    const task = await findTask(id);
    if (!task) continue;
    await pool.execute('UPDATE tasks SET description = ?, due_date = ?, priority = ? WHERE id = ?', [
      updates.description || task.description,
      updates.due_date || task.due_date,
      updates.priority || task.priority,
      id
    ]);
    updated.push(id);
  }
  return success(res, 200, { updated }, 'Tasks updated');
});

/**
 * Shared status patch. It preserves the existing Employee/Manager UI calls
 * while enforcing the real review lifecycle and persisting review feedback.
 */
export const updateTaskStatusCore = async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task, { write: true });
  const status = String(req.body.status || '').toUpperCase();
  if (!ALLOWED_STATUSES.includes(status)) throw new ValidationError('Invalid task status');
  if (status === task.status) return success(res, 200, { id: task.id, status }, 'Task status unchanged');

  const note = String(req.body.review_note || req.body.note || req.body.completion_note || '').trim() || null;
  const appreciation = String(req.body.appreciation || '').trim() || null;
  const submissionNote = String(req.body.submission_note || req.body.completion_note || '').trim() || null;
  let setSql = 'status = ?';
  let setValues = [status];
  let eventType = isWorker(req.user) ? 'EMPLOYEE_UPDATE' : 'MANAGER_REVIEW';
  let recipients = [];

  if (isWorker(req.user)) {
    if (task.assigned_to !== req.user.id) throw new AuthorizationError('You are not assigned to this task');
    if (!canEmployeeTransition(task.status, status)) throw new ValidationError('That task transition is not allowed');
    if (status === 'IN_PROGRESS') {
      setSql += ', started_at = COALESCE(started_at, NOW())';
    }
    if (status === 'UNDER_REVIEW') {
      setSql += ', submitted_at = NOW(), submission_note = ?';
      setValues.push(submissionNote || note);
      await notifyManagerOfSubmission(task, req.user);
    }
  } else {
    if (task.project_id) {
      const project = await getProject(task.project_id);
      assertProjectManager(req.user, project);
    }
    if (!canManagerTransition(task.status, status)) throw new ValidationError('That manager task transition is not allowed');
    if (status === 'COMPLETED') {
      setSql += ', progress_percent = 100, completed_at = NOW(), reviewed_by = ?, reviewed_at = ?, review_note = ?';
      setValues.push(req.user.id, new Date(), [note, appreciation && `Appreciation: ${appreciation}`].filter(Boolean).join(' | ') || null);
      recipients = await reviewRecipients(task, req.user.id);
    } else if (status === 'IN_PROGRESS' && task.status === 'UNDER_REVIEW') {
      setSql += ', rejection_count = rejection_count + 1, last_rejected_at = NOW(), reviewed_by = ?, reviewed_at = ?, review_note = ?';
      setValues.push(req.user.id, new Date(), note || 'Correction requested');
      recipients = await reviewRecipients(task, req.user.id);
    } else if (status === 'IN_PROGRESS' && task.status === 'BLOCKED') {
      setSql += ', reviewed_by = ?, reviewed_at = ?, review_note = ?';
      setValues.push(req.user.id, new Date(), note);
      recipients = await reviewRecipients(task, req.user.id);
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(`UPDATE tasks SET ${setSql} WHERE id = ?`, [...setValues, task.id]);
    await writeHistory(
      connection, task.id, req.user.id, eventType, task.status, status,
      [note, appreciation && `Appreciation: ${appreciation}`].filter(Boolean).join(' | ') || null
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  for (const recipient of recipients) {
    const approved = status === 'COMPLETED';
    await createNotification(
      recipient,
      approved ? 'TASK_APPROVED' : 'TASK_CORRECTION',
      approved ? 'Task approved' : 'Correction requested',
      approved ? `Your task “${task.description}” was approved.` : `Feedback on “${task.description}”: ${note || 'Please revise and resubmit.'}`,
      'TASK', task.id,
      {
        senderUserId: req.user.id,
        actionUrl: `/app/employee/tasks/${task.id}`,
        projectId: task.project_id,
        taskId: task.id
      }
    );
  }
  if (status === 'BLOCKED' || status === 'CANCELLED') {
    const targets = await reviewRecipients(task, req.user.id);
    for (const recipient of targets) {
      await createNotification(
        recipient, `TASK_${status}`, `Task ${status.toLowerCase()}`,
        `“${task.description}” is now ${status.toLowerCase()}.`,
        'TASK', task.id,
        { senderUserId: req.user.id, actionUrl: `/app/employee/tasks/${task.id}`, projectId: task.project_id, taskId: task.id }
      );
    }
  }
  await postTransition(task, task.status, status, req.user);
  return success(res, 200, { id: task.id, status }, 'Task status updated');
};

export const updateTaskStatus = asyncHandler(updateTaskStatusCore);

export const getTaskHistory = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task);
  const [history] = await pool.execute(
    'SELECT id, event_type, from_status, to_status, note, created_at FROM task_history WHERE task_id = ? ORDER BY created_at ASC, id ASC',
    [req.params.id]
  );
  return success(res, 200, history);
});

export const startTask = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task, { write: true });
  if (!isWorker(req.user) || task.assigned_to !== req.user.id) throw new AuthorizationError('Only the assignee can start this task.');
  if (task.status !== 'PENDING') throw new ValidationError('Only pending tasks can be started.');
  req.body.status = 'IN_PROGRESS';
  return updateTaskStatus(req, res);
});

export const updateTaskProgress = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task, { write: true });
  if (!isWorker(req.user) || task.assigned_to !== req.user.id) throw new AuthorizationError('Only the assignee can update progress.');
  if (!['IN_PROGRESS', 'BLOCKED'].includes(task.status)) throw new ValidationError('Progress can only be updated while work is in progress.');
  const progress = Number(req.body.progress_percent);
  if (!Number.isFinite(progress) || progress < 0 || progress > 99) throw new ValidationError('Progress must be between 0 and 99 until a Manager approves the work.');
  const percent = Math.round(progress * 100) / 100;
  await pool.execute('UPDATE tasks SET progress_percent = ?, actual_hours = ? WHERE id = ?', [
    percent, req.body.actual_hours !== undefined ? Number(req.body.actual_hours) || 0 : task.actual_hours, task.id
  ]);
  return success(res, 200, { progress_percent: percent }, 'Progress updated');
});

export const submitTaskForReview = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task, { write: true });
  if (!isWorker(req.user) || task.assigned_to !== req.user.id) throw new AuthorizationError('Only the assignee can submit this task.');
  if (!canEmployeeTransition(task.status, 'UNDER_REVIEW')) throw new ValidationError('This task cannot be submitted for review.');
  const note = String(req.body.submission_note || '').trim() || null;
  await pool.execute(
    `UPDATE tasks SET status = 'UNDER_REVIEW', submitted_at = NOW(), submission_note = ? WHERE id = ?`,
    [note, task.id]
  );
  await writeHistory(pool, task.id, req.user.id, 'TASK_SUBMITTED', task.status, 'UNDER_REVIEW', note);
  await notifyManagerOfSubmission({ ...task, status: 'UNDER_REVIEW' }, req.user);
  await postTransition(task, task.status, 'UNDER_REVIEW', req.user);
  return success(res, 200, { id: task.id, status: 'UNDER_REVIEW' }, 'Task submitted for review');
});

const managerReview = (approve) => asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task, { write: true });
  if (task.status !== 'UNDER_REVIEW') throw new ValidationError('Only submitted tasks can be reviewed.');
  if (task.project_id) {
    const project = await getProject(task.project_id);
    assertProjectManager(req.user, project);
  }
  const note = String(req.body.review_note || req.body.note || '').trim();
  if (!approve && !note) throw new ValidationError('Feedback is required when rejecting a task.');
  const status = approve ? 'COMPLETED' : 'IN_PROGRESS';
  const appreciation = approve ? String(req.body.appreciation || '').trim() : '';
  await pool.execute(
    `UPDATE tasks
        SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = NOW(),
            completed_at = ?, progress_percent = ?,
            rejection_count = rejection_count + ?, last_rejected_at = ?
      WHERE id = ?`,
    [
      status,
      [note, appreciation && `Appreciation: ${appreciation}`].filter(Boolean).join(' | ') || null,
      req.user.id,
      approve ? new Date() : null,
      approve ? 100 : 0,
      approve ? 0 : 1,
      approve ? null : new Date(),
      task.id
    ]
  );
  await writeHistory(pool, task.id, req.user.id, approve ? 'TASK_APPROVED' : 'TASK_REJECTED', 'UNDER_REVIEW', status, note);
  const recipients = await reviewRecipients(task, req.user.id);
  for (const recipient of recipients) {
    await createNotification(
      recipient,
      approve ? 'TASK_APPROVED' : 'TASK_REJECTED',
      approve ? 'Task approved' : 'Task returned for correction',
      approve
        ? `Your task “${task.description}” was approved${note ? `: ${note}` : ''}.`
        : `Feedback on “${task.description}”: ${note}`,
      'TASK', task.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/tasks/${task.id}`, projectId: task.project_id, taskId: task.id }
    );
  }
  await postTransition(task, 'UNDER_REVIEW', status, req.user);
  return success(res, 200, { id: task.id, status }, approve ? 'Task approved' : 'Task returned for correction');
});

export const approveTask = managerReview(true);
export const rejectTask = managerReview(false);

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await findTask(req.params.id);
  await assertTaskAccess(req.user, task, { write: true });
  if (req.user.role === 'PROJECT_MANAGER') throw new ValidationError('Tasks are retained for historical reporting; cancel the task instead');
  await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  await AuditLog.create({
    user_id: req.user.id,
    action: 'DELETE_TASK',
    entity_type: 'TASK',
    entity_id: req.params.id,
    old_value: task,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  return success(res, 200, null, 'Task deleted successfully');
});

export const moveTask = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || req.body.newStatus;
  return updateTaskStatus(req, res);
});

export default {
  listTasks,
  createTask,
  getTask,
  updateTask,
  bulkUpdateTasks,
  updateTaskStatus,
  getTaskHistory,
  deleteTask,
  moveTask,
  startTask,
  updateTaskProgress,
  submitTaskForReview,
  approveTask,
  rejectTask
};
