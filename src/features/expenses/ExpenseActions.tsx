import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../../components/common/Button';
import { Filter, Trash2, Download, Tag, Search } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseActionsProps {
  selectedExpenses: string[];
  onSelectionChange: (ids: string[]) => void;
  onFilter: (filters: ExpenseFilters) => void;
}

interface ExpenseFilters {
  dateRange?: { start: string; end: string };
  categories?: string[];
  tags?: string[];
  amountRange?: { min: number; max: number };
  searchTerm?: string;
}

export const ExpenseActions: React.FC<ExpenseActionsProps> = ({
  selectedExpenses,
  onSelectionChange,
  onFilter,
}) => {
  const { bulkDeleteExpenses, categories } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});

  const handleBulkDelete = () => {
    if (selectedExpenses.length === 0) return;
    
    if (window.confirm(`Delete ${selectedExpenses.length} selected expenses?`)) {
      bulkDeleteExpenses(selectedExpenses);
      onSelectionChange([]);
    }
  };

  const handleExport = () => {
    // Implementation for export functionality will go here
  };

  const handleFilterChange = (newFilters: Partial<ExpenseFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="secondary"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-blue-100 dark:bg-blue-900' : ''}
        >
          Filters
        </Button>

        <Button
          variant="danger"
          icon={Trash2}
          onClick={handleBulkDelete}
          disabled={selectedExpenses.length === 0}
        >
          Delete Selected ({selectedExpenses.length})
        </Button>

        <Button
          variant="secondary"
          icon={Download}
          onClick={handleExport}
        >
          Export
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                  value={filters.searchTerm || ''}
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) =>
                    handleFilterChange({
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value,
                      },
                    })
                  }
                  value={filters.dateRange?.start || ''}
                />
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) =>
                    handleFilterChange({
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value,
                      },
                    })
                  }
                  value={filters.dateRange?.end || ''}
                />
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) =>
                    handleFilterChange({
                      amountRange: {
                        ...filters.amountRange,
                        min: parseFloat(e.target.value),
                      },
                    })
                  }
                  value={filters.amountRange?.min || ''}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) =>
                    handleFilterChange({
                      amountRange: {
                        ...filters.amountRange,
                        max: parseFloat(e.target.value),
                      },
                    })
                  }
                  value={filters.amountRange?.max || ''}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      handleFilterChange({
                        categories: filters.categories?.includes(category.id)
                          ? filters.categories.filter((id) => id !== category.id)
                          : [...(filters.categories || []), category.id],
                      })
                    }
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.categories?.includes(category.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    style={{
                      backgroundColor: filters.categories?.includes(category.id)
                        ? category.color
                        : undefined,
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by tags (comma-separated)"
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) =>
                    handleFilterChange({
                      tags: e.target.value.split(',').map((tag) => tag.trim()),
                    })
                  }
                  value={filters.tags?.join(', ') || ''}
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({});
                onFilter({});
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
