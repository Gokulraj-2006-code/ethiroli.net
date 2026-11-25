import crypto from 'crypto';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors.js';
import { createNotification } from './notificationController.js';
import { safeName } from '../services/companyProjectService.js';

const isAdmin = (user) => ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
const VISIBILITY = ['PERSONAL', 'SHARED'];
const PERMISSIONS = ['VIEW', 'EDIT'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['PENDING', 'COMPLETED'];

const auditless = async (work) => work();

const fetchList = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT l.*, u.full_name AS owner_name,
            (SELECT COUNT(*) FROM todo_items i WHERE i.list_id = l.id) AS item_count,
            (SELECT COUNT(*) FROM todo_items i WHERE i.list_id = l.id AND i.status = 'COMPLETED') AS completed_count
       FROM todo_lists l LEFT JOIN users u ON u.id = l.owner_id
      WHERE l.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const assertListAccess = async (user, listId, { write = false } = {}) => {
  const list = await fetchList(listId);
  if (!list) throw new NotFoundError('To-Do list not found');
  if (isAdmin(user)) return { ...list, permission: 'EDIT' };
  if (list.owner_id === user.id) return { ...list, permission: 'EDIT' };
  if (list.visibility !== 'SHARED') throw new AuthorizationError('This is a personal To-Do list.');
  const [memberRows] = await pool.execute(
    'SELECT permission FROM todo_list_members WHERE list_id = ? AND user_id = ? LIMIT 1',
    [listId, user.id]
  );
  if (!memberRows.length) throw new AuthorizationError('This To-Do list is not shared with you.');
  if (write && memberRows[0].permission !== 'EDIT') throw new AuthorizationError('You have view-only access to this list.');
  return { ...list, permission: memberRows[0].permission };
};

const fetchItem = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT i.*, l.owner_id AS list_owner_id, l.visibility AS list_visibility
       FROM todo_items i JOIN todo_lists l ON l.id = i.list_id
      WHERE i.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const decorateItems = async (items) => {
  if (!items.length) return [];
  const ids = items.map((item) => item.id);
  const placeholders = ids.map(() => '?').join(',');
  const [subtasks, comments, attachments, reminders] = await Promise.all([
    pool.execute(`SELECT * FROM todo_item_subtasks WHERE item_id IN (${placeholders}) ORDER BY sort_order, created_at`, ids).then(([r]) => r),
    pool.execute(`SELECT c.*, u.full_name AS author_name FROM todo_item_comments c LEFT JOIN users u ON u.id = c.author_id WHERE c.item_id IN (${placeholders}) ORDER BY c.created_at`, ids).then(([r]) => r),
    pool.execute(`SELECT a.*, u.full_name AS uploader_name FROM todo_item_attachments a LEFT JOIN users u ON u.id = a.uploaded_by WHERE a.item_id IN (${placeholders}) ORDER BY a.created_at`, ids).then(([r]) => r),
    pool.execute(`SELECT * FROM todo_item_reminders WHERE item_id IN (${placeholders}) ORDER BY remind_at`, ids).then(([r]) => r)
  ]);
  const group = (rows) => rows.reduce((acc, row) => {
    (acc[row.item_id] ||= []).push(row);
    return acc;
  }, {});
  const bySubtask = group(subtasks);
  const byComment = group(comments);
  const byAttachment = group(attachments);
  const byReminder = group(reminders);
  return items.map((item) => ({
    ...item,
    subtasks: bySubtask[item.id] || [],
    comments: (byComment[item.id] || []).map((comment) => ({ ...comment, author_name: safeName(comment.author_name, 'Team member') })),
    attachments: byAttachment[item.id] || [],
    reminders: byReminder[item.id] || []
  }));
};

export const listTodoLists = asyncHandler(async (req, res) => {
  let sql = `SELECT DISTINCT l.*, u.full_name AS owner_name,
                    (SELECT COUNT(*) FROM todo_items i WHERE i.list_id = l.id) AS item_count,
                    (SELECT COUNT(*) FROM todo_items i WHERE i.list_id = l.id AND i.status = 'COMPLETED') AS completed_count
               FROM todo_lists l
               LEFT JOIN users u ON u.id = l.owner_id
               LEFT JOIN todo_list_members m ON m.list_id = l.id
              WHERE 1 = 1`;
  const values = [];
  if (!isAdmin(req.user)) {
    sql += ' AND (l.owner_id = ? OR l.visibility = ? OR m.user_id = ?)';
    values.push(req.user.id, 'SHARED', req.user.id);
  }
  sql += ' ORDER BY l.updated_at DESC LIMIT 200';
  const [rows] = await pool.execute(sql, values);
  return success(res, 200, rows.map((row) => ({ ...row, owner_name: safeName(row.owner_name, 'Me') })));
});

export const createTodoList = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) throw new ValidationError('A list name is required.');
  const visibility = String(req.body.visibility || 'PERSONAL').toUpperCase();
  if (!VISIBILITY.includes(visibility)) throw new ValidationError('Invalid list visibility.');
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO todo_lists (id, name, description, owner_id, visibility, color)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, String(req.body.description || '').trim() || null, req.user.id, visibility, req.body.color || null]
  );
  return success(res, 201, { id }, 'To-Do list created');
});

