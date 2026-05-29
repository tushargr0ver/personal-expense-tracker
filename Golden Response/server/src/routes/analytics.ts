import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/analytics/summary
router.get('/summary', analyticsController.summary);

// GET /api/analytics/categories
router.get('/categories', analyticsController.categoryBreakdown);

// GET /api/analytics/trends
router.get('/trends', analyticsController.trends);

export default router;
