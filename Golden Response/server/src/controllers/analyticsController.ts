import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const analyticsController = {
  async summary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const summaryData = await analyticsService.getSummary(req.user.id);
      sendSuccess(res, summaryData, 'Summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async categoryBreakdown(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const now = new Date();
      const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
      const year = parseInt(req.query.year as string, 10) || now.getFullYear();

      const breakdown = await analyticsService.getCategoryBreakdown(req.user.id, month, year);
      sendSuccess(res, { breakdown }, 'Category breakdown retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async trends(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const months = parseInt(req.query.months as string, 10) || 6;
      const trendsData = await analyticsService.getTrends(req.user.id, months);
      sendSuccess(res, { trends: trendsData }, 'Trends retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
};
