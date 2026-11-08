import { Router } from 'express';
import { SupplierController } from '../controllers/supplierController.js';
import { authenticateJwt, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.put('/:id', authenticateJwt, requireRole(['ADMIN', 'OPERATOR', 'SUPPLIER']), SupplierController.updateModule);

export default router;
