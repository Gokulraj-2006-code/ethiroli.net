import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import * as c from '../controllers/staffAdminController.js';

const router = express.Router();
router.use(authenticate);
router.get('/staff', requireRole('SUPER_ADMIN'), c.listStaff);
router.post('/staff', requireRole('SUPER_ADMIN'), c.createStaff);
router.patch('/staff/:id', requireRole('SUPER_ADMIN'), c.updateStaff);
router.put('/staff/:id', requireRole('SUPER_ADMIN'), c.updateStaff);
router.patch('/staff/:id/status', requireRole('SUPER_ADMIN'), c.toggleStaffStatus);
router.patch('/staff/:id/deactivate', requireRole('SUPER_ADMIN'), c.deactivateStaff);
router.patch('/staff/:id/activate', requireRole('SUPER_ADMIN'), c.activateStaff);
export default router;
