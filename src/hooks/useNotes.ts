import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { NotesDatabase } from "@/db/database";
import { SyncService } from "@/services/SyncService";
import { Note, SyncStatus, ActivityData } from "@/types";
import debounce from "lodash.debounce";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 使用useRef存储实例，避免多次创建
  const dbRef = useRef<NotesDatabase | null>(null);
  const syncServiceRef = useRef<SyncService | null>(null);

  // 初始化数据库和同步服务
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (!dbRef.current) {
        dbRef.current = new NotesDatabase();
      }

      if (!syncServiceRef.current) {
        syncServiceRef.current = new SyncService(
          setSyncStatus,
          (newActivityData, newTotalDays) => {
            setActivityData(newActivityData);
            setTotalDays(newTotalDays);
          }
        );
      }

      const loadNotes = async () => {
        try {
          if (!dbRef.current) return;
          const storedNotes = await dbRef.current.getAllNotes();
          setNotes(storedNotes);
          setError(null);
        } catch (err) {
          console.error("Failed to load notes:", err);
          setError("加载笔记失败");
        }
      };

      loadNotes();
    } catch (err) {
      console.error("初始化数据服务失败:", err);
      setError("初始化数据服务失败");
    }

    // 清理函数
    return () => {
      if (syncServiceRef.current) {
        syncServiceRef.current.destroy();
      }
    };
  }, []);

  // 限流添加笔记
  const addNote = useCallback(async (content: string, tags: string[]) => {
    try {
      if (!dbRef.current || !syncServiceRef.current) {
        throw new Error("数据服务未初始化");
      }

      setError(null);
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

      await syncServiceRef.current.addNote(newNote);
      setNotes((prev) => [...prev, newNote]);
    } catch (err) {
      console.error("添加笔记失败:", err);
      setError("添加笔记失败");
    }
  }, []);

  // 限流更新笔记
  // eslint-disable-next-line
  const updateNote = useCallback(
    debounce(
      async (
        uuid: string,
        content: string,
        tags: string[],
        links: string[]
      ) => {
        try {
          if (!dbRef.current || !syncServiceRef.current) {
            throw new Error("数据服务未初始化");
          }

          setError(null);
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

          await syncServiceRef.current.updateNote(updatedNote);
          setNotes((prev) =>
            prev.map((note) => (note.uuid === uuid ? updatedNote : note))
          );
        } catch (err) {
          console.error("更新笔记失败:", err);
          setError("更新笔记失败");
        }
      },
      300
    ),
    [notes]
  );

  // 限流删除笔记
  const deleteNote = useCallback(
    async (uuid: string) => {
      try {
        if (!dbRef.current || !syncServiceRef.current) {
          throw new Error("数据服务未初始化");
        }

        setError(null);
        const noteToDelete = notes.find((note) => note.uuid === uuid);
        if (!noteToDelete) return;

        await syncServiceRef.current.deleteNote(uuid);
        setNotes((prev) => prev.filter((note) => note.uuid !== uuid));
      } catch (err) {
        console.error("删除笔记失败:", err);
        setError("删除笔记失败");
      }
    },
    [notes]
  );

  // 手动触发同步
  const triggerSync = useCallback(async () => {
    try {
      if (!syncServiceRef.current) {
        throw new Error("同步服务未初始化");
      }

      setError(null);
      await syncServiceRef.current.triggerSync();
    } catch (err) {
      console.error("手动同步失败:", err);
      setError("手动同步失败");
    }
  }, []);

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    syncStatus,
    activityData,
    totalDays,
    error,
    triggerSync,
  };
}
