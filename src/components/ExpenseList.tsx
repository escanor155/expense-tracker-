import React from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import * as Icons from 'lucide-react';
import { Trash2 } from 'lucide-react';

export const ExpenseList: React.FC = () => {
  const { expenses, categories, deleteExpense } = useStore();

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
      <div className="space-y-4">
        {sortedExpenses.map((expense) => {
          const category = categories.find((c) => c.id === expense.category);
          const IconComponent = category?.icon ? Icons[category.icon as keyof typeof Icons] : Icons.Circle;
          
          return (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div
                  className="p-2 rounded-full"
                  style={{ backgroundColor: category?.color }}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{category?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {expense.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(expense.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {expenses.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No expenses recorded yet
          </p>
        )}
      </div>
    </div>
  );
};