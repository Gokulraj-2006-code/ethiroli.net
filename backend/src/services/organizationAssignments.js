import { BadRequestError } from '../utils/errors.js';

const ORG_FIELDS = ['branch_id', 'department_id', 'sub_role_id', 'reporting_manager_id'];

export async function resolveOrganizationAssignment(connection, body, current = {}) {
  if (!ORG_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(body, field))) return null;
  const branchId = body.branch_id ?? current.branch_id;
  const departmentId = Number(body.department_id ?? current.department_id);
  const subRoleId = body.sub_role_id ?? current.sub_role_id;
  const managerId = body.reporting_manager_id ?? current.reporting_manager_id ?? null;
  if (!branchId || !Number.isInteger(departmentId) || !subRoleId) {
    throw new BadRequestError('Branch, division, and sub-role must be assigned together');
  }
  const [branches] = await connection.execute('SELECT id FROM branches WHERE id=? AND is_active=1', [branchId]);
  const [departments] = await connection.execute(`SELECT department_id, department_name FROM departments WHERE department_id=?
    AND is_active=1 AND department_name IN ('Social Media','Technical','Content Creator','Marketing')`, [departmentId]);
  const [subRoles] = await connection.execute('SELECT id, department_id, name FROM organizational_sub_roles WHERE id=? AND is_active=1', [subRoleId]);
  if (!branches.length || !departments.length || !subRoles.length || Number(subRoles[0].department_id) !== departmentId) {
    throw new BadRequestError('Choose a valid branch, division, and sub-role combination');
  }
  if (managerId) {
    const [managers] = await connection.execute("SELECT id FROM users WHERE id=? AND role='PROJECT_MANAGER' AND is_active=1", [managerId]);
    if (!managers.length) throw new BadRequestError('Reporting manager must be an active Manager account');
  }
  return { branch_id: branchId, department_id: departmentId, sub_role_id: subRoleId,
    reporting_manager_id: managerId, department: departments[0].department_name,
    designation: subRoles[0].name };
}
