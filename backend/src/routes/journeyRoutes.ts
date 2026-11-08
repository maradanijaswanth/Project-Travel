import { Router } from 'express';
import { JourneyController } from '../controllers/journeyController.js';
import { authenticateJwt, optionalJwt, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Customer-facing composition
router.post('/compose', optionalJwt, JourneyController.compose);

// List journeys (admin & operators, or customer filtering)
router.get('/', optionalJwt, JourneyController.list);

// Get specific journey details
router.get('/:id', optionalJwt, JourneyController.getById);

// Submit draft journey to human operations review
router.post('/:id/submit-review', optionalJwt, JourneyController.submitReview);

// Human validation action (Operator / Admin role check)
router.post('/:id/validate', authenticateJwt, requireRole(['ADMIN', 'OPERATOR']), JourneyController.validate);

export default router;
