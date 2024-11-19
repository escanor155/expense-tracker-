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
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
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
            category: matchingCategory.id
          });
        });

        if (errors.length > 0) {
          onError(errors.join('\n'));
          return;
        }

        onSuccess(expenses);
      } catch (error) {
        onError('Failed to parse Excel file. Please make sure it\'s a valid .xlsx file.');
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
