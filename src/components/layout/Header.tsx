import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../common/Button';
import { useStore } from '../../store';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useStore();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Expense Tracker
          </h1>
          <Button
            onClick={toggleTheme}
            variant="secondary"
            icon={theme === 'dark' ? Sun : Moon}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </div>
    </header>
  );
};
