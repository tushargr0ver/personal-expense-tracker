import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { budgets, expenses } from '../db/schema';
import { BudgetWithSpending } from '../types';
import { CreateBudgetInput } from '../validators/budgetValidator';

export const budgetService = {
  async createOrUpdate(userId: number, data: CreateBudgetInput) {
    // Check if budget already exists for this month/year
    const [existing] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, data.month),
          eq(budgets.year, data.year)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing budget
      const [updated] = await db
        .update(budgets)
        .set({ amount: data.amount.toString(), updatedAt: new Date() })
        .where(eq(budgets.id, existing.id))
        .returning();
      return updated;
    }

    // Create new budget
    const [budget] = await db
      .insert(budgets)
      .values({
        userId,
        amount: data.amount.toString(),
        month: data.month,
        year: data.year,
      })
      .returning();

    return budget;
  },

  async findByMonthYear(userId: number, month: number, year: number) {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, month),
          eq(budgets.year, year)
        )
      )
      .limit(1);

    if (!budget) return null;

    // Calculate spending for this month
    const [spendingResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          sql`EXTRACT(MONTH FROM ${expenses.expenseDate}::date) = ${month}`,
          sql`EXTRACT(YEAR FROM ${expenses.expenseDate}::date) = ${year}`
        )
      );

    const spent = parseFloat(spendingResult.total);
    const budgetAmount = parseFloat(budget.amount);

    const result: BudgetWithSpending = {
      ...budget,
      spent,
      remaining: budgetAmount - spent,
      isOver: spent > budgetAmount,
    };

    return result;
  },

  async findAll(userId: number) {
    const allBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(sql`${budgets.year} DESC, ${budgets.month} DESC`);

    const results: BudgetWithSpending[] = [];

    for (const budget of allBudgets) {
      const [spendingResult] = await db
        .select({
          total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            sql`EXTRACT(MONTH FROM ${expenses.expenseDate}::date) = ${budget.month}`,
            sql`EXTRACT(YEAR FROM ${expenses.expenseDate}::date) = ${budget.year}`
          )
        );

      const spent = parseFloat(spendingResult.total);
      const budgetAmount = parseFloat(budget.amount);

      results.push({
        ...budget,
        spent,
        remaining: budgetAmount - spent,
        isOver: spent > budgetAmount,
      });
    }

    return results;
  },

  async update(id: number, userId: number, amount: number) {
    const [updated] = await db
      .update(budgets)
      .set({ amount: amount.toString(), updatedAt: new Date() })
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();

    return updated || null;
  },

  async checkOverBudget(userId: number, month: number, year: number) {
    const budgetData = await this.findByMonthYear(userId, month, year);

    if (!budgetData) {
      return {
        isOver: false,
        budget: null,
        spent: 0,
        remaining: null,
      };
    }

    return {
      isOver: budgetData.isOver,
      budget: parseFloat(budgetData.amount),
      spent: budgetData.spent,
      remaining: budgetData.remaining,
    };
  },
};
