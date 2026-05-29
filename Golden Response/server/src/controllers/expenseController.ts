import { Response, NextFunction } from 'express';
import { expenseService } from '../services/expenseService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest, ExpenseFilters } from '../types';

export const expenseController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const expense = await expenseService.create(req.user.id, req.body);
      sendSuccess(res, { expense }, 'Expense created successfully', 201);
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

      const {
        page = 1,
        limit = 20,
        category,
        dateFrom,
        dateTo,
        amountMin,
        amountMax,
        search,
        sortBy = 'expenseDate',
        sortOrder = 'desc',
      } = req.query as any;

      const filters: ExpenseFilters = {
        category,
        dateFrom,
        dateTo,
        amountMin: amountMin ? Number(amountMin) : undefined,
        amountMax: amountMax ? Number(amountMax) : undefined,
        search,
        sortBy,
        sortOrder,
      };

      const result = await expenseService.findAll(
        req.user.id,
        filters,
        { page: Number(page), limit: Math.min(Number(limit), 100) }
      );

      sendSuccess(res, result, 'Expenses retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid expense ID', [], 400);
        return;
      }

      const expense = await expenseService.findById(id, req.user.id);
      if (!expense) {
        sendError(res, 'Expense not found', [], 404);
        return;
      }

      sendSuccess(res, { expense }, 'Expense retrieved successfully');
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
        sendError(res, 'Invalid expense ID', [], 400);
        return;
      }

      const expense = await expenseService.update(id, req.user.id, req.body);
      if (!expense) {
        sendError(res, 'Expense not found', [], 404);
        return;
      }

      sendSuccess(res, { expense }, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid expense ID', [], 400);
        return;
      }

      const expense = await expenseService.delete(id, req.user.id);
      if (!expense) {
        sendError(res, 'Expense not found', [], 404);
        return;
      }

      sendSuccess(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
