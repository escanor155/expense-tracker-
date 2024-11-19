import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../../components/common/Button';
import { Calendar, Tags, Receipt, Repeat, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseFormProps {
  onSubmit: () => void;
  initialExpense?: Expense;
  isEditing?: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  initialExpense,
  isEditing = false,
}) => {
  const { categories, addExpense, updateExpense } = useStore();
  const [description, setDescription] = useState(initialExpense?.description || '');
  const [amount, setAmount] = useState(initialExpense?.amount.toString() || '');
  const [category, setCategory] = useState(initialExpense?.category || categories[0]?.id);
  const [date, setDate] = useState(initialExpense?.date || new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState<string[]>(initialExpense?.tags || []);
  const [isRecurring, setIsRecurring] = useState(initialExpense?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState(initialExpense?.recurringFrequency || 'monthly');
  const [note, setNote] = useState(initialExpense?.note || '');
  const [suggestedDescriptions, setSuggestedDescriptions] = useState<string[]>([]);

  // Simulated expense descriptions for autocomplete
  const recentDescriptions = [
    'Grocery Shopping',
    'Gas Station',
    'Netflix Subscription',
    'Internet Bill',
    'Restaurant',
    'Coffee Shop',
    'Uber Ride',
  ];

  useEffect(() => {
    if (description) {
      const filtered = recentDescriptions.filter(desc =>
        desc.toLowerCase().includes(description.toLowerCase())
      );
      setSuggestedDescriptions(filtered);
    } else {
      setSuggestedDescriptions([]);
    }
  }, [description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      id: initialExpense?.id || crypto.randomUUID(),
      description,
      amount: parseFloat(amount),
      category,
      date,
      tags,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      note,
    };

    if (isEditing) {
      updateExpense(expenseData);
    } else {
      addExpense(expenseData);
    }
    onSubmit();
  };

  const handleTagInput = (input: string) => {
    const newTags = input.split(',').map(tag => tag.trim());
    setTags(newTags.filter(tag => tag !== ''));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description Field with Autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <div className="relative">
            <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="What did you spend on?"
            />
            {suggestedDescriptions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 mt-1 rounded-lg shadow-lg max-h-48 overflow-auto">
                {suggestedDescriptions.map((desc) => (
                  <li
                    key={desc}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => setDescription(desc)}
                  >
                    {desc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Category Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="relative">
            <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={tags.join(', ')}
              onChange={(e) => handleTagInput(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Enter tags, separated by commas"
            />
          </div>
        </div>

        {/* Recurring Expense Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recurring Expense
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Repeat className="ml-2 h-5 w-5 text-gray-400" />
            </label>
            {isRecurring && (
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>
        </div>

        {/* Notes Field */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              rows={3}
              placeholder="Add any additional notes..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onSubmit}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};
