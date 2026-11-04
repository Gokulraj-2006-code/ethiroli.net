import crypto from 'crypto';
import pool from '../config/database.js';
import AuditLog from '../models/AuditLog.js';
import { broadcastToRole } from '../services/socketService.js';
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
  let sql = `SELECT i.*, u.full_name AS assigned_to_name FROM contact_inquiries i
    LEFT JOIN users u ON u.id=i.assigned_to WHERE i.is_deleted=0`;
  if (req.query.status && VALID_STATUSES.includes(String(req.query.status).toUpperCase())) {
    sql += ' AND i.status=?'; params.push(String(req.query.status).toUpperCase());
  }
  sql += ' ORDER BY i.created_at DESC LIMIT 250';
  const [rows] = await pool.execute(sql, params);
  const items = rows.map(present);
  return success(res, 200, items, 'Contact enquiries retrieved', { total: items.length });
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
  await pool.execute(`INSERT INTO contact_inquiries
    (inquiry_id, first_name, last_name, email, phone, subject, message, inquiry_source, category, status, meeting_preference)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'WEBSITE', ?, ?, ?)`,
  [id, first_name, last_name, cleanEmail, phone ? String(phone).trim() : null, cleanSubject, cleanMessage, type, status, preference]);
  const inquiry = { inquiry_id: id, name: cleanName, email: cleanEmail, phone: phone || null, subject: cleanSubject, message: cleanMessage, category: type, status, meeting_preference: preference };
  broadcastToRole('HR', 'new_contact_message', inquiry);
  broadcastToRole('SUPER_ADMIN', 'new_contact_message', inquiry);
  // Notify HR and CEO
  const [hrUsers] = await pool.execute("SELECT id FROM users WHERE role IN ('HR','SUPER_ADMIN') AND is_active=1");
  for (const u of hrUsers) {
    await createNotification(u.id, 'CONTACT_ENQUIRY', 'New Contact Us message', `New enquiry from ${cleanName}: ${cleanSubject}`, 'CONTACT_INQUIRY', id);
  }
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
  throw new BadRequestError('Contact enquiries are retained for history; close them instead.');
});

export const convertInquiryToLead = asyncHandler(async (req, res) => {
  throw new BadRequestError('Lead conversion is not enabled in the four-portal workflow. Update the enquiry status instead.');
});
