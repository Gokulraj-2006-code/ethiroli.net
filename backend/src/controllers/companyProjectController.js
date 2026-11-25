import crypto from 'crypto';
import pool from '../config/database.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { createNotification } from './notificationController.js';
import { getSalesBudget } from '../services/budgetService.js';
import { notifyOversight } from '../services/notificationTargets.js';
import {
  assertProjectAccess,
  assertProjectManager,
  getProject,
  logProjectActivity,
  parseAssignedIds,
  recomputeProjectProgress,
  safeName
} from '../services/companyProjectService.js';

const isAdmin = (user) => ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
const numeric = (value) => Number(value || 0);
const audit = (req, action, entityType, entityId, oldValue, newValue) => AuditLog.create({
  user_id: req.user?.id,
  action,
  entity_type: entityType,
  entity_id: entityId,
  old_value: oldValue,
  new_value: newValue,
  ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
  user_agent: req.headers['user-agent']
});

const withTransaction = async (work) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const projectSql = `
  SELECT p.*, c.name AS client_record_name,
         m.full_name AS manager_name, s.full_name AS sales_owner_name,
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.is_checklist_item = 0 AND t.status <> 'CANCELLED') AS task_count,
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.is_checklist_item = 0 AND t.status = 'COMPLETED') AS completed_tasks,
         (SELECT COALESCE(SUM(e.amount), 0) FROM project_expenses e WHERE e.project_id = p.id AND e.status = 'APPROVED') AS approved_expenses
    FROM student_projects p
    LEFT JOIN clients c ON c.id = p.client_id
    LEFT JOIN users m ON m.id = p.manager_id
    LEFT JOIN users s ON s.id = p.sales_owner_id
   WHERE p.project_type = 'COMPANY'`;

/**
 * Company projects are visible only to people with a real delivery or sales
 * relationship. HR uses its monitoring link rather than this project API.
 */
export const listCompanyProjects = asyncHandler(async (req, res) => {
  const values = [];
  let sql = projectSql;
  if (!isAdmin(req.user)) {
    if (req.user.role === 'SALES') {
      sql += ' AND p.sales_owner_id = ?';
      values.push(req.user.id);
    } else if (req.user.role === 'PROJECT_MANAGER') {
      sql += ' AND (p.manager_id = ? OR JSON_CONTAINS(p.assigned_user_ids, JSON_QUOTE(?)))';
      values.push(req.user.id, req.user.id);
    } else {
      sql += ` AND (JSON_CONTAINS(p.assigned_user_ids, JSON_QUOTE(?))
                    OR EXISTS (SELECT 1 FROM tasks t WHERE t.project_id = p.id AND t.assigned_to = ?))`;
      values.push(req.user.id, req.user.id);
    }
  }
  if (req.query.status) {
    sql += ' AND p.status = ?';
    values.push(String(req.query.status).toUpperCase());
  }
  if (req.query.search) {
    sql += ' AND (p.name LIKE ? OR p.project_code LIKE ? OR p.client_name LIKE ?)';
    const term = `%${String(req.query.search).trim()}%`;
    values.push(term, term, term);
  }
  sql += ' ORDER BY p.created_at DESC LIMIT 200';
  const [rows] = await pool.execute(sql, values);
  return success(res, 200, rows.map((row) => ({
    ...row,
    manager_name: safeName(row.manager_name, null),
    sales_owner_name: safeName(row.sales_owner_name, null)
  })));
});

export const getCompanyProject = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  await assertProjectAccess(req.user, project);
  const [rows] = await pool.execute(`${projectSql} AND p.id = ?`, [req.params.id]);
  const [tasks] = await pool.execute(
    `SELECT t.*, u.full_name AS assignee_name FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = ? ORDER BY t.is_checklist_item ASC, t.due_date ASC, t.created_at ASC`,
    [req.params.id]
  );
  const [milestones] = await pool.execute(
    'SELECT * FROM project_milestones WHERE project_id = ? ORDER BY target_date ASC', [req.params.id]
  );
  const [expenses] = await pool.execute(
    `SELECT e.*, u.full_name AS logged_by_name FROM project_expenses e
       LEFT JOIN users u ON u.id = e.logged_by
      WHERE e.project_id = ? ORDER BY e.expense_date DESC`, [req.params.id]
  );
  const [activity] = await pool.execute(
    `SELECT a.*, u.full_name AS actor_name FROM project_activity_log a
       LEFT JOIN users u ON u.id = a.actor_id
      WHERE a.project_id = ? ORDER BY a.created_at DESC LIMIT 100`, [req.params.id]
  );
  return success(res, 200, {
    project: rows[0] || project,
    tasks: tasks.map((task) => ({ ...task, assignee_name: safeName(task.assignee_name, null) })),
    milestones,
    expenses,
    activity,
    team: parseAssignedIds(project.assigned_user_ids)
  });
});

