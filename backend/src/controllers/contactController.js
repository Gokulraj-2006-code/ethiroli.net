import crypto from 'crypto';
import pool from '../config/database.js';
import AuditLog from '../models/AuditLog.js';
import ActivityFeed from '../models/ActivityFeed.js';
import { broadcastToRole, broadcastToUser } from '../services/socketService.js';
import { logger } from '../config/logger.js';
import { createNotification } from './notificationController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { BadRequestError, NotFoundError, ValidationError } from '../utils/errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = ['NEW', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'MEETING_REQUESTED', 'RESOLVED', 'CLOSED'];

function splitName(value = '') {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  return { first_name: words.shift() || '', last_name: words.join(' ') };
}

function present(row) {
  return {
    ...row,
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    enquiry_type: row.category || row.inquiry_source || 'General',
    meeting_requested: Boolean(row.meeting_preference),
    status: row.status || (row.is_resolved ? 'RESOLVED' : row.is_read ? 'IN_PROGRESS' : 'NEW')
  };
}

export const listContactMessages = asyncHandler(async (req, res) => {
  const params = [];
  let where = 'i.is_deleted=0';
  if (req.query.status && VALID_STATUSES.includes(String(req.query.status).toUpperCase())) {
    where += ' AND i.status=?'; params.push(String(req.query.status).toUpperCase());
  }
  // The dashboard only needs the newest handful; the enquiries table still
  // requests the full 250-row window.
  const requested = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 250) : 250;
  const [rows] = await pool.execute(`SELECT i.*, u.full_name AS assigned_to_name FROM contact_inquiries i
    LEFT JOIN users u ON u.id=i.assigned_to WHERE ${where} ORDER BY i.created_at DESC LIMIT ${limit}`, params);
  const [counts] = await pool.execute(`SELECT COUNT(*) AS total,
    COALESCE(SUM(i.status='NEW'), 0) AS new_count FROM contact_inquiries i WHERE ${where}`, params);
  const items = rows.map(present);
  res.locals.meta = {
    total: Number(counts[0]?.total || 0),
    new_count: Number(counts[0]?.new_count || 0),
    returned: items.length
  };
  return success(res, 200, items, 'Contact enquiries retrieved');
});

export const getContactMessage = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`SELECT i.*, u.full_name AS assigned_to_name FROM contact_inquiries i
    LEFT JOIN users u ON u.id=i.assigned_to WHERE i.inquiry_id=? AND i.is_deleted=0`, [req.params.id]);
  if (!rows.length) throw new NotFoundError('Contact enquiry not found');
  return success(res, 200, present(rows[0]));
});

export const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, enquiry_type, meeting_preference } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanSubject = String(subject || '').trim();
  const cleanMessage = String(message || '').trim();
  if (cleanName.length < 2 || cleanName.length > 200) throw new ValidationError('Please provide a valid name');
  if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 255) throw new ValidationError('Please provide a valid email address');
  if (!cleanSubject || cleanSubject.length > 255) throw new ValidationError('Please provide a subject');
  if (cleanMessage.length < 5 || cleanMessage.length > 10000) throw new ValidationError('Message must be between 5 and 10000 characters');
  if (phone && String(phone).length > 50) throw new ValidationError('Phone number is too long');
  const preference = meeting_preference ? new Date(meeting_preference) : null;
  if (meeting_preference && Number.isNaN(preference.getTime())) throw new ValidationError('Meeting preference must be a valid date and time');
  const { first_name, last_name } = splitName(cleanName);
  const type = String(enquiry_type || 'General').trim().slice(0, 80) || 'General';
  // Avoid common double submissions without suppressing legitimate later enquiries.
  const [duplicates] = await pool.execute(`SELECT inquiry_id FROM contact_inquiries
    WHERE email=? AND subject=? AND message=? AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MINUTE) LIMIT 1`,
  [cleanEmail, cleanSubject, cleanMessage]);
  if (duplicates.length) return success(res, 200, { id: duplicates[0].inquiry_id, duplicate: true }, 'Your enquiry has already been received.');

  const id = crypto.randomUUID();
  const status = preference || /meeting/i.test(type) ? 'MEETING_REQUESTED' : 'NEW';
  const cleanPhone = phone ? String(phone).trim() : null;
  await pool.execute(`INSERT INTO contact_inquiries
    (inquiry_id, first_name, last_name, email, phone, subject, message, inquiry_source, category, status, meeting_preference)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'WEBSITE', ?, ?, ?)`,
  [id, first_name, last_name, cleanEmail, cleanPhone, cleanSubject, cleanMessage, type, status, preference]);
  const inquiry = { inquiry_id: id, name: cleanName, email: cleanEmail, phone: cleanPhone, subject: cleanSubject, message: cleanMessage, category: type, status, meeting_preference: preference };
  broadcastToRole('HR', 'new_contact_message', inquiry);
  broadcastToRole('SUPER_ADMIN', 'new_contact_message', inquiry);

  // Contact pipeline: every active HR and CEO account receives an Activity
  // Feed row (the tray the HR portal actually renders), a bell notification,
  // and a live socket event. Notification failures must never lose the
  // enquiry that already committed above, so each channel is best-effort.
  const [hrUsers] = await pool.execute("SELECT id FROM users WHERE role IN ('HR','SUPER_ADMIN') AND is_active=1");
  const feedPayload = {
    message: `New website enquiry from ${cleanName}: ${cleanSubject}`,
    inquiry_id: id,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    subject: cleanSubject,
    category: type,
    status,
    meeting_preference: preference ? preference.toISOString() : null,
    link: '/app/hr/enquiries'
  };
  for (const u of hrUsers) {
    try {
      const feedId = await ActivityFeed.create({
        user_id: u.id,
        actor_id: null,
        event_type: 'CONTACT_ENQUIRY_RECEIVED',
        entity_type: 'ContactEnquiry',
        entity_id: id,
        payload: feedPayload
      });
      broadcastToUser(u.id, 'new_activity', {
        id: feedId,
        user_id: u.id,
        event_type: 'CONTACT_ENQUIRY_RECEIVED',
        entity_type: 'ContactEnquiry',
        entity_id: id,
        payload: feedPayload,
        is_read: false,
        created_at: new Date().toISOString()
      });
    } catch (feedError) {
      logger.error('Could not create contact enquiry activity feed row', { userId: u.id, inquiryId: id, error: feedError.message });
    }
    try {
      await createNotification(u.id, 'CONTACT_ENQUIRY', 'New Contact Us message', `New enquiry from ${cleanName}: ${cleanSubject}`, 'CONTACT_INQUIRY', id);
    } catch (notificationError) {
      logger.error('Could not create contact enquiry bell notification', { userId: u.id, inquiryId: id, error: notificationError.message });
    }
  }

  return success(res, 201, { id }, 'Your enquiry has been received. Our team will contact you within 24 hours.');
});

