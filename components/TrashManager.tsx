import React from 'react';
import { Note, DeletedTodoItem } from '../types';
import { RotateCcw, Trash2, Calendar, CheckCircle, Circle, FileText } from 'lucide-react';

interface TrashManagerProps {
  deletedNotes: Note[];
  deletedTasks: DeletedTodoItem[];
  onRestoreNote: (id: string) => void;
  onDeleteNoteForever: (id: string) => void;
  onRestoreTask: (task: DeletedTodoItem) => void;
  onDeleteTaskForever: (id: string) => void;
}

const TrashManager: React.FC<TrashManagerProps> = ({
  deletedNotes,
  deletedTasks,
  onRestoreNote,
  onDeleteNoteForever,
  onRestoreTask,
  onDeleteTaskForever,
}) => {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white/40 dark:bg-deep/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-4 border-b border-white/20 dark:border-white/5 bg-white/20 dark:bg-white/5 flex items-center justify-between">
        <h2 className="font-semibold text-deep dark:text-mint flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-teal" />
          Recycle Bin
        </h2>
        <span className="text-xs text-sage">
          {deletedNotes.length + deletedTasks.length} items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {deletedNotes.length === 0 && deletedTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-sage space-y-2 opacity-60">
            <Trash2 className="w-12 h-12" />
            <p>Trash is empty</p>
          </div>
        ) : (
          <>
            {/* Deleted Notes Section */}
            {deletedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-sage tracking-wider px-1">Notes</h3>
                {deletedNotes.map((note) => (
                  <div key={note.id} className="group flex items-center justify-between p-3 bg-white/40 dark:bg-forest/20 border border-white/20 dark:border-white/5 rounded-2xl hover:border-teal transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-sage/10 rounded-xl text-teal">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-midnight dark:text-mint truncate">{note.title || 'Untitled'}</h4>
                        <p className="text-xs text-sage truncate">{note.content || 'No content'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onRestoreNote(note.id)}
                        title="Restore"
                        className="p-2 btn-glass rounded-lg text-teal"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteNoteForever(note.id)}
                        title="Delete Forever"
                        className="p-2 btn-glass rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Deleted Tasks Section */}
            {deletedTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-sage tracking-wider px-1">Tasks</h3>
                {deletedTasks.map((task) => (
                  <div key={task.id} className="group flex items-center justify-between p-3 bg-white/40 dark:bg-forest/20 border border-white/20 dark:border-white/5 rounded-2xl hover:border-teal transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-sage/10 rounded-xl text-teal">
                        {task.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-medium truncate ${task.completed ? 'line-through text-sage' : 'text-midnight dark:text-mint'}`}>
                          {task.text}
                        </h4>
                        <p className="text-xs text-sage flex items-center gap-1">
                          Deleted {new Date(task.deletedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onRestoreTask(task)}
                        title="Restore"
                        className="p-2 btn-glass rounded-lg text-teal"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTaskForever(task.id)}
                        title="Delete Forever"
                        className="p-2 btn-glass rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrashManager;