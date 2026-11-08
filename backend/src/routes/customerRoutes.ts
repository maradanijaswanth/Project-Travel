import { Router } from 'express';
import { CustomerController } from '../controllers/customerController.js';
import { authenticateJwt, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateJwt, requireRole(['ADMIN', 'OPERATOR']), CustomerController.list);
router.get('/:id', authenticateJwt, requireRole(['ADMIN', 'OPERATOR']), CustomerController.getById);

export default router;
