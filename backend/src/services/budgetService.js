import pool from '../config/database.js';
import { ValidationError, ConflictError } from '../utils/errors.js';

export const SALES_PANEL = 'SALES';
export const BUDGET_PANELS = ['SALES'];

const num = (value) => Number(value || 0);

/**
 * The approved budget that currently funds the Sales panel, with real usage
 * figures. `committed` is the sum of estimated costs on live company projects,
 * `spent` is the sum of approved project expenses. Both come straight from the
 * database - there are no sample or fallback financial figures.
 *
 * When called inside a transaction with `forUpdate: true`, the annual budget
 * row is locked so two concurrent project/order conversions cannot both spend
 * the same remaining allocation.
 */
export const getSalesBudget = async (connection = pool, { forUpdate = false, excludeProjectId = null } = {}) => {
  const [budgets] = await connection.execute(
    `SELECT b.* FROM annual_budgets b
      WHERE b.status = 'APPROVED'
        AND EXISTS (
          SELECT 1 FROM budget_allocations a
           WHERE a.annual_budget_id = b.id AND a.panel = ? AND a.status = 'ACTIVE'
        )
      ORDER BY b.fiscal_year DESC, b.created_at DESC, b.id DESC
      LIMIT 1${forUpdate ? ' FOR UPDATE' : ''}`,
    [SALES_PANEL]
  );
  if (!budgets.length) return null;
  const budget = budgets[0];

  const [allocationRows] = await connection.execute(
    `SELECT a.*, u.full_name AS allocated_by_name
       FROM budget_allocations a
       LEFT JOIN users u ON u.id = a.allocated_by
      WHERE a.annual_budget_id = ? AND a.panel = ? AND a.status = 'ACTIVE'
      ORDER BY a.allocation_date DESC, a.created_at DESC`,
    [budget.id, SALES_PANEL]
  );

  const commitSql = `SELECT COALESCE(SUM(p.estimated_cost), 0) AS committed
       FROM student_projects p
      WHERE p.project_type = 'COMPANY' AND p.status <> 'CANCELLED'
        AND p.estimated_cost IS NOT NULL`;
  const spendSql = `SELECT COALESCE(SUM(e.amount), 0) AS spent
       FROM project_expenses e
       JOIN student_projects p ON p.id = e.project_id
      WHERE p.project_type = 'COMPANY' AND e.status = 'APPROVED'
        AND p.status <> 'CANCELLED'`;
  const commitParams = [];
  const spendParams = [];
  if (excludeProjectId) {
    commitSql += ' AND p.id <> ?';
    spendSql += ' AND p.id <> ?';
    commitParams.push(excludeProjectId);
    spendParams.push(excludeProjectId);
  }

  const [[commitRow], [spendRow]] = await Promise.all([
    connection.execute(commitSql, commitParams),
    connection.execute(spendSql, spendParams)
  ]);

  const allocated = allocationRows.reduce((sum, row) => sum + num(row.allocated_amount), 0);
  const committed = num(commitRow[0]?.committed);
  const spent = num(spendRow[0]?.spent);

  return {
    id: budget.id,
    fiscal_year: budget.fiscal_year,
    currency: budget.currency,
    status: budget.status,
    total_budget: num(budget.total_amount),
    allocated,
    committed,
    spent,
    // Approved expenses replace the matching commitment rather than adding to
    // it, so the larger of the two is the amount of the allocation already in
    // use. This prevents both double counting and concurrent overspend.
    available: allocated - Math.max(committed, spent),
    configured: true,
    allocations: allocationRows,
    latest_allocation_date: allocationRows[0]?.allocation_date || null
  };
};

/**
 * Financial guard for Sales project creation / re-costing. Call inside the
 * same transaction that inserts the project so the check and the write are
 * atomic.
 */
export const assertSalesBudgetAvailable = async (amount, connection = pool, excludeProjectId = null) => {
  const budget = await getSalesBudget(connection, { forUpdate: true, excludeProjectId });
  if (!budget) {
    throw new ValidationError('An approved annual budget with an active Sales allocation is required before creating a project.');
  }
  const requested = num(amount);
  if (requested <= 0) throw new ValidationError('A positive estimated cost is required.');
  if (requested > budget.available + 0.009) {
    throw new ConflictError(
      `Estimated cost exceeds the remaining Sales allocation. Available: ${budget.currency} ${budget.available.toFixed(2)}.`
    );
  }
  return budget;
};

export default { SALES_PANEL, BUDGET_PANELS, getSalesBudget, assertSalesBudgetAvailable };