export const getTodoList = asyncHandler(async (req, res) => {
  const list = await assertListAccess(req.user, req.params.id);
  const [items] = await pool.execute(
    'SELECT * FROM todo_items WHERE list_id = ? ORDER BY sort_order ASC, created_at ASC LIMIT 300',
    [list.id]
  );
  const [members] = await pool.execute(
    `SELECT m.*, u.full_name, u.email, u.role FROM todo_list_members m
       LEFT JOIN users u ON u.id = m.user_id WHERE m.list_id = ? ORDER BY m.created_at`,
    [list.id]
  );
  return success(res, 200, {
    list: { ...list, owner_name: safeName(list.owner_name, 'Me') },
    items: await decorateItems(items),
    members: members.map((member) => ({ ...member, full_name: safeName(member.full_name, member.email || 'Team member') }))
  });
});

export const updateTodoList = asyncHandler(async (req, res) => {
  await assertListAccess(req.user, req.params.id, { write: true });
  const parts = [];
  const values = [];
  for (const field of ['name', 'description', 'color', 'visibility']) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      if (field === 'visibility' && !VISIBILITY.includes(String(req.body[field]).toUpperCase())) {
        throw new ValidationError('Invalid list visibility.');
      }
      parts.push(`${field} = ?`);
      values.push(field === 'visibility' ? String(req.body[field]).toUpperCase() : req.body[field]);
    }
  }
  if (!parts.length) throw new ValidationError('No changes supplied.');
  values.push(req.params.id);
  await pool.execute(`UPDATE todo_lists SET ${parts.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
  return success(res, 200, null, 'To-Do list updated');
});

export const deleteTodoList = asyncHandler(async (req, res) => {
  const list = await fetchList(req.params.id);
  if (!list) throw new NotFoundError('To-Do list not found');
  if (!isAdmin(req.user) && list.owner_id !== req.user.id) throw new AuthorizationError('Only the list owner can delete this list.');
  await pool.execute('DELETE FROM todo_lists WHERE id = ?', [list.id]);
  return success(res, 200, null, 'To-Do list deleted');
});

export const shareTodoList = asyncHandler(async (req, res) => {
  const list = await fetchList(req.params.id);
  if (!list) throw new NotFoundError('To-Do list not found');
  if (!isAdmin(req.user) && list.owner_id !== req.user.id) throw new AuthorizationError('Only the list owner can share this list.');
  if (list.visibility !== 'SHARED') throw new ValidationError('Change the list visibility to Shared before adding members.');
  const { user_ids = [], permission = 'VIEW' } = req.body;
  if (!Array.isArray(user_ids)) throw new ValidationError('user_ids must be an array.');
  if (!PERMISSIONS.includes(String(permission).toUpperCase())) throw new ValidationError('Invalid permission.');
  for (const userId of [...new Set(user_ids.filter((id) => id && id !== list.owner_id))]) {
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ? AND is_active = 1', [userId]);
    if (!users.length) continue;
    await pool.execute(
      `INSERT INTO todo_list_members (id, list_id, user_id, permission)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE permission = VALUES(permission)`,
      [crypto.randomUUID(), list.id, userId, String(permission).toUpperCase()]
    );
    await createNotification(
      userId, 'TODO_LIST_SHARED', 'A To-Do list was shared with you',
      `${list.name} is now available to you.`,
      'TODO_LIST', list.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/todos/${list.id}` }
    );
  }
  return success(res, 200, null, 'To-Do list sharing updated');
});

export const removeTodoListMember = asyncHandler(async (req, res) => {
  const list = await fetchList(req.params.id);
  if (!list) throw new NotFoundError('To-Do list not found');
  if (!isAdmin(req.user) && list.owner_id !== req.user.id) throw new AuthorizationError('Only the list owner can remove members.');
  await pool.execute('DELETE FROM todo_list_members WHERE list_id = ? AND user_id = ?', [list.id, req.params.userId]);
  return success(res, 200, null, 'Member removed');
});

