import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';
import { broadcastToRole } from '../services/socketService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

import User from '../models/User.js';
import { BadRequestError, AuthorizationError } from '../utils/errors.js';
import { resolveOrganizationAssignment } from '../services/organizationAssignments.js';

// CEO monitoring includes employment and organizational details, but must not
// expose financial, government-ID, or personal contact information.
const employeeViewFor = (user, employee) => {
  if (user.role !== 'SUPER_ADMIN' || !employee) return employee;
  const monitoringFields = { ...employee };
  for (const field of [
    'pan', 'bank_account', 'pf_number', 'uan', 'salary_structure_id',
    'blood_group', 'emergency_contact', 'address'
  ]) delete monitoringFields[field];
  return monitoringFields;
};

export const listEmployees = asyncHandler(async (req, res) => {
  const list = await Employee.list();
  return success(res, 200, list.map(employee => employeeViewFor(req.user, employee)));
});

export const createEmployee = asyncHandler(async (req, res) => {
  throw new BadRequestError('Use the secure HR onboarding invitation workflow at /v1/hr/onboarding/employee');
});

export const getEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) throw new NotFoundError('Employee not found');
  return success(res, 200, employeeViewFor(req.user, emp));
});

import pool from '../config/database.js';

export const updateEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) throw new NotFoundError('Employee not found');
  const connection = await pool.getConnection();
  try {
    const assignment = await resolveOrganizationAssignment(connection, req.body, emp);
    await Employee.update(req.params.id, { ...req.body, ...(assignment || {}) });
  } finally { connection.release(); }

  if (emp.user_id && (req.body.name || req.body.full_name || req.body.email || req.body.is_active !== undefined)) {
    const userUpdates = {};
    if (req.body.name || req.body.full_name) userUpdates.full_name = req.body.name || req.body.full_name;
    if (req.body.email) userUpdates.email = req.body.email;
    if (req.body.is_active !== undefined) userUpdates.is_active = Boolean(req.body.is_active);
    await User.update(emp.user_id, userUpdates);
  }
  if (req.body.is_active !== undefined && req.body.account_status === undefined) {
    await Employee.update(req.params.id, { account_status: req.body.is_active ? 'ACTIVE' : 'ARCHIVED' });
  }

  await AuditLog.create({
    user_id: req.user.id,
    action: 'UPDATE_EMPLOYEE',
    entity_type: 'EMPLOYEE',
    entity_id: req.params.id,
    old_value: emp,
    new_value: req.body,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  broadcastToRole('HR', 'employee_updated', { id: req.params.id });
  const updated = await Employee.findById(req.params.id);
  return success(res, 200, updated, 'Employee updated successfully');
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) throw new NotFoundError('Employee not found');
  await Employee.update(req.params.id, { account_status: 'ARCHIVED' });
  if (emp.user_id) {
    await User.update(emp.user_id, { is_active: false });
    await pool.query('DELETE FROM sessions WHERE user_id = ?', [emp.user_id]);
  }
  await AuditLog.create({
    user_id: req.user.id,
    action: 'DELETE_EMPLOYEE',
    entity_type: 'EMPLOYEE',
    entity_id: req.params.id,
    old_value: emp,
    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']
  });
  broadcastToRole('HR', 'employee_deleted', { id: req.params.id });
  return success(res, 200, null, 'Employee archived; historical records were retained');
});
