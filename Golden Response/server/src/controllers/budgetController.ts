import { Response, NextFunction } from 'express';
import { budgetService } from '../services/budgetService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const budgetController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const budget = await budgetService.createOrUpdate(req.user.id, req.body);
      sendSuccess(res, { budget }, 'Budget created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const budgets = await budgetService.findAll(req.user.id);
      sendSuccess(res, { budgets }, 'Budgets retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getCurrent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const budget = await budgetService.findByMonthYear(req.user.id, month, year);

      if (!budget) {
        sendSuccess(res, { budget: null }, 'No budget set for current month');
        return;
      }

      const overBudgetCheck = await budgetService.checkOverBudget(req.user.id, month, year);

      sendSuccess(
        res,
        { budget, overBudget: overBudgetCheck },
        'Current budget retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid budget ID', [], 400);
        return;
      }

      const { amount } = req.body;
      const budget = await budgetService.update(id, req.user.id, amount);

      if (!budget) {
        sendError(res, 'Budget not found', [], 404);
        return;
      }

      sendSuccess(res, { budget }, 'Budget updated successfully');
    } catch (error) {
      next(error);
    }
  },
};