export const updateContactMessage = asyncHandler(async (req, res) => {
  const { status, notes, assigned_to } = req.body || {};
  if (!VALID_STATUSES.includes(String(status || '').toUpperCase())) throw new BadRequestError(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  if (notes !== undefined && String(notes).length > 10000) throw new BadRequestError('Follow-up notes are too long');
  if (assigned_to) {
    const [owners] = await pool.execute("SELECT id FROM users WHERE id=? AND role='HR' AND is_active=1", [assigned_to]);
    if (!owners.length) throw new BadRequestError('Assigned owner must be an active HR account');
  }
  const [existing] = await pool.execute('SELECT inquiry_id FROM contact_inquiries WHERE inquiry_id=? AND is_deleted=0', [req.params.id]);
  if (!existing.length) throw new NotFoundError('Contact enquiry not found');
  await pool.execute(`UPDATE contact_inquiries SET status=?, is_read=1,
    is_resolved=?, resolved_at=IF(?=1, COALESCE(resolved_at, NOW()), NULL), notes=COALESCE(?, notes),
    assigned_to=COALESCE(?, assigned_to) WHERE inquiry_id=? AND is_deleted=0`,
  [String(status).toUpperCase(), ['RESOLVED', 'CLOSED'].includes(String(status).toUpperCase()) ? 1 : 0,
    ['RESOLVED', 'CLOSED'].includes(String(status).toUpperCase()) ? 1 : 0, notes ?? null, assigned_to ?? null, req.params.id]);
  await AuditLog.create({ user_id: req.user.id, action: 'UPDATE_CONTACT_ENQUIRY', entity_type: 'CONTACT_ENQUIRY', entity_id: req.params.id,
    new_value: { status, notes, assigned_to }, ip_address: req.ip || 'unknown', user_agent: req.headers['user-agent'] });
  return success(res, 200, { id: req.params.id, status: String(status).toUpperCase() }, 'Enquiry updated');
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const [existing] = await pool.execute('SELECT inquiry_id FROM contact_inquiries WHERE inquiry_id=? AND is_deleted=0', [req.params.id]);
  if (!existing.length) throw new NotFoundError('Contact enquiry not found');
  // Capture the Activity Feed rows before removing them so the HR portals can
  // drop the matching notification from their trays in real time.
  let activityIds = [];
  try {
    const [feedRows] = await pool.execute('SELECT id FROM activity_feeds WHERE entity_type=? AND entity_id=?', ['ContactEnquiry', req.params.id]);
    activityIds = feedRows.map((row) => row.id);
  } catch (e) { console.error('Could not read contact enquiry activity feeds:', e.message); }
  // Remove the related HR notification trail as well, so the bell inbox and
  // Activity Feed no longer reference an enquiry that no longer exists.
  try { await pool.execute('DELETE FROM notifications WHERE related_entity_type=? AND related_entity_id=?', ['CONTACT_INQUIRY', req.params.id]); } catch (e) { console.error('Could not delete contact enquiry notifications:', e.message); }
  try { await pool.execute('DELETE FROM activity_feeds WHERE entity_type=? AND entity_id=?', ['ContactEnquiry', req.params.id]); } catch (e) { console.error('Could not delete contact enquiry activity feeds:', e.message); }
  await pool.execute('UPDATE contact_inquiries SET is_deleted=1, deleted_at=NOW() WHERE inquiry_id=? AND is_deleted=0', [req.params.id]);
  // Tell every HR / CEO client to drop the notification from their tray.
  broadcastToRole('HR', 'contact_enquiry_deleted', { inquiry_id: req.params.id, activity_ids: activityIds });
  broadcastToRole('SUPER_ADMIN', 'contact_enquiry_deleted', { inquiry_id: req.params.id, activity_ids: activityIds });
  await AuditLog.create({ user_id: req.user.id, action: 'DELETE_CONTACT_ENQUIRY', entity_type: 'CONTACT_ENQUIRY', entity_id: req.params.id,
    new_value: { deleted: true }, ip_address: req.ip || 'unknown', user_agent: req.headers['user-agent'] });
  return success(res, 200, { id: req.params.id }, 'Enquiry deleted');
});

export const convertInquiryToLead = asyncHandler(async (req, res) => {
  throw new BadRequestError('Lead conversion is not enabled in the four-portal workflow. Update the enquiry status instead.');
});
