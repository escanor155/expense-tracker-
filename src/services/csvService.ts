import Papa from 'papaparse';
import { format } from 'date-fns';
import { Category, Expense } from '../types';

interface CSVRow {
  date: string;
  description: string;
  amount: string;
  category: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: Partial<Expense>;
}

export class CSVService {
  static validateDate(date: string, rowIndex: number): ValidationResult {
    const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return {
        isValid: false,
        errors: [`Row ${rowIndex}: Invalid date format. Use MM/DD/YYYY (e.g., 11/19/2024)`]
      };
    }

    const [month, day, year] = date.split('/').map(part => part.trim());
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const dateObj = new Date(formattedDate);

    if (
      isNaN(dateObj.getTime()) ||
      dateObj.getFullYear() !== parseInt(year) ||
      dateObj.getMonth() + 1 !== parseInt(month) ||
      dateObj.getDate() !== parseInt(day)
    ) {
      return {
        isValid: false,
        errors: [`Row ${rowIndex}: Invalid date. Please enter a valid date`]
      };
    }

    return {
      isValid: true,
      errors: [],
      data: { date: formattedDate }
    };
  }

  static validateAmount(amount: string, rowIndex: number): ValidationResult {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return {
        isValid: false,
        errors: [`Row ${rowIndex}: Invalid amount. Must be a positive number`]
      };
    }

    return {
      isValid: true,
      errors: [],
      data: { amount: parsedAmount }
    };
  }

  static validateCategory(category: string, categories: Category[], rowIndex: number): ValidationResult {
    const matchingCategory = categories.find(c =>
      c.name.toLowerCase() === category.toLowerCase().trim()
    );

    if (!matchingCategory) {
      return {
        isValid: false,
        errors: [
          `Row ${rowIndex}: Invalid category "${category}". ` +
          `Valid categories are: ${categories.map(c => c.name).join(', ')}`
        ]
      };
    }

    return {
      isValid: true,
      errors: [],
      data: { category: matchingCategory.id }
    };
  }

  static validateRow(row: CSVRow, rowIndex: number, categories: Category[]): ValidationResult {
    const errors: string[] = [];
    let expenseData: Partial<Expense> = {};

    // Check required fields
    if (!row.date || !row.amount || !row.category) {
      return {
        isValid: false,
        errors: [`Row ${rowIndex}: Missing required fields`]
      };
    }

    // Validate date
    const dateValidation = this.validateDate(row.date, rowIndex);
    if (!dateValidation.isValid) {
      errors.push(...dateValidation.errors);
    } else if (dateValidation.data) {
      expenseData = { ...expenseData, ...dateValidation.data };
    }

    // Validate amount
    const amountValidation = this.validateAmount(row.amount, rowIndex);
    if (!amountValidation.isValid) {
      errors.push(...amountValidation.errors);
    } else if (amountValidation.data) {
      expenseData = { ...expenseData, ...amountValidation.data };
    }

    // Validate category
    const categoryValidation = this.validateCategory(row.category, categories, rowIndex);
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    } else if (categoryValidation.data) {
      expenseData = { ...expenseData, ...categoryValidation.data };
    }

    // Add description
    expenseData.description = row.description.trim();

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? expenseData : undefined
    };
  }

  static generateTemplate(categories: Category[]): string {
    const headers = ['date', 'description', 'amount', 'category'];
    const categoryNames = categories.map(c => c.name).join(', ');
    const today = format(new Date(), 'MM/dd/yyyy');
    
    const sampleData = [
      [today, 'Sample Expense', '50.00', categories[0]?.name || ''],
      [today, 'Another Expense', '25.50', categories[1]?.name || '']
    ];
    
    return [
      headers.join('\t'),
      `# Format: MM/DD/YYYY (e.g., 11/19/2024), Description, Amount (number), Category (one of: ${categoryNames})`,
      ...sampleData.map(row => row.join('\t'))
    ].join('\n');
  }

  static parseCSV(
    file: File,
    categories: Category[],
    onSuccess: (data: Partial<Expense>[]) => void,
    onError: (message: string) => void,
    onComplete: () => void
  ): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      Papa.parse<CSVRow>(csvText, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.toLowerCase().trim(),
        delimiter: '', // Auto-detect delimiter
        complete: (results) => {
          const errors: string[] = [];
          const validExpenses: Partial<Expense>[] = [];

          results.data.forEach((row, index) => {
            // Skip empty rows and comment lines
            if (
              Object.values(row).every(val => !val) ||
              Object.values(row).some(val => val.startsWith('#'))
            ) {
              return;
            }

            const validation = this.validateRow(row, index + 2, categories);
            if (!validation.isValid) {
              errors.push(...validation.errors);
            } else if (validation.data) {
              validExpenses.push(validation.data);
            }
          });

          if (errors.length > 0) {
            onError(
              `Imported ${validExpenses.length} expenses with ${errors.length} errors:\n` +
              errors.map(err => `• ${err}`).join('\n')
            );
          } else if (validExpenses.length === 0) {
            onError('No valid expenses found in the CSV file');
          } else {
            onSuccess(validExpenses);
          }
          onComplete();
        },
        error: (error) => {
          onError('Error parsing CSV: ' + error.message);
          onComplete();
        }
      });
    };

    reader.onerror = () => {
      onError('Error reading file');
      onComplete();
    };

    reader.readAsText(file);
  }
}
