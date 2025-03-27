import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Note } from '../types';

interface BacklinkPanelProps {
  currentNote: Note;
  allNotes: Note[];
  onNoteClick: (noteId: number) => void;
}

function BacklinkPanel({ currentNote, allNotes, onNoteClick }: BacklinkPanelProps) {
  const backlinks = allNotes.filter(note => 
    (note.links || []).includes(currentNote.id)
  );

  if (backlinks.length === 0) return null;

  const getExcerpt = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        被引用 ({backlinks.length})
      </h3>
      <div className="space-y-3">
        {backlinks.map(note => (
          <button
            key={note.id}
            onClick={() => onNoteClick(note.id)}
            className="w-full text-left group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {getExcerpt(note.content)}
              </p>
              <ArrowUpRight 
                size={16} 
                className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-1 flex-shrink-0"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BacklinkPanel;