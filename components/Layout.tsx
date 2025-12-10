import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { ViewMode, Theme } from '../types';
import { Moon, Sun, ClipboardList, Book, Trash2, Palette, Wifi, WifiOff } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeView: ViewMode;
  onSwitchView: (view: ViewMode) => void;
  isDarkMode: boolean;
  toggleThemeMode: () => void;
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  isOnline: boolean;
}

const THEMES: { id: Theme; name: string; colors: string[] }[] = [
  { id: 'nature', name: 'Nature', colors: ['#235347', '#DAF1DE'] },
  { id: 'sunset', name: 'Sunset', colors: ['#463699', '#FBF5F0'] },
  { id: 'botanic', name: 'Botanic', colors: ['#157954', '#D6D9D8'] },
  { id: 'celestial', name: 'Celestial', colors: ['#E4B55D', '#004466'] },
  { id: 'volcano', name: 'Volcano', colors: ['#CA3F16', '#F3F4F5'] },
  { id: 'earth', name: 'Earth', colors: ['#4F531F', '#F6F4EC'] },
];

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onSwitchView, 
  isDarkMode, 
  toggleThemeMode,
  currentTheme,
  setTheme,
  isOnline
}) => {
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setShowPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-mint dark:bg-midnight transition-colors duration-300">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs py-1 px-4 text-center font-medium animate-in slide-in-from-top-full">
          You are offline. Changes will be saved locally.
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/60 dark:bg-deep/80 backdrop-blur-md border-b border-sage/30 dark:border-forest shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 group cursor-default">
            <div className="bg-teal p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              <ClipboardList className="w-6 h-6 text-mint" />
            </div>
            <h1 className="text-xl font-bold text-midnight dark:text-mint hidden sm:block tracking-tight">
              TaskFlow & Notes
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-sage/20 dark:bg-forest rounded-lg p-1 space-x-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => onSwitchView('todos')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform whitespace-nowrap ${
                activeView === 'todos'
                  ? 'bg-teal text-mint shadow-md scale-100'
                  : 'text-forest dark:text-sage hover:text-teal dark:hover:text-mint hover:bg-white/50 dark:hover:bg-deep/50 hover:scale-105 active:scale-95'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>To-Do List</span>
            </button>
            <button
              onClick={() => onSwitchView('notes')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform whitespace-nowrap ${
                activeView === 'notes'
                  ? 'bg-teal text-mint shadow-md scale-100'
                  : 'text-forest dark:text-sage hover:text-teal dark:hover:text-mint hover:bg-white/50 dark:hover:bg-deep/50 hover:scale-105 active:scale-95'
              }`}
            >
              <Book className="w-4 h-4" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => onSwitchView('trash')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform whitespace-nowrap ${
                activeView === 'trash'
                  ? 'bg-red-500/90 text-white shadow-md scale-100'
                  : 'text-forest dark:text-sage hover:text-red-500 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-deep/50 hover:scale-105 active:scale-95'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Trash</span>
            </button>
          </div>

          {/* Theme & Network Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Network Status Icon (only shows when offline or transitioning) */}
            {!isOnline && (
              <div className="p-2 text-amber-500" title="Offline Mode">
                <WifiOff className="w-5 h-5" />
              </div>
            )}

            {/* Palette Picker */}
            <div className="relative" ref={paletteRef}>
              <button
                onClick={() => setShowPalette(!showPalette)}
                className="p-2 rounded-full hover:bg-sage/20 dark:hover:bg-forest transition-all duration-300 text-teal dark:text-sage hover:scale-110"
                aria-label="Change Theme"
              >
                <Palette className="w-5 h-5" />
              </button>
              
              {showPalette && (
                <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-deep rounded-xl shadow-xl border border-sage/30 dark:border-forest p-3 animate-in fade-in slide-in-from-top-2 z-50">
                   <div className="grid grid-cols-3 gap-3">
                     {THEMES.map((theme) => (
                       <button
                         key={theme.id}
                         onClick={() => {
                           setTheme(theme.id);
                           setShowPalette(false);
                         }}
                         className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                           currentTheme === theme.id ? 'border-teal' : 'border-transparent'
                         }`}
                         title={theme.name}
                       >
                         <div 
                           className="w-full h-full rounded-full overflow-hidden flex"
                           style={{ transform: 'rotate(45deg)' }}
                         >
                            <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors[0] }}></div>
                            <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors[1] }}></div>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-full hover:bg-sage/20 dark:hover:bg-forest transition-all duration-300 text-teal dark:text-sage hover:scale-110 hover:rotate-12 active:scale-90"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>
      
      <footer className="py-6 text-center text-sm text-forest dark:text-sage opacity-70">
        <p>© {new Date().getFullYear()} TaskFlow Created by Maytabe</p>
      </footer>
    </div>
  );
};

export default Layout;