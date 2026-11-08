import { Router } from 'express';
import { SupplierController } from '../controllers/supplierController.js';
import { authenticateJwt, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public / operational listing
router.get('/', SupplierController.list);
router.get('/:id', SupplierController.getById);

// Admin / Operator management
router.post('/', authenticateJwt, requireRole(['ADMIN', 'OPERATOR']), SupplierController.create);
router.put('/:id', authenticateJwt, requireRole(['ADMIN', 'OPERATOR']), SupplierController.update);
router.delete('/:id', authenticateJwt, requireRole(['ADMIN', 'OPERATOR']), SupplierController.delete);

// Capabilities & Modules
router.post('/:id/capabilities', authenticateJwt, requireRole(['ADMIN', 'OPERATOR', 'SUPPLIER']), SupplierController.addCapability);
router.post('/:id/modules', authenticateJwt, requireRole(['ADMIN', 'OPERATOR', 'SUPPLIER']), SupplierController.addModule);

export default router;
