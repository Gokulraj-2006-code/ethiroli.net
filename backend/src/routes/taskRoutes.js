import express from 'express';
import {
  listTasks,
  createTask,
  getTask,
  getTaskHistory,
  updateTask,
  updateTaskStatus,
  bulkUpdateTasks,
  deleteTask,
  moveTask,
  startTask,
  updateTaskProgress,
  submitTaskForReview,
  approveTask,
  rejectTask
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

const readRoles = requireRole('SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE', 'INTERN');
const manageRoles = requireRole('PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN');

router.get('/tasks', readRoles, listTasks);
router.post('/tasks', manageRoles, validateBody('createTask'), createTask);
router.get('/tasks/:id', readRoles, getTask);
router.get('/tasks/:id/history', readRoles, getTaskHistory);
router.put('/tasks/:id', manageRoles, validateBody('updateTask'), updateTask);
router.patch('/tasks/:id', manageRoles, validateBody('updateTask'), updateTask);
router.patch('/tasks/:id/status', readRoles, validateBody('updateTaskStatus'), updateTaskStatus);
router.patch('/tasks/:id/move', readRoles, moveTask);
// Review lifecycle. Employees start / submit; Managers approve / reject with
// persisted feedback. All four routes are role-guarded inside the controller
// by project ownership and task assignment.
router.post('/tasks/:id/start', requireRole('EMPLOYEE', 'INTERN'), startTask);
router.patch('/tasks/:id/progress', requireRole('EMPLOYEE', 'INTERN'), updateTaskProgress);
router.post('/tasks/:id/submit', requireRole('EMPLOYEE', 'INTERN'), submitTaskForReview);
router.post('/tasks/:id/approve', manageRoles, approveTask);
router.post('/tasks/:id/reject', manageRoles, rejectTask);
router.delete('/tasks/:id', manageRoles, deleteTask);
router.post('/tasks/bulk/status', manageRoles, validateBody('bulkUpdateTasks'), bulkUpdateTasks);

export default router;
