import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { downloadIssuedDocument, issueDocument, listIssuedDocuments, listPeople } from '../controllers/hrIssuedDocumentController.js';

const router = express.Router();
router.use(authenticate);
router.get('/hr/issued-documents/recipients', requireRole('HR'), listPeople);
router.post('/hr/issued-documents', requireRole('HR'), issueDocument);
router.get('/hr/issued-documents', requireRole('HR'), listIssuedDocuments);
router.get('/employee/hr-documents', requireRole('EMPLOYEE', 'INTERN'), listIssuedDocuments);
router.get('/employee/hr-documents/:id/download', requireRole('EMPLOYEE', 'INTERN'), downloadIssuedDocument);
router.get('/hr/issued-documents/:id/download', requireRole('HR'), downloadIssuedDocument);
export default router;
