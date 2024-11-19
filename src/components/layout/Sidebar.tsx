import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button } from '../common/Button';
import { Plus, X } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddCategory = () => {
    const name = prompt('Enter category name:');
    if (!name) return;

    const color = prompt('Enter category color (hex):', '#000000');
    if (!color) return;

    addCategory({ name, color });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64
          bg-white dark:bg-gray-800 shadow-lg z-30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Categories</h2>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleAddCategory}
              icon={Plus}
              className="w-full"
            >
              Add Category
            </Button>

            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete category "${category.name}"?`)) {
                        deleteCategory(category.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        className="fixed bottom-4 left-4 lg:hidden z-30 bg-blue-600 text-white p-4 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  );
};
