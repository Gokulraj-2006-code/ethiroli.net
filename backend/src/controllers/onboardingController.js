import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { encrypt, encryptDeterministic, decrypt } from '../config/encryption.js';
import { sendEmail } from '../services/emailService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

const required = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new BadRequestError(`${field} is required`);
  return value.trim();
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function validateOrganization(connection, body, isIntern) {
  const branchId = required(body.branch_id, 'branch_id');
  const departmentId = Number(body.department_id);
  const subRoleId = required(body.sub_role_id, 'sub_role_id');
  const managerId = body.reporting_manager_id || null;
  const [branchRows, departmentRows, subRoleRows] = await Promise.all([
    connection.execute('SELECT id FROM branches WHERE id=? AND is_active=1', [branchId]).then(([rows]) => rows),
    connection.execute('SELECT department_id, department_name FROM departments WHERE department_id=? AND is_active=1', [departmentId]).then(([rows]) => rows),
    connection.execute('SELECT id, department_id, name FROM organizational_sub_roles WHERE id=? AND is_active=1', [subRoleId]).then(([rows]) => rows)
  ]);
  const department = departmentRows[0];
  const subRole = subRoleRows[0];
  if (!branchRows.length || !department || !subRole || Number(subRole.department_id) !== departmentId) {
    throw new BadRequestError('Choose a valid branch, division, and sub-role combination');
  }
  if (managerId) {
    const [managers] = await connection.execute("SELECT id FROM users WHERE id=? AND role='PROJECT_MANAGER' AND is_active=1", [managerId]);
    if (!managers.length) throw new BadRequestError('Reporting manager must be an active Manager account');
  }
  if (isIntern) {
    const start = required(body.start_date, 'start_date');
    const end = required(body.end_date, 'end_date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) throw new BadRequestError('Internship dates are invalid');
  } else {
    required(body.date_of_joining, 'date_of_joining');
  }
  return { branchId, departmentId, departmentName: department.department_name, subRoleId, subRoleName: subRole.name, managerId };
}

export const createPersonnel = asyncHandler(async (req, res) => {
  const isIntern = req.params.kind === 'intern';
  if (!isIntern && req.params.kind !== 'employee') throw new NotFoundError('Onboarding type not found');
  const fullName = required(req.body.full_name, 'full_name');
  const email = required(req.body.email, 'email').toLowerCase();
  const employeeCode = required(req.body.employee_code, 'employee_code');
  if (!emailPattern.test(email)) throw new BadRequestError('email is invalid');
  if (fullName.length > 255 || employeeCode.length > 50) throw new BadRequestError('A field exceeds its allowed length');
  const phone = req.body.phone ? String(req.body.phone).trim() : null;
  if (!phone || !/^\+?[0-9 ()-]{7,20}$/.test(phone)) throw new BadRequestError('A valid contact phone number is required');
  const profileId = crypto.randomUUID();
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const connection = await pool.getConnection();
  let userId = crypto.randomUUID();
  let invitationSent = false;
  try {
    await connection.beginTransaction();
    const org = await validateOrganization(connection, req.body, isIntern);
    const emailCipher = encryptDeterministic(email);
    const [duplicate] = await connection.execute('SELECT id FROM users WHERE email=? LIMIT 1', [emailCipher]);
    if (duplicate.length) throw new BadRequestError('An account with this email already exists');
    const codeTable = isIntern ? 'interns' : 'employees';
    const [duplicateCode] = await connection.execute(`SELECT id FROM ${codeTable} WHERE employee_code=? LIMIT 1`, [employeeCode]);
    if (duplicateCode.length) throw new BadRequestError('This employee ID is already in use');
    const [existingManager] = org.managerId ? await connection.execute('SELECT id FROM users WHERE id=? AND is_active=1', [org.managerId]) : [[]];
    const randomHash = await bcrypt.hash(crypto.randomBytes(48).toString('hex'), 12);
    await connection.execute(`INSERT INTO users (id,email,password_hash,full_name,phone,role,is_active) VALUES (?,?,?,?,?,?,0)`,
      [userId, emailCipher, randomHash, encrypt(fullName), phone ? encrypt(phone) : null, isIntern ? 'INTERN' : 'EMPLOYEE']);
    if (isIntern) {
      await connection.execute(`INSERT INTO interns (id,user_id,mentor_id,start_date,end_date,employee_code,branch_id,department_id,sub_role_id,reporting_manager_id,account_status)
        VALUES (?,?,?,?,?,?,?,?,?,?, 'ACTIVE')`, [profileId, userId, existingManager[0]?.id || null, req.body.start_date,
        req.body.end_date, employeeCode, org.branchId, org.departmentId, org.subRoleId, org.managerId]);
    } else {
      await connection.execute(`INSERT INTO employees (id,user_id,employee_code,department,department_id,designation,date_of_joining,branch_id,sub_role_id,reporting_manager_id,account_status)
        VALUES (?,?,?,?,?,?,?,?,?,?, 'ACTIVE')`, [profileId, userId, employeeCode, org.departmentName, org.departmentId,
        org.subRoleName, req.body.date_of_joining, org.branchId, org.subRoleId, org.managerId]);
    }
    await connection.execute('INSERT INTO account_invitations (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 HOUR))', [userId, tokenHash]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }

  try {
    const activationUrl = `${process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/activate?token=${encodeURIComponent(rawToken)}`;
    const result = await sendEmail(email, 'Set up your Ethiroli account',
      `<p>Hello ${fullName.replace(/[&<>"']/g, '')},</p><p>HR has created your Ethiroli account. Set your password using this one-time link, which expires in 24 hours:</p><p><a href="${activationUrl}">Activate account</a></p>`,
      `Activate your Ethiroli account within 24 hours: ${activationUrl}`);
    invitationSent = result?.success === true && result?.simulated !== true;
  } catch { invitationSent = false; }
  if (!invitationSent) await pool.execute('DELETE FROM account_invitations WHERE token_hash=?', [tokenHash]);
  return success(res, 201, { id: profileId, user_id: userId, employee_code: employeeCode, invitationSent,
    onboardingStatus: invitationSent ? 'INVITATION_SENT' : 'ACCOUNT_PENDING_EMAIL_CONFIGURATION' },
  invitationSent ? 'Personnel record created and activation email sent' : 'Personnel record created; account remains inactive until an activation email can be delivered');
});

export const activateAccount = asyncHandler(async (req, res) => {
  const token = required(req.body.token, 'token');
  const password = required(req.body.password, 'password');
  if (!/^[a-f0-9]{64}$/i.test(token) || password.length < 12) throw new BadRequestError('Token or password is invalid');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(`SELECT ai.id, ai.user_id FROM account_invitations ai
      JOIN users u ON u.id=ai.user_id WHERE ai.token_hash=? AND ai.consumed_at IS NULL
      AND ai.expires_at>UTC_TIMESTAMP() AND u.is_active=0 FOR UPDATE`, [tokenHash]);
    if (!rows.length) throw new BadRequestError('Activation link is invalid or expired');
    const hash = await bcrypt.hash(password, 12);
    await connection.execute('UPDATE users SET password_hash=?,is_active=1 WHERE id=?', [hash, rows[0].user_id]);
    await connection.execute('UPDATE account_invitations SET consumed_at=UTC_TIMESTAMP() WHERE id=?', [rows[0].id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  return success(res, 200, null, 'Account activated. You can now sign in.');
});

export const resendInvitation = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`SELECT u.id, u.email, u.full_name FROM users u
    WHERE u.id=? AND u.role IN ('EMPLOYEE','INTERN') AND u.is_active=0
    AND (EXISTS (SELECT 1 FROM employees e WHERE e.user_id=u.id)
      OR EXISTS (SELECT 1 FROM interns i WHERE i.user_id=u.id)) LIMIT 1`, [req.params.userId]);
  if (!rows.length) throw new NotFoundError('Inactive employee or intern account not found');
  const email = decrypt(rows[0].email);
  const fullName = decrypt(rows[0].full_name) || 'team member';
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await pool.execute('DELETE FROM account_invitations WHERE user_id=? AND consumed_at IS NULL', [rows[0].id]);
  await pool.execute('INSERT INTO account_invitations (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 24 HOUR))', [rows[0].id, tokenHash]);
  let sent = false;
  try {
    const activationUrl = `${process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/activate?token=${encodeURIComponent(token)}`;
    const result = await sendEmail(email, 'Set up your Ethiroli account',
      `<p>Hello ${String(fullName).replace(/[&<>"']/g, '')},</p><p>Use this one-time link to set your password. It expires in 24 hours:</p><p><a href="${activationUrl}">Activate account</a></p>`,
      `Activate your Ethiroli account within 24 hours: ${activationUrl}`);
    sent = result?.success === true && result?.simulated !== true;
  } catch { sent = false; }
  if (!sent) await pool.execute('DELETE FROM account_invitations WHERE token_hash=?', [tokenHash]);
  return success(res, 200, { invitationSent: sent }, sent ? 'Activation email sent' : 'Email delivery is unavailable; account remains inactive');
});
