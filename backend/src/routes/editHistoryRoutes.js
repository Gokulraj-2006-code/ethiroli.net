import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import * as c from '../controllers/editHistoryController.js';

const router = express.Router();
router.use(authenticate);
router.get('/edit-history/:employeeId', requireRole('HR', 'SUPER_ADMIN'), c.getEditHistory);
export default router;