export const acceptCompanyProject = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (project?.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  assertProjectManager(req.user, project);
  if (project.manager_accepted_at) throw new ConflictError('This project has already been accepted.');
  await withTransaction(async (connection) => {
    await connection.execute(
      `UPDATE student_projects SET manager_accepted_at = NOW(), status = 'ACTIVE', updated_by = ? WHERE id = ?`,
      [req.user.id, req.params.id]
    );
    await logProjectActivity(req.params.id, req.user.id, 'MANAGER_ACCEPTED', 'Manager accepted the project.', { connection });
  });
  if (project.sales_owner_id) {
    await createNotification(
      project.sales_owner_id, 'PROJECT_ACCEPTED', 'Project accepted by Manager',
      `${project.project_code || project.name} has been accepted and is now active.`,
      'PROJECT', project.id,
      { senderUserId: req.user.id, actionUrl: `/app/sales/projects/${project.id}`, projectId: project.id }
    );
  }
  await notifyOversight(createNotification, {
    type: 'PROJECT_ACCEPTED',
    title: 'Manager accepted a project',
    message: `${project.project_code || project.name} is now active.`,
    entityType: 'PROJECT',
    entityId: project.id,
    senderUserId: req.user.id,
    actionUrl: `/app/super-admin/projects/${project.id}`,
    projectId: project.id
  });
  await audit(req, 'ACCEPT_COMPANY_PROJECT', 'PROJECT', project.id, { status: project.status }, { status: 'ACTIVE' });
  return success(res, 200, null, 'Project accepted');
});

