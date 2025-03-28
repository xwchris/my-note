import React from "react";
import type { Note } from "@/types";
import NoteCard from "./NoteCard";
import NoteInput from "./NoteInput";

interface NoteListProps {
  notes: Note[];
  allNotes: Note[];
  showInput: boolean;
  onNoteAdd: (content: string, tags: string[]) => void;
  onNoteUpdate: (
    uuid: string,
    content: string,
    tags: string[],
    links: string[]
  ) => void;
  onNoteDelete: (uuid: string) => void;
  onInputClose: () => void;
  onNoteClick: (noteId: string) => void;
  selectedNoteId?: string;
  onNoteSelect: (note: Note) => void;
}

function NoteList({
  notes,
  allNotes,
  showInput,
  onNoteAdd,
  onNoteUpdate,
  onNoteDelete,
  onInputClose,
  onNoteClick,
  selectedNoteId,
  onNoteSelect,
}: NoteListProps) {
  // Sort notes in reverse chronological order
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleNoteAdd = (content: string, tags: string[]) => {
    onNoteAdd(content, tags);
    onInputClose(); // Automatically close the form after saving
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>还没有笔记</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showInput && (
        <NoteInput onSubmit={handleNoteAdd} onCancel={onInputClose} />
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            allNotes={allNotes}
            onUpdate={onNoteUpdate}
            onDelete={onNoteDelete}
            onNoteClick={onNoteClick}
            isSelected={note.id === selectedNoteId}
            onClick={() => onNoteSelect(note)}
          />
        ))}
      </div>
    </div>
  );
}

export default NoteList;
