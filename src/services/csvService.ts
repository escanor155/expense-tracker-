import Papa from 'papaparse';
import { format } from 'date-fns';
import { Category, Expense } from '../types';

interface CSVRow {
  date: string;
  description: string;
  amount: string;
  category: string;
}

export class CSVService {
  static generateTemplate(categories: Category[]): Blob {
    const headers = ['date', 'description', 'amount', 'category'];
    const categoryNames = categories.map(c => c.name);
    const today = format(new Date(), 'MM/dd/yyyy');
    
    const sampleData = [
      headers,
      [`Format: MM/DD/YYYY (e.g., ${today})`, 'Text', 'Number', `One of: ${categoryNames.join(', ')}`],
      [today, 'Sample Expense', '50.00', categoryNames[0]],
      [today, 'Lunch', '15.50', categoryNames[1]]
    ];
    
    const csvContent = sampleData.map(row => row.join('\t')).join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  }

  static exportExpenses(expenses: Expense[], categories: Category[]): Blob {
    console.log('CSV Export - Expenses:', JSON.stringify(expenses, null, 2));
    console.log('CSV Export - Categories:', JSON.stringify(categories, null, 2));

    const headers = ['Date', 'Description', 'Amount', 'Category', 'Tags', 'Note', 'Recurring'];
    
    const rows = expenses.map(expense => {
      const category = categories.find(c => c.id === expense.category);
      console.log(`Processing expense: ${expense.id}, Category: ${category?.name}`);
      return [
        format(new Date(expense.date), 'MM/dd/yyyy'),
        expense.description,
        expense.amount.toFixed(2),
        category?.name || '',
        expense.tags?.join(', ') || '',
        expense.note || '',
        expense.isRecurring ? `${expense.isRecurring} (${expense.recurringFrequency})` : 'No'
      ];
    });

    const data = [headers, ...rows];
    const csvContent = data.map(row => row.join('\t')).join('\n');
    
    console.log('CSV Content:', csvContent);
    
    return new Blob([csvContent], { type: 'text/csv' });
  }

  static parseCSV(
    file: File,
    categories: Category[],
    onSuccess: (expenses: Partial<Expense>[]) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ): void {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.toLowerCase().trim(),
      delimiter: '',  // Auto-detect delimiter
      complete: (results) => {
        try {
          const errors: string[] = [];
          const expenses: Partial<Expense>[] = [];

          results.data.forEach((row, index) => {
            const rowNumber = index + 2; // Account for header row

            // Skip empty rows and instruction rows
            if (
              Object.values(row).every(val => !val) || 
              Object.values(row).some(val => String(val).startsWith('#')) ||
              Object.values(row).some(val => String(val).includes('Format:'))
            ) {
              return;
            }

            // Validate required fields
            if (!row.date || !row.amount || !row.category) {
              errors.push(`Row ${rowNumber}: Missing required fields`);
              return;
            }

            // Validate and parse date
            const dateStr = String(row.date);
            const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
            if (!dateRegex.test(dateStr)) {
              errors.push(`Row ${rowNumber}: Invalid date format. Use MM/DD/YYYY`);
              return;
            }

            // Parse date
            const [month, day, year] = dateStr.split('/').map(part => part.trim());
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            // Validate amount
            const amount = parseFloat(row.amount);
            if (isNaN(amount) || amount <= 0) {
              errors.push(`Row ${rowNumber}: Invalid amount. Must be a positive number`);
              return;
            }

            // Validate category
            const category = String(row.category).trim();
            const matchingCategory = categories.find(c => 
              c.name.toLowerCase() === category.toLowerCase()
            );

            if (!matchingCategory) {
              errors.push(
                `Row ${rowNumber}: Invalid category "${category}". ` +
                `Valid categories are: ${categories.map(c => c.name).join(', ')}`
              );
              return;
            }

            expenses.push({
              date: formattedDate,
              description: row.description || '',
              amount,
              category: matchingCategory.id
            });
          });

          if (errors.length > 0) {
            onError(errors.join('\n'));
          } else {
            onSuccess(expenses);
          }
        } catch (error) {
          onError('Failed to parse CSV file: ' + (error as Error).message);
        } finally {
          onComplete();
        }
      },
      error: (error) => {
        onError('Failed to parse CSV file: ' + error.message);
        onComplete();
      }
    });
  }
}
