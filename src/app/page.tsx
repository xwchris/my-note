"use client";

import { useState } from "react";
import NoteList from "@/components/NoteList";
import Sidebar from "@/components/Sidebar";
import { useNotes } from "@/hooks/useNotes";
import type { Note, Tag } from "@/types";

export default function Home() {
  const { notes, loading, error } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 计算标签统计
  const tagCounts = notes.reduce((acc, note) => {
    note.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const tags: Tag[] = Object.entries(tagCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const filteredNotes = selectedTag
    ? notes.filter((note) => note.tags.includes(selectedTag))
    : notes;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">加载中...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        notes={notes}
        tags={tags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 p-6">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden mb-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          打开侧边栏
        </button>
        <NoteList
          notes={filteredNotes}
          selectedNoteId={selectedNote?.id}
          onNoteSelect={setSelectedNote}
        />
      </div>
    </div>
  );
}
