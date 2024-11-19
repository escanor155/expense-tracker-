import { useMemo } from 'react';
import { Expense } from '../types';

export const useDuplicates = (expenses: Expense[]) => {
  const getDuplicateStyle = useMemo(() => (expense: Expense) => {
    const duplicates = expenses.filter(e => 
      e.description.toLowerCase() === expense.description.toLowerCase() &&
      e.amount === expense.amount &&
      e.category === expense.category &&
      e.date === expense.date
    );
    
    if (duplicates.length > 1) {
      return 'bg-yellow-50 dark:bg-yellow-900/20';
    }
    return '';
  }, [expenses]);

  const isDuplicate = useMemo(() => (expense: Expense) => {
    const duplicates = expenses.filter(e => 
      e.description.toLowerCase() === expense.description.toLowerCase() &&
      e.amount === expense.amount &&
      e.category === expense.category &&
      e.date === expense.date
    );
    return duplicates.length > 1;
  }, [expenses]);

  return {
    getDuplicateStyle,
    isDuplicate
  };
};
