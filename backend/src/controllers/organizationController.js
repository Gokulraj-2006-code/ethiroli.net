import pool from '../config/database.js';
import { decrypt } from '../config/encryption.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { AuthorizationError, BadRequestError, NotFoundError } from '../utils/errors.js';
import crypto from 'node:crypto';
import { businessDate } from '../config/timezone.js';

const managerOnly = (req) => req.user?.role === 'PROJECT_MANAGER';
const safeName = (value) => value ? (decrypt(value) || value) : null;

async function getManagerScopeIds(userId) {
  const [rows] = await pool.execute(
    'SELECT branch_id, department_id FROM manager_scopes WHERE manager_user_id = ?',
    [userId]
  );
  return rows;
}

function scopePredicate(scopes, alias, params) {
  if (!scopes.length) return ' AND 1 = 0';
  const parts = scopes.map((scope) => {
    params.push(scope.branch_id);
    if (scope.department_id === null) return `${alias}.branch_id = ?`;
    params.push(scope.department_id);
    return `(${alias}.branch_id = ? AND ${alias}.department_id = ?)`;
  });
  return ` AND (${parts.join(' OR ')})`;
}

const monthDateList = (month) => {
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) throw new BadRequestError('month must use YYYY-MM format');
  const [year, monthNumber] = month.split('-').map(Number);
  if (monthNumber < 1 || monthNumber > 12) throw new BadRequestError('Invalid calendar month');
  const end = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from({ length: end }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
};

async function addAttendanceCalendar(people, month) {
  const days = monthDateList(month);
  const userIds = people.map((person) => person.user_id);
  if (!userIds.length) return { month, days, people: [] };
  const placeholders = userIds.map(() => '?').join(',');
  const startDate = days[0];
  const endDate = days[days.length - 1];
  const [[attendance], [leaves], [holidays], [sessionRows]] = await Promise.all([
    pool.execute(`SELECT user_id, DATE_FORMAT(date,'%Y-%m-%d') work_date, status,
        check_in_time, check_out_time, total_hours, worked_minutes, session_count
      FROM attendance WHERE user_id IN (${placeholders}) AND date BETWEEN ? AND ?`, [...userIds, startDate, endDate]),
    pool.execute(`SELECT user_id, DATE_FORMAT(start_date,'%Y-%m-%d') start_date,
        DATE_FORMAT(end_date,'%Y-%m-%d') end_date, leave_type
      FROM leaves WHERE user_id IN (${placeholders}) AND status='APPROVED'
        AND start_date <= ? AND end_date >= ?`, [...userIds, endDate, startDate]),
    pool.execute(`SELECT DATE_FORMAT(date,'%Y-%m-%d') work_date, name FROM holidays WHERE date BETWEEN ? AND ?`, [startDate, endDate]),
    pool.execute(`SELECT user_id, DATE_FORMAT(work_date,'%Y-%m-%d') work_date,
        COUNT(*) session_count, SUM(worked_minutes) worked_minutes,
        MIN(check_in_time) first_check_in,
        MAX(CASE WHEN status='COMPLETED' THEN check_out_time ELSE NULL END) last_check_out,
        SUM(status='ACTIVE') active_count,
        MAX(CASE WHEN status='ACTIVE' THEN check_in_time ELSE NULL END) active_check_in
      FROM attendance_sessions WHERE user_id IN (${placeholders}) AND work_date BETWEEN ? AND ?
      GROUP BY user_id, work_date`, [...userIds, startDate, endDate])
  ]);
  const attendanceByKey = new Map(attendance.map((row) => [`${row.user_id}:${row.work_date}`, row]));
  const sessionsByKey = new Map(sessionRows.map((row) => [`${row.user_id}:${row.work_date}`, row]));
  const leavesByUser = new Map();
  for (const leave of leaves) {
    const userLeaves = leavesByUser.get(leave.user_id) || [];
    userLeaves.push(leave);
    leavesByUser.set(leave.user_id, userLeaves);
  }
  const holidayByDate = new Map(holidays.map((row) => [row.work_date, row.name]));
  const today = businessDate();
  const calendarPeople = people.map((person) => {
    const calendar = days.map((date) => {
      const record = attendanceByKey.get(`${person.user_id}:${date}`);
      const session = sessionsByKey.get(`${person.user_id}:${date}`);
      const leave = (leavesByUser.get(person.user_id) || []).find((row) => row.start_date <= date && row.end_date >= date);
      const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
      const joined = person.start_date ? String(person.start_date).slice(0, 10) : null;
      let status;
      if (joined && date < joined) status = 'NOT_JOINED';
      else if (weekday === 0) status = 'SUNDAY';
      // A company holiday is always a non-working day, even if a stale
      // attendance/leave row exists for that date.
      else if (holidayByDate.has(date)) status = 'HOLIDAY';
      else if ((record && ['PRESENT', 'ON_TIME', 'LATE', 'HALF_DAY'].includes(record.status)) || session) status = 'PRESENT';
      else if (leave) status = 'LEAVE';
      else if (date <= today) status = 'ABSENT';
      else status = 'FUTURE';
      const open = Number(session?.active_count || 0) > 0;
      const activeStart = session?.active_check_in ? new Date(session.active_check_in).getTime() : 0;
      const liveMinutes = open && Number.isFinite(activeStart) ? Math.max(0, Math.floor((Date.now() - activeStart) / 60000)) : 0;
      const workedMinutes = session
        ? Number(session.worked_minutes || 0) + liveMinutes
        : record?.worked_minutes != null
          ? Number(record.worked_minutes)
          : Math.round(Number(record?.total_hours || 0) * 60);
      return {
        date,
        status,
        check_in_time: session?.first_check_in || record?.check_in_time || null,
        check_out_time: open ? null : (session?.last_check_out || record?.check_out_time || null),
        worked_minutes: workedMinutes,
        worked_hours: Number((workedMinutes / 60).toFixed(2)),
        session_count: Number(session?.session_count || record?.session_count || 0),
        is_punched_in: open,
        leave_type: leave?.leave_type || null,
        holiday_name: holidayByDate.get(date) || null,
        available: status !== 'ABSENT' && status !== 'LEAVE' && status !== 'NOT_JOINED'
      };
    });
    const presentDays = calendar.filter((day) => day.status === 'PRESENT').length;
    return { ...person, full_name: safeName(person.full_name), calendar, present_days: presentDays };
  });
  const [taskCounts] = await pool.execute(`SELECT assigned_to AS user_id, COUNT(*) AS open_task_count
    FROM tasks WHERE assigned_to IN (${placeholders}) AND status NOT IN ('COMPLETED','CANCELLED')
    GROUP BY assigned_to`, userIds);
  const tasksByUser = new Map(taskCounts.map((row) => [row.user_id, Number(row.open_task_count)]));
  const peopleWithAvailability = calendarPeople.map((person) => {
    const openTaskCount = tasksByUser.get(person.user_id) || 0;
    const current = person.calendar.find((day) => day.date === today);
    const attendanceAvailable = current?.status === 'PRESENT';
    const availability = current?.status === 'ABSENT' || current?.status === 'LEAVE'
      ? 'NOT_AVAILABLE' : attendanceAvailable ? (openTaskCount ? 'BUSY' : 'AVAILABLE') : 'UNKNOWN';
    return { ...person, open_task_count: openTaskCount, availability };
  });
  return { month, days, people: peopleWithAvailability };
}

