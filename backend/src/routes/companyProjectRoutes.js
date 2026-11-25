import express from 'express';
import {
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
} from '../controllers/companyProjectController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();
router.use(authenticate);

const reader = requireRole('SALES', 'PROJECT_MANAGER', 'EMPLOYEE', 'INTERN', 'SUPER_ADMIN', 'ADMIN');
const manager = requireRole('PROJECT_MANAGER', 'SUPER_ADMIN', 'ADMIN');
const sales = requireRole('SALES', 'SUPER_ADMIN', 'ADMIN');
const admin = requireRole('SUPER_ADMIN', 'ADMIN');

router.get('/', reader, listCompanyProjects);
router.get('/assignable-staff', manager, listAssignableStaff);

router.get('/:id', reader, getCompanyProject);
router.get('/:id/activity', reader, getProjectActivity);
router.post('/:id/accept', manager, acceptCompanyProject);
router.post('/:id/team', manager, assignProjectTeam);
router.post('/:id/recompute', manager, recomputeProject);

router.get('/:id/tasks', reader, listProjectTasks);
router.post('/:id/tasks', manager, createProjectTask);

router.get('/:id/expenses', reader, listProjectExpenses);
router.post('/:id/expenses', sales, createProjectExpense);
router.put('/:id/expenses/:expenseId/approve', manager, approveProjectExpense);
router.put('/:id/expenses/:expenseId/reject', manager, rejectProjectExpense);

router.post('/:id/delivery/submit', manager, submitProjectDelivery);
router.post('/:id/delivery/confirm-sales', sales, confirmSalesDelivery);
router.post('/:id/delivery/complete', admin, confirmAdminCompletion);

export default router;
