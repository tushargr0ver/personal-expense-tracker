import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Wallet,
  Receipt,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import SpendingLineChart from '../components/charts/SpendingLineChart';
import { analyticsApi, expensesApi } from '../services/api';
import type {
  DashboardSummary,
  CategoryBreakdown,
  MonthlyTrend,
  Expense,
} from '../types';

function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton h-5 w-40 mb-6" />
      <div className="skeleton h-[300px] w-full" />
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [summaryRes, categoriesRes, trendsRes, expensesRes] =
          await Promise.all([
            analyticsApi.summary(),
            analyticsApi.categories(),
            analyticsApi.trends(6),
            expensesApi.list({ limit: 5, sortBy: 'expenseDate', sortOrder: 'desc' }),
          ]);

        if (!cancelled) {
          setSummary(summaryRes.data.data ?? null);
          setCategories(categoriesRes.data.data?.breakdown ?? []);
          setTrends(trendsRes.data.data?.trends ?? []);
          setRecentExpenses(expensesRes.data.data?.items ?? []);
        }
      } catch {
        // silently handle — data will remain empty/skeleton
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatCurrency = (val: number) =>
    '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      id: 'total-spending',
      label: 'Total Spending',
      value: formatCurrency(summary?.totalSpending ?? 0),
      icon: DollarSign,
      iconBg: 'from-orange-500/20 to-orange-600/10',
      iconColor: 'text-orange-400',
      subtitle: 'This month',
    },
    {
      id: 'budget-remaining',
      label: 'Budget Remaining',
      value:
        summary?.budgetRemaining != null
          ? formatCurrency(summary.budgetRemaining)
          : 'Not set',
      icon: Wallet,
      iconBg: summary?.isOverBudget
        ? 'from-red-500/20 to-red-600/10'
        : 'from-emerald-500/20 to-emerald-600/10',
      iconColor: summary?.isOverBudget
        ? 'text-red-400'
        : 'text-emerald-400',
      subtitle: summary?.budgetAmount
        ? `of ${formatCurrency(summary.budgetAmount)}`
        : 'Set a budget',
    },
    {
      id: 'expense-count',
      label: 'Expenses',
      value: String(summary?.expenseCount ?? 0),
      icon: Receipt,
      iconBg: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400',
      subtitle: 'This month',
    },
    {
      id: 'top-category',
      label: 'Top Category',
      value: summary?.topCategory?.category ?? 'None',
      icon: TrendingUp,
      iconBg: 'from-violet-500/20 to-violet-600/10',
      iconColor: 'text-violet-400',
      subtitle: summary?.topCategory
        ? formatCurrency(summary.topCategory.total)
        : 'No data',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Over budget alert */}
      {summary?.isOverBudget && (
        <Alert type="warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">You&apos;ve exceeded your monthly budget!</span>
          </div>
          <p className="mt-1 text-xs opacity-80">
            You&apos;ve spent {formatCurrency(summary.totalSpending)} of your{' '}
            {formatCurrency(summary.budgetAmount ?? 0)} budget.
          </p>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <Card
            key={card.id}
            hover
            className="animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400">{card.label}</p>
                <p className="text-2xl font-bold text-dark-100 mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-dark-500 mt-1">{card.subtitle}</p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.iconBg}`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-base font-semibold text-dark-200 mb-4">
            Spending by Category
          </h3>
          <SpendingPieChart data={categories} />
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-base font-semibold text-dark-200 mb-4">
            6-Month Trend
          </h3>
          <SpendingLineChart data={trends} />
        </Card>
      </div>

      {/* Budget Progress */}
      {summary?.budgetAmount && (
        <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-dark-200">
              Budget Progress
            </h3>
            <Link
              to="/budgets"
              className="text-sm text-accent-mid hover:text-accent-start transition-colors"
              id="dashboard-view-budgets"
            >
              Manage Budget
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">
                {formatCurrency(summary.totalSpending)} spent
              </span>
              <span className="text-dark-400">
                {formatCurrency(summary.budgetAmount)} budget
              </span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 progress-animated"
                style={{
                  ['--progress-width' as string]: `${Math.min(
                    ((summary.totalSpending / summary.budgetAmount) * 100),
                    100
                  )}%`,
                  backgroundColor: summary.isOverBudget
                    ? '#ef4444'
                    : (summary.totalSpending / summary.budgetAmount) > 0.7
                    ? '#f59e0b'
                    : '#10b981',
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Recent Expenses */}
      <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-dark-200">
            Recent Expenses
          </h3>
          <Link
            to="/expenses"
            className="flex items-center gap-1 text-sm text-accent-mid hover:text-accent-start transition-colors"
            id="dashboard-view-all-expenses"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-center text-dark-500 py-8 text-sm">
            No expenses yet. Start tracking your spending!
          </p>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge category={expense.category} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-dark-200">
                      {expense.title}
                    </p>
                    <p className="text-xs text-dark-500">
                      {new Date(expense.expenseDate).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-dark-200">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
