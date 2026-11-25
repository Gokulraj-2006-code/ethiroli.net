import crypto from 'crypto';
import pool from '../config/database.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import { getSalesBudget, SALES_PANEL } from '../services/budgetService.js';

const number = (value, label) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError(`${label} must be a non-negative number.`);
  return Math.round(parsed * 100) / 100;
};

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

/** Every annual budget with its allocation totals and revision count. */
export const listAnnualBudgets = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT b.*,
            COALESCE(SUM(CASE WHEN a.status = 'ACTIVE' THEN a.allocated_amount ELSE 0 END), 0) AS allocated_total,
            COUNT(DISTINCT r.id) AS revision_count,
            creator.full_name AS created_by_name,
            approver.full_name AS approved_by_name
       FROM annual_budgets b
       LEFT JOIN budget_allocations a ON a.annual_budget_id = b.id
       LEFT JOIN budget_revisions r ON r.annual_budget_id = b.id
       LEFT JOIN users creator ON creator.id = b.created_by
       LEFT JOIN users approver ON approver.id = b.approved_by
      GROUP BY b.id
      ORDER BY b.fiscal_year DESC, b.created_at DESC`
  );
  return success(res, 200, rows);
});

export const getAnnualBudget = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT b.*,
            COALESCE(SUM(CASE WHEN a.status = 'ACTIVE' THEN a.allocated_amount ELSE 0 END), 0) AS allocated_total
       FROM annual_budgets b
       LEFT JOIN budget_allocations a ON a.annual_budget_id = b.id
      WHERE b.id = ? GROUP BY b.id`,
    [req.params.id]
  );
  if (!rows.length) throw new NotFoundError('Annual budget not found');
  const [allocations] = await pool.execute(
    `SELECT a.*, u.full_name AS allocated_by_name
       FROM budget_allocations a LEFT JOIN users u ON u.id = a.allocated_by
      WHERE a.annual_budget_id = ? ORDER BY a.allocation_date DESC, a.created_at DESC`,
    [req.params.id]
  );
  return success(res, 200, { ...rows[0], allocations });
});

export const createAnnualBudget = asyncHandler(async (req, res) => {
  const fiscalYear = String(req.body.fiscal_year || '').trim();
  if (!/^\d{4}(-\d{4})?$/.test(fiscalYear)) {
    throw new ValidationError('Enter a fiscal year such as 2026 or 2026-27.');
  }
  const total = number(req.body.total_amount, 'Total budget');
  if (total <= 0) throw new ValidationError('Total budget must be greater than zero.');
  const currency = String(req.body.currency || 'INR').trim().slice(0, 10);
  const description = String(req.body.description || '').trim() || null;
  const [existing] = await pool.execute('SELECT id FROM annual_budgets WHERE fiscal_year = ?', [fiscalYear]);
  if (existing.length) throw new ConflictError(`${fiscalYear} already has an annual budget. Revise it instead.`);
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO annual_budgets (id, fiscal_year, total_amount, currency, description, status, created_by)
     VALUES (?, ?, ?, ?, ?, 'DRAFT', ?)`,
    [id, fiscalYear, total, currency, description, req.user.id]
  );
  await audit(req, 'CREATE_ANNUAL_BUDGET', 'ANNUAL_BUDGET', id, null, req.body);
  return success(res, 201, { id }, 'Annual budget created as a draft');
});

export const approveAnnualBudget = asyncHandler(async (req, res) => {
  const result = await withTransaction(async (connection) => {
    const [rows] = await connection.execute('SELECT * FROM annual_budgets WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) throw new NotFoundError('Annual budget not found');
    if (rows[0].status === 'APPROVED') throw new ConflictError('This annual budget is already approved.');
    await connection.execute(
      `UPDATE annual_budgets SET status = 'APPROVED', approved_by = ?, approved_at = NOW() WHERE id = ?`,
      [req.user.id, req.params.id]
    );
    return rows[0];
  });
  await audit(req, 'APPROVE_ANNUAL_BUDGET', 'ANNUAL_BUDGET', req.params.id, { status: result.status }, { status: 'APPROVED' });
  return success(res, 200, null, 'Annual budget approved');
});

export const reviseAnnualBudget = asyncHandler(async (req, res) => {
  const newTotal = number(req.body.new_total, 'New total');
  if (newTotal <= 0) throw new ValidationError('New total must be greater than zero.');
  const reason = String(req.body.reason || '').trim();
  if (!reason) throw new ValidationError('A revision reason is required.');
  const revisionId = crypto.randomUUID();

  await withTransaction(async (connection) => {
    const [rows] = await connection.execute('SELECT * FROM annual_budgets WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!rows.length) throw new NotFoundError('Annual budget not found');
    const [allocationRows] = await connection.execute(
      `SELECT COALESCE(SUM(allocated_amount), 0) AS allocated
         FROM budget_allocations WHERE annual_budget_id = ? AND status = 'ACTIVE'`,
      [req.params.id]
    );
    if (Number(allocationRows[0].allocated) > newTotal) {
      throw new ConflictError('The new total is below the amount already allocated to panels.');
    }
    await connection.execute(
      `INSERT INTO budget_revisions (id, annual_budget_id, old_total, new_total, reason, revised_by, approved_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [revisionId, req.params.id, rows[0].total_amount, newTotal, reason, req.user.id, req.user.id]
    );
    await connection.execute('UPDATE annual_budgets SET total_amount = ?, updated_at = NOW() WHERE id = ?', [newTotal, req.params.id]);
  });
  await audit(req, 'REVISE_ANNUAL_BUDGET', 'ANNUAL_BUDGET', req.params.id, null, { new_total: newTotal, reason });
  return success(res, 201, { id: revisionId }, 'Annual budget revised');
});

