import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Note } from "../types";

interface NoteLinkProps {
  currentNoteUuid: string;
  notes: Note[];
  existingLinks: string[];
  onSelect: (noteUuid: string) => void;
  onClose: () => void;
}

function NoteLink({
  currentNoteUuid,
  notes,
  existingLinks,
  onSelect,
  onClose,
}: NoteLinkProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter notes that:
  // 1. Are not the current note
  // 2. Are not already linked
  // 3. Match the search term
  // 4. Are not deleted
  const filteredNotes = notes.filter(
    (note) =>
      note.uuid !== currentNoteUuid &&
      !existingLinks.includes(note.uuid) &&
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
      note.deleted === 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            链接到笔记
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredNotes.length > 0 ? (
              <div className="space-y-2">
                {filteredNotes.map((note) => (
                  <button
                    key={note.uuid}
                    onClick={() => onSelect(note.uuid)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                {searchTerm ? "没有找到匹配的笔记" : "没有可链接的笔记"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteLink;
