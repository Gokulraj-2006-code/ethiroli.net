import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';
import { broadcastToUser } from '../services/socketService.js';
import { createNotification } from './notificationController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import pool from '../config/database.js';
import { assertManagerTargetInScope } from './organizationController.js';
import { canEmployeeTransition, canManagerTransition } from '../services/taskWorkflow.js';

export const listTasks = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const assigned_to = role === 'EMPLOYEE' || role === 'INTERN' ? req.user.id : req.query.assigned_to;
  let list;
  if (role === 'PROJECT_MANAGER') {
    const [rows] = await pool.execute(`SELECT t.* FROM tasks t
      JOIN manager_scopes s ON s.manager_user_id = ?
      LEFT JOIN employees e ON e.user_id=t.assigned_to
      LEFT JOIN interns i ON i.user_id=t.assigned_to
      WHERE t.assigned_to IS NOT NULL AND COALESCE(e.branch_id,i.branch_id)=s.branch_id
        AND (s.department_id IS NULL OR COALESCE(e.department_id,i.department_id)=s.department_id)
      ORDER BY t.due_date ASC LIMIT 200`, [req.user.id]);
    list = rows;
  } else {
    list = await Task.list({ assigned_to, subscription_id: req.query.subscription_id });
  }
  return success(res, 200, list);
});