export const allocatePanel = asyncHandler(async (req, res) => {
  const budgetId = req.body.budget_id;
  const panel = String(req.body.panel || SALES_PANEL).trim().toUpperCase();
  const amount = number(req.body.allocated_amount, 'Allocated amount');
  if (amount <= 0) throw new ValidationError('Allocated amount must be greater than zero.');
  const allocationDate = String(req.body.allocation_date || '').trim() || new Date().toISOString().slice(0, 10);
  if (Number.isNaN(Date.parse(allocationDate))) throw new ValidationError('Enter a valid allocation date.');
  const id = crypto.randomUUID();

  await withTransaction(async (connection) => {
    const [budgetRows] = await connection.execute('SELECT * FROM annual_budgets WHERE id = ? FOR UPDATE', [budgetId]);
    if (!budgetRows.length) throw new NotFoundError('Annual budget not found');
    if (budgetRows[0].status !== 'APPROVED') throw new ValidationError('Only an approved annual budget can be allocated.');
    const [sumRows] = await connection.execute(
      `SELECT COALESCE(SUM(allocated_amount), 0) AS allocated
         FROM budget_allocations WHERE annual_budget_id = ? AND status = 'ACTIVE'`,
      [budgetId]
    );
    if (Number(sumRows[0].allocated) + amount > Number(budgetRows[0].total_amount)) {
      throw new ConflictError('Allocation exceeds the unallocated annual budget.');
    }
    await connection.execute(
      `INSERT INTO budget_allocations
         (id, annual_budget_id, panel, allocated_amount, allocation_date, description, allocated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, budgetId, panel, amount, allocationDate, String(req.body.description || '').trim() || null, req.user.id]
    );
    await connection.execute(
      `INSERT INTO budget_allocation_revisions (id, allocation_id, old_amount, new_amount, reason, revised_by)
       VALUES (?, ?, 0, ?, ?, ?)`,
      [crypto.randomUUID(), id, amount, String(req.body.description || 'Initial allocation').trim(), req.user.id]
    );
  });
  await audit(req, 'ALLOCATE_BUDGET', 'BUDGET_ALLOCATION', id, null, req.body);
  return success(res, 201, { id }, 'Budget allocated');
});

export const reviseAllocation = asyncHandler(async (req, res) => {
  const newAmount = number(req.body.new_amount, 'New amount');
  const reason = String(req.body.reason || '').trim();
  if (!reason) throw new ValidationError('A revision reason is required.');
  const revisionId = crypto.randomUUID();

  await withTransaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT a.*, b.total_amount, b.status AS budget_status
         FROM budget_allocations a JOIN annual_budgets b ON b.id = a.annual_budget_id
        WHERE a.id = ? FOR UPDATE`,
      [req.params.id]
    );
    if (!rows.length) throw new NotFoundError('Budget allocation not found');
    const [siblings] = await connection.execute(
      `SELECT COALESCE(SUM(allocated_amount), 0) AS allocated
         FROM budget_allocations
        WHERE annual_budget_id = ? AND status = 'ACTIVE' AND id <> ?`,
      [rows[0].annual_budget_id, rows[0].id]
    );
    if (Number(siblings[0].allocated) + newAmount > Number(rows[0].total_amount)) {
      throw new ConflictError('Revision exceeds the unallocated annual budget.');
    }
    if (rows[0].panel === SALES_PANEL) {
      const [usage] = await connection.execute(
        `SELECT COALESCE(SUM(p.estimated_cost), 0) AS committed
           FROM student_projects p
          WHERE p.project_type = 'COMPANY' AND p.status <> 'CANCELLED' AND p.estimated_cost IS NOT NULL`
      );
      if (Number(usage[0].committed) > newAmount) {
        throw new ConflictError('The new allocation is below the cost already committed to Sales projects.');
      }
    }
    await connection.execute(
      `INSERT INTO budget_allocation_revisions (id, allocation_id, old_amount, new_amount, reason, revised_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [revisionId, rows[0].id, rows[0].allocated_amount, newAmount, reason, req.user.id]
    );
    await connection.execute('UPDATE budget_allocations SET allocated_amount = ?, updated_at = NOW() WHERE id = ?', [newAmount, rows[0].id]);
  });
  await audit(req, 'REVISE_BUDGET_ALLOCATION', 'BUDGET_ALLOCATION', req.params.id, null, { new_amount: newAmount, reason });
  return success(res, 201, { id: revisionId }, 'Allocation revised');
});

export const listBudgetHistory = asyncHandler(async (req, res) => {
  const [budgetRevisions] = await pool.execute(
    `SELECT r.*, b.fiscal_year, reviser.full_name AS revised_by_name
       FROM budget_revisions r JOIN annual_budgets b ON b.id = r.annual_budget_id
       LEFT JOIN users reviser ON reviser.id = r.revised_by
      ORDER BY r.created_at DESC LIMIT 200`
  );
  const [allocationRevisions] = await pool.execute(
    `SELECT r.*, a.panel, b.fiscal_year, reviser.full_name AS revised_by_name
       FROM budget_allocation_revisions r
       JOIN budget_allocations a ON a.id = r.allocation_id
       JOIN annual_budgets b ON b.id = a.annual_budget_id
       LEFT JOIN users reviser ON reviser.id = r.revised_by
      ORDER BY r.created_at DESC LIMIT 200`
  );
  return success(res, 200, { budget_revisions: budgetRevisions, allocation_revisions: allocationRevisions });
});

export const salesBudget = asyncHandler(async (req, res) => {
  const budget = await getSalesBudget();
  return success(res, 200, budget || {
    fiscal_year: null,
    total_budget: 0,
    allocated: 0,
    committed: 0,
    spent: 0,
    available: 0,
    allocations: [],
    latest_allocation_date: null,
    configured: false
  });
});

export default {
  listAnnualBudgets,
  getAnnualBudget,
  createAnnualBudget,
  approveAnnualBudget,
  reviseAnnualBudget,
  allocatePanel,
  reviseAllocation,
  listBudgetHistory,
  salesBudget
};
