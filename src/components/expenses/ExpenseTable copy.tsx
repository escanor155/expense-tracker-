import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ExpenseForm } from '../../features/expenses/ExpenseForm';
import { ExpenseActions } from '../../features/expenses/ExpenseActions';
import type { Expense } from '../../types';

interface ExpenseFilters {
  searchTerm?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  tags?: string[];
}

interface ExpenseTableProps {
  month: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ month }) => {
  const { expenses, categories, deleteExpense } = useStore();
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Basic month filter
      if (!expense.date.startsWith(month)) return false;

      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!expense.description.toLowerCase().includes(searchLower) &&
            !expense.note?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Date range
      if (filters.dateRange?.start && expense.date < filters.dateRange.start) return false;
      if (filters.dateRange?.end && expense.date > filters.dateRange.end) return false;

      // Amount range
      if (filters.amountRange?.min && expense.amount < filters.amountRange.min) return false;
      if (filters.amountRange?.max && expense.amount > filters.amountRange.max) return false;

      // Categories
      if (filters.categories?.length && !filters.categories.includes(expense.category)) {
        return false;
      }

      // Tags
      if (filters.tags?.length) {
        const hasMatchingTag = filters.tags.some(tag =>
          expense.tags.some(expenseTag =>
            expenseTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [expenses, month, filters]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedExpenses(checked ? filteredExpenses.map(e => e.id) : []);
  };

  const handleSelectExpense = (id: string, checked: boolean) => {
    setSelectedExpenses(prev =>
      checked ? [...prev, id] : prev.filter(expId => expId !== id)
    );
  };

  return (
    <div className="space-y-6">
      <ExpenseActions
        selectedExpenses={selectedExpenses}
        onSelectionChange={setSelectedExpenses}
        onFilter={setFilters}
      />

      {editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ExpenseForm
              initialExpense={editingExpense}
              isEditing={true}
              onSubmit={() => setEditingExpense(null)}
            />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.length === filteredExpenses.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.map((expense) => {
                const category = categories.find((c) => c.id === expense.category);
                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={(e) => handleSelectExpense(expense.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        {expense.description}
                        {expense.isRecurring && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {expense.recurringFrequency}
                          </span>
                        )}
                      </div>
                      {expense.note && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {expense.note}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className="px-2 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: category?.color + '40',
                          color: category?.color,
                        }}
                      >
                        {category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {expense.tags?.map((tag) => (
                          <span
                            key={`${expense.id}-${tag}`}
                            className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        )) || null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => setEditingExpense(expense)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => {
                            if (window.confirm('Delete this expense?')) {
                              deleteExpense(expense.id);
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr key="no-expenses">
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
