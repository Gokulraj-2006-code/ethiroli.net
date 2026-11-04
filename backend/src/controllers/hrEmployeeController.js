import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { encrypt, encryptDeterministic } from '../config/encryption.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { BadRequestError } from '../utils/errors.js';

export const createEmployeeWithPassword = asyncHandler(async (req, res) => {
  const isIntern = req.body.employment_type === 'Intern';
  const fullName = String(req.body.full_name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const employeeCode = String(req.body.employee_code || '').trim();
  const phone = String(req.body.phone || '').trim();
  const branchId = req.body.branch_id;
  const departmentId = Number(req.body.department_id);
  const subRoleId = req.body.sub_role_id;
  const managerId = req.body.reporting_manager_id || null;
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirm_password || '');
  const dateOfJoining = req.body.date_of_joining || null;
  const startDate = req.body.start_date || null;
  const endDate = req.body.end_date || null;

  if (!fullName || !email || !employeeCode || !phone || !branchId || !departmentId || !subRoleId) {
    throw new BadRequestError('All required fields must be provided');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestError('Invalid email');
  if (password.length < 8) throw new BadRequestError('Password must be at least 8 characters');
  if (password !== confirmPassword) throw new BadRequestError('Passwords do not match');

  const [deptRows] = await pool.execute('SELECT department_name FROM departments WHERE department_id=?', [departmentId]);
  const deptName = deptRows[0]?.department_name || '';
  const [subRows] = await pool.execute('SELECT name FROM organizational_sub_roles WHERE id=?', [subRoleId]);
  const subRoleName = subRows[0]?.name || '';

  const encEmail = encryptDeterministic(email);
  const [existing] = await pool.execute('SELECT id FROM users WHERE email=?', [encEmail]);
  if (existing.length) throw new BadRequestError('Email already registered');

  const [codeCheck] = await pool.execute('SELECT id FROM employees WHERE employee_code=?', [employeeCode]);
  if (codeCheck.length) throw new BadRequestError('Employee ID already exists');

  const userId = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 12);
  const encName = encrypt(fullName);
  const encPhone = encrypt(phone);

  const profileId = crypto.randomUUID();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active)
       VALUES (?,?,?,?,?,?,1)`,
      [userId, encEmail, hash, encName, encPhone, isIntern ? 'INTERN' : 'EMPLOYEE']
    );
    if (isIntern) {
      await conn.execute(
        `INSERT INTO interns (id, user_id, employee_code, department_id, sub_role_id, branch_id, reporting_manager_id, start_date, end_date, account_status)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [profileId, userId, employeeCode, departmentId, subRoleId, branchId, managerId, startDate, endDate, 'ACTIVE']
      );
    } else {
      await conn.execute(
        `INSERT INTO employees (id, user_id, employee_code, department, designation, branch_id, department_id, sub_role_id, reporting_manager_id, account_status, date_of_joining)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [profileId, userId, employeeCode, deptName, subRoleName, branchId, departmentId, subRoleId, managerId, 'ACTIVE', dateOfJoining]
      );
    }
    await conn.execute(
      `INSERT INTO user_credentials (user_id, password_hash, password_algo, failed_login_attempts, lockout_until, requires_password_change, password_history)
       VALUES (?,?, 'BCRYPT', 0, NULL, TRUE, ?)
       ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), requires_password_change=TRUE`,
      [userId, hash, JSON.stringify([hash])]
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  return success(res, 201, { id: profileId, user_id: userId, email, employee_code: employeeCode }, 'Account created. Employee must change password on first login.');
});