/** Active employees/interns a Manager or Sales owner can put on a project. */
export const listAssignableStaff = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.full_name, u.email, u.role,
            e.department_id, e.department, e.designation, e.branch_id,
            i.department_id AS intern_department_id, i.branch_id AS intern_branch_id,
            sr.name AS intern_designation, i.project_target AS intern_project_target,
            u.preferences
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       LEFT JOIN interns i ON i.user_id = u.id
       LEFT JOIN organizational_sub_roles sr ON sr.id = i.sub_role_id
      WHERE u.is_active = 1 AND u.role IN ('EMPLOYEE', 'INTERN', 'PROJECT_MANAGER')
      ORDER BY u.role ASC, u.id ASC LIMIT 500`
  );
  return success(res, 200, rows.map((row) => {
    let preferences = null;
    try {
      preferences = typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences;
    } catch {
      preferences = null;
    }
    return {
      id: row.id,
      full_name: safeName(row.full_name, row.email || 'Team member'),
      email: safeName(row.email, ''),
      role: row.role,
      department_id: row.department_id || row.intern_department_id || null,
      department: row.department || preferences?.department || null,
      designation: row.designation || row.intern_designation || row.intern_project_target || preferences?.designation || null,
      branch_id: row.branch_id || row.intern_branch_id || null
    };
  }));
});

export const assignProjectTeam = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (project?.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  assertProjectManager(req.user, project);
  if (!Array.isArray(req.body.user_ids)) throw new ValidationError('user_ids must be an array.');
  const userIds = [...new Set(req.body.user_ids.filter(Boolean))];
  if (userIds.length) {
    const placeholders = userIds.map(() => '?').join(',');
    const [rows] = await pool.execute(
      `SELECT id FROM users WHERE id IN (${placeholders}) AND is_active = 1 AND role IN ('EMPLOYEE','INTERN','PROJECT_MANAGER')`,
      userIds
    );
    if (rows.length !== userIds.length) throw new ValidationError('One or more selected team members are inactive or cannot be assigned.');
  }
  const previous = parseAssignedIds(project.assigned_user_ids);
  await withTransaction(async (connection) => {
    await connection.execute(
      'UPDATE student_projects SET assigned_user_ids = ?, updated_by = ? WHERE id = ?',
      [userIds.length ? JSON.stringify(userIds) : null, req.user.id, project.id]
    );
    await logProjectActivity(
      project.id, req.user.id, 'TEAM_UPDATED',
      `Project team updated (${previous.length} -> ${userIds.length} members).`,
      { connection }
    );
  });
  for (const userId of userIds.filter((id) => !previous.includes(id))) {
    await createNotification(
      userId, 'PROJECT_TEAM_ASSIGNED', 'Added to project team',
      `You have been added to the delivery team for ${project.project_code || project.name}.`,
      'PROJECT', project.id,
      { senderUserId: req.user.id, actionUrl: `/app/employee/projects/${project.id}`, projectId: project.id }
    );
  }
  await audit(req, 'ASSIGN_PROJECT_TEAM', 'PROJECT', project.id, { team: previous }, { team: userIds });
  return success(res, 200, { team: userIds }, 'Project team updated');
});

export const listProjectTasks = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  await assertProjectAccess(req.user, project);
  const [rows] = await pool.execute(
    `SELECT t.*, u.full_name AS assignee_name FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = ? AND t.is_checklist_item = 0
      ORDER BY t.due_date ASC, t.created_at ASC`,
    [project.id]
  );
  return success(res, 200, rows.map((task) => ({ ...task, assignee_name: safeName(task.assignee_name, null) })));
});

export const createProjectTask = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (project?.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  assertProjectManager(req.user, project);
  const description = String(req.body.description || '').trim();
  if (!description) throw new ValidationError('A task description is required.');
  if (!req.body.due_date) throw new ValidationError('A due date is required.');
  const assignedTo = req.body.assigned_to || null;
  if (!assignedTo) throw new ValidationError('Assign this task to a team member.');
  const [users] = await pool.execute(
    'SELECT id, full_name FROM users WHERE id = ? AND is_active = 1', [assignedTo]
  );
  if (!users.length) throw new ValidationError('The selected assignee is not active.');
  const taskId = crypto.randomUUID();
  await withTransaction(async (connection) => {
    const [listRows] = await connection.execute(
      'SELECT id FROM task_lists WHERE id = ? AND project_id = ? LIMIT 1',
      [req.body.task_list_id || null, project.id]
    );
    const taskListId = listRows.length ? listRows[0].id : null;
    await connection.execute(
      `INSERT INTO tasks
         (id, description, due_date, status, assigned_to, project_id, task_list_id, priority, created_by)
       VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
      [
        taskId, description, String(req.body.due_date).slice(0, 10), assignedTo, project.id,
        taskListId, String(req.body.priority || 'MEDIUM').toUpperCase(), req.user.id
      ]
    );
    await connection.execute(
      `INSERT INTO task_history (task_id, actor_user_id, event_type, to_status, note)
       VALUES (?, ?, 'TASK_CREATED', 'PENDING', ?)`,
      [taskId, req.user.id, assignedTo]
    );
    await logProjectActivity(
      project.id, req.user.id, 'TASK_CREATED', `Task created and assigned to ${safeName(users[0].full_name, 'a team member')}.`,
      { taskId, connection }
    );
  });
  await createNotification(
    assignedTo, 'TASK_ASSIGNED', 'New project task assigned', `You were assigned: ${description}`,
    'TASK', taskId,
    { senderUserId: req.user.id, actionUrl: `/app/employee/tasks/${taskId}`, projectId: project.id, taskId }
  );
  await audit(req, 'CREATE_PROJECT_TASK', 'TASK', taskId, null, req.body);
  return success(res, 201, { id: taskId }, 'Task created and assigned');
});

export const listProjectExpenses = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  await assertProjectAccess(req.user, project);
  const [rows] = await pool.execute(
    `SELECT e.*, u.full_name AS logged_by_name, a.full_name AS approved_by_name
       FROM project_expenses e
       LEFT JOIN users u ON u.id = e.logged_by
       LEFT JOIN users a ON a.id = e.approved_by
      WHERE e.project_id = ? ORDER BY e.expense_date DESC, e.created_at DESC`,
    [project.id]
  );
  return success(res, 200, rows);
});

