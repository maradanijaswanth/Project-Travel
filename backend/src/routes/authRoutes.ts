import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateJwt } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateJwt, AuthController.me);

export default router;
