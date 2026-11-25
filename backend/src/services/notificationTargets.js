import pool from '../config/database.js';

/** Users who should receive oversight notifications for company work. */
export const listOversightUserIds = async (connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT id FROM users WHERE role IN ('SUPER_ADMIN', 'ADMIN') AND is_active = 1`
  );
  return rows.map((row) => row.id);
};

/** Notify every oversight user, deduplicating the caller when requested. */
export const notifyOversight = async (
  createNotification,
  { type, title, message, entityType = null, entityId = null, senderUserId = null, actionUrl = null, projectId = null, taskId = null, excludeUserId = null, connection = pool }
) => {
  const ids = (await listOversightUserIds(connection)).filter((id) => id !== excludeUserId && id !== senderUserId);
  await Promise.all(ids.map((id) => createNotification(
    id, type, title, message, entityType, entityId,
    { senderUserId, actionUrl, projectId, taskId }
  )));
  return ids;
};