export const createProjectExpense = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (project?.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  await assertProjectAccess(req.user, project, { write: true });
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new ValidationError('Enter a positive expense amount.');
  const description = String(req.body.description || '').trim();
  if (!description) throw new ValidationError('An expense description is required.');
  const id = crypto.randomUUID();
  await withTransaction(async (connection) => {
    await connection.execute(
      `INSERT INTO project_expenses
         (id, project_id, logged_by, category, description, amount, currency, expense_date,
          receipt_url, is_billable, status, vendor, reference_no, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`,
      [
        id, project.id, req.user.id, String(req.body.category || 'MISC').toUpperCase(), description,
        Math.round(amount * 100) / 100, String(req.body.currency || 'INR').slice(0, 10),
        String(req.body.expense_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
        req.body.receipt_url || null, req.body.is_billable === false ? 0 : 1,
        req.body.vendor || null, req.body.reference_no || null,
        req.body.idempotency_key ? `${req.user.id}:${req.body.idempotency_key}` : null
      ]
    );
    await logProjectActivity(project.id, req.user.id, 'EXPENSE_LOGGED', `Expense of ${amount} logged: ${description}.`, { connection });
  });
  if (project.manager_id && project.manager_id !== req.user.id) {
    await createNotification(
      project.manager_id, 'EXPENSE_PENDING_APPROVAL', 'Project expense awaiting approval',
      `${description} (${amount}) needs your approval on ${project.project_code || project.name}.`,
      'EXPENSE', id,
      { senderUserId: req.user.id, actionUrl: `/app/manager/projects/${project.id}?tab=expenses`, projectId: project.id }
    );
  }
  await audit(req, 'CREATE_PROJECT_EXPENSE', 'EXPENSE', id, null, req.body);
  return success(res, 201, { id }, 'Expense logged');
});

const decideExpense = (approve) => asyncHandler(async (reqInner, res) => {
  const result = await withTransaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT e.*, p.manager_id, p.sales_owner_id, p.estimated_cost, p.project_code, p.name AS project_name
         FROM project_expenses e JOIN student_projects p ON p.id = e.project_id
        WHERE e.id = ? FOR UPDATE`,
      [reqInner.params.expenseId || reqInner.params.id]
    );
    const expense = rows[0];
    if (!expense) throw new NotFoundError('Expense not found');
    const project = await getProject(expense.project_id, connection);
    assertProjectManager(reqInner.user, project);
    if (expense.status !== 'PENDING') throw new ConflictError('This expense has already been reviewed.');

    if (approve) {
      const budget = await getSalesBudget(connection, { forUpdate: true });
      if (!budget) throw new ValidationError('No approved Sales allocation is available for expense approval.');
      const [usedRows] = await connection.execute(
        `SELECT COALESCE(SUM(e.amount), 0) AS total
           FROM project_expenses e JOIN student_projects p ON p.id = e.project_id
          WHERE p.project_type = 'COMPANY' AND e.status = 'APPROVED'`,
        []
      );
      const [projectRows] = await connection.execute(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM project_expenses
          WHERE project_id = ? AND status = 'APPROVED'`,
        [expense.project_id]
      );
      if (numeric(usedRows[0].total) + numeric(expense.amount) > numeric(budget.allocated)) {
        throw new ConflictError('Approving this expense would exceed the total Sales allocation.');
      }
      if (expense.estimated_cost && numeric(projectRows[0].total) + numeric(expense.amount) > numeric(expense.estimated_cost) + 0.009) {
        throw new ConflictError('Approved expenses would exceed this project’s estimated cost.');
      }
      await connection.execute(
        `UPDATE project_expenses SET status = 'APPROVED', approved_by = ?, approved_at = NOW(), updated_by = ?, rejection_note = NULL WHERE id = ?`,
        [reqInner.user.id, reqInner.user.id, expense.id]
      );
    } else {
      const note = String(reqInner.body?.note || reqInner.body?.rejection_note || '').trim();
      if (!note) throw new ValidationError('A rejection note is required.');
      await connection.execute(
        `UPDATE project_expenses SET status = 'REJECTED', updated_by = ?, rejection_note = ? WHERE id = ?`,
        [reqInner.user.id, note, expense.id]
      );
    }
    await logProjectActivity(
      expense.project_id, reqInner.user.id, approve ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
      `${expense.description} was ${approve ? 'approved' : 'rejected'}.`,
      { connection }
    );
    return expense;
  });

  const recipientIds = [result.logged_by, result.sales_owner_id].filter((id, index, list) => id && list.indexOf(id) === index && id !== reqInner.user.id);
  for (const recipient of recipientIds) {
    await createNotification(
      recipient,
      approve ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
      approve ? 'Project expense approved' : 'Project expense rejected',
      `${result.description} on ${result.project_code || result.project_name} was ${approve ? 'approved' : 'rejected'}.`,
      'EXPENSE', result.id,
      { senderUserId: reqInner.user.id, actionUrl: `/app/sales/projects/${result.project_id}?tab=expenses`, projectId: result.project_id }
    );
  }
  await audit(reqInner, approve ? 'APPROVE_PROJECT_EXPENSE' : 'REJECT_PROJECT_EXPENSE', 'EXPENSE', result.id, null, reqInner.body);
  return success(res, 200, null, approve ? 'Expense approved' : 'Expense rejected');
});

