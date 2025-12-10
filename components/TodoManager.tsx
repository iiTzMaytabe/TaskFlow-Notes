import React, { useState, useRef } from 'react';
import { Category, TodoItem } from '../types';
import { Plus, Trash2, CheckCircle, Circle, Check, Clock, Bell, CalendarPlus } from 'lucide-react';

interface TodoManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onDeleteTask: (task: TodoItem, categoryId: string) => void;
}

// --- Helper: Google Calendar Link Generator ---
const createGoogleCalendarUrl = (text: string, timestamp: number) => {
  const startDate = new Date(timestamp);
  const endDate = new Date(timestamp + 60 * 60 * 1000); // Default 1 hour duration

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: text,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: 'Created via TaskFlow & Notes',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

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

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (todo.reminder) {
      window.open(createGoogleCalendarUrl(todo.text, todo.reminder), '_blank');
    }
  };

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
        className={`relative group flex items-center gap-3 p-4 bg-white/60 dark:bg-deep/60 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl transition-shadow ${
          todo.completed ? 'opacity-60 grayscale' : 'hover:shadow-lg'
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
            <div className="flex items-center gap-3 mt-1 pointer-events-auto">
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-teal'}`}>
                <Bell className="w-3 h-3" />
                {formatReminder(todo.reminder)}
              </span>
              <button 
                onClick={handleCalendarClick}
                className="text-sage hover:text-teal transition-colors"
                title="Add to Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
              </button>
            </div>
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
          className="opacity-0 group-hover:opacity-100 p-2 text-sage hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hidden sm:block pointer-events-auto"
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
  const [syncToCalendar, setSyncToCalendar] = useState(false);

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

    const reminderTimestamp = reminderTime ? new Date(reminderTime).getTime() : undefined;

    const newTask: TodoItem = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      createdAt: Date.now(),
      reminder: reminderTimestamp
    };

    const updatedCategories = categories.map((cat) => {
      if (cat.id === activeCategoryId) {
        return { ...cat, todos: [newTask, ...cat.todos] };
      }
      return cat;
    });

    setCategories(updatedCategories);
    
    // Handle Calendar Sync
    if (syncToCalendar && reminderTimestamp) {
      window.open(createGoogleCalendarUrl(newTaskText, reminderTimestamp), '_blank');
    }

    setNewTaskText('');
    setReminderTime('');
    setShowReminderInput(false);
    setSyncToCalendar(false);
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
      <div className="flex items-center space-x-3 overflow-x-auto pb-4 pt-1 scrollbar-hide px-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`group relative shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
              activeCategoryId === cat.id
                ? 'btn-liquid pr-11' // Increased padding for internal delete button
                : 'btn-glass text-forest dark:text-sage'
            }`}
          >
            <span className="font-medium">{cat.name}</span>
            <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full transition-colors ${activeCategoryId === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-forest/50'}`}>
              {cat.todos.filter(t => !t.completed).length}
            </span>
            {activeCategoryId === cat.id && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.id);
                }}
                // Positioned inside the pill (right-1.5) to avoid clipping by overflow:hidden
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-600 hover:scale-110"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        ))}
        
        {/* Add Category Button */}
        {isAddingCategory ? (
          <form onSubmit={handleAddCategory} className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-2 shrink-0">
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onBlur={() => !newCategoryName && setIsAddingCategory(false)}
              placeholder="New List..."
              className="px-4 py-2.5 rounded-full bg-white/50 backdrop-blur-sm border border-teal focus:ring-2 focus:ring-teal outline-none dark:bg-deep/50 dark:border-teal dark:text-mint transition-all w-32"
            />
            <button
              type="submit"
              className="btn-liquid p-2.5 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="btn-glass flex items-center space-x-1 px-4 py-2.5 rounded-full text-sage hover:text-teal shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add List</span>
          </button>
        )}
      </div>

      {/* Main Todo Area */}
      <div className="flex-1 bg-white/40 dark:bg-deep/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/5 flex flex-col overflow-hidden transition-all duration-300">
        {activeCategory ? (
          <>
            <div className="p-6 border-b border-white/20 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-midnight dark:text-mint">{activeCategory.name}</h2>
                <p className="text-sm text-sage dark:text-sage mt-1">
                  Created {new Date(activeCategory.createdAt).toLocaleDateString()} • {activeCategory.todos.filter(t => t.completed).length}/{activeCategory.todos.length} done
                </p>
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleAddTask} className="p-4 border-b border-white/20 dark:border-white/5 flex flex-col gap-2">
               <div className="relative group">
                 <input
                   type="text"
                   value={newTaskText}
                   onChange={(e) => setNewTaskText(e.target.value)}
                   placeholder="Add a new task..."
                   className="w-full pl-5 pr-14 py-4 text-lg bg-white/60 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-teal/50 outline-none text-midnight dark:text-mint placeholder-sage/60 transition-all shadow-inner"
                 />
                 <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                   {/* Reminder Button */}
                   <button
                    type="button"
                    onClick={() => setShowReminderInput(!showReminderInput)}
                    className={`p-2 rounded-xl transition-colors btn-glass ${
                      showReminderInput || reminderTime ? 'text-teal border-teal/50' : 'text-sage hover:text-teal'
                    }`}
                   >
                     {reminderTime ? <Bell className="w-5 h-5 fill-current" /> : <Clock className="w-5 h-5" />}
                   </button>
                   
                   <button
                     type="submit"
                     disabled={!newTaskText.trim()}
                     className="btn-liquid aspect-square h-full rounded-xl flex items-center justify-center disabled:opacity-50 disabled:filter-none"
                   >
                     <Plus className="w-6 h-6" />
                   </button>
                 </div>
               </div>
               
               {/* Reminder Date Picker */}
               {showReminderInput && (
                 <div className="animate-in slide-in-from-top-2 fade-in flex flex-wrap items-center gap-3 p-2 bg-white/30 dark:bg-black/10 rounded-xl">
                   <input
                     type="datetime-local"
                     value={reminderTime}
                     onChange={(e) => setReminderTime(e.target.value)}
                     className="flex-grow sm:flex-grow-0 px-3 py-2 bg-white/50 dark:bg-midnight/50 border border-white/30 rounded-lg text-forest dark:text-sage text-sm focus:outline-none focus:border-teal"
                   />
                   <label className="flex items-center space-x-2 text-sm text-sage dark:text-sage cursor-pointer select-none">
                     <input 
                      type="checkbox"
                      checked={syncToCalendar}
                      onChange={(e) => setSyncToCalendar(e.target.checked)}
                      className="w-4 h-4 text-teal rounded border-sage/30 focus:ring-teal"
                     />
                     <span>Add to G-Cal</span>
                   </label>
                 </div>
               )}
            </form>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-sage/50 scrollbar-track-transparent">
              {activeCategory.todos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-sage space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 rounded-full bg-mint/50 dark:bg-forest/50 flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="w-8 h-8 opacity-50 text-teal" />
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
            <p className="text-lg font-medium">Select a category to view tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoManager;