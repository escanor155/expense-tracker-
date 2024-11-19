import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Expense, Category, Budget } from '../types';

const useStore = create<AppState>()(
  persist(
    (set) => ({
      expenses: [],
      categories: [
        { id: 'food', name: 'Food & Dining', color: '#FF5722' },
        { id: 'transport', name: 'Transportation', color: '#2196F3' },
        { id: 'utilities', name: 'Utilities', color: '#4CAF50' },
        { id: 'entertainment', name: 'Entertainment', color: '#9C27B0' },
        { id: 'shopping', name: 'Shopping', color: '#FF9800' },
      ],
      budgets: [],
      theme: 'light',

      addExpense: (expense: Expense) => 
        set((state) => {
          const newExpenses = [...state.expenses, expense];
          
          // Handle recurring expenses
          if (expense.isRecurring) {
            const recurringDates = generateRecurringDates(expense.date, expense.recurringFrequency!, 12);
            const recurringExpenses = recurringDates.map((date) => ({
              ...expense,
              id: crypto.randomUUID(),
              date,
            }));
            newExpenses.push(...recurringExpenses);
          }
          
          return { expenses: newExpenses };
        }),

      updateExpense: (expense: Expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)),
        })),

      deleteExpense: (id: string) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      bulkDeleteExpenses: (ids: string[]) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => !ids.includes(e.id)),
        })),

      bulkUpdateExpenses: (expenses: Expense[]) =>
        set((state) => ({
          expenses: state.expenses.map((e) => {
            const updated = expenses.find((ue) => ue.id === e.id);
            return updated || e;
          }),
        })),

      addCategory: (category: Omit<Category, 'id'>) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: crypto.randomUUID() }],
        })),

      deleteCategory: (id: string) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      setBudget: (budget: Budget) =>
        set((state) => ({
          budgets: [
            ...state.budgets.filter((b) => b.month !== budget.month),
            budget,
          ],
        })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'expense-tracker-storage',
    }
  )
);

// Helper function to generate recurring dates
const generateRecurringDates = (
  startDate: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  count: number
): string[] => {
  const dates: string[] = [];
  const date = new Date(startDate);

  for (let i = 1; i < count; i++) {
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
};

export { useStore };