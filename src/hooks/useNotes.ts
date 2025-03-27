import { useState, useEffect } from "react";
import type { Note } from "@/types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("获取笔记失败");
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Omit<Note, "id">) => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("添加笔记失败");
    }
  };

  const updateNote = async (note: Note) => {
    try {
      const response = await fetch("/api/notes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("更新笔记失败");
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("删除笔记失败");
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
  };
}