export const createTask = asyncHandler(async (req, res) => {
  if (req.user.role === 'PROJECT_MANAGER') {
    if (!req.body.assigned_to) throw new ValidationError('A team member must be assigned');
    await assertManagerTargetInScope(req.user.id, req.body.assigned_to);
  }
  if (req.body.due_date) {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    if (req.body.due_date < todayStr) throw new ValidationError('Due date cannot be in the past');
  }
  const id = await Task.create(req.body);
  await pool.execute('UPDATE tasks SET created_by = ? WHERE id = ?', [req.user.id, id]);
  await pool.execute(`INSERT INTO task_history (task_id, actor_user_id, event_type, to_status, note)
    VALUES (?, ?, 'TASK_CREATED', ?, ?)`, [id, req.user.id, req.body.status || 'PENDING', req.body.assigned_to]);
  await AuditLog.create({
    user_id: req.user.id,
    action: 'CREATE_TASK',
    entity_type: 'TASK',
    entity_id: id,
    new_value: req.body,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  if (req.body.assigned_to) {
    broadcastToUser(req.body.assigned_to, 'task_assigned', { id, description: req.body.description });
    await createNotification(req.body.assigned_to, 'TASK_ASSIGNED', 'New task assigned', `A new task has been assigned to you: ${req.body.description}`, 'TASK', id);
  }
  return success(res, 201, { id }, 'Task created successfully');
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  if (['EMPLOYEE', 'INTERN'].includes(req.user.role) && task.assigned_to !== req.user.id) throw new NotFoundError('Task not found');
  if (req.user.role === 'PROJECT_MANAGER') {
    if (!task.assigned_to) throw new NotFoundError('Task not found');
    await assertManagerTargetInScope(req.user.id, task.assigned_to);
  }
  return success(res, 200, task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  if (req.user.role === 'PROJECT_MANAGER') {
    await assertManagerTargetInScope(req.user.id, task.assigned_to);
    if (req.body.assigned_to) await assertManagerTargetInScope(req.user.id, req.body.assigned_to);
    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) throw new ValidationError('Use the review workflow to change task status');
  }
  if (['EMPLOYEE', 'INTERN'].includes(req.user.role)) throw new ValidationError('Use the employee task workflow to update assigned work');
  await Task.update(req.params.id, req.body);
  if (req.body.assigned_to && req.body.assigned_to !== task.assigned_to) {
    await pool.execute(`INSERT INTO task_history (task_id, actor_user_id, event_type, note)
      VALUES (?, ?, 'TASK_REASSIGNED', ?)`, [req.params.id, req.user.id, `${task.assigned_to || 'unassigned'} -> ${req.body.assigned_to}`]);
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
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ValidationError('No task ids provided for bulk update');
  }
  const results = [];
  for (const id of ids) {
    const task = await Task.findById(id);
    if (task) {
      await Task.update(id, updates);
      await AuditLog.create({
        user_id: req.user.id,
        action: 'BULK_UPDATE_TASK',
        entity_type: 'TASK',
        entity_id: id,
        new_value: updates
      });
      results.push(id);
    }
  }
  return success(res, 200, { updated: results }, 'Tasks updated');
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  const role = req.user.role;
  const allowed = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED'];
  if (!allowed.includes(req.body.status)) throw new ValidationError('Invalid task status');
  if (role === 'EMPLOYEE' || role === 'INTERN') {
    if (task.assigned_to !== req.user.id) throw new NotFoundError('Task not found');
    if (!canEmployeeTransition(task.status, req.body.status)) throw new ValidationError('That task transition is not allowed');
  } else if (role === 'PROJECT_MANAGER') {
    if (!task.assigned_to) throw new NotFoundError('Task not found');
    await assertManagerTargetInScope(req.user.id, task.assigned_to);
    if (!canManagerTransition(task.status, req.body.status)) throw new ValidationError('That manager task transition is not allowed');
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(`UPDATE tasks SET status = ? WHERE id = ?`, [req.body.status, req.params.id]);







    await connection.execute('INSERT INTO task_history (task_id, actor_user_id, event_type, from_status, to_status, note) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, req.user.id, role === 'PROJECT_MANAGER' ? 'MANAGER_REVIEW' : 'STATUS_CHANGE', task.status, req.body.status, [req.body.review_note, req.body.appreciation].filter(Boolean).join(' | ') || null]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  if (task.assigned_to && (req.body.status === 'BLOCKED' || req.body.status === 'CANCELLED')) {
    await createNotification(task.assigned_to, `TASK_${req.body.status}`, `Task ${req.body.status.toLowerCase()}`, `Your task "${task.description}" has been ${req.body.status.toLowerCase()}.`, 'TASK', req.params.id);
  }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'UPDATE_TASK_STATUS',
    entity_type: 'TASK',
    entity_id: req.params.id,
    old_value: { status: task.status },
    new_value: { status: req.body.status },
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  return success(res, 200, null, 'Task status updated');
});

export const getTaskHistory = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  if (['EMPLOYEE', 'INTERN'].includes(req.user.role) && task.assigned_to !== req.user.id) throw new NotFoundError('Task not found');
  if (req.user.role === 'PROJECT_MANAGER') {
    if (!task.assigned_to) throw new NotFoundError('Task not found');
    await assertManagerTargetInScope(req.user.id, task.assigned_to);
  }
  const [history] = await pool.execute(`SELECT id, event_type, from_status, to_status, note, created_at
    FROM task_history WHERE task_id = ? ORDER BY created_at ASC, id ASC`, [req.params.id]);
  return success(res, 200, history);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  if (req.user.role === 'PROJECT_MANAGER') await assertManagerTargetInScope(req.user.id, task.assigned_to);
  if (req.user.role === 'PROJECT_MANAGER') throw new ValidationError('Tasks are retained for historical reporting; cancel the task instead');
  await Task.delete(req.params.id);
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
  const task = await Task.findById(req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  const { status } = req.body;
  if (!status) throw new ValidationError('status is required');
  if (!['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED'].includes(status)) throw new ValidationError('Invalid task status');
  if (['EMPLOYEE', 'INTERN'].includes(req.user.role)) {
    if (task.assigned_to !== req.user.id) throw new NotFoundError('Task not found');
    if (!canEmployeeTransition(task.status, status)) throw new ValidationError('That task transition is not allowed');
  } else if (req.user.role === 'PROJECT_MANAGER') {
    if (!task.assigned_to) throw new NotFoundError('Task not found');
    await assertManagerTargetInScope(req.user.id, task.assigned_to);
    if (!canManagerTransition(task.status, status)) throw new ValidationError('That manager task transition is not allowed');
  }
  await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
  await pool.execute(`INSERT INTO task_history (task_id, actor_user_id, event_type, from_status, to_status)
    VALUES (?, ?, 'STATUS_CHANGE', ?, ?)`, [req.params.id, req.user.id, task.status, status]);
  if (status === 'CORRECTION_REQUESTED' && task.assigned_to) {
    await createNotification(task.assigned_to, 'TASK_CORRECTION', 'Correction requested', `Correction requested for task: ${task.description}`, 'TASK', req.params.id);
  }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'MOVE_TASK',
    entity_type: 'TASK',
    entity_id: req.params.id,
    old_value: { status: task.status },
    new_value: { status },
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  return success(res, 200, { id: req.params.id, status }, 'Task moved successfully');
});

