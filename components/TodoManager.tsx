import React, { useState, useRef } from 'react';
import { Category, TodoItem } from '../types';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface TodoManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

// --- Swipeable Item Component ---
interface SwipeableTodoItemProps {
  todo: TodoItem;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const SwipeableTodoItem: React.FC<SwipeableTodoItemProps> = ({ todo, toggleTask, deleteTask }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef<number>(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.targetTouches[0].clientX;
    setIsSwiping(true);
    // Disable transition during drag for immediate feedback
    if (itemRef.current) itemRef.current.style.transition = 'none';
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - startX.current;

    // Only allow swiping left (negative diff)
    if (diff < 0) {
      // Limit swipe distance visually
      setOffsetX(Math.max(diff, -150));
    }
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (itemRef.current) itemRef.current.style.transition = 'transform 0.3s ease-out';

    // Threshold to trigger delete
    if (offsetX < -100) {
      // Slide completely off screen then delete
      setOffsetX(-500); // Visual slide out
      setTimeout(() => deleteTask(todo.id), 300);
    } else {
      // Snap back
      setOffsetX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl mb-2 select-none touch-pan-y">
      {/* Background (Trash Layer) */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 rounded-xl">
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Foreground (Content Layer) */}
      <div
        ref={itemRef}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`relative group flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl transition-shadow ${
          todo.completed ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : 'hover:shadow-md'
        }`}
      >
        <button
          onClick={() => toggleTask(todo.id)}
          className={`flex-shrink-0 transition-colors z-10 ${
            todo.completed ? 'text-green-500' : 'text-gray-300 hover:text-indigo-500'
          }`}
        >
          {todo.completed ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
        
        <span className={`flex-1 text-lg transition-all pointer-events-none ${
          todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
        }`}>
          {todo.text}
        </span>
        
        <span className="text-xs text-gray-300 hidden sm:block pointer-events-none">
          {new Date(todo.createdAt).toLocaleDateString()}
        </span>

        {/* Desktop Delete Button (Hidden on Touch if swiping logic handles it, but good to keep for mouse users) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(todo.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hidden sm:block"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const TodoManager: React.FC<TodoManagerProps> = ({ categories, setCategories }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCategoryName,
      todos: [],
      createdAt: Date.now(),
    };
    setCategories([...categories, newCategory]);
    setActiveCategoryId(newCategory.id);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    if (activeCategoryId === id) {
      setActiveCategoryId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory || !newTaskText.trim()) return;

    const newTask: TodoItem = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      createdAt: Date.now(),
    };

    const updatedCategories = categories.map((cat) => {
      if (cat.id === activeCategoryId) {
        return { ...cat, todos: [newTask, ...cat.todos] };
      }
      return cat;
    });

    setCategories(updatedCategories);
    setNewTaskText('');
  };

  const toggleTask = (todoId: string) => {
    const updatedCategories = categories.map((cat) => {
      if (cat.id === activeCategoryId) {
        return {
          ...cat,
          todos: cat.todos.map((t) =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
          ),
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const deleteTask = (todoId: string) => {
    const updatedCategories = categories.map((cat) => {
      if (cat.id === activeCategoryId) {
        return {
          ...cat,
          todos: cat.todos.filter((t) => t.id !== todoId),
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6">
      
      {/* Category Scroll Bar */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`group relative flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 border ${
              activeCategoryId === cat.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
            }`}
          >
            <span className="font-medium">{cat.name}</span>
            <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full ${activeCategoryId === cat.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
              {cat.todos.filter(t => !t.completed).length}
            </span>
            {activeCategoryId === cat.id && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
        
        {/* Add Category Button */}
        {isAddingCategory ? (
          <form onSubmit={handleAddCategory} className="flex items-center space-x-2">
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onBlur={() => !newCategoryName && setIsAddingCategory(false)}
              placeholder="New Category..."
              className="px-4 py-2.5 rounded-full border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-full border border-dashed border-gray-400 text-gray-500 hover:text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add List</span>
          </button>
        )}
      </div>

      {/* Main Todo Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {activeCategory ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{activeCategory.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Created {new Date(activeCategory.createdAt).toLocaleDateString()} • {activeCategory.todos.filter(t => t.completed).length}/{activeCategory.todos.length} done
                </p>
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleAddTask} className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
               <div className="relative">
                 <input
                   type="text"
                   value={newTaskText}
                   onChange={(e) => setNewTaskText(e.target.value)}
                   placeholder="Add a new task..."
                   className="w-full pl-4 pr-12 py-4 text-lg bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white placeholder-gray-400 transition-shadow"
                 />
                 <button
                   type="submit"
                   disabled={!newTaskText.trim()}
                   className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors flex items-center justify-center"
                 >
                   <Plus className="w-6 h-6" />
                 </button>
               </div>
            </form>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              {activeCategory.todos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 opacity-20" />
                  </div>
                  <p>No tasks yet.</p>
                </div>
              ) : (
                activeCategory.todos.map((todo) => (
                  <SwipeableTodoItem
                    key={todo.id}
                    todo={todo}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p className="text-lg">Select a category or create a new one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoManager;
