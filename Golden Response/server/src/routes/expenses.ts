import { Router } from 'express';
import { expenseController } from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createExpenseSchema,
  updateExpenseSchema,
  queryExpenseSchema,
} from '../validators/expenseValidator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/expenses
router.post('/', validate(createExpenseSchema), expenseController.create);

// GET /api/expenses
router.get('/', validate(queryExpenseSchema, 'query'), expenseController.getAll);

// GET /api/expenses/:id
router.get('/:id', expenseController.getById);

// PUT /api/expenses/:id
router.put('/:id', validate(updateExpenseSchema), expenseController.update);

// DELETE /api/expenses/:id
router.delete('/:id', expenseController.delete);

export default router;
