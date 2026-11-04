import crypto from 'crypto';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { createNotification } from './notificationController.js';

export const requestDeactivation = asyncHandler(async (req, res) => {
  const { user_id, reason } = req.body || {};
  if (!user_id || !reason?.trim()) throw new BadRequestError('user_id and reason required');
  // Check if pending request exists
  const [existing] = await pool.execute('SELECT id FROM deactivation_requests WHERE user_id=? AND status="PENDING"', [user_id]);
  if (existing.length) throw new BadRequestError('A pending deactivation request already exists for this account');
  const id = crypto.randomUUID();
  await pool.execute('INSERT INTO deactivation_requests (id, user_id, requested_by, reason) VALUES (?,?,?,?)', [id, user_id, req.user.id, reason.trim()]);
  // Notify CEO
  const [ceos] = await pool.execute("SELECT id FROM users WHERE role='SUPER_ADMIN' AND is_active=1");
  for (const c of ceos) {
    await createNotification(c.id, 'DEACTIVATION_REQUEST', 'Deactivation request', `HR requested deactivation of an account. Reason: ${reason.trim()}`, 'DEACTIVATION', id);
  }
  return success(res, 201, { id }, 'Deactivation request submitted for CEO approval');
});

export const listDeactivationRequests = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT dr.*, u.full_name AS user_name, u.role AS user_role, r.full_name AS requester_name, rv.full_name AS reviewer_name
     FROM deactivation_requests dr
     JOIN users u ON u.id = dr.user_id
     LEFT JOIN users r ON r.id = dr.requested_by
     LEFT JOIN users rv ON rv.id = dr.reviewed_by
     ORDER BY dr.created_at DESC`
  );
  return success(res, 200, rows);
});

export const reviewDeactivation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, review_note } = req.body || {};
  if (!['APPROVED','REJECTED'].includes(decision)) throw new BadRequestError('decision must be APPROVED or REJECTED');
  const [rows] = await pool.execute('SELECT * FROM deactivation_requests WHERE id=? AND status="PENDING"', [id]);
  if (!rows.length) throw new NotFoundError('Pending request not found');
  const req_row = rows[0];
  await pool.execute('UPDATE deactivation_requests SET status=?, reviewed_by=?, review_note=?, reviewed_at=NOW() WHERE id=?', [decision, req.user.id, review_note || null, id]);
  if (decision === 'APPROVED') {
    await pool.execute('UPDATE users SET is_active=0 WHERE id=?', [req_row.user_id]);
    await pool.execute('UPDATE employees SET account_status=\'ARCHIVED\' WHERE user_id=?', [req_row.user_id]);
    await pool.execute('UPDATE interns SET account_status=\'ARCHIVED\' WHERE user_id=?', [req_row.user_id]);
    await pool.execute('DELETE FROM sessions WHERE user_id=?', [req_row.user_id]);
  }
  // Notify HR requester
  await createNotification(req_row.requested_by, `DEACTIVATION_${decision}`, `Deactivation ${decision.toLowerCase()}`, `Deactivation request was ${decision.toLowerCase()}.`, 'DEACTIVATION', id);
  return success(res, 200, { id, status: decision }, 'Request reviewed');
});

export default { requestDeactivation, listDeactivationRequests, reviewDeactivation };
