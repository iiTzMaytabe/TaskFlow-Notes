import React, { ReactNode } from 'react';
import { ViewMode } from '../types';
import { Moon, Sun, ClipboardList, Book } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeView: ViewMode;
  onSwitchView: (view: ViewMode) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onSwitchView, 
  isDarkMode, 
  toggleTheme 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hidden sm:block">
              TaskFlow & Notes
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 space-x-1">
            <button
              onClick={() => onSwitchView('todos')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeView === 'todos'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>My To-Do List</span>
            </button>
            <button
              onClick={() => onSwitchView('notes')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeView === 'notes'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Book className="w-4 h-4" />
              <span>My Notes</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-400 dark:text-gray-600">
        <p>© {new Date().getFullYear()} TaskFlow & Notes. Auto-save enabled.</p>
      </footer>
    </div>
  );
};

export default Layout;
