import { eq, and, gte, lte, ilike, sql, asc, desc, count } from 'drizzle-orm';
import { db } from '../db';
import { expenses } from '../db/schema';
import { PaginatedResult, ExpenseFilters, PaginationParams } from '../types';
import { CreateExpenseInput, UpdateExpenseInput } from '../validators/expenseValidator';

export const expenseService = {
  async create(userId: number, data: CreateExpenseInput) {
    const [expense] = await db
      .insert(expenses)
      .values({
        userId,
        title: data.title,
        amount: data.amount.toString(),
        category: data.category,
        expenseDate: data.expenseDate,
        notes: data.notes ?? null,
      })
      .returning();

    return expense;
  },

  async findAll(
    userId: number,
    filters: ExpenseFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<typeof expenses.$inferSelect>> {
    const conditions = [eq(expenses.userId, userId)];

    if (filters.category) {
      conditions.push(eq(expenses.category, filters.category));
    }

    if (filters.dateFrom) {
      conditions.push(gte(expenses.expenseDate, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(expenses.expenseDate, filters.dateTo));
    }

    if (filters.amountMin !== undefined) {
      conditions.push(gte(expenses.amount, filters.amountMin.toString()));
    }

    if (filters.amountMax !== undefined) {
      conditions.push(lte(expenses.amount, filters.amountMax.toString()));
    }

    if (filters.search) {
      conditions.push(ilike(expenses.title, `%${filters.search}%`));
    }

    const whereClause = and(...conditions);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(expenses)
      .where(whereClause);

    // Determine sort
    const sortColumn = (() => {
      switch (filters.sortBy) {
        case 'amount':
          return expenses.amount;
        case 'title':
          return expenses.title;
        case 'createdAt':
          return expenses.createdAt;
        case 'expenseDate':
        default:
          return expenses.expenseDate;
      }
    })();

    const orderFn = filters.sortOrder === 'asc' ? asc : desc;

    // Get paginated items
    const offset = (pagination.page - 1) * pagination.limit;
    const items = await db
      .select()
      .from(expenses)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(pagination.limit)
      .offset(offset);

    return {
      items,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
      limit: pagination.limit,
    };
  },

  async findById(id: number, userId: number) {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .limit(1);

    return expense || null;
  },

  async update(id: number, userId: number, data: Record<string, unknown>) {
    // Build update values
    const updateValues: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) updateValues.title = data.title;
    if (data.amount !== undefined && data.amount !== null) updateValues.amount = (data.amount as number).toString();
    if (data.category !== undefined) updateValues.category = data.category;
    if (data.expenseDate !== undefined) updateValues.expenseDate = data.expenseDate;
    if (data.notes !== undefined) updateValues.notes = data.notes;

    const [updated] = await db
      .update(expenses)
      .set(updateValues)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();

    return updated || null;
  },

  async delete(id: number, userId: number) {
    const [deleted] = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();

    return deleted || null;
  },
};
