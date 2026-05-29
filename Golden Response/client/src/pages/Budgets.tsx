import { useState, useEffect } from 'react';
import { budgetsApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import BudgetGauge from '../components/charts/BudgetGauge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import type { BudgetWithSpending } from '../types';
import { Wallet, AlertTriangle } from 'lucide-react';

export default function Budgets() {
  const [currentBudget, setCurrentBudget] = useState<BudgetWithSpending | null>(null);
  const [history, setHistory] = useState<BudgetWithSpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [currentRes, historyRes] = await Promise.all([
        budgetsApi.getCurrent(),
        budgetsApi.list()
      ]);
      
      setCurrentBudget(currentRes.data.data?.budget || null);
      if (currentRes.data.data?.budget) {
        setBudgetAmount(currentRes.data.data.budget.amount.toString());
      }
      setHistory(historyRes.data.data?.budgets || []);
    } catch (err) {
      addToast('error', 'Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetAmount);
    
    if (isNaN(amount) || amount < 0) {
      addToast('warning', 'Please enter a valid amount');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const now = new Date();
      await budgetsApi.createOrUpdate({
        amount,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      addToast('success', 'Budget saved successfully');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast('error', 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-accent-start" />
          Monthly Budgets
        </h1>
        <Button onClick={() => setIsModalOpen(true)}>
          {currentBudget ? 'Edit Budget' : 'Set Budget'}
        </Button>
      </div>

      {currentBudget ? (
        <Card className="p-6" glow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {currentMonthName} {currentYear} Budget
              </h2>
              <p className="text-dark-300 mb-6">
                Here's how you're tracking against your budget this month.
              </p>
              
              <div className="space-y-4">
                <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
                  <div className="text-sm text-dark-400 mb-1">Total Budget</div>
                  <div className="text-2xl font-bold">
                    ${parseFloat(currentBudget.amount.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
                    <div className="text-sm text-dark-400 mb-1">Spent</div>
                    <div className="text-xl font-semibold text-dark-100">
                      ${currentBudget.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="bg-dark-800/50 rounded-xl p-4 border border-white/5">
                    <div className="text-sm text-dark-400 mb-1">Remaining</div>
                    <div className={`text-xl font-semibold ${currentBudget.isOverBudget ? 'text-danger' : 'text-success'}`}>
                      ${Math.abs(currentBudget.remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      {currentBudget.isOverBudget && ' over'}
                    </div>
                  </div>
                </div>
              </div>
              
              {currentBudget.isOverBudget && (
                <div className="mt-4 flex items-center gap-2 text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">You have exceeded your budget for this month!</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <BudgetGauge 
                budget={parseFloat(currentBudget.amount.toString())} 
                spent={currentBudget.spent} 
                percentage={currentBudget.percentage || (currentBudget.spent / parseFloat(currentBudget.amount.toString()) * 100) || 0} 
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center border-dashed border-2 border-dark-600 bg-dark-800/30">
          <Wallet className="h-12 w-12 text-dark-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Budget Set</h2>
          <p className="text-dark-300 max-w-md mx-auto mb-6">
            You haven't set a budget for {currentMonthName} {currentYear} yet. Set one now to start tracking your spending progress.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Set Monthly Budget</Button>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Budget History</h2>
        {history.length === 0 ? (
          <p className="text-dark-400">No past budgets found.</p>
        ) : (
          <div className="space-y-4">
            {history.map((budget) => {
              const date = new Date(budget.year, budget.month - 1);
              const monthName = date.toLocaleString('default', { month: 'long' });
              // Assuming budget.percentage exists or we calculate it
              const pct = budget.percentage || (budget.spent / parseFloat(budget.amount.toString()) * 100) || 0;
              const isOver = pct > 100;
              
              return (
                <Card key={budget.id} className="p-4" hover>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="w-48">
                      <div className="font-medium text-dark-50">{monthName} {budget.year}</div>
                      <div className="text-sm text-dark-400">
                        Budget: ${parseFloat(budget.amount.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="flex-1 max-w-xl w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-300">Spent: ${budget.spent.toLocaleString()}</span>
                        <span className={isOver ? 'text-danger' : 'text-success'}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isOver ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title={`${currentBudget ? 'Edit' : 'Set'} Budget for ${currentMonthName}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <Input
            label="Monthly Budget Amount ($)"
            type="number"
            step="0.01"
            min="0"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            placeholder="e.g. 2000.00"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
