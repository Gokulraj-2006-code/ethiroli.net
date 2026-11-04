import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { AuthorizationError } from '../utils/errors.js';
import { createPersonnel, resendInvitation } from '../controllers/onboardingController.js';

const router = express.Router();
router.use(authenticate);
router.use((req, res, next) => {
  if (req.user?.role !== 'HR') return next(new AuthorizationError('HR role required'));
  next();
});
router.post('/:kind', createPersonnel);
router.post('/accounts/:userId/resend', resendInvitation);

export default router;
