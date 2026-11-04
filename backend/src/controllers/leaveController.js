import crypto from 'crypto';
import Leave from '../models/Leave.js';
import AuditLog from '../models/AuditLog.js';
import ActivityFeed from '../models/ActivityFeed.js';
import { broadcastToRole, broadcastToUser } from '../services/socketService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from './notificationController.js';
import { success } from '../utils/response.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { decrypt } from '../config/encryption.js';
import pool from '../config/database.js';

/**
 * Normalises a MySQL DATE to `YYYY-MM-DD`.
 *
 * mysql2 returns a DATE as a JS Date at LOCAL midnight, so `.toISOString()`
 * shifts the day one day backwards east of UTC (this project runs Asia/Kolkata).
 * A leave of "2 Oct to 7 Oct" was being announced to the employee as "1 Oct to
 * 6 Oct". Reading the local parts keeps the day the database actually stores.
 */
const toDateKey = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : null;
};

export const listLeaves = asyncHandler(async (req, res) => {
  const user_id = ['EMPLOYEE', 'INTERN'].includes(req.user.role) ? req.user.id : req.query.user_id;
  const list = await Leave.list({ status: req.query.status, user_id });
  return success(res, 200, list);
});

export const getLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new NotFoundError('Leave not found');
  if (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && leave.user_id !== req.user.id) {
    throw new ForbiddenError('Not authorized to view this leave');
  }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'VIEW_LEAVE',
    entity_type: 'LEAVE',
    entity_id: req.params.id,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  return success(res, 200, leave);
});

export const applyLeave = asyncHandler(async (req, res) => {
  if (req.user.role === 'SUPER_ADMIN') throw new ForbiddenError('Company monitoring accounts cannot create or change leave requests.');
  const { leave_type, start_date, end_date, reason } = req.body || {};
  if (!leave_type || !start_date || !end_date || !reason?.trim()) throw new BadRequestError('Leave type, dates, and reason are required');
  if (start_date > end_date) throw new BadRequestError('Start date must be on or before end date');
  const connection = await pool.getConnection();
  let leaveId;
  try {
    await connection.beginTransaction();
    await connection.execute('SELECT id FROM users WHERE id=? FOR UPDATE', [req.user.id]);
    const [overlaps] = await connection.execute(`SELECT id FROM leaves WHERE user_id=? AND status IN ('PENDING','APPROVED')
      AND start_date <= ? AND end_date >= ? LIMIT 1`, [req.user.id, end_date, start_date]);
    if (overlaps.length) throw new BadRequestError('This request overlaps an existing pending or approved leave');
    leaveId = crypto.randomUUID();
    await connection.execute(`INSERT INTO leaves (id,user_id,leave_type,start_date,end_date,reason,status)
      VALUES (?,?,?,?,?,?, 'PENDING')`, [leaveId, req.user.id, leave_type, start_date, end_date, reason.trim()]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'APPLY_LEAVE',
    entity_type: 'LEAVE',
    new_value: req.body,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  broadcastToRole('HR', 'leave_applied', { user_id: req.user.id, name: req.user.full_name });
  const [hrUsers] = await pool.execute("SELECT id FROM users WHERE role='HR' AND is_active=1");
  for (const u of hrUsers) {
    await createNotification(u.id, 'LEAVE_REQUEST', 'New leave request', `${req.user.full_name} submitted a ${leave_type} leave request`, 'LEAVE', leaveId);
  }
  return success(res, 201, null, 'Leave request submitted successfully');
});

export const updateLeaveStatus = asyncHandler(async (req, res) => {
  if (req.user.role === 'SUPER_ADMIN') throw new ForbiddenError('Company monitoring is read-only. HR reviews leave requests.');
  const { status, review_note: reviewNote } = req.body;
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new NotFoundError('Leave not found');

  const VALID = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  if (!VALID.includes(String(status).toUpperCase())) {
    throw new BadRequestError(`Invalid status. Must be one of: ${VALID.join(', ')}`);
  }

  const decision = String(status).toUpperCase();
  if (!['APPROVED', 'REJECTED', 'CANCELLED', 'PENDING'].includes(decision)) throw new BadRequestError('Invalid leave decision');
  if (decision === 'REJECTED' && !String(reviewNote || '').trim()) throw new BadRequestError('Please provide a reason when rejecting a leave request');
  if (String(reviewNote || '').length > 500) throw new BadRequestError('Leave review reason must be 500 characters or fewer');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [reference] = await connection.execute('SELECT user_id FROM leaves WHERE id=?', [req.params.id]);
    if (!reference.length) throw new NotFoundError('Leave not found');
    await connection.execute('SELECT id FROM users WHERE id=? FOR UPDATE', [reference[0].user_id]);
    const [locked] = await connection.execute('SELECT id,status,start_date,end_date,user_id FROM leaves WHERE id=? FOR UPDATE', [req.params.id]);
    if (!locked.length) throw new NotFoundError('Leave not found');
    if (locked[0].status !== 'PENDING') throw new BadRequestError('This leave request has already been reviewed');
    if (decision === 'APPROVED') {
      const [overlaps] = await connection.execute(`SELECT id FROM leaves WHERE user_id=? AND id<>? AND status='APPROVED'
        AND start_date <= ? AND end_date >= ? LIMIT 1`, [locked[0].user_id, req.params.id, locked[0].end_date, locked[0].start_date]);
      if (overlaps.length) throw new BadRequestError('An approved leave already overlaps these dates');
    }
    await connection.execute(`UPDATE leaves SET status=?, approved_by=?, review_note=? WHERE id=? AND status='PENDING'`,
      [decision, req.user.id, reviewNote || null, req.params.id]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }

  if (leave) {
    broadcastToUser(leave.user_id, 'leave_status_updated', { id: req.params.id, status });
  }

  // Post a feed row so the decision actually reaches the employee.
  //
  // This was the missing link in the leave workflow: the status was written and
  // a socket event fired, but nothing was ever written to activity_feeds, which
  // is the table the Employee Notifications page reads. An approved or rejected
  // request therefore produced no notification at all - the employee had to
  // happen to reload the Leave Management page to notice.
  //
  // The payload names the reviewer and the decision time so the employee can see
  // who approved it and when, not just that it changed.
  try {
    const reviewerName = req.user.full_name ? decrypt(req.user.full_name) : null;
    const reviewerLabel = reviewerName || `a ${String(req.user.role).toLowerCase().replace(/_/g, ' ')}`;
    const message =
      decision === 'APPROVED'
        ? `Your ${leave.leave_type || 'leave'} request for ${toDateKey(leave.start_date)} to ${toDateKey(leave.end_date)} was approved by ${reviewerLabel}.`
        : decision === 'REJECTED'
          ? `Your ${leave.leave_type || 'leave'} request for ${toDateKey(leave.start_date)} to ${toDateKey(leave.end_date)} was declined by ${reviewerLabel}.${reviewNote ? ` Reason: ${reviewNote}` : ''}`
          : decision === 'CANCELLED'
            ? `Your ${leave.leave_type || 'leave'} request was cancelled.`
            : `Your ${leave.leave_type || 'leave'} request was moved back to pending by ${reviewerLabel}.`;

    await ActivityFeed.create({
      user_id: leave.user_id,
      actor_id: req.user.id,
      event_type: `LEAVE_${decision}`,
      entity_type: 'Leave',
      entity_id: req.params.id,
      payload: {
        message,
        status: decision,
        leave_type: leave.leave_type,
        start_date: toDateKey(leave.start_date),
        end_date: toDateKey(leave.end_date),
        reason: leave.reason,
        reviewed_by_name: reviewerName,
        reviewed_by_role: req.user.role,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote || null
      }
    });
    await createNotification(leave.user_id, `LEAVE_${decision}`, `Leave ${decision.toLowerCase()}`, message, 'LEAVE', req.params.id);
  } catch (feedErr) {
    // Never fail an approval because the notification could not be written.
    console.error('Failed to record leave decision notification:', feedErr.message);
  }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'UPDATE_LEAVE_STATUS',
    entity_type: 'LEAVE',
    entity_id: req.params.id,
    old_value: leave,
    new_value: { status },
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  broadcastToRole('HR', 'leave_status_updated', { id: req.params.id, status });

  if (decision === 'APPROVED') {
    try {
      const CalendarEvent = (await import('../models/CalendarEvent.js')).default;
      const notificationRouter = (await import('../services/notificationRouter.js')).default;

      const startDateStr = (leave.start_date instanceof Date ? leave.start_date.toISOString() : String(leave.start_date)).slice(0, 10);
      const endDateStr = (leave.end_date instanceof Date ? leave.end_date.toISOString() : String(leave.end_date)).slice(0, 10);

      const calEventId = await CalendarEvent.create({
        title: `Leave: ${leave.leave_type || 'Time Off'} - ${leave.user_name || 'Staff Member'}`,
        description: `Approved leave: ${leave.reason || 'Personal'}`,
        event_type: 'LEAVE',
        event_type_id: 'evt_leave',
        start_time: `${startDateStr} 09:00:00`,
        end_time: `${endDateStr} 18:00:00`,
        is_all_day: true,
        created_by: leave.user_id,
        assigned_users: [leave.user_id],
        status: 'scheduled',
        role: 'HR'
      });

      const calEvent = await CalendarEvent.findById(calEventId);
      await notificationRouter.route('created', calEvent, req.user.id, req.user.role);
    } catch (calErr) {
      console.error('Failed to auto-create calendar event for approved leave:', calErr);
    }
  }

  return success(res, 200, null, 'Leave status updated successfully');
});

export const cancelLeave = asyncHandler(async (req, res) => {
  if (req.user.role === 'SUPER_ADMIN') throw new ForbiddenError('Company monitoring is read-only.');
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new NotFoundError('Leave not found');
  if (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && leave.user_id !== req.user.id) {
    throw new ForbiddenError('Not authorized to cancel this leave');
  }
  if (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && leave.status !== 'PENDING') {
    throw new ForbiddenError('Only pending leave requests may be cancelled by the requester');
  }
  await Leave.update(req.params.id, { status: 'CANCELLED' });
  await AuditLog.create({
    user_id: req.user.id,
    action: 'CANCEL_LEAVE',
    entity_type: 'LEAVE',
    entity_id: req.params.id,
    old_value: leave,
    new_value: { status: 'CANCELLED' },
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  broadcastToUser(leave.user_id, 'leave_cancelled', { id: req.params.id });
  broadcastToRole('HR', 'leave_cancelled', { id: req.params.id });
  return success(res, 200, null, 'Leave cancelled successfully');
});

export const updateLeave = asyncHandler(async (req, res) => {
  if (req.user.role === 'SUPER_ADMIN') throw new ForbiddenError('Company monitoring is read-only.');
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new NotFoundError('Leave not found');

  if (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && leave.user_id !== req.user.id) {
    throw new ForbiddenError('Not authorized to update this leave');
  }
  if (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'status')) throw new ForbiddenError('Only HR may change a leave decision');
    if (leave.status !== 'PENDING') throw new ForbiddenError('Only pending leave requests may be edited');
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'status')) throw new ForbiddenError('Use the leave decision endpoint to approve or reject requests');

  await Leave.update(req.params.id, req.body);
  const updated = await Leave.findById(req.params.id);

  await AuditLog.create({
    user_id: req.user.id,
    action: 'UPDATE_LEAVE',
    entity_type: 'LEAVE',
    entity_id: req.params.id,
    old_value: leave,
    new_value: req.body,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });

  broadcastToRole('HR', 'leave_updated', { id: req.params.id });
  return success(res, 200, updated, 'Leave updated successfully');
});

export const deleteLeave = asyncHandler(async (req, res) => {
  if (req.user.role === 'SUPER_ADMIN') throw new ForbiddenError('Company monitoring is read-only.');
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new NotFoundError('Leave not found');

  if (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && leave.user_id !== req.user.id) {
    throw new ForbiddenError('Not authorized to delete this leave');
  }

  await Leave.update(req.params.id, { status: 'CANCELLED' });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'CANCEL_LEAVE',
    entity_type: 'LEAVE',
    entity_id: req.params.id,
    old_value: leave,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });

  broadcastToRole('HR', 'leave_deleted', { id: req.params.id });
  return success(res, 200, null, 'Leave cancelled; the historical record was retained');
});

