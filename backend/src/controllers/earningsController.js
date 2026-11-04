import crypto from 'crypto';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors.js';

const uid = () => crypto.randomUUID();

export const getMySalary = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM salary_configs WHERE user_id=? ORDER BY effective_from DESC LIMIT 1', [req.user.id]);
  return success(res, 200, rows[0] || null);
});

export const getMyExtraDuty = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM extra_duty_payments WHERE user_id=? ORDER BY work_date DESC', [req.user.id]);
  return success(res, 200, rows);
});

export const getMyReferrals = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM referral_commissions WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
  return success(res, 200, rows);
});

export const getMyInvestments = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM investment_requests WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
  const [cfg] = await pool.execute('SELECT * FROM investment_config ORDER BY updated_at DESC LIMIT 1');
  return success(res, 200, { requests: rows, config: cfg[0] || null });
});

export const createReferral = asyncHandler(async (req, res) => {
  const { project_name, project_value, commission_rate } = req.body || {};
  if (!project_name || !project_value) throw new ValidationError('project_name and project_value required');
  const rate = Number(commission_rate || 10);
  const amount = (Number(project_value) * rate) / 100;
  const id = uid();
  await pool.execute('INSERT INTO referral_commissions (id,user_id,project_name,project_value,commission_rate,commission_amount,status) VALUES (?,?,?,?,?,?,?)',
    [id, req.user.id, project_name, project_value, rate, amount, 'PENDING']);
  return success(res, 201, { id, commission_amount: amount }, 'Referral submitted for approval');
});

export const createInvestmentRequest = asyncHandler(async (req, res) => {
  const { request_type, amount, terms_accepted } = req.body || {};
  if (!['INVESTMENT','WITHDRAWAL'].includes(request_type)) throw new ValidationError('invalid request_type');
  if (!amount || Number(amount) <= 0) throw new ValidationError('amount required');
  if (request_type === 'WITHDRAWAL' && !terms_accepted) throw new ValidationError('terms must be accepted');
  const noticeMonths = request_type === 'WITHDRAWAL' ? 2 : 0;
  const eligibleDate = request_type === 'WITHDRAWAL' ? new Date(Date.now() + noticeMonths*30*24*60*60*1000).toISOString().slice(0,10) : null;
  const id = uid();
  await pool.execute('INSERT INTO investment_requests (id,user_id,request_type,amount,notice_months,withdrawal_eligible_date,terms_accepted,status) VALUES (?,?,?,?,?,?,?,?)',
    [id, req.user.id, request_type, amount, noticeMonths, eligibleDate, terms_accepted?1:0, 'PENDING']);
  return success(res, 201, { id }, 'Request submitted');
});

// HR/CEO approval endpoints
export const listPendingReferrals = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT rc.*, u.email FROM referral_commissions rc JOIN users u ON u.id=rc.user_id WHERE rc.status="PENDING" ORDER BY rc.created_at DESC');
  return success(res, 200, rows);
});

export const approveReferral = asyncHandler(async (req, res) => {
  const { id, status } = req.body || {};
  if (!['APPROVED','REJECTED'].includes(status)) throw new ValidationError('invalid status');
  await pool.execute('UPDATE referral_commissions SET status=?, approved_by=?, approved_at=NOW() WHERE id=?', [status, req.user.id, id]);
  return success(res, 200, { id, status }, 'Updated');
});

export const listPendingInvestments = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT ir.*, u.email FROM investment_requests ir JOIN users u ON u.id=ir.user_id WHERE ir.status="PENDING" ORDER BY ir.created_at DESC');
  return success(res, 200, rows);
});

export const approveInvestment = asyncHandler(async (req, res) => {
  const { id, status } = req.body || {};
  if (!['APPROVED','REJECTED','PROCESSED'].includes(status)) throw new ValidationError('invalid status');
  await pool.execute('UPDATE investment_requests SET status=?, approved_by=?, approved_at=NOW() WHERE id=?', [status, req.user.id, id]);
  return success(res, 200, { id, status }, 'Updated');
});

export const updateInvestmentConfig = asyncHandler(async (req, res) => {
  const { proposed_rate, rate_period, rate_enabled, terms_text } = req.body || {};
  const id = uid();
  await pool.execute('INSERT INTO investment_config (id, proposed_rate, rate_period, rate_enabled, terms_text, updated_by) VALUES (?,?,?,?,?,?)',
    [id, proposed_rate || 2.00, rate_period || 'DISABLED', rate_enabled ? 1 : 0, terms_text || null, req.user.id]);
  return success(res, 201, { id }, 'Config updated');
});

export default { getMySalary, getMyExtraDuty, getMyReferrals, getMyInvestments, createReferral, createInvestmentRequest, listPendingReferrals, approveReferral, listPendingInvestments, approveInvestment, updateInvestmentConfig };
