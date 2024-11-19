import React from 'react';
import { BudgetOverview } from '../../features/budget/BudgetOverview';
import { ExpenseChart } from '../charts/ExpenseChart';
import { ExpenseTables } from '../expenses/ExpenseTables';

export const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetOverview />
          <ExpenseChart />
        </div>
        <ExpenseTables />
      </div>
    </div>
  );
};