export const approveProjectExpense = decideExpense(true);
export const rejectProjectExpense = decideExpense(false);

export const submitProjectDelivery = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (project?.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  assertProjectManager(req.user, project);
  if (numeric(project.progress_percent) < 100) {
    throw new ConflictError('Delivery can only be submitted after every task and milestone is complete.');
  }
  if (project.delivery_submitted_at) throw new ConflictError('Delivery has already been submitted.');
  await withTransaction(async (connection) => {
    await connection.execute(
      `UPDATE student_projects SET status = 'DELIVERY_SUBMITTED', delivery_submitted_at = NOW(),
        delivery_submitted_by = ?, updated_by = ? WHERE id = ?`,
      [req.user.id, req.user.id, project.id]
    );
    await logProjectActivity(project.id, req.user.id, 'DELIVERY_SUBMITTED', 'Manager submitted the project for delivery.', { connection });
    await connection.execute(
      `INSERT INTO project_approvals (id, project_id, approval_type, status, requested_by, note)
       VALUES (?, ?, 'DELIVERY', 'PENDING', ?, ?)`,
      [crypto.randomUUID(), project.id, req.user.id, String(req.body.note || '').trim() || null]
    );
  });
  if (project.sales_owner_id) {
    await createNotification(
      project.sales_owner_id, 'DELIVERY_SUBMITTED', 'Project ready for client delivery',
      `${project.project_code || project.name} has been submitted for delivery. Please confirm with the client.`,
      'PROJECT', project.id,
      { senderUserId: req.user.id, actionUrl: `/app/sales/projects/${project.id}`, projectId: project.id }
    );
  }
  await notifyOversight(createNotification, {
    type: 'DELIVERY_SUBMITTED',
    title: 'Project delivery submitted',
    message: `${project.project_code || project.name} is awaiting Sales and Admin confirmation.`,
    entityType: 'PROJECT',
    entityId: project.id,
    senderUserId: req.user.id,
    actionUrl: `/app/super-admin/projects/${project.id}`,
    projectId: project.id
  });
  await audit(req, 'SUBMIT_PROJECT_DELIVERY', 'PROJECT', project.id, { status: project.status }, { status: 'DELIVERY_SUBMITTED' });
  return success(res, 200, null, 'Project submitted for delivery');
});

