import axios from 'axios';
import type {
  ApiResponse,
  User,
  Expense,
  Budget,
  BudgetWithSpending,
  CategoryBreakdown,
  MonthlyTrend,
  DashboardSummary,
  PaginatedResponse,
  ExpenseFilters,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes('/auth/profile')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ user: User }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User }>>('/auth/login', data),

  logout: () => api.post<ApiResponse>('/auth/logout'),

  getProfile: () => api.get<ApiResponse<{ user: User }>>('/auth/profile'),

  refresh: () => api.post<ApiResponse>('/auth/refresh'),

  updateProfile: (data: { name?: string }) =>
    api.put<ApiResponse<{ user: User }>>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse>('/auth/change-password', data),
};

// ─── Expenses ───────────────────────────────────────────

export const expensesApi = {
  list: (params?: ExpenseFilters) =>
    api.get<ApiResponse<PaginatedResponse<Expense>>>('/expenses', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`),

  create: (data: {
    title: string;
    amount: number;
    category: string;
    expenseDate: string;
    notes?: string;
  }) => api.post<ApiResponse<{ expense: Expense }>>('/expenses', data),

  update: (
    id: number,
    data: {
      title?: string;
      amount?: number;
      category?: string;
      expenseDate?: string;
      notes?: string;
    }
  ) => api.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, data),

  delete: (id: number) => api.delete<ApiResponse>(`/expenses/${id}`),
};

// ─── Budgets ────────────────────────────────────────────

export const budgetsApi = {
  list: () => api.get<ApiResponse<{ budgets: BudgetWithSpending[] }>>('/budgets'),

  getCurrent: () =>
    api.get<ApiResponse<{ budget: BudgetWithSpending }>>('/budgets/current'),

  createOrUpdate: (data: { amount: number; month: number; year: number }) =>
    api.post<ApiResponse<{ budget: Budget }>>('/budgets', data),

  update: (id: number, data: { amount: number }) =>
    api.put<ApiResponse<{ budget: Budget }>>(`/budgets/${id}`, data),
};

// ─── Analytics ──────────────────────────────────────────

export const analyticsApi = {
  summary: () =>
    api.get<ApiResponse<DashboardSummary>>('/analytics/summary'),

  categories: (month?: number, year?: number) =>
    api.get<ApiResponse<{ breakdown: CategoryBreakdown[] }>>(
      '/analytics/categories',
      { params: { month, year } }
    ),

  trends: (months?: number) =>
    api.get<ApiResponse<{ trends: MonthlyTrend[] }>>('/analytics/trends', {
      params: { months },
    }),
};

export default api;
