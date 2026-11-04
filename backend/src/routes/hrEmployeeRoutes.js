import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import * as c from '../controllers/hrEmployeeController.js';

const router = express.Router();
router.use(authenticate);
router.post('/hr/employees', requireRole('HR', 'SUPER_ADMIN'), c.createEmployeeWithPassword);
export default router;
