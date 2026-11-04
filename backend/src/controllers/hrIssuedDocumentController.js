import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';
import { decrypt } from '../config/encryption.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { success } from '../utils/response.js';

const storageDir = path.resolve(process.env.PRIVATE_DOCUMENTS_DIR || path.join(process.cwd(), 'private-documents'));
// Keep base64 JSON payloads beneath the application's 10 MB JSON parser limit.
const MAX_BYTES = 7 * 1024 * 1024;
const TYPES = new Set(['OFFER_LETTER', 'APPOINTMENT_LETTER', 'INTERNSHIP_CERTIFICATE', 'EMPLOYMENT_CERTIFICATE', 'EXPERIENCE_LETTER', 'OTHER']);
const safeName = (value) => {
  if (!value) return '';
  const plain = decrypt(value);
  if (plain !== value) return plain;
  return /^[a-f0-9]{24}:[a-f0-9]{32}:/i.test(value) ? '' : value;
};

const validateRecipient = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.role, u.full_name, u.email,
       EXISTS(SELECT 1 FROM employees e WHERE e.user_id=u.id) AS is_employee,
       EXISTS(SELECT 1 FROM interns i WHERE i.user_id=u.id) AS is_intern
     FROM users u WHERE u.id=? AND u.is_active=1 LIMIT 1`, [userId]
  );
  const person = rows[0];
  if (!person || !['EMPLOYEE', 'INTERN'].includes(person.role) || !(person.is_employee || person.is_intern)) {
    throw new BadRequestError('Choose an active employee or intern with a personnel record.');
  }
  return { ...person, full_name: safeName(person.full_name), email: safeName(person.email) };
};

export const listPeople = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.role, u.full_name, u.email, e.employee_code, e.designation AS job_title
     FROM users u JOIN employees e ON e.user_id=u.id
     WHERE u.is_active=1 AND u.role='EMPLOYEE'
     UNION ALL
     SELECT u.id, u.role, u.full_name, u.email, i.employee_code, NULL AS job_title
     FROM users u JOIN interns i ON i.user_id=u.id
     WHERE u.is_active=1 AND u.role='INTERN'
     ORDER BY full_name`
  );
  return success(res, 200, rows.map((r) => ({ ...r, full_name: safeName(r.full_name), email: safeName(r.email) })));
});

export const issueDocument = asyncHandler(async (req, res) => {
  const { recipient_user_id, title, document_type, original_filename, file_base64 } = req.body || {};
  if (!recipient_user_id || !title?.trim() || !TYPES.has(document_type) || !original_filename || !file_base64) {
    throw new BadRequestError('Recipient, title, document type, and PDF file are required.');
  }
  if (!String(original_filename).toLowerCase().endsWith('.pdf')) throw new BadRequestError('Only PDF documents are accepted.');
  const encoded = String(file_base64).replace(/^data:application\/pdf;base64,/i, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || encoded.length > Math.ceil(MAX_BYTES * 4 / 3) + 4) {
    throw new BadRequestError('PDF is invalid or exceeds the 7 MB limit.');
  }
  const file = Buffer.from(encoded, 'base64');
  if (file.length > MAX_BYTES || file.subarray(0, 5).toString() !== '%PDF-') throw new BadRequestError('The selected file must be a valid PDF up to 7 MB.');
  const recipient = await validateRecipient(recipient_user_id);
  const id = crypto.randomUUID();
  const storageKey = `${crypto.randomUUID()}.pdf`;
  await fs.promises.mkdir(storageDir, { recursive: true });
  const filePath = path.join(storageDir, storageKey);
  await fs.promises.writeFile(filePath, file, { flag: 'wx', mode: 0o600 });
  try {
    await pool.execute(
      `INSERT INTO hr_issued_documents (id,recipient_user_id,recipient_role,title,document_type,original_filename,storage_key,file_size_bytes,uploaded_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, recipient.id, recipient.role, title.trim(), document_type, path.basename(original_filename).slice(0, 255), storageKey, file.length, req.user.id]
    );
  } catch (error) {
    await fs.promises.unlink(filePath).catch(() => {});
    throw error;
  }
  return success(res, 201, { id, recipient_name: recipient.full_name }, 'Document delivered to recipient portal.');
});

export const listIssuedDocuments = asyncHandler(async (req, res) => {
  const isHr = ['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
  const [rows] = await pool.execute(
    `SELECT d.id,d.recipient_user_id,d.recipient_role,d.title,d.document_type,d.original_filename,d.file_size_bytes,d.created_at,
            u.full_name AS recipient_name,u.email AS recipient_email
     FROM hr_issued_documents d JOIN users u ON u.id=d.recipient_user_id
     ${isHr ? '' : 'WHERE d.recipient_user_id=?'} ORDER BY d.created_at DESC`,
    isHr ? [] : [req.user.id]
  );
  const data = rows.map((r) => ({ ...r, recipient_name: safeName(r.recipient_name), recipient_email: safeName(r.recipient_email) }));
  return success(res, 200, data);
});

export const downloadIssuedDocument = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM hr_issued_documents WHERE id=? LIMIT 1', [req.params.id]);
  const doc = rows[0];
  if (!doc || (!['HR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && doc.recipient_user_id !== req.user.id)) throw new NotFoundError('Document not found');
  const filePath = path.resolve(storageDir, doc.storage_key);
  if (path.dirname(filePath) !== storageDir) throw new NotFoundError('Document not found');
  await fs.promises.access(filePath, fs.constants.R_OK);
  const downloadName = path.basename(doc.original_filename).replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '') || 'document.pdf';
  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': String(doc.file_size_bytes), 'Content-Disposition': `attachment; filename="${downloadName}"`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' });
  return fs.createReadStream(filePath).pipe(res);
});
