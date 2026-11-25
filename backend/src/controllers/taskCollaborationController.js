import crypto from 'crypto';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors.js';
import { assertProjectAccess, getProject } from '../services/companyProjectService.js';
import { assertManagerTargetInScope } from './organizationController.js';
import { createNotification } from './notificationController.js';
import { safeName } from '../services/companyProjectService.js';

const isAdmin = (user) => ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

export const assertTaskAccess = async (user, taskId, { write = false } = {}) => {
  const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ? LIMIT 1', [taskId]);
  const task = rows[0];
  if (!task) throw new NotFoundError('Task not found');
  if (isAdmin(user)) return task;
  if (task.project_id) {
    const project = await getProject(task.project_id);
    return { ...(await assertProjectAccess(user, project, { write })), task };
  }
  if (['EMPLOYEE', 'INTERN'].includes(user.role)) {
    if (task.assigned_to !== user.id) throw new AuthorizationError('You are not assigned to this task.');
    return task;
  }
  if (user.role === 'PROJECT_MANAGER') {
    if (!task.assigned_to) throw new AuthorizationError('This task is not in your scope.');
    await assertManagerTargetInScope(user.id, task.assigned_to);
    return task;
  }
  throw new AuthorizationError('Your role cannot access this task.');
};

const fetchTaskList = async (id, connection = pool) => {
  const [rows] = await connection.execute('SELECT * FROM task_lists WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const listTaskLists = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.projectId);
  await assertProjectAccess(req.user, project);
  const [rows] = await pool.execute(
    `SELECT l.*, u.full_name AS creator_name,
            (SELECT COUNT(*) FROM tasks t WHERE t.task_list_id = l.id) AS task_count
       FROM task_lists l LEFT JOIN users u ON u.id = l.created_by
      WHERE l.project_id = ? ORDER BY l.created_at`,
    [project.id]
  );
  return success(res, 200, rows.map((row) => ({ ...row, creator_name: safeName(row.creator_name, 'Team member') })));
});

export const createTaskList = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.projectId);
  await assertProjectAccess(req.user, project, { write: true });
  if (req.user.role === 'PROJECT_MANAGER' && project.manager_id !== req.user.id) {
    throw new AuthorizationError('Only the assigned Manager can manage project task lists.');
  }
  const name = String(req.body.name || '').trim();
  if (!name) throw new ValidationError('A task list name is required.');
  const id = crypto.randomUUID();
  await pool.execute(
    'INSERT INTO task_lists (id, project_id, name, description, created_by, is_shared) VALUES (?, ?, ?, ?, ?, ?)',
    [id, project.id, name, String(req.body.description || '').trim() || null, req.user.id, req.body.is_shared === false ? 0 : 1]
  );
  return success(res, 201, { id }, 'Task list created');
});