export const getOrganizationStructure = asyncHandler(async (req, res) => {
  const [branches, departments, subRoles, managerRows] = await Promise.all([
    pool.execute('SELECT id, name FROM branches WHERE is_active = 1 ORDER BY name').then(([r]) => r),
    pool.execute('SELECT department_id AS id, department_name AS name FROM departments WHERE is_active = 1 AND department_name IN (\'Social Media\',\'Technical\',\'Content Creator\',\'Marketing\') ORDER BY department_name').then(([r]) => r),
    pool.execute(`SELECT sr.id, sr.name, sr.department_id, d.department_name
      FROM organizational_sub_roles sr JOIN departments d ON d.department_id = sr.department_id
      WHERE sr.is_active = 1 ORDER BY d.department_name, sr.name`).then(([r]) => r),
    pool.execute("SELECT id, full_name FROM users WHERE role='PROJECT_MANAGER' AND is_active=1 ORDER BY full_name").then(([r]) => r)
  ]);
  const managers = managerRows.map((row) => ({ ...row, full_name: safeName(row.full_name) }));
  return success(res, 200, { branches, departments, subRoles, managers });
});

export const createSubRole = asyncHandler(async (req, res) => {
  const departmentId = Number(req.body.department_id);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!Number.isInteger(departmentId) || !name || name.length > 150) throw new BadRequestError('department_id and a sub-role name (1–150 characters) are required');
  const [department] = await pool.execute(`SELECT department_id FROM departments WHERE department_id=?
    AND department_name IN ('Social Media','Technical','Content Creator','Marketing') AND is_active=1`, [departmentId]);
  if (!department.length) throw new BadRequestError('Choose one of the four company divisions');
  await pool.execute('INSERT INTO organizational_sub_roles (department_id,name) VALUES (?,?)', [departmentId, name]);
  return success(res, 201, { department_id: departmentId, name }, 'Sub-role added');
});

export const updateSubRole = asyncHandler(async (req, res) => {
  const updates = [];
  const values = [];
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.trim().length > 150) throw new BadRequestError('Sub-role name must contain 1–150 characters');
    updates.push('name=?'); values.push(req.body.name.trim());
  }
  if (req.body.is_active !== undefined) {
    if (typeof req.body.is_active !== 'boolean') throw new BadRequestError('is_active must be a boolean');
    updates.push('is_active=?'); values.push(req.body.is_active ? 1 : 0);
  }
  if (!updates.length) throw new BadRequestError('No supported sub-role changes were supplied');
  values.push(req.params.id);
  const [result] = await pool.execute(`UPDATE organizational_sub_roles SET ${updates.join(',')} WHERE id=?`, values);
  if (!result.affectedRows) throw new BadRequestError('Sub-role not found');
  return success(res, 200, null, 'Sub-role updated');
});

export const getManagerScopes = asyncHandler(async (req, res) => {
  const [manager] = await pool.execute("SELECT id FROM users WHERE id=? AND role='PROJECT_MANAGER' LIMIT 1", [req.params.managerId]);
  if (!manager.length) throw new NotFoundError('Manager not found');
  const [scopes] = await pool.execute(`SELECT s.branch_id,b.name branch_name,s.department_id,d.department_name
    FROM manager_scopes s JOIN branches b ON b.id=s.branch_id
    LEFT JOIN departments d ON d.department_id=s.department_id
    WHERE s.manager_user_id=? ORDER BY b.name,d.department_name`, [req.params.managerId]);
  return success(res, 200, scopes);
});

