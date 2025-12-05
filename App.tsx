import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import NotesManager from './components/NotesManager';
import TodoManager from './components/TodoManager';
import { ViewMode, Note, Category } from './types';

const App: React.FC = () => {
  // --- State ---
  const [activeView, setActiveView] = useState<ViewMode>('todos');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize with some default data or empty arrays
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Persistence Logic ---

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('tf_notes');
      const savedCategories = localStorage.getItem('tf_categories');
      const savedTheme = localStorage.getItem('tf_theme');

      if (savedNotes) setNotes(JSON.parse(savedNotes));
      else {
        // Default Welcome Note
        setNotes([{
          id: 'welcome-note',
          title: 'Welcome to Notes',
          content: 'This is your new notebook. You can write anything here. Try the AI Polish button to fix grammar!',
          createdAt: Date.now(),
          updatedAt: Date.now()
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
            { id: 't1', text: 'Explore the app', completed: false, createdAt: Date.now() },
            { id: 't2', text: 'Try Dark Mode', completed: true, createdAt: Date.now() }
          ]
        }]);
      }

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
        <TodoManager categories={categories} setCategories={setCategories} />
      </div>
      
      <div className={`transition-opacity duration-300 ${activeView === 'notes' ? 'opacity-100' : 'hidden opacity-0'}`} style={{ display: activeView === 'notes' ? 'block' : 'none' }}>
        <NotesManager notes={notes} setNotes={setNotes} />
      </div>
    </Layout>
  );
};

export default App;