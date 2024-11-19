import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Download, FileSpreadsheet, FileText, Upload } from 'lucide-react';
import { CSVService } from '../services/csvService';
import { XLSXService } from '../services/xlsxService';
import { Button } from './common/Button';

type FileFormat = 'csv' | 'xlsx';

export const FileImport: React.FC = () => {
  const { addExpense, categories, expenses } = useStore();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('csv');

  const downloadTemplate = () => {
    try {
      let blob: Blob;
      let filename: string;

      if (selectedFormat === 'xlsx') {
        blob = XLSXService.generateTemplate(categories);
        filename = 'expense-template.xlsx';
      } else {
        blob = CSVService.generateTemplate(categories);
        filename = 'expense-template.csv';
      }

      downloadFile(blob, filename);
    } catch (error) {
      setError('Failed to generate template: ' + (error as Error).message);
    }
  };

  const exportExpenses = () => {
    // Verify store access and data
    console.log('Store Access Test:');
    console.log('Expenses Store:', expenses);
    console.log('Categories Store:', categories);

    // Validate expenses
    if (!expenses || expenses.length === 0) {
      console.error('No expenses found');
      alert('No expenses to export');
      return;
    }

    // Validate categories
    if (!categories || categories.length === 0) {
      console.error('No categories found');
      alert('No categories available for export');
      return;
    }

    // Detailed expense validation
    const validExpenses = expenses.filter(expense => {
      const isValid = !!(
        expense.date && 
        expense.amount && 
        expense.category && 
        categories.some(cat => cat.id === expense.category)
      );
      
      if (!isValid) {
        console.warn('Invalid expense found:', expense);
      }
      
      return isValid;
    });

    console.log('Valid Expenses:', validExpenses);

    if (validExpenses.length === 0) {
      console.error('No valid expenses to export');
      alert('No valid expenses found for export');
      return;
    }

    try {
      let blob: Blob;
      let filename: string;

      // Explicit error handling for export
      try {
        if (selectedFormat === 'xlsx') {
          console.log('Attempting XLSX export');
          blob = XLSXService.exportExpenses(validExpenses, categories);
          filename = `expenses-${new Date().toISOString().split('T')[0]}.xlsx`;
          console.log('XLSX Export successful');
        } else {
          console.log('Attempting CSV export');
          blob = CSVService.exportExpenses(validExpenses, categories);
          filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
          console.log('CSV Export successful');
        }

        console.log('Blob details:', {
          type: blob.type,
          size: blob.size,
          filename: filename
        });

        // Verify blob creation
        if (!(blob instanceof Blob)) {
          throw new Error('Failed to create export blob');
        }

        // Multiple download methods
        const downloadMethods = [
          () => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
          },
          () => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const a = document.createElement('a');
              a.href = reader.result as string;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            };
            reader.readAsDataURL(blob);
          }
        ];

        // Try download methods
        let downloadSuccessful = false;
        for (const method of downloadMethods) {
          try {
            method();
            downloadSuccessful = true;
            break;
          } catch (downloadError) {
            console.warn('Download method failed:', downloadError);
          }
        }

        if (!downloadSuccessful) {
          throw new Error('All download methods failed');
        }

        setError(`Successfully exported ${validExpenses.length} expenses`);
      } catch (exportError) {
        console.error('Export process error:', exportError);
        alert(`Failed to export expenses: ${(exportError as Error).message}`);
        setError(`Failed to export expenses: ${(exportError as Error).message}`);
      }
    } catch (outerError) {
      console.error('Outer export error:', outerError);
      alert(`Unexpected error during export: ${(outerError as Error).message}`);
      setError(`Unexpected error during export: ${(outerError as Error).message}`);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx') {
      setError('Please upload a CSV or XLSX file');
      setLoading(false);
      return;
    }

    const onSuccess = (expenses: any[]) => {
      expenses.forEach(expense => {
        if (expense.date && expense.amount && expense.category) {
          addExpense({
            id: crypto.randomUUID(),
            ...expense,
            isRecurring: false,
            recurringFrequency: null
          });
        }
      });
      setError(`Successfully imported ${expenses.length} expenses`);
    };

    const onError = (errorMessage: string) => {
      setError(errorMessage);
    };

    const onComplete = () => {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    if (fileExtension === 'xlsx') {
      XLSXService.parseExcel(file, categories, onSuccess, onError, onComplete);
    } else {
      CSVService.parseCSV(file, categories, onSuccess, onError, onComplete);
    }
  };

  return (
    <div className="space-y-4" data-testid="file-import">
      <h2 className="text-lg font-semibold">Import/Export</h2>
      
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setSelectedFormat('csv')}
            icon={FileText}
            variant={selectedFormat === 'csv' ? 'primary' : 'secondary'}
          >
            CSV
          </Button>
          <Button
            onClick={() => setSelectedFormat('xlsx')}
            icon={FileSpreadsheet}
            variant={selectedFormat === 'xlsx' ? 'primary' : 'secondary'}
          >
            Excel
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={downloadTemplate}
            icon={Download}
            variant="secondary"
            type="button"
          >
            Download Template
          </Button>
          <Button
            onClick={exportExpenses}
            icon={Upload}
            variant="primary"
            type="button"
            data-testid="export-button"
          >
            Export Expenses
          </Button>
        </div>

        <div className="relative">
          <input
            type="file"
            accept=".csv,.xlsx"
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

        {error && (
          <div className={`mt-2 p-2 rounded ${error.includes('Successfully') ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-200'}`}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};