import { Request } from 'express';

// Category enum
export const CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

// User interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense interfaces
export interface Expense {
  id: number;
  userId: number;
  title: string;
  amount: string; // numeric stored as string
  category: Category;
  expenseDate: string; // date stored as string
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Budget interfaces
export interface Budget {
  id: number;
  userId: number;
  amount: string; // numeric stored as string
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// JWT Payload
export interface JwtPayload {
  id: number;
  email: string;
}

// Express Request augmentation
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Expense filters
export interface ExpenseFilters {
  category?: Category;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
  sortBy?: 'expenseDate' | 'amount' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Budget with spending info
export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  isOver: boolean;
}

// Analytics types
export interface CategoryBreakdown {
  category: Category;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  total: number;
}

export interface Summary {
  totalSpendingThisMonth: number;
  budgetAmount: number | null;
  budgetRemaining: number | null;
  isOverBudget: boolean;
  expenseCount: number;
  topCategory: Category | null;
}
