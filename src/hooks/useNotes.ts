import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { NotesDatabase } from "../db/database";
import { SyncService } from "../services/SyncService";
import { Note, SyncStatus, ActivityData } from "../types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [db] = useState(() => new NotesDatabase());
  const [syncService] = useState(
    () =>
      new SyncService(setSyncStatus, (newActivityData, newTotalDays) => {
        setActivityData(newActivityData);
        setTotalDays(newTotalDays);
      })
  );

  useEffect(() => {
    const loadNotes = async () => {
      const storedNotes = await db.getAllNotes();
      setNotes(storedNotes);
    };
    loadNotes();

    return () => {
      syncService.destroy();
    };
  }, []);

  const addNote = useCallback(async (content: string, tags: string[]) => {
    const newNote: Note = {
      uuid: uuidv4(),
      content,
      tags,
      createdAt: new Date().toISOString(),
      links: [],
      version: 1,
      syncStatus: "pending",
      deleted: 0,
    };

    await syncService.addNote(newNote);
    setNotes((prev) => [...prev, newNote]);
  }, []);

  const updateNote = useCallback(
    async (uuid: string, content: string, tags: string[], links: string[]) => {
      const noteToUpdate = notes.find((note) => note.uuid === uuid);
      if (!noteToUpdate) return;

      const updatedNote: Note = {
        ...noteToUpdate,
        content,
        tags,
        links,
        lastEdited: new Date().toISOString(),
        version: (noteToUpdate.version || 1) + 1,
        syncStatus: "pending",
      };

      await syncService.updateNote(updatedNote);
      setNotes((prev) =>
        prev.map((note) => (note.uuid === uuid ? updatedNote : note))
      );
    },
    [notes]
  );

  const deleteNote = useCallback(
    async (uuid: string) => {
      const noteToDelete = notes.find((note) => note.uuid === uuid);
      if (!noteToDelete) return;

      await syncService.deleteNote(uuid);
      setNotes((prev) => prev.filter((note) => note.uuid !== uuid));
    },
    [notes]
  );

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    syncStatus,
    activityData,
    totalDays,
  };
}
