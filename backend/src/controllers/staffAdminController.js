import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { encrypt, encryptDeterministic, decrypt } from '../config/encryption.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

const parsePreferences = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch (e) { return {}; }
};

export const listStaff = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.email, u.full_name, u.phone, u.role, u.is_active, u.created_at, u.preferences,
            (SELECT s.branch_id FROM manager_scopes s WHERE s.manager_user_id = u.id ORDER BY s.branch_id LIMIT 1) AS scope_branch_id
     FROM users u
     WHERE u.role IN ('HR','PROJECT_MANAGER') AND u.is_active=1
     ORDER BY u.role, u.full_name`
  );
  const result = rows.map(r => {
    const prefs = parsePreferences(r.preferences);
    return {
      id: r.id,
      email: r.email ? decrypt(r.email) : null,
      full_name: r.full_name ? decrypt(r.full_name) : null,
      phone: r.phone ? decrypt(r.phone) : null,
      role: r.role,
      is_active: r.is_active,
      created_at: r.created_at,
      branch_id: r.scope_branch_id || prefs.branch_id || null,
      branch_name: null,
      department: prefs.department || null,
      designation: prefs.designation || null,
      joining_date: prefs.joining_date || null,
    };
  });
  // Resolve branch names
  const branchIds = [...new Set(result.map(r => r.branch_id).filter(Boolean))];
  if (branchIds.length) {
    const placeholders = branchIds.map(() => '?').join(',');
    const [branches] = await pool.execute(`SELECT id, name FROM branches WHERE id IN (${placeholders})`, branchIds);
    const map = new Map(branches.map(b => [b.id, b.name]));
    result.forEach(r => { r.branch_name = r.branch_id ? (map.get(r.branch_id) || null) : null; });
  }
  return success(res, 200, result);
});

export const createStaff = asyncHandler(async (req, res) => {
  const fullName = String(req.body.full_name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const role = req.body.role;
  const branchId = req.body.branch_id;
  const department = String(req.body.department || '').trim();
  const designation = String(req.body.designation || '').trim();
  const joiningDate = req.body.joining_date || null;
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirm_password || '');

  if (!fullName || !email || !role || !branchId || !department || !designation || !password) throw new BadRequestError('All required fields must be provided');
  if (!['HR','PROJECT_MANAGER'].includes(role)) throw new BadRequestError('Role must be HR or PROJECT_MANAGER');
  if (password.length < 8) throw new BadRequestError('Password must be at least 8 characters');
  if (confirmPassword && password !== confirmPassword) throw new BadRequestError('Passwords do not match');

  const encEmail = encryptDeterministic(email);
  const [existing] = await pool.execute('SELECT id FROM users WHERE email=?', [encEmail]);
  if (existing.length) throw new BadRequestError('Email already registered');

  const userId = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 12);
  const encName = encrypt(fullName);
  const encPhone = phone ? encrypt(phone) : null;
  const preferences = JSON.stringify({ department, designation, joining_date: joiningDate, branch_id: branchId });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, preferences) VALUES (?,?,?,?,?,?,1,?)', [userId, encEmail, hash, encName, encPhone, role, preferences]);
    await conn.execute(`INSERT INTO user_credentials (user_id, password_hash, password_algo, failed_login_attempts, lockout_until, requires_password_change, password_history) VALUES (?,?, 'BCRYPT', 0, NULL, FALSE, ?)`, [userId, hash, JSON.stringify([hash])]);
    if (role === 'PROJECT_MANAGER') {
      const scopeId = crypto.randomUUID();
      await conn.execute('INSERT INTO manager_scopes (id, manager_user_id, branch_id, department_id) VALUES (?,?,?,NULL)', [scopeId, userId, branchId]);
    }
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }

  return success(res, 201, { id: userId, email, role }, 'Staff account created successfully');
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.execute('SELECT id, role, preferences FROM users WHERE id=? AND role IN ("HR","PROJECT_MANAGER")', [id]);
  if (!rows.length) throw new NotFoundError('Staff account not found');
  const existingRole = rows[0].role;
  const existingPrefs = parsePreferences(rows[0].preferences);

  const fullName = req.body.full_name !== undefined ? String(req.body.full_name || '').trim() : undefined;
  const email = req.body.email !== undefined ? String(req.body.email || '').trim().toLowerCase() : undefined;
  const phone = req.body.phone !== undefined ? String(req.body.phone || '').trim() : undefined;
  const role = req.body.role !== undefined ? req.body.role : undefined;
  const branchId = req.body.branch_id !== undefined ? req.body.branch_id : undefined;
  const department = req.body.department !== undefined ? String(req.body.department || '').trim() : undefined;
  const designation = req.body.designation !== undefined ? String(req.body.designation || '').trim() : undefined;
  const joiningDate = req.body.joining_date !== undefined ? (req.body.joining_date || null) : undefined;
  const password = req.body.password !== undefined ? String(req.body.password || '') : undefined;
  const isActive = req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : undefined;

  if (role !== undefined && !['HR','PROJECT_MANAGER'].includes(role)) throw new BadRequestError('Role must be HR or PROJECT_MANAGER');
  if (password !== undefined && password !== '' && password.length < 8) throw new BadRequestError('Password must be at least 8 characters');
  if (password !== undefined && password !== '' && req.body.confirm_password !== undefined && password !== String(req.body.confirm_password || '')) throw new BadRequestError('Passwords do not match');

  if (email !== undefined && email !== '') {
    const encEmail = encryptDeterministic(email);
    const [existing] = await pool.execute('SELECT id FROM users WHERE email=? AND id<>?', [encEmail, id]);
    if (existing.length) throw new BadRequestError('Email already registered');
  }

  const prefs = { ...existingPrefs };
  if (department !== undefined) prefs.department = department;
  if (designation !== undefined) prefs.designation = designation;
  if (joiningDate !== undefined) prefs.joining_date = joiningDate;
  if (branchId !== undefined) prefs.branch_id = branchId;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const updates = [];
    const params = [];
    if (fullName !== undefined) { updates.push('full_name=?'); params.push(fullName ? encrypt(fullName) : null); }
    if (email !== undefined && email !== '') { updates.push('email=?'); params.push(encryptDeterministic(email)); }
    if (phone !== undefined) { updates.push('phone=?'); params.push(phone ? encrypt(phone) : null); }
    if (role !== undefined) { updates.push('role=?'); params.push(role); }
    if (isActive !== undefined) { updates.push('is_active=?'); params.push(isActive); }
    updates.push('preferences=?'); params.push(JSON.stringify(prefs));
    if (updates.length) {
      params.push(id);
      await conn.execute(`UPDATE users SET ${updates.join(', ')} WHERE id=?`, params);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      await conn.execute('UPDATE users SET password_hash=? WHERE id=?', [hash, id]);
      await conn.execute(
        `INSERT INTO user_credentials (user_id, password_hash, password_algo, failed_login_attempts, lockout_until, requires_password_change, password_history)
         VALUES (?,?, 'BCRYPT', 0, NULL, FALSE, ?)
         ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), password_updated_at=NOW(), requires_password_change=FALSE, password_history=VALUES(password_history)`,
        [id, hash, JSON.stringify([hash])]
      );
    }

    const newRole = role !== undefined ? role : existingRole;
    if (newRole === 'HR') {
      await conn.execute('DELETE FROM manager_scopes WHERE manager_user_id=?', [id]);
    } else if (newRole === 'PROJECT_MANAGER' && branchId !== undefined) {
      await conn.execute('DELETE FROM manager_scopes WHERE manager_user_id=?', [id]);
      if (branchId) {
        const scopeId = crypto.randomUUID();
        await conn.execute('INSERT INTO manager_scopes (id, manager_user_id, branch_id, department_id) VALUES (?,?,?,NULL)', [scopeId, id, branchId]);
      }
    }
    if (isActive === 0) await conn.execute('DELETE FROM sessions WHERE user_id=?', [id]);
    await conn.commit();
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }

  return success(res, 200, { id }, 'Staff account updated successfully');
});

export const toggleStaffStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  await pool.execute('UPDATE users SET is_active=? WHERE id=? AND role IN ("HR","PROJECT_MANAGER")', [is_active ? 1 : 0, id]);
  if (!is_active) await pool.execute('DELETE FROM sessions WHERE user_id=?', [id]);
  return success(res, 200, { id, is_active }, 'Status updated');
});

export const deactivateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.execute('UPDATE users SET is_active=0 WHERE id=? AND role IN ("HR","PROJECT_MANAGER")', [id]);
  await pool.execute('DELETE FROM sessions WHERE user_id=?', [id]);
  return success(res, 200, { id, is_active: false }, 'Staff account deactivated');
});

export const activateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.execute('UPDATE users SET is_active=1 WHERE id=? AND role IN ("HR","PROJECT_MANAGER")', [id]);
  return success(res, 200, { id, is_active: true }, 'Staff account activated');
});

export default { listStaff, createStaff, updateStaff, toggleStaffStatus, deactivateStaff, activateStaff };
