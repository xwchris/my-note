import { openDB, type IDBPDatabase } from 'idb';
import { Note } from '../types';

const DB_NAME = 'NotesDB';
const STORE_NAME = 'notes';
const SYNC_META_STORE = 'syncMeta';

export class NotesDatabase {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = this.initDB();
  }

  private async initDB() {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'uuid' });
        }
        if (!db.objectStoreNames.contains(SYNC_META_STORE)) {
          db.createObjectStore(SYNC_META_STORE, { keyPath: 'key' });
        }
      },
    });
  }

  async getAllNotes(): Promise<Note[]> {
    const db = await this.db;
    const notes = await db.getAll(STORE_NAME);
    return notes.filter(note => note.deleted === 0);
  }

  async addNote(note: Note): Promise<void> {
    const db = await this.db;
    await db.put(STORE_NAME, note);
  }

  async updateNote(note: Note): Promise<void> {
    const db = await this.db;
    await db.put(STORE_NAME, note);
  }

  async deleteNote(uuid: string): Promise<void> {
    const db = await this.db;
    const note = await db.get(STORE_NAME, uuid);
    if (note) {
      note.deleted = 1;
      note.lastEdited = new Date().toISOString();
      note.version = (note.version || 1) + 1;
      note.syncStatus = 'pending';
      await db.put(STORE_NAME, note);
    }
  }

  async getPendingNotes(): Promise<Note[]> {
    const db = await this.db;
    const allNotes = await db.getAll(STORE_NAME);
    return allNotes.filter(note => note.syncStatus === 'pending');
  }

  async markNoteSynced(uuid: string): Promise<void> {
    const db = await this.db;
    const note = await db.get(STORE_NAME, uuid);
    if (note) {
      note.syncStatus = 'synced';
      await db.put(STORE_NAME, note);
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    const db = await this.db;
    const meta = await db.get(SYNC_META_STORE, 'lastSync');
    return meta?.value || null;
  }

  async updateLastSyncTime(): Promise<void> {
    const db = await this.db;
    await db.put(SYNC_META_STORE, {
      key: 'lastSync',
      value: new Date().toISOString()
    });
  }
}