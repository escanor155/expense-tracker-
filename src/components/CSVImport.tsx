import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import Papa from 'papaparse';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

interface CSVRow {
  date: string;
  description: string;
  amount: string;
  category: string;
}

export const CSVImport: React.FC = () => {
  const { addExpense, categories } = useStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = ['date', 'description', 'amount', 'category'];
    const categoryNames = categories.map(c => c.name).join(', ');
    const today = new Date();
    const formattedDate = format(today, 'MM/dd/yyyy');
    
    const sampleData = [
      // Sample rows
      [
        '11/19/2024',
        'Sample Expense',
        '50.00',
        'Shopping'
      ],
      [
        '11/19/2024',
        'Lunch',
        '15.50',
        'Food'
      ]
    ];
    
    const csvContent = [
      headers.join('\t'),
      '# Format: MM/DD/YYYY (e.g., 11/19/2024), Description, Amount (number), Category (one of: ' + categoryNames + ')',
      ...sampleData.map(row => row.join('\t'))
    ].join('\n');

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

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      Papa.parse<CSVRow>(csvText, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.toLowerCase().trim(),
        delimiter: '',  // Auto-detect delimiter (will handle both tabs and commas)
        complete: (results) => {
          const errors: string[] = [];
          let successCount = 0;

          results.data.forEach((row, index) => {
            // Skip empty rows and comment lines
            if (Object.values(row).every(val => !val) || 
                Object.values(row).some(val => val.startsWith('#'))) {
              return;
            }

            // Validate required fields
            if (!row.date || !row.amount || !row.category) {
              errors.push(`Row ${index + 2}: Missing required fields`);
              return;
            }

            // Validate date format and parse date
            const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
            if (!dateRegex.test(row.date)) {
              errors.push(`Row ${index + 2}: Invalid date format. Use MM/DD/YYYY (e.g., 11/19/2024)`);
              return;
            }

            // Parse the date parts and pad with zeros if needed
            const [month, day, year] = row.date.split('/').map(part => part.trim());
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            // Validate if it's a real date
            const dateObj = new Date(formattedDate);
            if (isNaN(dateObj.getTime()) || 
                dateObj.getFullYear() !== parseInt(year) || 
                dateObj.getMonth() + 1 !== parseInt(month) || 
                dateObj.getDate() !== parseInt(day)) {
              errors.push(`Row ${index + 2}: Invalid date. Please enter a valid date`);
              return;
            }

            // Validate amount
            const amount = parseFloat(row.amount);
            if (isNaN(amount) || amount <= 0) {
              errors.push(`Row ${index + 2}: Invalid amount. Must be a positive number`);
              return;
            }

            // Find matching category (case-insensitive)
            const category = categories.find(c => 
              c.name.toLowerCase() === row.category.toLowerCase().trim()
            );

            if (!category) {
              errors.push(
                `Row ${index + 2}: Invalid category "${row.category}". ` +
                `Valid categories are: ${categories.map(c => c.name).join(', ')}`
              );
              return;
            }

            try {
              addExpense({
                date: formattedDate,
                amount: amount,
                category: category.id,
                description: row.description.trim()
              });
              successCount++;
            } catch (err) {
              errors.push(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          });

          if (errors.length > 0) {
            setError(
              `Imported ${successCount} expenses with ${errors.length} errors:\n` +
              errors.map(err => `• ${err}`).join('\n')
            );
          } else if (successCount === 0) {
            setError('No valid expenses found in the CSV file');
          } else {
            setError(`Successfully imported ${successCount} expenses`);
          }
          setLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
        error: (error) => {
          setError('Error parsing CSV: ' + error.message);
          setLoading(false);
        }
      });
    };

    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Import/Export</h2>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          Download CSV Template
        </button>

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