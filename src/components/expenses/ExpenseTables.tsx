import React from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { ExpenseTable } from './ExpenseTable';
import { CSVImport } from '../../features/import-export/CSVImport';

interface SummaryTableProps {
  title: string;
  items: Array<{
    description: string;
    category: string;
    count?: number;
    amount: number;
    totalAmount?: number;
  }>;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ title, items }) => {
  const { categories } = useExpenses();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Category</th>
              {items[0]?.count !== undefined && (
                <th className="text-right py-3 px-4">Count</th>
              )}
              {items[0]?.totalAmount !== undefined ? (
                <th className="text-right py-3 px-4">Total Amount</th>
              ) : (
                <th className="text-right py-3 px-4">Amount</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4">{item.description}</td>
                <td className="py-2 px-4">
                  <span
                    className="inline-block px-2 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor:
                        categories.find(c => c.id === item.category)?.color + '40',
                    }}
                  >
                    {categories.find(c => c.id === item.category)?.name}
                  </span>
                </td>
                {item.count !== undefined && (
                  <td className="text-right py-2 px-4">{item.count}x</td>
                )}
                <td className="text-right py-2 px-4">
                  ${(item.totalAmount || item.amount).toFixed(2)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-gray-500"
                >
                  No data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ExpenseTables: React.FC = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { mostFrequentItems, mostExpensiveItems } = useExpenses(currentMonth);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryTable
          title="Most Frequent Items"
          items={mostFrequentItems.map(item => ({
            ...item,
            amount: item.totalAmount / item.count,
          }))}
        />
        <SummaryTable
          title="Most Expensive Items"
          items={mostExpensiveItems.map(item => ({
            description: item.description,
            category: item.category,
            amount: item.amount,
          }))}
        />
      </div>
      <ExpenseTable month={currentMonth} />
      <CSVImport />
    </div>
  );
};
