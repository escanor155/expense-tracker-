import React, { useState, useRef, KeyboardEvent } from 'react';
import { useStore } from '../store';
import * as Icons from 'lucide-react';

interface ExpenseField {
  ref: React.RefObject<HTMLInputElement | HTMLSelectElement>;
  next: string;
  previous: string;
}

export const AddExpense: React.FC = () => {
  const { categories, addExpense } = useStore();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Create refs for each field
  const amountRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // Define field navigation
  const fields: Record<string, ExpenseField> = {
    amount: { ref: amountRef, next: 'category', previous: 'date' },
    category: { ref: categoryRef, next: 'description', previous: 'amount' },
    description: { ref: descriptionRef, next: 'date', previous: 'category' },
    date: { ref: dateRef, next: 'amount', previous: 'description' },
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>, fieldName: string) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      const nextField = e.shiftKey ? fields[fieldName].previous : fields[fieldName].next;
      fields[nextField].ref.current?.focus();
    }
    
    if (e.key === 'Enter' && fieldName === 'date') {
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.category) {
      addExpense({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
      });
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      amountRef.current?.focus();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quick Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              ref={amountRef}
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, 'amount')}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Amount"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <select
              ref={categoryRef}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, 'category')}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <input
            ref={descriptionRef}
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, 'description')}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Item Name"
          />
        </div>
        
        <div>
          <input
            ref={dateRef}
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, 'date')}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Expense (Enter)
        </button>
      </form>
    </div>
  );
};