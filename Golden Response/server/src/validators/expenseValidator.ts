import { z } from 'zod';
import { CATEGORIES } from '../types';

export const createExpenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({
      message: `Category must be one of: ${CATEGORIES.join(', ')}`,
    }),
  }),
  expenseDate: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date format' }
    )
    .refine(
      (val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
      },
      { message: 'Expense date cannot be in the future' }
    ),
  notes: z
    .string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional()
    .nullable(),
});

export const updateExpenseSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(255, 'Title must be at most 255 characters')
      .optional(),
    amount: z
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be greater than 0')
      .optional(),
    category: z
      .enum(CATEGORIES, {
        errorMap: () => ({
          message: `Category must be one of: ${CATEGORIES.join(', ')}`,
        }),
      })
      .optional(),
    expenseDate: z
      .string()
      .refine(
        (val) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'Invalid date format' }
      )
      .refine(
        (val) => {
          const date = new Date(val);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return date <= today;
        },
        { message: 'Expense date cannot be in the future' }
      )
      .optional(),
    notes: z
      .string()
      .max(1000, 'Notes must be at most 1000 characters')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  );

export const queryExpenseSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(CATEGORIES).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  amountMin: z.coerce.number().positive().optional(),
  amountMax: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['expenseDate', 'amount', 'title', 'createdAt']).default('expenseDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type QueryExpenseInput = z.infer<typeof queryExpenseSchema>;
