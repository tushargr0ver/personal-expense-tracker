export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  userId: number;
  title: string;
  amount: number;
  category: Category;
  expenseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type Category =
  | 'Food'
  | 'Transportation'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',
  Transportation: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#8b5cf6',
  Entertainment: '#eab308',
  Healthcare: '#10b981',
  Other: '#6b7280',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: 'UtensilsCrossed',
  Transportation: 'Car',
  Shopping: 'ShoppingBag',
  Bills: 'Receipt',
  Entertainment: 'Gamepad2',
  Healthcare: 'Heart',
  Other: 'MoreHorizontal',
};

export interface Budget {
  id: number;
  userId: number;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  isOverBudget: boolean;
  percentage: number;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  total: number;
  label: string;
}

export interface DashboardSummary {
  totalSpending: number;
  budgetAmount: number | null;
  budgetRemaining: number | null;
  isOverBudget: boolean;
  expenseCount: number;
  topCategory: { category: Category; total: number } | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
}

export interface ExpenseFilters {
  search?: string;
  category?: Category | '';
  startDate?: string;
  endDate?: string;
  minAmount?: number | '';
  maxAmount?: number | '';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