export const setManagerScopes = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.scopes) || req.body.scopes.length > 50) throw new BadRequestError('scopes must be an array of at most 50 entries');
  const connection = await pool.getConnection();
  let scopeCount = 0;
  try {
    await connection.beginTransaction();
    const [manager] = await connection.execute("SELECT id FROM users WHERE id=? AND role='PROJECT_MANAGER' AND is_active=1 FOR UPDATE", [req.params.managerId]);
    if (!manager.length) throw new NotFoundError('Active manager not found');
    const seen = new Set();
    for (const scope of req.body.scopes) {
      if (!/^[0-9a-f-]{36}$/i.test(String(scope.branch_id || ''))) throw new BadRequestError('Each scope requires a valid branch_id');
      const departmentId = scope.department_id === null || scope.department_id === '' ? null : Number(scope.department_id);
      if (departmentId !== null && !Number.isInteger(departmentId)) throw new BadRequestError('department_id must be an integer or null');
      const [branches] = await connection.execute('SELECT id FROM branches WHERE id=? AND is_active=1', [scope.branch_id]);
      if (!branches.length) throw new BadRequestError('Scope contains an inactive or unknown branch');
      if (departmentId !== null) {
        const [departments] = await connection.execute(`SELECT department_id FROM departments WHERE department_id=? AND is_active=1
          AND department_name IN ('Social Media','Technical','Content Creator','Marketing')`, [departmentId]);
        if (!departments.length) throw new BadRequestError('Scope contains an unknown company division');
      }
      const key = `${scope.branch_id}:${departmentId ?? '*'}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    await connection.execute('DELETE FROM manager_scopes WHERE manager_user_id=?', [req.params.managerId]);
    for (const key of seen) {
      const [branchId, department] = key.split(':');
      await connection.execute('INSERT INTO manager_scopes (manager_user_id,branch_id,department_id) VALUES (?,?,?)',
        [req.params.managerId, branchId, department === '*' ? null : Number(department)]);
    }
    scopeCount = seen.size;
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  return success(res, 200, { scopeCount }, 'Manager scope assignments saved');
});

export const getPeopleDirectory = asyncHandler(async (req, res) => {
  const params = [];
  let employeeScope = '';
  let internScope = '';
  if (managerOnly(req)) {
    const scopes = await getManagerScopeIds(req.user.id);
    const employeeParams = [];
    const internParams = [];
    employeeScope = scopePredicate(scopes, 'e', employeeParams);
    internScope = scopePredicate(scopes, 'i', internParams);
    req._employeeScopeParams = employeeParams;
    req._internScopeParams = internParams;
  }
  if (req.user.role !== 'HR') {
    employeeScope += ' AND u.is_active = 1';
    internScope += ' AND u.is_active = 1';
  }
  // HR records live in the employees table for profile and attendance data,
  // but they are not direct reports in a manager's assigned team directory.
  const employeeRoles = managerOnly(req) ? "u.role = 'EMPLOYEE'"
    : req.user.role === 'HR' ? "u.role = 'EMPLOYEE'"
    : "u.role IN ('EMPLOYEE','HR')";
  const branchFilter = req.query.branch_id;
  if (branchFilter) {
    if (!/^[0-9a-f-]{36}$/i.test(branchFilter)) throw new BadRequestError('Invalid branch_id');
    employeeScope += ' AND e.branch_id = ?';
    internScope += ' AND i.branch_id = ?';
    req._employeeScopeParams?.push(branchFilter);
    req._internScopeParams?.push(branchFilter);
    if (!managerOnly(req)) params.push(branchFilter);
  }
  const employeeParams = req._employeeScopeParams || params;
  const internParams = req._internScopeParams || params;
  const [employees, interns] = await Promise.all([
    pool.execute(`SELECT u.id AS user_id, e.id AS profile_id, e.employee_code, u.full_name, u.role, u.is_active,
        e.department, e.designation AS sub_role, DATE_FORMAT(e.date_of_joining,'%Y-%m-%d') AS start_date,
        e.account_status, b.id AS branch_id, b.name AS branch_name, d.department_name,
        e.reporting_manager_id, 'Employee' AS employment_type, a.status AS attendance_status,
        a.check_in_time, a.check_out_time, a.worked_minutes, a.total_hours, a.session_count
      FROM employees e JOIN users u ON u.id = e.user_id
      LEFT JOIN attendance a ON a.user_id=u.id AND a.date=DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))
      LEFT JOIN branches b ON b.id = e.branch_id
      LEFT JOIN departments d ON d.department_id = e.department_id
      WHERE ${employeeRoles}${employeeScope}
      ORDER BY u.full_name`, employeeParams).then(([r]) => r),
    pool.execute(`SELECT u.id AS user_id, i.id AS profile_id, i.employee_code, u.full_name, u.role, u.is_active,
        'Intern' AS employment_type, DATE_FORMAT(i.start_date,'%Y-%m-%d') AS start_date, DATE_FORMAT(i.end_date,'%Y-%m-%d') AS end_date, i.account_status,
        b.id AS branch_id, b.name AS branch_name, d.department_name,
        sr.name AS sub_role, i.reporting_manager_id, a.status AS attendance_status,
        a.check_in_time, a.check_out_time, a.worked_minutes, a.total_hours, a.session_count
      FROM interns i JOIN users u ON u.id = i.user_id
      LEFT JOIN attendance a ON a.user_id=u.id AND a.date=DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))
      LEFT JOIN branches b ON b.id = i.branch_id
      LEFT JOIN departments d ON d.department_id = i.department_id
      LEFT JOIN organizational_sub_roles sr ON sr.id = i.sub_role_id
      WHERE u.role = 'INTERN'${internScope}
      ORDER BY u.full_name`, internParams).then(([r]) => r)
  ]);
  const managers = ['HR', 'SUPER_ADMIN'].includes(req.user.role)
    ? await pool.execute(`SELECT u.id AS user_id, NULL AS profile_id, u.employee_code, u.full_name, u.role, u.is_active,
        NULL AS department, 'Manager' AS sub_role, DATE_FORMAT(u.created_at,'%Y-%m-%d') AS start_date,
        'ACTIVE' AS account_status,
        (SELECT s.branch_id FROM manager_scopes s WHERE s.manager_user_id=u.id ORDER BY s.branch_id LIMIT 1) AS branch_id,
        (SELECT b.name FROM manager_scopes s JOIN branches b ON b.id=s.branch_id WHERE s.manager_user_id=u.id ORDER BY b.name LIMIT 1) AS branch_name,
        NULL AS department_name, NULL AS reporting_manager_id, 'Manager' AS employment_type,
        a.status AS attendance_status, a.check_in_time, a.check_out_time, a.worked_minutes, a.total_hours, a.session_count
      FROM users u LEFT JOIN attendance a ON a.user_id=u.id AND a.date=DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30'))
      WHERE u.role='PROJECT_MANAGER' AND u.is_active=1
        ${branchFilter ? 'AND EXISTS (SELECT 1 FROM manager_scopes s WHERE s.manager_user_id=u.id AND s.branch_id=?)' : ''}
      ORDER BY u.full_name`, branchFilter ? [branchFilter] : []).then(([r]) => r)
    : [];
  const people = [...employees, ...interns, ...managers].map((person) => ({ ...person, full_name: safeName(person.full_name) }));
  return success(res, 200, people, 'Organization directory retrieved');
});

export const getPersonMonitoring = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const isManagerSelf = managerOnly(req) && req.user.id === userId;
  const allowedRoles = isManagerSelf ? "('EMPLOYEE','HR','INTERN','PROJECT_MANAGER')"
    : ['HR', 'SUPER_ADMIN'].includes(req.user.role) ? "('EMPLOYEE','HR','INTERN','PROJECT_MANAGER')"
      : "('EMPLOYEE','HR','INTERN')";
  const [identities] = await pool.execute(`SELECT id AS user_id, full_name, role, is_active FROM users WHERE id=? AND role IN ${allowedRoles} LIMIT 1`, [userId]);
  const identity = identities[0];
  if (!identity) throw new BadRequestError('Person not found');
  const profileQuery = identity.role === 'PROJECT_MANAGER'
    ? `SELECT id AS user_id, full_name, role, is_active, NULL AS employee_code, 'Manager' AS employment_type,
        NULL AS department_id, NULL AS department, NULL AS sub_role, DATE_FORMAT(created_at,'%Y-%m-%d') AS start_date,
        'ACTIVE' AS account_status, NULL AS branch_id, NULL AS branch_name, NULL AS department_name,
        NULL AS reporting_manager_id, NULL AS end_date FROM users WHERE id=? LIMIT 1`
    : identity.role === 'INTERN'
    ? `SELECT u.id AS user_id, u.full_name, u.role, u.is_active, i.employee_code, 'Intern' AS employment_type,
        i.department_id, d.department_name AS department, sr.name AS sub_role,
        DATE_FORMAT(i.start_date,'%Y-%m-%d') AS start_date, i.account_status, i.branch_id, b.name AS branch_name,
        d.department_name, i.reporting_manager_id, DATE_FORMAT(i.end_date,'%Y-%m-%d') AS end_date
      FROM users u JOIN interns i ON i.user_id=u.id LEFT JOIN branches b ON b.id=i.branch_id
      LEFT JOIN departments d ON d.department_id=i.department_id LEFT JOIN organizational_sub_roles sr ON sr.id=i.sub_role_id
      WHERE u.id=? LIMIT 1`
    : `SELECT u.id AS user_id, u.full_name, u.role, u.is_active, e.employee_code, 'Employee' AS employment_type,
        e.department_id, e.department, e.designation AS sub_role, DATE_FORMAT(e.date_of_joining,'%Y-%m-%d') AS start_date,
        e.account_status, e.branch_id, b.name AS branch_name, d.department_name, e.reporting_manager_id, NULL AS end_date
      FROM users u JOIN employees e ON e.user_id=u.id LEFT JOIN branches b ON b.id=e.branch_id
      LEFT JOIN departments d ON d.department_id=e.department_id WHERE u.id=? LIMIT 1`;
  const [people] = await pool.execute(profileQuery, [userId]);
  const person = people[0];
  if (!person) throw new BadRequestError('Personnel profile not found');
  if (managerOnly(req) && !isManagerSelf) await assertManagerTargetInScope(req.user.id, userId);
  person.full_name = safeName(person.full_name);
  const month = String(req.query.month || businessDate().slice(0, 7));
  const monthData = await addAttendanceCalendar([person], month);
  const monitoredPerson = monthData.people[0];
  const todayStatus = monitoredPerson.calendar.find((day) => day.date === businessDate());
  monitoredPerson.availability = todayStatus?.status === 'ABSENT' || todayStatus?.status === 'LEAVE'
    ? 'NOT_AVAILABLE' : todayStatus?.status === 'PRESENT' ? 'AVAILABLE' : 'UNKNOWN';
  const [attendance, leaves, tasks, taskHistory] = await Promise.all([
    pool.execute(`SELECT date, status, check_in_time, check_out_time FROM attendance
      WHERE user_id=? ORDER BY date DESC LIMIT 90`, [userId]).then(([r]) => r),
    pool.execute(`SELECT leave_type, start_date, end_date, status FROM leaves
      WHERE user_id=? ORDER BY created_at DESC LIMIT 25`, [userId]).then(([r]) => r),
    pool.execute(`SELECT t.id, t.description, t.due_date, t.status, t.priority, t.project_id, p.name AS project_name
      FROM tasks t LEFT JOIN student_projects p ON p.id=t.project_id
      WHERE t.assigned_to=? ORDER BY t.updated_at DESC LIMIT 50`, [userId]).then(([r]) => r),
    pool.execute(`SELECT h.event_type, h.from_status, h.to_status, h.note, h.created_at, t.description AS task_description, u.full_name AS actor_name
      FROM task_history h JOIN tasks t ON t.id=h.task_id LEFT JOIN users u ON u.id=h.actor_user_id
      WHERE t.assigned_to=? ORDER BY h.created_at DESC LIMIT 100`, [userId]).then(([r]) => r.map((row) => ({ ...row, actor_name: safeName(row.actor_name) })))
  ]);
  const [coverage] = await pool.execute(`SELECT c.id, DATE_FORMAT(c.work_date,'%Y-%m-%d') work_date,
      c.absent_user_id, c.replacement_user_id, c.task_id, c.note, c.created_at,
      absent.full_name AS absent_name, replacement.full_name AS replacement_name
    FROM attendance_coverage c JOIN users absent ON absent.id=c.absent_user_id
    JOIN users replacement ON replacement.id=c.replacement_user_id
    WHERE c.absent_user_id=? OR c.replacement_user_id=? ORDER BY c.work_date DESC LIMIT 50`, [userId, userId]);
  const openTaskCount = tasks.filter((task) => !['COMPLETED', 'CANCELLED'].includes(task.status)).length;
  if (monitoredPerson.availability === 'AVAILABLE' && openTaskCount > 0) monitoredPerson.availability = 'BUSY';
  monitoredPerson.open_task_count = openTaskCount;
  return success(res, 200, { person: monitoredPerson, attendance, calendar: monthData, leaves, tasks, taskHistory,
    coverage: coverage.map((row) => ({ ...row, absent_name: safeName(row.absent_name), replacement_name: safeName(row.replacement_name) })) }, 'Read-only personnel record retrieved');
});

export const getAttendanceCalendar = asyncHandler(async (req, res) => {
  const date = req.query.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) throw new BadRequestError('A date in YYYY-MM-DD format is required');
  if (Number.isNaN(Date.parse(`${date}T00:00:00Z`))) throw new BadRequestError('Invalid calendar date');
  if (managerOnly(req)) throw new AuthorizationError('Use the assigned team attendance view');
  const params = [date, date, date, date, date];
  let branch = '';
  if (req.query.branch_id) {
    if (!/^[0-9a-f-]{36}$/i.test(req.query.branch_id)) throw new BadRequestError('Invalid branch_id');
    branch = ' AND p.branch_id = ?'; params.push(req.query.branch_id);
  }
  const [rows] = await pool.execute(`SELECT p.user_id, p.employee_code, p.full_name, p.employment_type,
      p.branch_id, b.name AS branch_name, p.department_name, p.sub_role, a.status AS recorded_status,
      a.check_in_time, a.check_out_time,
      CASE WHEN DAYOFWEEK(?) = 1 THEN 'SUNDAY'
           WHEN a.id IS NOT NULL THEN a.status
           WHEN h.id IS NOT NULL THEN 'HOLIDAY'
           WHEN l.user_id IS NOT NULL THEN 'APPROVED_LEAVE'
           WHEN ? <= DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30')) THEN 'ABSENT'
           ELSE 'FUTURE' END AS day_status,
      h.name AS holiday_name
    FROM (
      SELECT u.id user_id,e.employee_code,u.full_name,'Employee' employment_type,e.branch_id,d.department_name,e.designation sub_role
      FROM employees e JOIN users u ON u.id=e.user_id LEFT JOIN departments d ON d.department_id=e.department_id
      WHERE u.is_active=1 AND u.role IN ('EMPLOYEE','HR')
      UNION ALL
      SELECT u.id,i.employee_code,u.full_name,'Intern',i.branch_id,d.department_name,sr.name
      FROM interns i JOIN users u ON u.id=i.user_id LEFT JOIN departments d ON d.department_id=i.department_id
        LEFT JOIN organizational_sub_roles sr ON sr.id=i.sub_role_id WHERE u.is_active=1 AND u.role='INTERN'
      UNION ALL
      SELECT u.id,NULL AS employee_code,u.full_name,'Manager',NULL AS branch_id,NULL AS department_name,'Manager' AS sub_role
      FROM users u WHERE u.is_active=1 AND u.role='PROJECT_MANAGER'
    ) p LEFT JOIN branches b ON b.id=p.branch_id
    LEFT JOIN attendance a ON a.user_id=p.user_id AND a.date=?
    LEFT JOIN holidays h ON h.date=?
    LEFT JOIN leaves l ON l.user_id=p.user_id AND l.status='APPROVED' AND ? BETWEEN l.start_date AND l.end_date
    WHERE p.user_id IS NOT NULL${branch} ORDER BY b.name, p.department_name, p.full_name`,
    params);
  const output = rows.map((row) => ({ ...row, full_name: safeName(row.full_name) }));
  return success(res, 200, { date, rows: output }, 'Attendance day view retrieved');
});

export const getAttendanceCalendarMonth = asyncHandler(async (req, res) => {
  const month = String(req.query.month || businessDate().slice(0, 7));
  const dates = monthDateList(month);
  const manager = managerOnly(req);
  const scopes = manager ? await getManagerScopeIds(req.user.id) : [];
  const employeeParams = [];
  const internParams = [];
  let employeeScope = manager ? scopePredicate(scopes, 'e', employeeParams) : '';
  let internScope = manager ? scopePredicate(scopes, 'i', internParams) : '';
  if (manager) {
    employeeScope += " AND u.role = 'EMPLOYEE' AND u.is_active = 1";
    internScope += " AND u.is_active = 1";
  } else {
    employeeScope += " AND u.role IN ('EMPLOYEE','HR') AND u.is_active = 1";
    internScope += " AND u.is_active = 1";
  }
  const [employees, interns] = await Promise.all([
    pool.execute(`SELECT u.id AS user_id, u.full_name, u.role, e.employee_code,
        e.designation AS sub_role, e.branch_id, e.department_id,
        DATE_FORMAT(e.date_of_joining,'%Y-%m-%d') AS start_date,
        b.name AS branch_name, d.department_name, 'Employee' AS employment_type
      FROM employees e JOIN users u ON u.id=e.user_id
      LEFT JOIN branches b ON b.id=e.branch_id LEFT JOIN departments d ON d.department_id=e.department_id
      WHERE 1=1${employeeScope} ORDER BY u.full_name`, employeeParams).then(([rows]) => rows),
    pool.execute(`SELECT u.id AS user_id, u.full_name, u.role, i.employee_code,
        sr.name AS sub_role, i.branch_id, i.department_id,
        DATE_FORMAT(i.start_date,'%Y-%m-%d') AS start_date,
        b.name AS branch_name, d.department_name, 'Intern' AS employment_type
      FROM interns i JOIN users u ON u.id=i.user_id
      LEFT JOIN branches b ON b.id=i.branch_id LEFT JOIN departments d ON d.department_id=i.department_id
      LEFT JOIN organizational_sub_roles sr ON sr.id=i.sub_role_id
      WHERE 1=1${internScope} ORDER BY u.full_name`, internParams).then(([rows]) => rows)
  ]);
  const people = [...employees, ...interns];
  if (manager) {
    const [selfRows] = await pool.execute(`SELECT id AS user_id, full_name, role, NULL AS employee_code,
        NULL AS sub_role, NULL AS branch_id, NULL AS department_id, DATE_FORMAT(created_at,'%Y-%m-%d') AS start_date,
        NULL AS branch_name, NULL AS department_name, 'Manager' AS employment_type
      FROM users WHERE id=? AND role='PROJECT_MANAGER' AND is_active=1`, [req.user.id]);
    people.push(...selfRows);
  } else if (['HR', 'SUPER_ADMIN'].includes(req.user.role)) {
    const [managerRows] = await pool.execute(`SELECT id AS user_id, full_name, role, NULL AS employee_code,
        NULL AS sub_role, NULL AS branch_id, NULL AS department_id, DATE_FORMAT(created_at,'%Y-%m-%d') AS start_date,
        NULL AS branch_name, NULL AS department_name, 'Manager' AS employment_type
      FROM users WHERE role='PROJECT_MANAGER' AND is_active=1 ORDER BY full_name`);
    people.push(...managerRows);
  }
  const calendar = await addAttendanceCalendar(people, month);
  return success(res, 200, calendar, 'Attendance month retrieved');
});

export const assignAttendanceCoverage = asyncHandler(async (req, res) => {
  const { work_date: workDate, absent_user_id: absentUserId, replacement_user_id: replacementUserId } = req.body || {};
  const taskIds = Array.isArray(req.body?.task_ids) ? [...new Set(req.body.task_ids)] : [];
  const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 1000) : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(workDate || '')) || Number.isNaN(Date.parse(`${workDate}T00:00:00Z`))) {
    throw new BadRequestError('work_date must use YYYY-MM-DD format');
  }
  if (![absentUserId, replacementUserId].every((id) => /^[0-9a-f-]{36}$/i.test(String(id || ''))) || absentUserId === replacementUserId) {
    throw new BadRequestError('Choose two different valid people for coverage');
  }
  if (taskIds.some((id) => !/^[0-9a-f-]{36}$/i.test(String(id || '')))) throw new BadRequestError('Invalid task id');
  const [people] = await pool.execute(`SELECT id, role, is_active FROM users
    WHERE id IN (?,?)`, [absentUserId, replacementUserId]);
  const absent = people.find((person) => person.id === absentUserId);
  const replacement = people.find((person) => person.id === replacementUserId);
  if (!absent || !replacement || ![absent.role, replacement.role].every((role) => ['EMPLOYEE', 'INTERN'].includes(role)) ||
      !absent.is_active || !replacement.is_active) throw new BadRequestError('Coverage can only be assigned between active employees or interns');

  const connection = await pool.getConnection();
  let coveredTasks = [];
  try {
    await connection.beginTransaction();
    const [[absentAttendance], [replacementAttendance], [approvedLeave]] = await Promise.all([
      connection.execute(`SELECT id,status FROM attendance WHERE user_id=? AND date=? FOR UPDATE`, [absentUserId, workDate]),
      connection.execute(`SELECT id,status FROM attendance WHERE user_id=? AND date=? FOR UPDATE`, [replacementUserId, workDate]),
      connection.execute(`SELECT user_id FROM leaves WHERE user_id IN (?,?) AND status='APPROVED'
        AND start_date<=? AND end_date>=?`, [absentUserId, replacementUserId, workDate, workDate])
    ]);
    if (absentAttendance.some((row) => ['PRESENT','ON_TIME','LATE','HALF_DAY'].includes(row.status))) {
      throw new BadRequestError('This person is marked present for that date and does not need cover');
    }
    if (approvedLeave.some((row) => row.user_id === absentUserId)) throw new BadRequestError('This person is on approved leave for that date');
    if (approvedLeave.some((row) => row.user_id === replacementUserId) ||
        !replacementAttendance.some((row) => ['PRESENT','ON_TIME','LATE','HALF_DAY'].includes(row.status))) {
      throw new BadRequestError('Choose a replacement who is recorded present and not on leave for that date');
    }

    const [tasks] = taskIds.length ? await connection.execute(
      `SELECT id,status FROM tasks WHERE id IN (${taskIds.map(() => '?').join(',')})
        AND assigned_to=? AND due_date=? AND status NOT IN ('COMPLETED','CANCELLED') FOR UPDATE`,
      [...taskIds, absentUserId, workDate]
    ) : [[]];
    if (taskIds.length && tasks.length !== taskIds.length) throw new BadRequestError('One or more selected tasks are not open and assigned to the absent person for that date');
    coveredTasks = tasks;
    const rowsToRecord = coveredTasks.length ? coveredTasks : [{ id: null, status: null }];
    for (const task of rowsToRecord) {
      await connection.execute(`INSERT INTO attendance_coverage
        (id,work_date,absent_user_id,replacement_user_id,task_id,assigned_by,note)
        VALUES (?,?,?,?,?,?,?)`, [crypto.randomUUID(), workDate, absentUserId, replacementUserId, task.id, req.user.id, note]);
      if (task.id) {
        await connection.execute('UPDATE tasks SET assigned_to=? WHERE id=?', [replacementUserId, task.id]);
        await connection.execute(`INSERT INTO task_history (task_id,actor_user_id,event_type,note)
          VALUES (?,?,'TASK_REASSIGNED',?)`, [task.id, req.user.id, `Coverage for ${workDate}; replaced absent team member ${absentUserId}`]);
      }
    }
    await connection.execute(`INSERT INTO audit_logs
      (user_id,action,entity_type,entity_id,old_value,new_value,ip_address,user_agent)
      VALUES (?,'ASSIGN_ATTENDANCE_COVERAGE','ATTENDANCE_COVERAGE',?,?,?, ?,?)`,
    [req.user.id, absentUserId, JSON.stringify({ absentUserId, workDate }),
      JSON.stringify({ absentUserId, replacementUserId, workDate, taskIds: coveredTasks.map((task) => task.id) }),
      req.ip || req.headers['x-forwarded-for'] || 'unknown', req.headers['user-agent'] || null]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
  return success(res, 201, { work_date: workDate, absent_user_id: absentUserId,
    replacement_user_id: replacementUserId, tasks_reassigned: coveredTasks.length }, 'Coverage assignment saved');
});

export const getCompanyOverview = asyncHandler(async (req, res) => {
  if (managerOnly(req)) throw new AuthorizationError('Manager monitoring is available only through the assigned team workspace');
  const scopes = managerOnly(req) ? await getManagerScopeIds(req.user.id) : null;
  const branchId = req.query.branch_id || null;
  if (branchId && !/^[0-9a-f-]{36}$/i.test(branchId)) throw new BadRequestError('Invalid branch_id');
  if (scopes) {
    const permitted = scopes.some((s) => s.branch_id === branchId || (!branchId && s.branch_id));
    if (branchId && !permitted) throw new AuthorizationError('Branch is outside your assigned scope');
    if (!scopes.length) throw new AuthorizationError('No manager team scope is assigned');
  }
  const scopeParts = [];
  const scopeParams = [];
  if (branchId) { scopeParts.push('branch_id = ?'); scopeParams.push(branchId); }
  if (scopes) {
    const or = scopes.map((s) => {
      scopeParams.push(s.branch_id);
      if (s.department_id === null) return 'branch_id = ?';
      scopeParams.push(s.department_id);
      return '(branch_id = ? AND department_id = ?)';
    });
    scopeParts.push(`(${or.join(' OR ')})`);
  }
  const scoped = scopeParts.length ? ` AND ${scopeParts.join(' AND ')}` : '';
  const [branches, departments, attendance, taskRows] = await Promise.all([
    pool.execute(`SELECT b.id, b.name,
      (SELECT COUNT(*) FROM employees e JOIN users u ON u.id=e.user_id WHERE e.branch_id=b.id AND u.is_active=1) employees,
      (SELECT COUNT(*) FROM interns i JOIN users u ON u.id=i.user_id WHERE i.branch_id=b.id AND u.is_active=1) interns
      FROM branches b WHERE b.is_active=1 ORDER BY b.name`).then(([r]) => r),
    pool.execute(`SELECT d.department_name AS department,
        SUM(CASE WHEN x.kind = 'EMPLOYEE' THEN 1 ELSE 0 END) AS employees,
        SUM(CASE WHEN x.kind = 'INTERN' THEN 1 ELSE 0 END) AS interns
      FROM departments d LEFT JOIN (
        SELECT e.department AS department_name, e.branch_id, 'EMPLOYEE' AS kind
        FROM employees e JOIN users u ON u.id=e.user_id WHERE u.is_active=1
        UNION ALL
        SELECT d2.department_name, i.branch_id, 'INTERN' AS kind
        FROM interns i JOIN users u ON u.id=i.user_id JOIN departments d2 ON d2.department_id=i.department_id WHERE u.is_active=1
      ) x ON x.department_name=d.department_name${branchId ? ' AND x.branch_id = ?' : ''}
      WHERE d.department_name IN ('Social Media','Technical','Content Creator','Marketing')
      GROUP BY d.department_name ORDER BY d.department_name`, branchId ? [branchId] : []).then(([r]) => r),
    pool.execute(`SELECT a.status, COUNT(*) AS count FROM attendance a
      JOIN users u ON u.id=a.user_id LEFT JOIN employees e ON e.user_id=u.id LEFT JOIN interns i ON i.user_id=u.id
      WHERE a.date = DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30')) AND u.role IN ('EMPLOYEE','INTERN')
      ${branchId ? 'AND COALESCE(e.branch_id,i.branch_id) = ?' : ''} GROUP BY a.status`, branchId ? [branchId] : []).then(([r]) => r),
    pool.execute(`SELECT t.status, COUNT(*) AS count FROM tasks t
      LEFT JOIN employees e ON e.user_id=t.assigned_to LEFT JOIN interns i ON i.user_id=t.assigned_to
      WHERE t.assigned_to IS NOT NULL${branchId ? ' AND COALESCE(e.branch_id,i.branch_id) = ?' : ''}
      GROUP BY status`, branchId ? [branchId] : []).then(([r]) => r)
  ]);
  const [employees, interns, missingAttendance] = await Promise.all([
    pool.execute(`SELECT COUNT(*) count FROM employees e JOIN users u ON u.id=e.user_id WHERE u.is_active=1${scoped}`, scopeParams).then(([r]) => Number(r[0].count)),
    pool.execute(`SELECT COUNT(*) count FROM interns i JOIN users u ON u.id=i.user_id WHERE u.is_active=1${scoped}`, scopeParams).then(([r]) => Number(r[0].count)),
    pool.execute(`SELECT COUNT(*) count FROM users u LEFT JOIN employees e ON e.user_id=u.id LEFT JOIN interns i ON i.user_id=u.id
      WHERE u.is_active=1 AND u.role IN ('EMPLOYEE','INTERN') AND NOT EXISTS
      (SELECT 1 FROM attendance a WHERE a.user_id=u.id AND a.date=DATE(CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30')))
      AND NOT EXISTS (SELECT 1 FROM leaves l WHERE l.user_id=u.id AND l.status='APPROVED' AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30') BETWEEN l.start_date AND l.end_date)
      ${branchId ? 'AND COALESCE(e.branch_id,i.branch_id) = ?' : ''}`, branchId ? [branchId] : []).then(([r]) => Number(r[0].count))
  ]);
  const [leaveRows, overdueRows] = await Promise.all([
    pool.execute(`SELECT COUNT(DISTINCT l.user_id) count FROM leaves l JOIN users u ON u.id=l.user_id
      LEFT JOIN employees e ON e.user_id=u.id LEFT JOIN interns i ON i.user_id=u.id
      WHERE l.status='APPROVED' AND CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30') BETWEEN l.start_date AND l.end_date
      AND u.is_active=1 AND u.role IN ('EMPLOYEE','INTERN')${branchId ? ' AND COALESCE(e.branch_id,i.branch_id)=?' : ''}`,
    branchId ? [branchId] : []).then(([r]) => Number(r[0].count)),
    pool.execute(`SELECT COUNT(*) count FROM tasks t LEFT JOIN employees e ON e.user_id=t.assigned_to LEFT JOIN interns i ON i.user_id=t.assigned_to
      WHERE t.assigned_to IS NOT NULL AND t.status NOT IN ('COMPLETED','CANCELLED') AND t.due_date < CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+05:30')
      ${branchId ? 'AND COALESCE(e.branch_id,i.branch_id)=?' : ''}`, branchId ? [branchId] : []).then(([r]) => Number(r[0].count))
  ]);
  const [recentTasks] = await pool.execute(`SELECT t.id, t.description, t.status, t.priority, t.due_date,
      u.full_name, u.role, b.name branch_name, t.updated_at
    FROM tasks t JOIN users u ON u.id=t.assigned_to
    LEFT JOIN employees e ON e.user_id=u.id LEFT JOIN interns i ON i.user_id=u.id
    LEFT JOIN branches b ON b.id=COALESCE(e.branch_id,i.branch_id)
    WHERE t.assigned_to IS NOT NULL${branchId ? ' AND COALESCE(e.branch_id,i.branch_id)=?' : ''}
    ORDER BY t.updated_at DESC LIMIT 10`, branchId ? [branchId] : []);
  const recentTaskRows = recentTasks.map((task) => ({
    ...task, full_name: safeName(task.full_name), employment_type: task.role === 'INTERN' ? 'Intern' : 'Employee'
  }));
  return success(res, 200, { branchId, branches, employees, interns, departments,
    attendance: { byStatus: attendance, notRecorded: missingAttendance, approvedLeave: leaveRows },
    tasks: taskRows, overdueTasks: overdueRows, recentTasks: recentTaskRows });
});

export const assertManagerTargetInScope = async (managerId, targetUserId, connection = pool) => {
  const [rows] = await connection.execute(`SELECT 1 FROM manager_scopes s
    JOIN employees e ON e.branch_id=s.branch_id AND (s.department_id IS NULL OR e.department_id=s.department_id)
    WHERE s.manager_user_id=? AND e.user_id=?
    UNION ALL
    SELECT 1 FROM manager_scopes s
    JOIN interns i ON i.branch_id=s.branch_id AND (s.department_id IS NULL OR i.department_id=s.department_id)
    WHERE s.manager_user_id=? AND i.user_id=? LIMIT 1`,
  [managerId, targetUserId, managerId, targetUserId]);
  if (!rows.length) throw new AuthorizationError('Team member is outside your assigned scope');
};
