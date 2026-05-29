import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  X,
  Receipt,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import ExpenseForm from '../components/forms/ExpenseForm';
import type { ExpenseFormData } from '../components/forms/ExpenseForm';
import { expensesApi, budgetsApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { Expense, ExpenseFilters, Category } from '../types';
import { CATEGORIES } from '../types';

export default function Expenses() {
  const { addToast } = useToast();

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'expenseDate',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounced search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minAmount !== '' && filters.minAmount !== undefined)
        params.minAmount = filters.minAmount;
      if (filters.maxAmount !== '' && filters.maxAmount !== undefined)
        params.maxAmount = filters.maxAmount;

      const res = await expensesApi.list(params as ExpenseFilters);
      const data = res.data.data;
      setExpenses(data?.items ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch {
      addToast('error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 400);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'expenseDate',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '';

  // CRUD handlers
  const handleCreate = async (data: ExpenseFormData) => {
    setFormLoading(true);
    try {
      await expensesApi.create(data);
      addToast('success', 'Expense added successfully');
      setShowFormModal(false);
      setEditingExpense(undefined);
      fetchExpenses();

      // Check budget
      try {
        const budgetRes = await budgetsApi.getCurrent();
        const budget = budgetRes.data.data?.budget;
        if (budget?.isOverBudget) {
          addToast('warning', `You've exceeded your monthly budget of $${budget.amount.toFixed(2)}!`);
        }
      } catch {
        // no budget set, ignore
      }
    } catch {
      addToast('error', 'Failed to add expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    setFormLoading(true);
    try {
      await expensesApi.update(editingExpense.id, data);
      addToast('success', 'Expense updated successfully');
      setShowFormModal(false);
      setEditingExpense(undefined);
      fetchExpenses();
    } catch {
      addToast('error', 'Failed to update expense');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;
    setDeleteLoading(true);
    try {
      await expensesApi.delete(deletingExpense.id);
      addToast('success', 'Expense deleted');
      setShowDeleteModal(false);
      setDeletingExpense(null);
      fetchExpenses();
    } catch {
      addToast('error', 'Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowFormModal(true);
  };

  const openDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setShowDeleteModal(true);
  };

  const formatCurrency = (val: number) =>
    '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Input
              id="expense-search"
              placeholder="Search expenses..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          {/* Filter toggle */}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            icon={<SlidersHorizontal className="h-4 w-4" />}
            id="expense-filter-toggle"
          >
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-mid/30 text-[10px] text-white">
                !
              </span>
            )}
          </Button>
        </div>

        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditingExpense(undefined);
            setShowFormModal(true);
          }}
          id="expense-add-btn"
        >
          Add Expense
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              id="expense-filter-category"
              label="Category"
              options={categoryOptions}
              value={filters.category as string}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  category: e.target.value as Category | '',
                  page: 1,
                }))
              }
            />
            <Input
              id="expense-filter-start"
              label="From Date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value, page: 1 }))
              }
            />
            <Input
              id="expense-filter-end"
              label="To Date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value, page: 1 }))
              }
            />
            <div className="flex gap-2">
              <Input
                id="expense-filter-min"
                label="Min Amount"
                type="number"
                placeholder="0"
                value={filters.minAmount === '' ? '' : String(filters.minAmount)}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    minAmount: e.target.value ? Number(e.target.value) : '',
                    page: 1,
                  }))
                }
              />
              <Input
                id="expense-filter-max"
                label="Max Amount"
                type="number"
                placeholder="∞"
                value={filters.maxAmount === '' ? '' : String(filters.maxAmount)}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    maxAmount: e.target.value ? Number(e.target.value) : '',
                    page: 1,
                  }))
                }
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                icon={<X className="h-3 w-3" />}
                id="expense-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Expense List */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-500">
            <Receipt className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-dark-400">
              No expenses found
            </p>
            <p className="text-sm mt-1">
              {filters.search || hasActiveFilters
                ? 'Try adjusting your filters'
                : "Click 'Add Expense' to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-white/3 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-dark-200">
                            {expense.title}
                          </p>
                          {expense.notes && (
                            <p className="text-xs text-dark-500 mt-0.5 truncate max-w-[200px]">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-dark-200">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge category={expense.category} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-400">
                        {new Date(expense.expenseDate).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(expense)}
                            className="rounded-lg p-2 text-dark-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            aria-label={`Edit ${expense.title}`}
                            id={`expense-edit-${expense.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDelete(expense)}
                            className="rounded-lg p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            aria-label={`Delete ${expense.title}`}
                            id={`expense-delete-${expense.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge category={expense.category} size="sm" />
                      </div>
                      <p className="text-sm font-medium text-dark-200 truncate">
                        {expense.title}
                      </p>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {new Date(expense.expenseDate).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-sm font-semibold text-dark-200">
                        {formatCurrency(expense.amount)}
                      </span>
                      <button
                        onClick={() => openEdit(expense)}
                        className="rounded-lg p-1.5 text-dark-400 hover:text-blue-400 transition-colors"
                        aria-label={`Edit ${expense.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(expense)}
                        className="rounded-lg p-1.5 text-dark-400 hover:text-red-400 transition-colors"
                        aria-label={`Delete ${expense.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && expenses.length > 0 && (
          <div className="px-6 pb-4">
            <Pagination
              page={filters.page || 1}
              totalPages={totalPages}
              limit={filters.limit || 10}
              total={total}
              onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
              onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))}
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingExpense(undefined);
        }}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          expense={editingExpense}
          onSubmit={editingExpense ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowFormModal(false);
            setEditingExpense(undefined);
          }}
          isLoading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-300">
            Are you sure you want to delete this expense?
          </p>
          {deletingExpense && (
            <div className="rounded-xl bg-white/5 p-4 border border-white/5">
              <p className="font-medium text-dark-200">
                {deletingExpense.title}
              </p>
              <p className="text-lg font-bold text-dark-100 mt-1">
                {formatCurrency(deletingExpense.amount)}
              </p>
            </div>
          )}
          <p className="text-xs text-dark-500">
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingExpense(null);
              }}
              id="expense-delete-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDelete}
              fullWidth
              id="expense-delete-confirm"
            >
              Delete Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