export const listTodoItems = asyncHandler(async (req, res) => {
  await assertListAccess(req.user, req.params.id);
  let sql = 'SELECT * FROM todo_items WHERE list_id = ?';
  const values = [req.params.id];
  if (req.query.status) {
    sql += ' AND status = ?';
    values.push(String(req.query.status).toUpperCase());
  }
  if (req.query.priority) {
    sql += ' AND priority = ?';
    values.push(String(req.query.priority).toUpperCase());
  }
  if (req.query.assigned_to) {
    sql += ' AND assigned_to = ?';
    values.push(req.query.assigned_to);
  }
  if (req.query.search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    const term = `%${String(req.query.search).trim()}%`;
    values.push(term, term);
  }
  const sort = {
    due: 'due_date IS NULL, due_date ASC, sort_order ASC',
    priority: "FIELD(priority, 'HIGH', 'MEDIUM', 'LOW'), sort_order ASC",
    created: 'created_at DESC',
    manual: 'sort_order ASC, created_at ASC'
  }[req.query.sort] || 'sort_order ASC, created_at ASC';
  sql += ` ORDER BY ${sort} LIMIT 300`;
  const [rows] = await pool.execute(sql, values);
  return success(res, 200, await decorateItems(rows));
});

export const createTodoItem = asyncHandler(async (req, res) => {
  const list = await assertListAccess(req.user, req.params.id, { write: true });
  const title = String(req.body.title || '').trim();
  if (!title) throw new ValidationError('A task title is required.');
  const priority = String(req.body.priority || 'MEDIUM').toUpperCase();
  if (!PRIORITIES.includes(priority)) throw new ValidationError('Invalid priority.');
  const assignedTo = req.body.assigned_to || null;
  if (assignedTo) {
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ? AND is_active = 1', [assignedTo]);
    if (!users.length) throw new ValidationError('The selected assignee is not active.');
  }
  const id = crypto.randomUUID();
  const [[sortRow]] = await pool.execute('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM todo_items WHERE list_id = ?', [list.id]);
  await pool.execute(
    `INSERT INTO todo_items
       (id, list_id, title, description, due_date, priority, status, assigned_to, created_by, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
    [
      id, list.id, title, String(req.body.description || '').trim() || null,
      req.body.due_date || null, priority, assignedTo, req.user.id, sortRow.next_order
    ]
  );
  if (assignedTo && assignedTo !== req.user.id) {
    await createNotification(
      assignedTo, 'TODO_ITEM_ASSIGNED', 'New To-Do assigned to you', `${title} was added to ${list.name}.`,
      'TODO_ITEM', id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/todos/${list.id}` }
    );
  }
  return success(res, 201, { id }, 'To-Do created');
});

export const updateTodoItem = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.id);
  if (!item) throw new NotFoundError('To-Do not found');
  await assertListAccess(req.user, item.list_id, { write: true });
  const parts = [];
  const values = [];
  for (const field of ['title', 'description', 'due_date', 'priority', 'status', 'assigned_to', 'sort_order']) {
    if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;
    let value = req.body[field];
    if (field === 'priority') {
      value = String(value).toUpperCase();
      if (!PRIORITIES.includes(value)) throw new ValidationError('Invalid priority.');
    }
    if (field === 'status') {
      value = String(value).toUpperCase();
      if (!STATUSES.includes(value)) throw new ValidationError('Invalid To-Do status.');
      parts.push('completed_at = ?');
      values.push(value === 'COMPLETED' ? new Date() : null);
    }
    parts.push(`${field} = ?`);
    values.push(value || null);
  }
  if (!parts.length) throw new ValidationError('No changes supplied.');
  values.push(item.id);
  await pool.execute(`UPDATE todo_items SET ${parts.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
  return success(res, 200, null, 'To-Do updated');
});

export const deleteTodoItem = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.id);
  if (!item) throw new NotFoundError('To-Do not found');
  await assertListAccess(req.user, item.list_id, { write: true });
  await pool.execute('DELETE FROM todo_items WHERE id = ?', [item.id]);
  return success(res, 200, null, 'To-Do deleted');
});

export const createTodoSubtask = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.itemId);
  if (!item) throw new NotFoundError('To-Do not found');
  await assertListAccess(req.user, item.list_id, { write: true });
  const title = String(req.body.title || '').trim();
  if (!title) throw new ValidationError('A subtask title is required.');
  const id = crypto.randomUUID();
  const [[sortRow]] = await pool.execute('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM todo_item_subtasks WHERE item_id = ?', [item.id]);
  await pool.execute(
    'INSERT INTO todo_item_subtasks (id, item_id, title, is_done, sort_order) VALUES (?, ?, ?, 0, ?)',
    [id, item.id, title, sortRow.next_order]
  );
  return success(res, 201, { id }, 'Subtask added');
});

export const updateTodoSubtask = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT s.*, i.list_id FROM todo_item_subtasks s JOIN todo_items i ON i.id = s.item_id WHERE s.id = ?`,
    [req.params.id]
  );
  if (!rows.length) throw new NotFoundError('Subtask not found');
  await assertListAccess(req.user, rows[0].list_id, { write: true });
  const parts = [];
  const values = [];
  if (req.body.title !== undefined) {
    const title = String(req.body.title).trim();
    if (!title) throw new ValidationError('A subtask title is required.');
    parts.push('title = ?');
    values.push(title);
  }
  if (req.body.is_done !== undefined) {
    parts.push('is_done = ?');
    values.push(req.body.is_done ? 1 : 0);
  }
  if (!parts.length) throw new ValidationError('No changes supplied.');
  values.push(req.params.id);
  await pool.execute(`UPDATE todo_item_subtasks SET ${parts.join(', ')} WHERE id = ?`, values);
  return success(res, 200, null, 'Subtask updated');
});

