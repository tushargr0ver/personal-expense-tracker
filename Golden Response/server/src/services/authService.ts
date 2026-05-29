import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { JwtPayload, UserWithoutPassword } from '../types';

const BCRYPT_ROUNDS = 12;

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: UserWithoutPassword; accessToken: string; refreshToken: string }> {
    // Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    logger.info(`New user registered: ${email}`);

    // Generate tokens
    const tokens = this.generateTokens(newUser.id, newUser.email);

    return { user: newUser, ...tokens };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserWithoutPassword; accessToken: string; refreshToken: string }> {
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      logger.warn(`Failed login attempt: user not found for ${email}`);
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn(`Failed login attempt: wrong password for ${email}`);
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    logger.info(`User logged in: ${email}`);

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    const userWithoutPassword: UserWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userWithoutPassword, ...tokens };
  },

  generateTokens(
    userId: number,
    email: string
  ): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = { id: userId, email };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  },

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
      return { id: decoded.id, email: decoded.email };
    } catch {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }
  },

  async getUserById(id: number): Promise<UserWithoutPassword | null> {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  },
};
