import React from "react";
import NoteCard from "./NoteCard";
import NoteInput from "./NoteInput";
import { Note } from "../types";

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
  onTagClick?: (tag: string) => void;
  onShowRelationGraph?: (noteUuid: string) => void;
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
  onTagClick,
  onShowRelationGraph,
}: NoteListProps) {
  // Sort notes in reverse chronological order
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.lastEdited || a.createdAt);
    const dateB = new Date(b.lastEdited || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleNoteAdd = (content: string, tags: string[]) => {
    onNoteAdd(content, tags);
    onInputClose(); // Automatically close the form after saving
  };

  return (
    <div className="space-y-6">
      {showInput && (
        <NoteInput onSubmit={handleNoteAdd} onCancel={onInputClose} />
      )}

      {sortedNotes.map((note) => (
        <NoteCard
          key={note.uuid}
          note={note}
          allNotes={allNotes}
          onUpdate={onNoteUpdate}
          onDelete={onNoteDelete}
          onNoteClick={onNoteClick}
          onTagClick={onTagClick}
          onShowRelationGraph={onShowRelationGraph}
        />
      ))}

      {notes.length === 0 && !showInput && (
        <div className="text-center py-12">
          <p className="text-gray-500">还没有笔记，开始创建一个吧！</p>
        </div>
      )}
    </div>
  );
}

export default NoteList;
