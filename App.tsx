import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import NotesManager from './components/NotesManager';
import TodoManager from './components/TodoManager';
import TrashManager from './components/TrashManager';
import { ViewMode, Note, Category, DeletedTodoItem, TodoItem } from './types';

const App: React.FC = () => {
  // --- State ---
  const [activeView, setActiveView] = useState<ViewMode>('todos');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize with some default data or empty arrays
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<DeletedTodoItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Persistence Logic ---

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('tf_notes');
      const savedCategories = localStorage.getItem('tf_categories');
      const savedDeletedTasks = localStorage.getItem('tf_deleted_tasks');
      const savedTheme = localStorage.getItem('tf_theme');

      if (savedNotes) setNotes(JSON.parse(savedNotes));
      else {
        // Default Welcome Note
        setNotes([{
          id: 'welcome-note',
          title: 'Welcome to Notes',
          content: 'This is your new notebook. You can write anything here.',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isDeleted: false
        }]);
      }

      if (savedCategories) setCategories(JSON.parse(savedCategories));
      else {
        // Default Category
        setCategories([{
          id: 'default-cat',
          name: 'My Tasks',
          createdAt: Date.now(),
          todos: [
            { id: 't1', text: 'Explore the new theme', completed: false, createdAt: Date.now() },
            { id: 't2', text: 'Try Dark Mode', completed: true, createdAt: Date.now() }
          ]
        }]);
      }

      if (savedDeletedTasks) setDeletedTasks(JSON.parse(savedDeletedTasks));

      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('tf_notes', JSON.stringify(notes));
  }, [notes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('tf_categories', JSON.stringify(categories));
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('tf_deleted_tasks', JSON.stringify(deletedTasks));
  }, [deletedTasks, isLoaded]);

  // --- Theme Logic ---
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('tf_theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // --- Trash Logic ---
  const handleMoveTaskToTrash = (task: TodoItem, categoryId: string) => {
    const deletedTask: DeletedTodoItem = {
      ...task,
      originalCategoryId: categoryId,
      deletedAt: Date.now(),
    };
    setDeletedTasks(prev => [deletedTask, ...prev]);
  };

  const handleRestoreTask = (task: DeletedTodoItem) => {
    // Remove from trash
    setDeletedTasks(prev => prev.filter(t => t.id !== task.id));
    
    // Add back to category (or default if original is gone)
    const { originalCategoryId, deletedAt, ...todoItem } = task;
    
    setCategories(prev => {
      const categoryExists = prev.some(c => c.id === originalCategoryId);
      if (categoryExists) {
        return prev.map(c => c.id === originalCategoryId ? { ...c, todos: [todoItem, ...c.todos] } : c);
      } else {
        // If category deleted, add to first one or create 'Restored'
        if (prev.length > 0) {
           return prev.map((c, idx) => idx === 0 ? { ...c, todos: [todoItem, ...c.todos] } : c);
        } else {
           return [{
             id: crypto.randomUUID(),
             name: 'Restored Tasks',
             createdAt: Date.now(),
             todos: [todoItem]
           }];
        }
      }
    });
  };

  const handleDeleteTaskForever = (id: string) => {
    setDeletedTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleRestoreNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isDeleted: false } : n));
  };

  const handleDeleteNoteForever = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mint dark:bg-midnight">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <Layout
      activeView={activeView}
      onSwitchView={setActiveView}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
    >
      <div className={`transition-opacity duration-300 ${activeView === 'todos' ? 'opacity-100' : 'hidden opacity-0'}`} style={{ display: activeView === 'todos' ? 'block' : 'none' }}>
        <TodoManager 
          categories={categories} 
          setCategories={setCategories} 
          onDeleteTask={handleMoveTaskToTrash}
        />
      </div>
      
      <div className={`transition-opacity duration-300 ${activeView === 'notes' ? 'opacity-100' : 'hidden opacity-0'}`} style={{ display: activeView === 'notes' ? 'block' : 'none' }}>
        <NotesManager notes={notes} setNotes={setNotes} />
      </div>

      <div className={`transition-opacity duration-300 ${activeView === 'trash' ? 'opacity-100' : 'hidden opacity-0'}`} style={{ display: activeView === 'trash' ? 'block' : 'none' }}>
        <TrashManager 
          deletedNotes={notes.filter(n => n.isDeleted)} 
          deletedTasks={deletedTasks}
          onRestoreNote={handleRestoreNote}
          onDeleteNoteForever={handleDeleteNoteForever}
          onRestoreTask={handleRestoreTask}
          onDeleteTaskForever={handleDeleteTaskForever}
        />
      </div>
    </Layout>
  );
};

export default App;