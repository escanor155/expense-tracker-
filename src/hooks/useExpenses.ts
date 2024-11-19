import { useMemo } from 'react';
import { useStore } from '../store';
import { Expense } from '../types';
import { format } from 'date-fns';

export const useExpenses = (month?: string) => {
  const { expenses, categories, deleteExpense } = useStore();

  const filteredExpenses = useMemo(() => {
    if (!month) return expenses;
    return expenses.filter(expense => expense.date.startsWith(month));
  }, [expenses, month]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const expensesByCategory = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const category = categories.find(c => c.id === expense.category);
      if (!category) return acc;
      
      acc[category.name] = (acc[category.name] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredExpenses, categories]);

  const mostFrequentItems = useMemo(() => {
    const frequencyMap = filteredExpenses.reduce((acc, expense) => {
      const key = `${expense.description.toLowerCase()}_${expense.category}`;
      if (!acc[key]) {
        acc[key] = {
          description: expense.description,
          category: expense.category,
          count: 0,
          totalAmount: 0
        };
      }
      acc[key].count++;
      acc[key].totalAmount += expense.amount;
      return acc;
    }, {} as Record<string, { description: string; category: string; count: number; totalAmount: number }>);

    return Object.values(frequencyMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredExpenses]);

  const mostExpensiveItems = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredExpenses]);

  const formatDate = (date: string) => {
    return format(new Date(date), 'MM/dd/yyyy');
  };

  return {
    expenses: filteredExpenses,
    totalExpenses,
    expensesByCategory,
    mostFrequentItems,
    mostExpensiveItems,
    deleteExpense,
    formatDate,
    categories
  };
};
