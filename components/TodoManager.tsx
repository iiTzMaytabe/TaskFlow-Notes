import React, { useState, useRef } from 'react';
import { Category, TodoItem } from '../types';
import { Plus, Trash2, CheckCircle, Circle, Check, Calendar, Clock, Bell } from 'lucide-react';

interface TodoManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onDeleteTask: (task: TodoItem, categoryId: string) => void;
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

    // Limit swipe distance visually
    if (diff > 0) {
        setOffsetX(Math.min(diff, 150));
    } else {
        setOffsetX(Math.max(diff, -150));
    }
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (itemRef.current) itemRef.current.style.transition = 'transform 0.3s ease-out';

    // Thresholds
    if (offsetX < -100) {
      // Left Swipe: Delete
      setOffsetX(-500); // Visual slide out
      setTimeout(() => deleteTask(todo.id), 300);
    } else if (offsetX > 100) {
      // Right Swipe: Toggle Complete
      toggleTask(todo.id);
      setOffsetX(0);
    } else {
      setOffsetX(0);
    }
  };

  const formatReminder = (ts: number) => {
    const date = new Date(ts);
    const isToday = new Date().toDateString() === date.toDateString();
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      weekday: isToday ? undefined : 'short' 
    });
  };

  const isOverdue = todo.reminder && todo.reminder < Date.now() && !todo.completed;

  return (
    <div className="relative overflow-hidden rounded-xl mb-2 select-none touch-pan-y">
      {/* Background Layer */}
      <div 
        className={`absolute inset-0 flex items-center px-6 rounded-xl transition-colors duration-200 ${
          offsetX > 0 ? 'bg-teal justify-start' : 'bg-red-500 justify-end'
        }`}
      >
        {offsetX > 0 ? (
          <Check className="w-6 h-6 text-mint" />
        ) : (
          <Trash2 className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Foreground (Content Layer) */}
      <div
        ref={itemRef}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`relative group flex items-center gap-3 p-4 bg-white dark:bg-deep border border-sage/30 dark:border-forest rounded-xl transition-shadow ${
          todo.completed ? 'opacity-60 bg-gray-50 dark:bg-deep/50' : 'hover:shadow-md'
        }`}
      >
        <button
          onClick={() => toggleTask(todo.id)}
          className={`flex-shrink-0 transition-colors z-10 ${
            todo.completed ? 'text-sage' : 'text-sage hover:text-teal'
          }`}
        >
          {todo.completed ? (
            <CheckCircle className="w-6 h-6 text-teal" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>
        
        <div className="flex-1 flex flex-col pointer-events-none">
          <span className={`text-lg transition-all ${
            todo.completed ? 'line-through text-sage' : 'text-midnight dark:text-mint'
          }`}>
            {todo.text}
          </span>
          {todo.reminder && (
            <span className={`text-xs flex items-center gap-1 mt-1 ${isOverdue ? 'text-red-500' : 'text-teal'}`}>
              <Bell className="w-3 h-3" />
              {formatReminder(todo.reminder)}
            </span>
          )}
        </div>
        
        <span className="text-xs text-sage/70 hidden sm:block pointer-events-none">
          {new Date(todo.createdAt).toLocaleDateString()}
        </span>

        {/* Desktop Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(todo.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-2 text-sage hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hidden sm:block"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const TodoManager: React.FC<TodoManagerProps> = ({ categories, setCategories, onDeleteTask }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [showReminderInput, setShowReminderInput] = useState(false);

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
      reminder: reminderTime ? new Date(reminderTime).getTime() : undefined
    };

    const updatedCategories = categories.map((cat) => {
      if (cat.id === activeCategoryId) {
        return { ...cat, todos: [newTask, ...cat.todos] };
      }
      return cat;
    });

    setCategories(updatedCategories);
    setNewTaskText('');
    setReminderTime('');
    setShowReminderInput(false);
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
    // Find task first to pass to onDeleteTask
    const taskToDelete = activeCategory?.todos.find(t => t.id === todoId);
    
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

    // Call prop to move to trash
    if (taskToDelete && activeCategoryId) {
      onDeleteTask(taskToDelete, activeCategoryId);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-6">
      
      {/* Category Scroll Bar */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`group relative flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 border hover:scale-105 active:scale-95 ${
              activeCategoryId === cat.id
                ? 'bg-teal text-mint border-teal shadow-lg shadow-teal/30 scale-100'
                : 'bg-white dark:bg-deep text-forest dark:text-sage border-sage/30 dark:border-forest hover:border-teal'
            }`}
          >
            <span className="font-medium">{cat.name}</span>
            <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full transition-colors ${activeCategoryId === cat.id ? 'bg-forest/50 text-mint' : 'bg-gray-100 dark:bg-forest/50'}`}>
              {cat.todos.filter(t => !t.completed).length}
            </span>
            {activeCategoryId === cat.id && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 hover:scale-110"
              >
                <Trash2 className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
        
        {/* Add Category Button */}
        {isAddingCategory ? (
          <form onSubmit={handleAddCategory} className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-2">
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onBlur={() => !newCategoryName && setIsAddingCategory(false)}
              placeholder="New Category..."
              className="px-4 py-2.5 rounded-full border border-teal focus:ring-2 focus:ring-teal outline-none dark:bg-deep dark:border-teal dark:text-mint transition-all"
            />
            <button
              type="submit"
              className="p-2.5 bg-teal text-mint rounded-full hover:bg-forest shadow-md hover:scale-110 active:scale-90 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-full border border-dashed border-sage text-sage hover:text-teal hover:border-teal hover:bg-teal/5 dark:hover:bg-forest/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add List</span>
          </button>
        )}
      </div>

      {/* Main Todo Area */}
      <div className="flex-1 bg-white dark:bg-deep rounded-2xl shadow-xl border border-sage/30 dark:border-forest flex flex-col overflow-hidden transition-all duration-300">
        {activeCategory ? (
          <>
            <div className="p-6 border-b border-sage/30 dark:border-forest bg-mint/20 dark:bg-forest/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-midnight dark:text-mint">{activeCategory.name}</h2>
                <p className="text-sm text-sage dark:text-sage mt-1">
                  Created {new Date(activeCategory.createdAt).toLocaleDateString()} • {activeCategory.todos.filter(t => t.completed).length}/{activeCategory.todos.length} done
                </p>
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleAddTask} className="p-4 bg-white dark:bg-deep border-b border-sage/20 dark:border-forest flex flex-col gap-2">
               <div className="relative group">
                 <input
                   type="text"
                   value={newTaskText}
                   onChange={(e) => setNewTaskText(e.target.value)}
                   placeholder="Add a new task..."
                   className="w-full pl-4 pr-12 py-4 text-lg bg-gray-50/50 dark:bg-midnight border-none rounded-xl focus:ring-2 focus:ring-teal outline-none text-midnight dark:text-mint placeholder-sage/60 transition-all"
                 />
                 <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                   {/* Reminder Button */}
                   <button
                    type="button"
                    onClick={() => setShowReminderInput(!showReminderInput)}
                    className={`p-2 rounded-lg transition-colors ${
                      showReminderInput || reminderTime ? 'text-teal bg-teal/10' : 'text-sage hover:text-teal hover:bg-sage/10'
                    }`}
                   >
                     {reminderTime ? <Bell className="w-5 h-5 fill-current" /> : <Clock className="w-5 h-5" />}
                   </button>
                   
                   <button
                     type="submit"
                     disabled={!newTaskText.trim()}
                     className="aspect-square h-full bg-teal text-mint rounded-lg hover:bg-forest disabled:opacity-50 disabled:hover:bg-teal transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                   >
                     <Plus className="w-6 h-6" />
                   </button>
                 </div>
               </div>
               
               {/* Reminder Date Picker */}
               {showReminderInput && (
                 <div className="animate-in slide-in-from-top-2 fade-in">
                   <input
                     type="datetime-local"
                     value={reminderTime}
                     onChange={(e) => setReminderTime(e.target.value)}
                     className="w-full sm:w-auto px-3 py-2 bg-gray-50 dark:bg-midnight border border-sage/30 rounded-lg text-forest dark:text-sage text-sm focus:outline-none focus:border-teal"
                   />
                 </div>
               )}
            </form>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-sage/50 scrollbar-track-transparent">
              {activeCategory.todos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-sage space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 rounded-full bg-mint dark:bg-forest flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 opacity-40 text-teal" />
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
          <div className="h-full flex flex-col items-center justify-center text-sage animate-in fade-in zoom-in-95 duration-500">
            <p className="text-lg">Select a category or create a new one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoManager;