import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import * as c from '../controllers/deactivationController.js';

const router = express.Router();
router.use(authenticate);
router.post('/deactivation-requests', requireRole('HR', 'SUPER_ADMIN'), c.requestDeactivation);
router.get('/deactivation-requests', requireRole('HR', 'SUPER_ADMIN'), c.listDeactivationRequests);
router.patch('/deactivation-requests/:id', requireRole('SUPER_ADMIN'), c.reviewDeactivation);
export default router;
