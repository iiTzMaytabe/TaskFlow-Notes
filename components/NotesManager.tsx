import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { Plus, Trash2, Calendar, Save, Book, FileText } from 'lucide-react';

interface NotesManagerProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

// --- Swipeable Note Item Component ---
interface SwipeableNoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  formatDate: (ts: number) => string;
}

const SwipeableNoteItem: React.FC<SwipeableNoteItemProps> = ({ note, isSelected, onSelect, onDelete, formatDate }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef<number>(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.targetTouches[0].clientX;
    setIsSwiping(true);
    if (itemRef.current) itemRef.current.style.transition = 'none';
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - startX.current;

    // Only swipe left
    if (diff < 0) {
      setOffsetX(Math.max(diff, -150));
    }
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (itemRef.current) itemRef.current.style.transition = 'transform 0.3s ease-out';

    if (offsetX < -100) {
      setOffsetX(-500); // Animate out
      setTimeout(onDelete, 300);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div className="relative overflow-hidden mb-2 rounded-xl select-none touch-pan-y">
      {/* Background (Delete) */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-xl">
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div
        ref={itemRef}
        onClick={onSelect}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`relative group p-4 rounded-xl cursor-pointer backdrop-blur-md transition-all duration-200 border ${
          isSelected
            ? 'bg-white/80 dark:bg-white/10 border-teal shadow-md'
            : 'bg-white/40 dark:bg-deep/40 hover:bg-white/60 dark:hover:bg-deep/60 border-transparent hover:shadow-sm'
        }`}
      >
        <div className="flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-2 overflow-hidden">
             <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-teal' : 'text-sage'}`} />
             <h3 className={`font-medium truncate ${isSelected ? 'text-teal dark:text-mint' : 'text-midnight dark:text-gray-200'}`}>
               {note.title || 'Untitled Note'}
             </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-sage hover:text-red-500 transition-opacity pointer-events-auto hidden sm:block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-sage dark:text-sage mt-1 flex items-center pointer-events-none pl-6">
           {formatDate(note.updatedAt)}
        </p>
        <p className="text-sm text-forest/70 dark:text-gray-400 line-clamp-2 mt-2 pointer-events-none pl-6">
          {note.content || 'No additional text'}
        </p>
      </div>
    </div>
  );
};

const NotesManager: React.FC<NotesManagerProps> = ({ notes, setNotes }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Filter out deleted notes for main view
  const visibleNotes = notes.filter(n => !n.isDeleted);

  // Initialize selection
  useEffect(() => {
    if (visibleNotes.length > 0 && (!selectedNoteId || !visibleNotes.find(n => n.id === selectedNoteId))) {
      setSelectedNoteId(visibleNotes[0].id);
    }
  }, [visibleNotes, selectedNoteId]);

  const activeNote = visibleNotes.find((n) => n.id === selectedNoteId);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false,
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    // Soft delete: set isDeleted to true
    const updatedNotes = notes.map((n) => 
      n.id === id ? { ...n, isDeleted: true, updatedAt: Date.now() } : n
    );
    setNotes(updatedNotes);
    
    const remaining = updatedNotes.filter(n => !n.isDeleted);
    if (selectedNoteId === id) {
      setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleUpdateNote = (key: keyof Note, value: string) => {
    if (!activeNote) return;
    const updatedNotes = notes.map((note) =>
      note.id === activeNote.id
        ? { ...note, [key]: value, updatedAt: Date.now() }
        : note
    );
    setNotes(updatedNotes);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] bg-white/40 dark:bg-deep/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 border-r border-white/20 dark:border-white/5 flex flex-col bg-white/30 dark:bg-black/10">
        <div className="p-4 border-b border-white/20 dark:border-white/5 flex justify-between items-center">
          <h2 className="font-semibold text-deep dark:text-mint ml-2">All Notes</h2>
          <button
            onClick={handleCreateNote}
            className="btn-liquid p-2 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {visibleNotes.length === 0 ? (
            <div className="text-center py-10 text-sage text-sm">
              No notes yet. <br /> Click + to create one.
            </div>
          ) : (
            visibleNotes.map((note) => (
              <SwipeableNoteItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={() => setSelectedNoteId(note.id)}
                onDelete={() => handleDeleteNote(note.id)}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white/20 dark:bg-transparent">
        {activeNote ? (
          <>
            <div className="p-4 border-b border-white/20 dark:border-white/5 flex justify-between items-center">
              <span className="text-xs text-sage flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created {formatDate(activeNote.createdAt)}
              </span>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-teal dark:text-sage flex items-center gap-1">
                   <Save className="w-3 h-3" /> Saved
                 </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col h-full overflow-hidden">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
                placeholder="Note Title"
                className="text-4xl font-bold bg-transparent border-none outline-none text-midnight dark:text-mint placeholder-sage/50 mb-6"
              />
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateNote('content', e.target.value)}
                placeholder="Start typing your note here..."
                className="flex-1 w-full resize-none bg-transparent border-none outline-none text-forest dark:text-gray-300 leading-relaxed text-lg placeholder-sage/40"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-sage">
            <Book className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a note or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManager;