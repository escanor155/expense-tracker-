import React, { useState } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Trash2, Filter } from 'lucide-react';

export const ExpenseTable: React.FC = () => {
  const { expenses, categories, deleteExpense } = useStore();
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof expenses[0] | 'categoryName';
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  // Filter expenses by month
  const filteredExpenses = expenses.filter(exp => exp.date.startsWith(filterMonth));

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortConfig.key === 'categoryName') {
      const catA = categories.find(c => c.id === a.category)?.name || '';
      const catB = categories.find(c => c.id === b.category)?.name || '';
      return sortConfig.direction === 'asc' 
        ? catA.localeCompare(catB)
        : catB.localeCompare(catA);
    }
    
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    
    return sortConfig.direction === 'asc'
      ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
      : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
  });

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: typeof sortConfig.key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Add a function to detect and highlight duplicates
  const getDuplicateStyle = (expense: Expense, expenses: Expense[]) => {
    const duplicates = expenses.filter(e => 
      e.description.toLowerCase() === expense.description.toLowerCase() &&
      e.amount === expense.amount &&
      e.category === expense.category &&
      e.date === expense.date
    );
    
    if (duplicates.length > 1) {
      return 'bg-yellow-50 dark:bg-yellow-900/20';
    }
    return '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Expense List</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="border-b dark:border-gray-700">
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('description')}
              >
                Description {getSortIcon('description')}
              </th>
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('categoryName')}
              >
                Category {getSortIcon('categoryName')}
              </th>
              <th 
                className="text-right py-3 px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('amount')}
              >
                Amount {getSortIcon('amount')}
              </th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedExpenses.map((expense) => (
              <tr 
                key={expense.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${getDuplicateStyle(expense, expenses)}`}
              >
                <td className="py-2 px-4">
                  {format(new Date(expense.date), 'MM/dd/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>{expense.description}</span>
                    {getDuplicateStyle(expense, expenses) && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        (Duplicate)
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <span
                    className="inline-block px-2 py-1 rounded-full text-sm"
                    style={{ backgroundColor: categories.find(c => c.id === expense.category)?.color + '40' }}
                  >
                    {categories.find(c => c.id === expense.category)?.name}
                  </span>
                </td>
                <td className="text-right py-2 px-4">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="text-right py-2 px-4">
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete expense"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {sortedExpenses.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No expenses found for this month
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t-2 dark:border-gray-700">
            <tr>
              <td colSpan={3} className="py-3 px-4 font-semibold">
                Total
              </td>
              <td className="text-right py-3 px-4 font-semibold">
                ${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
