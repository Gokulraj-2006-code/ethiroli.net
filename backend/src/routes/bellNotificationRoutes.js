import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as c from '../controllers/notificationController.js';

const router = express.Router();
router.use(authenticate);
router.get('/bell-notifications', c.listNotifications);
router.patch('/bell-notifications/:id/read', c.markRead);
router.post('/bell-notifications/read-all', c.markAllRead);
export default router;
