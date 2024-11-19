import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Category, Expense } from '../types';

interface ExcelRow {
  date: string;
  description: string;
  amount: string | number;
  category: string;
}

export class XLSXService {
  static generateTemplate(categories: Category[]): Blob {
    const headers = ['date', 'description', 'amount', 'category'];
    const categoryNames = categories.map(c => c.name);
    const today = format(new Date(), 'MM/dd/yyyy');
    
    const sampleData = [
      ['Date', 'Description', 'Amount', 'Category'],
      [`Format: MM/DD/YYYY (e.g., ${today})`, 'Text', 'Number', `One of: ${categoryNames.join(', ')}`],
      [today, 'Sample Expense', 50.00, categoryNames[0]],
      [today, 'Lunch', 15.50, categoryNames[1]]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleData);

    // Add column widths for better readability
    ws['!cols'] = [
      { width: 12 }, // Date
      { width: 30 }, // Description
      { width: 10 }, // Amount
      { width: 15 }  // Category
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  static exportExpenses(expenses: Expense[], categories: Category[]): Blob {
    console.log('XLSX Export - Expenses:', JSON.stringify(expenses, null, 2));
    console.log('XLSX Export - Categories:', JSON.stringify(categories, null, 2));

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
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add column widths for better readability
    ws['!cols'] = [
      { width: 12 }, // Date
      { width: 30 }, // Description
      { width: 10 }, // Amount
      { width: 15 }, // Category
      { width: 20 }, // Tags
      { width: 30 }, // Note
      { width: 15 }  // Recurring
    ];

    // Add cell formatting
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cell_address];
        if (!cell) continue;

        // Format header row
        if (R === 0) {
          cell.s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "CCCCCC" } }
          };
        }
        // Format amount column
        else if (C === 2) {
          cell.z = '#,##0.00';
        }
      }
    }

    console.log('Workbook created successfully');

    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    console.log('Excel Buffer created:', excelBuffer.length);
    
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  static parseExcel(
    file: File,
    categories: Category[],
    onSuccess: (expenses: Partial<Expense>[]) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: ['date', 'description', 'amount', 'category'] });
        
        // Remove header row and any instruction rows (starting with '#' or containing 'Format:')
        const validRows = rows.filter((row, index) => 
          index > 0 && 
          !String(row.date).startsWith('#') && 
          !String(row.date).includes('Format:')
        );

        const expenses: Partial<Expense>[] = [];
        const errors: string[] = [];

        validRows.forEach((row, index) => {
          const rowNumber = index + 2; // Accounting for header row
          
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
          const amount = typeof row.amount === 'number' ? row.amount : parseFloat(row.amount);
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
            category: matchingCategory.id,
            tags: [],
            isRecurring: false,
            recurringFrequency: undefined,
            note: ''
          });
        });

        if (errors.length > 0) {
          onError(errors.join('\n'));
        } else {
          onSuccess(expenses);
        }
      } catch (error) {
        onError('Failed to parse Excel file: ' + (error as Error).message);
      } finally {
        onComplete();
      }
    };

    reader.onerror = () => {
      onError('Failed to read Excel file');
      onComplete();
    };

    reader.readAsArrayBuffer(file);
  }
}
