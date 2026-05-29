import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

function clearTokenCookies(res: Response): void {
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);

      setTokenCookies(res, result.accessToken, result.refreshToken);

      sendSuccess(res, { user: result.user }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      setTokenCookies(res, result.accessToken, result.refreshToken);

      sendSuccess(res, { user: result.user }, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    clearTokenCookies(res);
    sendSuccess(res, null, 'Logged out successfully');
  },

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', [], 401);
        return;
      }

      const user = await authService.getUserById(req.user.id);
      if (!user) {
        sendError(res, 'User not found', [], 404);
        return;
      }

      sendSuccess(res, { user }, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        sendError(res, 'Refresh token not provided', [], 401);
        return;
      }

      const payload = authService.verifyRefreshToken(refreshToken);
      const tokens = authService.generateTokens(payload.id, payload.email);

      setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

      sendSuccess(res, null, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  },
};