export const updateTaskList = asyncHandler(async (req, res) => {
  const list = await fetchTaskList(req.params.id);
  if (!list) throw new NotFoundError('Task list not found');
  const project = await getProject(list.project_id);
  await assertProjectAccess(req.user, project, { write: true });
  const parts = [];
  const values = [];
  for (const field of ['name', 'description', 'is_shared']) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      parts.push(`${field} = ?`);
      values.push(field === 'is_shared' ? (req.body[field] ? 1 : 0) : req.body[field]);
    }
  }
  if (!parts.length) throw new ValidationError('No changes supplied.');
  values.push(list.id);
  await pool.execute(`UPDATE task_lists SET ${parts.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
  return success(res, 200, null, 'Task list updated');
});

export const deleteTaskList = asyncHandler(async (req, res) => {
  const list = await fetchTaskList(req.params.id);
  if (!list) throw new NotFoundError('Task list not found');
  const project = await getProject(list.project_id);
  await assertProjectAccess(req.user, project, { write: true });
  await pool.execute('DELETE FROM task_lists WHERE id = ?', [list.id]);
  return success(res, 200, null, 'Task list deleted');
});

export const listTaskComments = asyncHandler(async (req, res) => {
  const task = await assertTaskAccess(req.user, req.params.taskId);
  const [rows] = await pool.execute(
    `SELECT c.*, u.full_name AS author_name FROM task_comments c
       LEFT JOIN users u ON u.id = c.author_id WHERE c.task_id = ? ORDER BY c.created_at`,
    [task.id]
  );
  return success(res, 200, rows.map((row) => ({ ...row, author_name: safeName(row.author_name, 'Team member') })));
});

export const createTaskComment = asyncHandler(async (req, res) => {
  const task = await assertTaskAccess(req.user, req.params.taskId, { write: true });
  const body = String(req.body.body || '').trim();
  if (!body) throw new ValidationError('A comment cannot be empty.');
  const id = crypto.randomUUID();
  await pool.execute(
    'INSERT INTO task_comments (id, task_id, author_id, body) VALUES (?, ?, ?, ?)',
    [id, task.id, req.user.id, body]
  );
  const recipients = [task.assigned_to, task.created_by].filter((userId, index, all) => userId && userId !== req.user.id && all.indexOf(userId) === index);
  for (const recipient of recipients) {
    await createNotification(
      recipient, 'TASK_COMMENT', 'New comment on a task', body.slice(0, 140),
      'TASK', task.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/tasks/${task.id}`, taskId: task.id, projectId: task.project_id }
    );
  }
  return success(res, 201, { id }, 'Comment added');
});

export const deleteTaskComment = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM task_comments WHERE id = ?', [req.params.id]);
  const comment = rows[0];
  if (!comment) throw new NotFoundError('Comment not found');
  await assertTaskAccess(req.user, comment.task_id, { write: true });
  if (!isAdmin(req.user) && comment.author_id !== req.user.id) {
    throw new AuthorizationError('Only the comment author can delete this comment.');
  }
  await pool.execute('DELETE FROM task_comments WHERE id = ?', [comment.id]);
  return success(res, 200, null, 'Comment deleted');
});

export const createTaskAttachment = asyncHandler(async (req, res) => {
  const task = await assertTaskAccess(req.user, req.params.taskId, { write: true });
  const fileName = String(req.body.file_name || '').trim();
  const fileUrl = String(req.body.file_url || '').trim();
  if (!fileName || !fileUrl) throw new ValidationError('file_name and file_url are required.');
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO task_attachments (id, task_id, uploaded_by, file_name, file_url, mime_type, file_size_bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, task.id, req.user.id, fileName, fileUrl, req.body.mime_type || 'application/octet-stream', Number(req.body.file_size_bytes || 0)]
  );
  return success(res, 201, { id }, 'Attachment added');
});

export const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM task_attachments WHERE id = ?', [req.params.id]);
  if (!rows.length) throw new NotFoundError('Attachment not found');
  await assertTaskAccess(req.user, rows[0].task_id, { write: true });
  if (!isAdmin(req.user) && rows[0].uploaded_by !== req.user.id) {
    throw new AuthorizationError('Only the uploader can remove this attachment.');
  }
  await pool.execute('DELETE FROM task_attachments WHERE id = ?', [rows[0].id]);
  return success(res, 200, null, 'Attachment removed');
});

export const listTaskChecklist = asyncHandler(async (req, res) => {
  const task = await assertTaskAccess(req.user, req.params.taskId);
  const [rows] = await pool.execute('SELECT * FROM task_checklist_items WHERE task_id = ? ORDER BY sort_order, created_at', [task.id]);
  return success(res, 200, rows);
});

export const createTaskChecklistItem = asyncHandler(async (req, res) => {
  const task = await assertTaskAccess(req.user, req.params.taskId, { write: true });
  const title = String(req.body.title || '').trim();
  if (!title) throw new ValidationError('A checklist title is required.');
  const id = crypto.randomUUID();
  const [[sortRow]] = await pool.execute('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM task_checklist_items WHERE task_id = ?', [task.id]);
  await pool.execute(
    'INSERT INTO task_checklist_items (id, task_id, title, is_done, sort_order) VALUES (?, ?, ?, 0, ?)',
    [id, task.id, title, sortRow.next_order]
  );
  return success(res, 201, { id }, 'Checklist item added');
});

