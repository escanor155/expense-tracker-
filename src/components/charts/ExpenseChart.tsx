import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useExpenses } from '../../hooks/useExpenses';

ChartJS.register(ArcElement, Tooltip, Legend);

export const ExpenseChart: React.FC = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { expensesByCategory, categories } = useExpenses(currentMonth);

  const data = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: categories
          .filter(cat => Object.keys(expensesByCategory).includes(cat.name))
          .map(cat => cat.color + '80'),
        borderColor: categories
          .filter(cat => Object.keys(expensesByCategory).includes(cat.name))
          .map(cat => cat.color),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
      <div className="w-full h-[300px] flex items-center justify-center">
        {Object.keys(expensesByCategory).length > 0 ? (
          <Pie data={data} options={options} />
        ) : (
          <p className="text-gray-500">No expenses to display</p>
        )}
      </div>
    </div>
  );
};
