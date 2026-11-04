import express from 'express';
import {
  listContactMessages,
  getContactMessage,
  createContactMessage,
  updateContactMessage,
  deleteContactMessage,
  convertInquiryToLead
} from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { createLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public submission endpoints (supports POST / or POST /contact-messages)
const publicInquiryLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many enquiries from this connection. Please try again later.', suffix: 'public:contact' });
router.post('/', publicInquiryLimiter, createContactMessage);
router.post('/contact-messages', publicInquiryLimiter, createContactMessage);

// Protected endpoints for staff
router.get('/', authenticate, requireRole('HR', 'SUPER_ADMIN'), listContactMessages);
router.get('/contact-messages', authenticate, requireRole('HR', 'SUPER_ADMIN'), listContactMessages);
router.get('/:id', authenticate, requireRole('HR', 'SUPER_ADMIN'), getContactMessage);
router.patch('/:id/status', authenticate, requireRole('HR'), updateContactMessage);
router.delete('/:id', authenticate, requireRole('HR'), deleteContactMessage);
router.post('/:id/convert', authenticate, requireRole('HR'), convertInquiryToLead);

export default router;
