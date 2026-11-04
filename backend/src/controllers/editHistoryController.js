import crypto from 'crypto';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';

export const getEditHistory = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const [rows] = await pool.execute(
    `SELECT h.*, u.full_name AS changed_by_name FROM employee_edit_history h LEFT JOIN users u ON u.id = h.changed_by WHERE h.employee_id = ? ORDER BY h.changed_at DESC`,
    [employeeId]
  );
  return success(res, 200, rows);
});

export const recordEdit = async (employeeId, fieldName, oldValue, newValue, changedBy, reason = null) => {
  await pool.execute(
    `INSERT INTO employee_edit_history (id, employee_id, field_name, old_value, new_value, changed_by, reason) VALUES (?,?,?,?,?,?,?)`,
    [crypto.randomUUID(), employeeId, fieldName, oldValue, newValue, changedBy, reason]
  );
};

export default { getEditHistory, recordEdit };