export const deleteTodoSubtask = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT s.*, i.list_id FROM todo_item_subtasks s JOIN todo_items i ON i.id = s.item_id WHERE s.id = ?`,
    [req.params.id]
  );
  if (!rows.length) throw new NotFoundError('Subtask not found');
  await assertListAccess(req.user, rows[0].list_id, { write: true });
  await pool.execute('DELETE FROM todo_item_subtasks WHERE id = ?', [req.params.id]);
  return success(res, 200, null, 'Subtask deleted');
});

export const listTodoComments = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.itemId);
  if (!item) throw new NotFoundError('To-Do not found');
  await assertListAccess(req.user, item.list_id);
  const [rows] = await pool.execute(
    `SELECT c.*, u.full_name AS author_name FROM todo_item_comments c
       LEFT JOIN users u ON u.id = c.author_id WHERE c.item_id = ? ORDER BY c.created_at`,
    [item.id]
  );
  return success(res, 200, rows.map((row) => ({ ...row, author_name: safeName(row.author_name, 'Team member') })));
});

export const createTodoComment = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.itemId);
  if (!item) throw new NotFoundError('To-Do not found');
  const list = await assertListAccess(req.user, item.list_id, { write: true });
  const body = String(req.body.body || '').trim();
  if (!body) throw new ValidationError('A comment cannot be empty.');
  const id = crypto.randomUUID();
  await pool.execute(
    'INSERT INTO todo_item_comments (id, item_id, author_id, body) VALUES (?, ?, ?, ?)',
    [id, item.id, req.user.id, body]
  );
  const watchers = [item.assigned_to, list.owner_id].filter((userId, index, all) => userId && userId !== req.user.id && all.indexOf(userId) === index);
  for (const watcher of watchers) {
    await createNotification(
      watcher, 'TODO_COMMENT', 'New comment on a To-Do', `${body.slice(0, 120)}`,
      'TODO_ITEM', item.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/todos/${item.list_id}` }
    );
  }
  return success(res, 201, { id }, 'Comment added');
});

export const deleteTodoComment = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT c.*, i.list_id, l.owner_id FROM todo_item_comments c
       JOIN todo_items i ON i.id = c.item_id JOIN todo_lists l ON l.id = i.list_id
      WHERE c.id = ?`,
    [req.params.id]
  );
  const comment = rows[0];
  if (!comment) throw new NotFoundError('Comment not found');
  await assertListAccess(req.user, comment.list_id);
  if (!isAdmin(req.user) && comment.author_id !== req.user.id && comment.owner_id !== req.user.id) {
    throw new AuthorizationError('Only the comment author or list owner can delete this comment.');
  }
  await pool.execute('DELETE FROM todo_item_comments WHERE id = ?', [comment.id]);
  return success(res, 200, null, 'Comment deleted');
});

export const createTodoAttachment = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.itemId);
  if (!item) throw new NotFoundError('To-Do not found');
  await assertListAccess(req.user, item.list_id, { write: true });
  const fileName = String(req.body.file_name || '').trim();
  const fileUrl = String(req.body.file_url || '').trim();
  if (!fileName || !fileUrl) throw new ValidationError('file_name and file_url are required.');
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO todo_item_attachments
       (id, item_id, uploaded_by, file_name, file_url, mime_type, file_size_bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, item.id, req.user.id, fileName, fileUrl, req.body.mime_type || 'application/octet-stream', Number(req.body.file_size_bytes || 0)]
  );
  return success(res, 201, { id }, 'Attachment added');
});

export const deleteTodoAttachment = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT a.*, i.list_id FROM todo_item_attachments a JOIN todo_items i ON i.id = a.item_id WHERE a.id = ?`,
    [req.params.id]
  );
  if (!rows.length) throw new NotFoundError('Attachment not found');
  const list = await assertListAccess(req.user, rows[0].list_id, { write: true });
  if (!isAdmin(req.user) && rows[0].uploaded_by !== req.user.id && list.owner_id !== req.user.id) {
    throw new AuthorizationError('Only the uploader or list owner can remove this attachment.');
  }
  await pool.execute('DELETE FROM todo_item_attachments WHERE id = ?', [req.params.id]);
  return success(res, 200, null, 'Attachment removed');
});

