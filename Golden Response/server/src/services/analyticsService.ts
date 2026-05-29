import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import { expenses, budgets } from '../db/schema';
import { CategoryBreakdown, MonthlyTrend, Summary, CATEGORIES, Category } from '../types';

export const analyticsService = {
  async getSummary(userId: number): Promise<Summary> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total spending this month
    const [spendingResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          sql`EXTRACT(MONTH FROM ${expenses.expenseDate}::date) = ${currentMonth}`,
          sql`EXTRACT(YEAR FROM ${expenses.expenseDate}::date) = ${currentYear}`
        )
      );

    const totalSpendingThisMonth = parseFloat(spendingResult.total);
    const expenseCount = Number(spendingResult.count);

    // Budget info
    const [budget] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, currentMonth),
          eq(budgets.year, currentYear)
        )
      )
      .limit(1);

    const budgetAmount = budget ? parseFloat(budget.amount) : null;
    const budgetRemaining = budgetAmount !== null ? budgetAmount - totalSpendingThisMonth : null;
    const isOverBudget = budgetAmount !== null ? totalSpendingThisMonth > budgetAmount : false;

    // Top category this month
    const topCategoryResult = await db
      .select({
        category: expenses.category,
        total: sql<string>`SUM(${expenses.amount})`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          sql`EXTRACT(MONTH FROM ${expenses.expenseDate}::date) = ${currentMonth}`,
          sql`EXTRACT(YEAR FROM ${expenses.expenseDate}::date) = ${currentYear}`
        )
      )
      .groupBy(expenses.category)
      .orderBy(desc(sql`SUM(${expenses.amount})`))
      .limit(1);

    const topCategory = topCategoryResult.length > 0
      ? (topCategoryResult[0].category as Category)
      : null;

    return {
      totalSpendingThisMonth,
      budgetAmount,
      budgetRemaining,
      isOverBudget,
      expenseCount,
      topCategory,
    };
  },

  async getCategoryBreakdown(
    userId: number,
    month: number,
    year: number
  ): Promise<CategoryBreakdown[]> {
    const results = await db
      .select({
        category: expenses.category,
        total: sql<string>`SUM(${expenses.amount})`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          sql`EXTRACT(MONTH FROM ${expenses.expenseDate}::date) = ${month}`,
          sql`EXTRACT(YEAR FROM ${expenses.expenseDate}::date) = ${year}`
        )
      )
      .groupBy(expenses.category)
      .orderBy(desc(sql`SUM(${expenses.amount})`));

    // Calculate grand total for percentages
    const grandTotal = results.reduce((sum, r) => sum + parseFloat(r.total), 0);

    return results.map((r) => ({
      category: r.category as Category,
      total: parseFloat(r.total),
      percentage: grandTotal > 0
        ? Math.round((parseFloat(r.total) / grandTotal) * 10000) / 100
        : 0,
    }));
  },

  async getTrends(userId: number, months: number = 6): Promise<MonthlyTrend[]> {
    const results = await db
      .select({
        month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${expenses.expenseDate}::date), 'YYYY-MM')`,
        year: sql<number>`EXTRACT(YEAR FROM ${expenses.expenseDate}::date)`,
        total: sql<string>`SUM(${expenses.amount})`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          sql`${expenses.expenseDate}::date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${sql.raw(String(months - 1))} months'`
        )
      )
      .groupBy(
        sql`DATE_TRUNC('month', ${expenses.expenseDate}::date)`,
        sql`EXTRACT(YEAR FROM ${expenses.expenseDate}::date)`
      )
      .orderBy(sql`DATE_TRUNC('month', ${expenses.expenseDate}::date)`);

    return results.map((r) => ({
      month: r.month,
      year: Number(r.year),
      total: parseFloat(r.total),
    }));
  },
};
