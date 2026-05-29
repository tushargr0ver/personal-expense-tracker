import { useState, useEffect, type FormEvent } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Expense, Category } from '../../types';
import { CATEGORIES } from '../../types';
import {
  Type,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  category: Category;
  expenseDate: string;
  notes: string;
}

interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
  expenseDate?: string;
}

export default function ExpenseForm({
  expense,
  onSubmit,
  onCancel,
  isLoading,
}: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setExpenseDate(expense.expenseDate.split('T')[0]);
      setNotes(expense.notes || '');
    } else {
      // Default to today
      setExpenseDate(new Date().toISOString().split('T')[0]);
    }
  }, [expense]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.trim().length < 2)
      newErrors.title = 'Title must be at least 2 characters';

    const numAmount = parseFloat(amount);
    if (!amount) newErrors.amount = 'Amount is required';
    else if (isNaN(numAmount) || numAmount <= 0)
      newErrors.amount = 'Amount must be greater than 0';

    if (!category) newErrors.category = 'Category is required';

    if (!expenseDate) newErrors.expenseDate = 'Date is required';
    else {
      const date = new Date(expenseDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) newErrors.expenseDate = 'Date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      amount: parseFloat(amount),
      category: category as Category,
      expenseDate,
      notes: notes.trim(),
    });
  };

  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="expense-title"
        label="Title"
        placeholder="e.g. Grocery shopping"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        icon={<Type className="h-4 w-4" />}
      />

      <Input
        id="expense-amount"
        label="Amount"
        type="number"
        placeholder="0.00"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        icon={<DollarSign className="h-4 w-4" />}
      />

      <Select
        id="expense-category"
        label="Category"
        placeholder="Select category"
        options={categoryOptions}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        error={errors.category}
      />

      <Input
        id="expense-date"
        label="Date"
        type="date"
        value={expenseDate}
        onChange={(e) => setExpenseDate(e.target.value)}
        error={errors.expenseDate}
        icon={<Calendar className="h-4 w-4" />}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="expense-notes"
          className="text-sm font-medium text-dark-300"
        >
          Notes <span className="text-dark-500">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-3 text-dark-400 pointer-events-none">
            <FileText className="h-4 w-4" />
          </span>
          <textarea
            id="expense-notes"
            rows={3}
            placeholder="Add any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-11 text-sm text-dark-100 placeholder:text-dark-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-mid/50 focus:border-accent-mid hover:border-white/20 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          id="expense-cancel-btn"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          fullWidth
          id="expense-submit-btn"
        >
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