export const confirmSalesDelivery = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (project?.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  if (!isAdmin(req.user) && project.sales_owner_id !== req.user.id) {
    throw new AuthorizationError('Only the Sales owner can confirm client delivery.');
  }
  if (!project.delivery_submitted_at) throw new ConflictError('The Manager has not submitted this project for delivery.');
  if (project.sales_confirmed_at) throw new ConflictError('Delivery has already been confirmed by Sales.');
  await withTransaction(async (connection) => {
    await connection.execute(
      `UPDATE student_projects SET sales_confirmed_at = NOW(), status = 'AWAITING_ADMIN_CONFIRMATION', updated_by = ? WHERE id = ?`,
      [req.user.id, project.id]
    );
    await logProjectActivity(project.id, req.user.id, 'SALES_DELIVERY_CONFIRMED', 'Sales confirmed client delivery.', { connection });
    await connection.execute(
      `UPDATE project_approvals SET status = 'APPROVED', acted_by = ?, acted_at = NOW()
        WHERE project_id = ? AND approval_type = 'DELIVERY' AND status = 'PENDING'
        ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, project.id]
    );
  });
  await notifyOversight(createNotification, {
    type: 'SALES_DELIVERY_CONFIRMED',
    title: 'Sales confirmed delivery',
    message: `${project.project_code || project.name} is ready for final Admin confirmation.`,
    entityType: 'PROJECT',
    entityId: project.id,
    senderUserId: req.user.id,
    actionUrl: `/app/super-admin/projects/${project.id}`,
    projectId: project.id
  });
  await audit(req, 'CONFIRM_SALES_DELIVERY', 'PROJECT', project.id, null, { sales_confirmed: true });
  return success(res, 200, null, 'Client delivery confirmed by Sales');
});

export const confirmAdminCompletion = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project || project.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  if (!project.sales_confirmed_at) throw new ConflictError('Sales must confirm delivery before completion.');
  const percent = await recomputeProjectProgress(project.id);
  if (percent < 100) throw new ConflictError('Project completion requires 100% task and milestone progress.');
  await withTransaction(async (connection) => {
    await connection.execute(
      `UPDATE student_projects SET status = 'COMPLETED', completed_at = NOW(), admin_confirmed_at = NOW(), updated_by = ? WHERE id = ?`,
      [req.user.id, project.id]
    );
    await logProjectActivity(project.id, req.user.id, 'PROJECT_COMPLETED', 'Admin confirmed final project completion.', { connection });
    await connection.execute(
      `UPDATE project_approvals SET status = 'APPROVED', acted_by = ?, acted_at = NOW()
        WHERE project_id = ? AND approval_type = 'COMPLETION' AND status = 'PENDING'`,
      [req.user.id, project.id]
    );
  });
  const recipients = [project.sales_owner_id, project.manager_id].filter((id, index, list) => id && list.indexOf(id) === index && id !== req.user.id);
  for (const recipient of recipients) {
    await createNotification(
      recipient, 'PROJECT_COMPLETED', 'Project completed',
      `${project.project_code || project.name} has been completed and confirmed.`,
      'PROJECT', project.id,
      { senderUserId: req.user.id, actionUrl: `/app/sales/projects/${project.id}`, projectId: project.id }
    );
  }
  await audit(req, 'COMPLETE_COMPANY_PROJECT', 'PROJECT', project.id, { status: project.status }, { status: 'COMPLETED' });
  return success(res, 200, { progress_percent: percent }, 'Project completed');
});

export const getProjectActivity = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  await assertProjectAccess(req.user, project);
  const [rows] = await pool.execute(
    `SELECT a.*, u.full_name AS actor_name FROM project_activity_log a
       LEFT JOIN users u ON u.id = a.actor_id
      WHERE a.project_id = ? ORDER BY a.created_at DESC LIMIT 200`,
    [project.id]
  );
  return success(res, 200, rows);
});

export const recomputeProject = asyncHandler(async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project || project.project_type !== 'COMPANY') throw new NotFoundError('Company project not found');
  await assertProjectAccess(req.user, project, { write: true });
  const percent = await recomputeProjectProgress(project.id);
  return success(res, 200, { progress_percent: percent }, 'Project progress recalculated from work items');
});

export default {
  listCompanyProjects,
  getCompanyProject,
  acceptCompanyProject,
  listAssignableStaff,
  assignProjectTeam,
  listProjectTasks,
  createProjectTask,
  listProjectExpenses,
  createProjectExpense,
  approveProjectExpense,
  rejectProjectExpense,
  submitProjectDelivery,
  confirmSalesDelivery,
  confirmAdminCompletion,
  getProjectActivity,
  recomputeProject
};
