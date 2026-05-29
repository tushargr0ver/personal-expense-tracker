import { z } from 'zod';

export const createBudgetSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Amount must be 0 or greater'),
  month: z
    .number({ invalid_type_error: 'Month must be a number' })
    .int('Month must be an integer')
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z
    .number({ invalid_type_error: 'Year must be a number' })
    .int('Year must be an integer')
    .min(2000, 'Year must be between 2000 and 2100')
    .max(2100, 'Year must be between 2000 and 2100'),
});

export const updateBudgetSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Amount must be 0 or greater'),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
