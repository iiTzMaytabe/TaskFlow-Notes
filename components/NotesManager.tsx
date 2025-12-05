import React, { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { Plus, Trash2, Calendar, Save, Book } from 'lucide-react';

interface NotesManagerProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NotesManager: React.FC<NotesManagerProps> = ({ notes, setNotes }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Initialize selection
  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  const activeNote = notes.find((n) => n.id === selectedNoteId);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    if (selectedNoteId === id) {
      setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">All Notes</h2>
          <button
            onClick={handleCreateNote}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {notes.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No notes yet. <br /> Click + to create one.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedNoteId === note.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium truncate ${selectedNoteId === note.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-800 dark:text-gray-200'}`}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                   {formatDate(note.updatedAt)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {note.content || 'No additional text'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {activeNote ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created {formatDate(activeNote.createdAt)}
              </span>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                   <Save className="w-3 h-3" /> Saved
                 </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col h-full overflow-hidden">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
                placeholder="Note Title"
                className="text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 mb-4"
              />
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateNote('content', e.target.value)}
                placeholder="Start typing your note here..."
                className="flex-1 w-full resize-none bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Book className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a note or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManager;