import express from 'express';
import * as c from '../controllers/earningsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticate);

// Employee/Intern (self)
router.get('/earnings/salary', requireRole('EMPLOYEE','INTERN'), c.getMySalary);
router.get('/earnings/extra-duty', requireRole('EMPLOYEE','INTERN'), c.getMyExtraDuty);
router.get('/earnings/referrals', requireRole('EMPLOYEE','INTERN'), c.getMyReferrals);
router.post('/earnings/referrals', requireRole('EMPLOYEE','INTERN'), c.createReferral);
router.get('/earnings/investments', requireRole('EMPLOYEE','INTERN'), c.getMyInvestments);
router.post('/earnings/investments', requireRole('EMPLOYEE','INTERN'), c.createInvestmentRequest);

// HR/CEO approval
router.get('/earnings/pending-referrals', requireRole('HR','SUPER_ADMIN'), c.listPendingReferrals);
router.patch('/earnings/referrals/approve', requireRole('HR','SUPER_ADMIN'), c.approveReferral);
router.get('/earnings/pending-investments', requireRole('HR','SUPER_ADMIN'), c.listPendingInvestments);
router.patch('/earnings/investments/approve', requireRole('HR','SUPER_ADMIN'), c.approveInvestment);
router.post('/earnings/config', requireRole('SUPER_ADMIN'), c.updateInvestmentConfig);

export default router;
