import crypto from 'crypto';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';

export async function createNotification(recipientUserId, type, title, message, entityType = null, entityId = null) {
  // Dedupe: skip if identical unread notification exists for same recipient+type+entity within 1 min
  const [existing] = await pool.execute(
    `SELECT id FROM notifications WHERE recipient_user_id=? AND type=? AND related_entity_id=? AND is_read=0 AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE) LIMIT 1`,
    [recipientUserId, type, entityId]
  );
  if (existing.length) return existing[0].id;
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO notifications (id, recipient_user_id, type, title, message, related_entity_type, related_entity_id) VALUES (?,?,?,?,?,?,?)`,
    [id, recipientUserId, type, title, message, entityType, entityId]
  );
  return id;
}

export const listNotifications = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT * FROM notifications WHERE recipient_user_id=? ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  );
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) c FROM notifications WHERE recipient_user_id=? AND is_read=0`,
    [req.user.id]
  );
  return success(res, 200, { notifications: rows, unread_count: countRows[0].c });
});

export const markRead = asyncHandler(async (req, res) => {
  await pool.execute('UPDATE notifications SET is_read=1, read_at=NOW() WHERE id=? AND recipient_user_id=?', [req.params.id, req.user.id]);
  return success(res, 200, null, 'Marked as read');
});

export const markAllRead = asyncHandler(async (req, res) => {
  await pool.execute('UPDATE notifications SET is_read=1, read_at=NOW() WHERE recipient_user_id=? AND is_read=0', [req.user.id]);
  return success(res, 200, null, 'All marked as read');
});

export default { createNotification, listNotifications, markRead, markAllRead };
