import React from 'react';
import { useStore } from '../../store';
import { useExpenses } from '../../hooks/useExpenses';
import { Button } from '../../components/common/Button';
import { Edit2 } from 'lucide-react';

export const BudgetOverview: React.FC = () => {
  const { budgets, setBudget } = useStore();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { totalExpenses } = useExpenses(currentMonth);
  
  const currentBudget = budgets.find(b => b.month === currentMonth)?.amount || 0;
  const remaining = currentBudget - totalExpenses;
  const progress = currentBudget ? (totalExpenses / currentBudget) * 100 : 0;

  const handleBudgetUpdate = () => {
    const amount = prompt('Enter budget amount:', currentBudget.toString());
    if (amount === null) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert('Please enter a valid positive number');
      return;
    }

    setBudget({ month: currentMonth, amount: parsedAmount });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Budget Overview</h2>
        <Button
          onClick={handleBudgetUpdate}
          variant="secondary"
          icon={Edit2}
          title="Edit budget"
        >
          Edit Budget
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
            <p className="text-lg font-semibold">${currentBudget.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
            <p className="text-lg font-semibold">${totalExpenses.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
            <p className={`text-lg font-semibold ${remaining < 0 ? 'text-red-500' : ''}`}>
              ${remaining.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-600">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {progress.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${Math.min(progress, 100)}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                progress > 100 ? 'bg-red-500' : 'bg-blue-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
