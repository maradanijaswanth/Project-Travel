import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledgeController.js';

const router = Router();

router.get('/routes', KnowledgeController.getRoutes);
router.get('/seasons', KnowledgeController.getSeasons);
router.get('/stats', KnowledgeController.getStats);

export default router;