export const updateTaskChecklistItem = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT c.*, t.project_id FROM task_checklist_items c JOIN tasks t ON t.id = c.task_id WHERE c.id = ?`,
    [req.params.id]
  );
  if (!rows.length) throw new NotFoundError('Checklist item not found');
  await assertTaskAccess(req.user, rows[0].task_id, { write: true });
  const parts = [];
  const values = [];
  if (req.body.title !== undefined) {
    const title = String(req.body.title).trim();
    if (!title) throw new ValidationError('A checklist title is required.');
    parts.push('title = ?');
    values.push(title);
  }
  if (req.body.is_done !== undefined) {
    parts.push('is_done = ?');
    values.push(req.body.is_done ? 1 : 0);
  }
  if (!parts.length) throw new ValidationError('No changes supplied.');
  values.push(rows[0].id);
  await pool.execute(`UPDATE task_checklist_items SET ${parts.join(', ')} WHERE id = ?`, values);
  return success(res, 200, null, 'Checklist item updated');
});

export const deleteTaskChecklistItem = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM task_checklist_items WHERE id = ?', [req.params.id]);
  if (!rows.length) throw new NotFoundError('Checklist item not found');
  await assertTaskAccess(req.user, rows[0].task_id, { write: true });
  await pool.execute('DELETE FROM task_checklist_items WHERE id = ?', [rows[0].id]);
  return success(res, 200, null, 'Checklist item removed');
});

export const listTaskReminders = asyncHandler(async (req, res) => {
  const task = await assertTaskAccess(req.user, req.params.taskId);
  const [rows] = await pool.execute('SELECT * FROM task_reminders WHERE task_id = ? ORDER BY remind_at', [task.id]);
  return success(res, 200, rows);
});

export const createTaskReminder = asyncHandler(async (req, res) => {
  const task = await assertTaskAccess(req.user, req.params.taskId, { write: true });
  if (!req.body.remind_at || Number.isNaN(Date.parse(req.body.remind_at))) {
    throw new ValidationError('Enter a valid reminder date and time.');
  }
  const userId = req.body.user_id || task.assigned_to || req.user.id;
  const [users] = await pool.execute('SELECT id FROM users WHERE id = ? AND is_active = 1', [userId]);
  if (!users.length) throw new ValidationError('The reminder recipient is not active.');
  const id = crypto.randomUUID();
  await pool.execute(
    'INSERT INTO task_reminders (id, task_id, user_id, remind_at) VALUES (?, ?, ?, ?)',
    [id, task.id, userId, new Date(req.body.remind_at).toISOString().slice(0, 19).replace('T', ' ')]
  );
  if (new Date(req.body.remind_at).getTime() <= Date.now() + 60_000 && userId !== req.user.id) {
    await createNotification(
      userId, 'TASK_REMINDER', 'Task reminder', `Reminder: ${task.description.slice(0, 140)}`,
      'TASK', task.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/tasks/${task.id}`, taskId: task.id, projectId: task.project_id }
    );
  }
  return success(res, 201, { id }, 'Reminder added');
});

export const deleteTaskReminder = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM task_reminders WHERE id = ?', [req.params.id]);
  if (!rows.length) throw new NotFoundError('Reminder not found');
  await assertTaskAccess(req.user, rows[0].task_id, { write: true });
  await pool.execute('DELETE FROM task_reminders WHERE id = ?', [rows[0].id]);
  return success(res, 200, null, 'Reminder removed');
});

export default {
  listTaskLists,
  createTaskList,
  updateTaskList,
  deleteTaskList,
  listTaskComments,
  createTaskComment,
  deleteTaskComment,
  createTaskAttachment,
  deleteTaskAttachment,
  listTaskChecklist,
  createTaskChecklistItem,
  updateTaskChecklistItem,
  deleteTaskChecklistItem,
  listTaskReminders,
  createTaskReminder,
  deleteTaskReminder
};
