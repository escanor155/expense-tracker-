import React from 'react';
import { BudgetOverview } from './features/budget/BudgetOverview';
import { ExpenseChart } from './components/charts/ExpenseChart';
import { ExpenseTables } from './components/expenses/ExpenseTables';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/layout/Dashboard';
import { useStore } from './store';

const App: React.FC = () => {
  const { theme } = useStore();

  return (
    <div className={`${theme} min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default App;