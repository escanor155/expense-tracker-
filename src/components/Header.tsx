import React from 'react';
import { Moon, Sun, PiggyBank } from 'lucide-react';
import { useStore } from '../store';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <PiggyBank className="h-6 w-6" />
          <span className="font-bold">ExpenseTracker</span>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};