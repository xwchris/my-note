import { openDB, type IDBPDatabase } from "idb";
import { Note } from "../types";

const DB_NAME = "NotesDB";
const STORE_NAME = "notes";
const SYNC_META_STORE = "syncMeta";

export class NotesDatabase {
  private db: Promise<IDBPDatabase> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.db = this.initDB();
    }
  }

  private async initDB() {
    if (typeof window === "undefined") {
      throw new Error("Cannot initialize IndexedDB on server side");
    }
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "uuid" });
        }
        if (!db.objectStoreNames.contains(SYNC_META_STORE)) {
          db.createObjectStore(SYNC_META_STORE, { keyPath: "key" });
        }
      },
    });
  }

  private async getDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      if (typeof window === "undefined") {
        throw new Error("Cannot access IndexedDB on server side");
      }
      this.db = this.initDB();
    }
    return this.db;
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      const notes = await db.getAll(STORE_NAME);
      return notes.filter((note) => note.deleted === 0);
    } catch (error) {
      console.error("Failed to get notes:", error);
      return [];
    }
  }

  async getNote(uuid: string): Promise<Note | undefined> {
    try {
      const db = await this.getDB();
      return await db.get(STORE_NAME, uuid);
    } catch (error) {
      console.error("Failed to get note:", error);
      return undefined;
    }
  }

  async addNote(note: Note): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(STORE_NAME, note);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  }

  async updateNote(note: Note): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(STORE_NAME, note);
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  }

  async deleteNote(uuid: string): Promise<void> {
    try {
      const db = await this.getDB();
      const note = await db.get(STORE_NAME, uuid);
      if (note) {
        note.deleted = 1;
        note.lastEdited = new Date().toISOString();
        note.version = (note.version || 1) + 1;
        note.syncStatus = "pending";
        await db.put(STORE_NAME, note);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }

  async getPendingNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      const allNotes = await db.getAll(STORE_NAME);
      return allNotes.filter((note) => note.syncStatus === "pending");
    } catch (error) {
      console.error("Failed to get pending notes:", error);
      return [];
    }
  }

  async markNoteSynced(uuid: string): Promise<void> {
    try {
      const db = await this.getDB();
      const note = await db.get(STORE_NAME, uuid);
      if (note) {
        note.syncStatus = "synced";
        await db.put(STORE_NAME, note);
      }
    } catch (error) {
      console.error("Failed to mark note as synced:", error);
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    try {
      const db = await this.getDB();
      const meta = await db.get(SYNC_META_STORE, "lastSync");
      return meta?.timestamp || null;
    } catch (error) {
      console.error("Failed to get last sync time:", error);
      return null;
    }
  }

  async updateLastSyncTime(): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(SYNC_META_STORE, {
        key: "lastSync",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update last sync time:", error);
    }
  }
}
