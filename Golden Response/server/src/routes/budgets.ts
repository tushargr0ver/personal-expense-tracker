import { Router } from 'express';
import { budgetController } from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budgetValidator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/budgets
router.post('/', validate(createBudgetSchema), budgetController.create);

// GET /api/budgets
router.get('/', budgetController.getAll);

// GET /api/budgets/current
router.get('/current', budgetController.getCurrent);

// PUT /api/budgets/:id
router.put('/:id', validate(updateBudgetSchema), budgetController.update);

export default router;
