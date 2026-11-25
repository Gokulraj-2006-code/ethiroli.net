import express from 'express';
import {
  listClientOrders,
  getClientOrder,
  createClientOrder,
  updateClientOrder,
  deleteClientOrder,
  convertOrderToProject,
  listAvailableManagers
} from '../controllers/clientOrderController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();
router.use(authenticate);
router.use(requireRole('SALES', 'SUPER_ADMIN', 'ADMIN'));

router.get('/managers', listAvailableManagers);
router.get('/', listClientOrders);
router.post('/', createClientOrder);
router.get('/:id', getClientOrder);
router.put('/:id', updateClientOrder);
router.patch('/:id', updateClientOrder);
router.delete('/:id', deleteClientOrder);
router.post('/:id/convert', convertOrderToProject);

export default router;
