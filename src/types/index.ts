export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  tags: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Budget {
  month: string;
  amount: number;
}

export interface AppState {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  theme: 'light' | 'dark';
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  bulkDeleteExpenses: (ids: string[]) => void;
  bulkUpdateExpenses: (expenses: Expense[]) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  setBudget: (budget: Budget) => void;
  toggleTheme: () => void;
}