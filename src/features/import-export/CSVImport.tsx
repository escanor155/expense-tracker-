import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Download } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CSVService } from '../../services/csvService';

export const CSVImport: React.FC = () => {
  const { addExpense, categories } = useStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = CSVService.generateTemplate(categories);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setLoading(true);

    const file = event.target.files?.[0];
    if (!file) {
      setError('No file selected');
      setLoading(false);
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setLoading(false);
      return;
    }

    CSVService.parseCSV(
      file,
      categories,
      (expenses) => {
        expenses.forEach(expense => {
          if (expense.date && expense.amount && expense.category) {
            addExpense({
              date: expense.date,
              amount: expense.amount,
              category: expense.category,
              description: expense.description || ''
            });
          }
        });
        setError(`Successfully imported ${expenses.length} expenses`);
      },
      setError,
      () => {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Import/Export</h2>
      
      <div className="flex flex-col gap-4">
        <Button
          onClick={downloadTemplate}
          icon={Download}
          variant="primary"
        >
          Download CSV Template
        </Button>

        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white hover:file:bg-blue-700
              cursor-pointer file:cursor-pointer"
          />
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="whitespace-pre-wrap p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
