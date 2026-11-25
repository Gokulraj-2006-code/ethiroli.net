import express from 'express';
import {
  listAnnualBudgets,
  getAnnualBudget,
  createAnnualBudget,
  approveAnnualBudget,
  reviseAnnualBudget,
  allocatePanel,
  reviseAllocation,
  listBudgetHistory,
  salesBudget
} from '../controllers/budgetController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();
router.use(authenticate);

const admin = requireRole('SUPER_ADMIN', 'ADMIN');
const budgetReader = requireRole('SALES', 'SUPER_ADMIN', 'ADMIN');

// Fixed paths must precede /:id.
router.get('/sales', budgetReader, salesBudget);
router.get('/history', admin, listBudgetHistory);
router.post('/allocate', admin, allocatePanel);
router.patch('/allocations/:id/revise', admin, reviseAllocation);

router.get('/', admin, listAnnualBudgets);
router.post('/', admin, createAnnualBudget);
router.get('/:id', admin, getAnnualBudget);
router.patch('/:id/approve', admin, approveAnnualBudget);
router.patch('/:id/revise', admin, reviseAnnualBudget);

export default router;
