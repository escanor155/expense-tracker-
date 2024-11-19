import React from 'react';
import { useStore } from '../store';
import { ExpenseChart } from './ExpenseChart';
import { ExpenseTables } from './ExpenseTables';
import { Sidebar } from './Sidebar';

export const Dashboard: React.FC = () => {
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <main className="w-full h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
              {/* Add monthly trend chart here */}
            </div>
          </div>
          <ExpenseTables />
        </div>
      </main>
    </div>
  );
};