export const createTodoReminder = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.itemId);
  if (!item) throw new NotFoundError('To-Do not found');
  await assertListAccess(req.user, item.list_id, { write: true });
  if (!req.body.remind_at || Number.isNaN(Date.parse(req.body.remind_at))) {
    throw new ValidationError('Enter a valid reminder date and time.');
  }
  const userId = req.body.user_id || item.assigned_to || req.user.id;
  const [users] = await pool.execute('SELECT id FROM users WHERE id = ? AND is_active = 1', [userId]);
  if (!users.length) throw new ValidationError('The reminder recipient is not active.');
  const id = crypto.randomUUID();
  await pool.execute(
    'INSERT INTO todo_item_reminders (id, item_id, user_id, remind_at) VALUES (?, ?, ?, ?)',
    [id, item.id, userId, new Date(req.body.remind_at).toISOString().slice(0, 19).replace('T', ' ')]
  );
  if (new Date(req.body.remind_at).getTime() <= Date.now() + 60_000 && userId !== req.user.id) {
    await createNotification(
      userId, 'TODO_REMINDER', 'To-Do reminder', `Reminder: ${item.title}`,
      'TODO_ITEM', item.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/todos/${item.list_id}` }
    );
  }
  return success(res, 201, { id }, 'Reminder added');
});

export const listTodoReminders = asyncHandler(async (req, res) => {
  const item = await fetchItem(req.params.itemId);
  if (!item) throw new NotFoundError('To-Do not found');
  await assertListAccess(req.user, item.list_id);
  const [rows] = await pool.execute('SELECT * FROM todo_item_reminders WHERE item_id = ? ORDER BY remind_at', [item.id]);
  return success(res, 200, rows);
});

export const deleteTodoReminder = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT r.*, i.list_id FROM todo_item_reminders r JOIN todo_items i ON i.id = r.item_id WHERE r.id = ?`,
    [req.params.id]
  );
  if (!rows.length) throw new NotFoundError('Reminder not found');
  await assertListAccess(req.user, rows[0].list_id, { write: true });
  await pool.execute('DELETE FROM todo_item_reminders WHERE id = ?', [req.params.id]);
  return success(res, 200, null, 'Reminder removed');
});

export const getTodoSummary = asyncHandler(async (req, res) => {
  let where = 'WHERE 1 = 1';
  const values = [];
  if (!isAdmin(req.user)) {
    where += ' AND (l.owner_id = ? OR l.visibility = ? OR m.user_id = ?)';
    values.push(req.user.id, 'SHARED', req.user.id);
  }
  const [[row]] = await pool.execute(
    `SELECT COUNT(DISTINCT l.id) AS lists,
            COUNT(i.id) AS items,
            SUM(CASE WHEN i.status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN i.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN i.due_date IS NOT NULL AND i.due_date < CURDATE() AND i.status <> 'COMPLETED' THEN 1 ELSE 0 END) AS overdue
       FROM todo_lists l
       LEFT JOIN todo_list_members m ON m.list_id = l.id
       LEFT JOIN todo_items i ON i.list_id = l.id
       ${where}`,
    values
  );
  return success(res, 200, {
    lists: Number(row.lists || 0),
    items: Number(row.items || 0),
    pending: Number(row.pending || 0),
    completed: Number(row.completed || 0),
    overdue: Number(row.overdue || 0)
  });
});

export default {
  listTodoLists,
  createTodoList,
  getTodoList,
  updateTodoList,
  deleteTodoList,
  shareTodoList,
  removeTodoListMember,
  listTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
  createTodoSubtask,
  updateTodoSubtask,
  deleteTodoSubtask,
  listTodoComments,
  createTodoComment,
  deleteTodoComment,
  createTodoAttachment,
  deleteTodoAttachment,
  createTodoReminder,
  listTodoReminders,
  deleteTodoReminder,
  getTodoSummary
};
