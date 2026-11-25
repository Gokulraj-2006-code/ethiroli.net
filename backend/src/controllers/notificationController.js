import crypto from 'crypto';
import pool from '../config/database.js';
import { decrypt } from '../config/encryption.js';
import { looksLikeEncryptedValue } from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';

const safeName = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback;
  try {
    const out = decrypt(value);
    if (!out || looksLikeEncryptedValue(out)) return fallback;
    return out;
  } catch (_) {
    return fallback;
  }
};

/**
 * Creates one in-app notification.
 *
 * The trailing `options` argument is additive so every existing caller keeps
 * working: sender_user_id, action_url, project_id and task_id were introduced
 * with migration 028 to satisfy the cross-panel notification requirements.
 */
export async function createNotification(
  recipientUserId,
  type,
  title,
  message,
  entityType = null,
  entityId = null,
  options = {}
) {
  if (!recipientUserId) return null;

  // Dedupe: skip if identical unread notification exists for same recipient+type+entity within 1 min
  const [existing] = await pool.execute(
    `SELECT id FROM notifications WHERE recipient_user_id=? AND type=? AND related_entity_id=? AND is_read=0 AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE) LIMIT 1`,
    [recipientUserId, type, entityId]
  );
  if (existing.length) return existing[0].id;

  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO notifications
       (id, recipient_user_id, type, title, message, related_entity_type, related_entity_id,
        sender_user_id, action_url, project_id, task_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      recipientUserId,
      type,
      title,
      message,
      entityType,
      entityId,
      options.senderUserId || null,
      options.actionUrl || null,
      options.projectId || null,
      options.taskId || null
    ]
  );
  return id;
}

export const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const [rows] = await pool.execute(
    `SELECT n.*,
            s.full_name AS sender_name,
            s.role      AS sender_role,
            p.name      AS project_name,
            p.project_code AS project_code,
            t.description AS task_description
       FROM notifications n
       LEFT JOIN users s ON s.id = n.sender_user_id
       LEFT JOIN student_projects p ON p.id = n.project_id
       LEFT JOIN tasks t ON t.id = n.task_id
      WHERE n.recipient_user_id = ?
      ORDER BY n.created_at DESC, n.id DESC
      LIMIT ${limit}`,
    [req.user.id]
  );
  const [countRows] = await pool.execute(
    'SELECT COUNT(*) c FROM notifications WHERE recipient_user_id=? AND is_read=0',
    [req.user.id]
  );

  const notifications = rows.map((row) => ({
    ...row,
    sender_name: safeName(row.sender_name, null),
    recipient_user_id: row.recipient_user_id,
    action_url: row.action_url || null,
    is_read: Boolean(row.is_read),
    read_at: row.read_at || null,
    created_at: row.created_at
  }));

  return success(res, 200, { notifications, unread_count: countRows[0].c });
});

export const markRead = asyncHandler(async (req, res) => {
  await pool.execute(
    'UPDATE notifications SET is_read=1, read_at=NOW() WHERE id=? AND recipient_user_id=?',
    [req.params.id, req.user.id]
  );
  return success(res, 200, null, 'Marked as read');
});

export const markAllRead = asyncHandler(async (req, res) => {
  await pool.execute(
    'UPDATE notifications SET is_read=1, read_at=NOW() WHERE recipient_user_id=? AND is_read=0',
    [req.user.id]
  );
  return success(res, 200, null, 'All marked as read');
});

export default { createNotification, listNotifications, markRead, markAllRead };
