import axios from "axios";
import { NotesDatabase } from "../db/database";
import { Note, SyncStatus, ActivityData } from "../types";
import { AuthService } from "./AuthService";

const API_URL = "http://" + location.hostname + ":12001/api";
const SYNC_INTERVAL = 5000;
const CONNECTION_CHECK_INTERVAL = 3000;

export class SyncService {
  private db: NotesDatabase;
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private connectionInterval: NodeJS.Timeout | null = null;
  private setStatus: (status: SyncStatus) => void;
  private lastConnectionStatus = true;
  private onStatsUpdate?: (
    activityData: ActivityData[],
    totalDays: number
  ) => void;
  private pendingSyncs = 0;

  constructor(
    setStatus: (status: SyncStatus) => void,
    onStatsUpdate?: (activityData: ActivityData[], totalDays: number) => void
  ) {
    this.db = new NotesDatabase();
    this.setStatus = setStatus;
    this.onStatsUpdate = onStatsUpdate;
    this.startConnectionCheck();
    this.startPeriodicSync();
  }

  private getAuthHeaders() {
    const token = AuthService.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/ping`, {
        timeout: 2000,
        headers: this.getAuthHeaders(),
      });
      return response.status === 200;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        AuthService.clearToken();
      }
      return false;
    }
  }

  private startConnectionCheck() {
    this.checkConnection().then((isConnected) => {
      this.lastConnectionStatus = isConnected;
      this.setStatus(isConnected ? "idle" : "offline");
      if (isConnected) {
        this.performFullSync();
      }
    });

    this.connectionInterval = setInterval(async () => {
      const isConnected = await this.checkConnection();

      if (isConnected !== this.lastConnectionStatus) {
        this.lastConnectionStatus = isConnected;

        if (isConnected) {
          this.setStatus("syncing");
          this.performFullSync();
          this.startPeriodicSync();
        } else {
          this.setStatus("offline");
          this.stopPeriodicSync();
        }
      }
    }, CONNECTION_CHECK_INTERVAL);
  }

  private startPeriodicSync() {
    if (!this.syncInterval) {
      this.syncInterval = setInterval(() => {
        if (this.lastConnectionStatus) {
          this.performFullSync();
        }
      }, SYNC_INTERVAL);
    }
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async fetchRemoteNotes(): Promise<Note[]> {
    try {
      const response = await axios.get(`${API_URL}/notes`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch remote notes:", error);
      throw error;
    }
  }

  private async fetchStats(): Promise<{
    activityData: ActivityData[];
    totalDays: number;
  }> {
    try {
      const response = await axios.get(`${API_URL}/stats`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      throw error;
    }
  }

  private async handleConflict(
    localNote: Note,
    serverNote: Note
  ): Promise<void> {
    const serverDate = new Date(serverNote.lastEdited || serverNote.createdAt);
    const localDate = new Date(localNote.lastEdited || localNote.createdAt);

    if (serverDate > localDate) {
      await this.db.updateNote(serverNote);
    } else {
      await this.syncNote(localNote);
    }
  }

  private updateSyncStatus() {
    if (this.pendingSyncs > 0) {
      this.setStatus("syncing");
    } else if (this.lastConnectionStatus) {
      this.setStatus("idle");
    } else {
      this.setStatus("offline");
    }
  }

  private async syncNote(note: Note): Promise<void> {
    if (!this.lastConnectionStatus) {
      this.setStatus("offline");
      return;
    }

    try {
      this.pendingSyncs++;
      this.updateSyncStatus();

      const response = await axios.post(
        `${API_URL}/notes/sync`,
        {
          uuid: note.uuid,
          content: note.content,
          tags: note.tags,
          links: note.links,
          version: note.version,
          createdAt: note.createdAt,
          lastEdited: note.lastEdited,
          deleted: note.deleted,
        },
        { headers: this.getAuthHeaders() }
      );

      if (response.status === 409) {
        await this.handleConflict(note, response.data.serverVersion);
      } else {
        await this.db.markNoteSynced(note.uuid);
      }
    } catch (error) {
      console.error("Failed to sync note:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        AuthService.clearToken();
      }
      this.setStatus("error");
      throw error;
    } finally {
      this.pendingSyncs--;
      this.updateSyncStatus();
    }
  }

  private async performFullSync(): Promise<void> {
    if (this.syncInProgress || !this.lastConnectionStatus) {
      if (!this.lastConnectionStatus) {
        this.setStatus("offline");
      }
      return;
    }

    try {
      this.syncInProgress = true;
      this.setStatus("syncing");

      const [localNotes, remoteNotes, stats] = await Promise.all([
        this.db.getAllNotes(),
        this.fetchRemoteNotes(),
        this.fetchStats(),
      ]);

      const localNotesMap = new Map(
        localNotes.map((note) => [note.uuid, note])
      );
      const remoteNotesMap = new Map(
        remoteNotes.map((note) => [note.uuid, note])
      );

      const pendingNotes = await this.db.getPendingNotes();
      for (const note of pendingNotes) {
        await this.syncNote(note);
      }

      for (const remoteNote of remoteNotes) {
        const localNote = localNotesMap.get(remoteNote.uuid);

        if (!localNote) {
          await this.db.addNote({ ...remoteNote, syncStatus: "synced" });
        } else if (remoteNote.version > localNote.version) {
          await this.db.updateNote({ ...remoteNote, syncStatus: "synced" });
        }
      }

      if (this.onStatsUpdate) {
        this.onStatsUpdate(stats.activityData, stats.totalDays);
      }

      await this.db.updateLastSyncTime();
      this.updateSyncStatus();
    } catch (error) {
      console.error("Full sync failed:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        AuthService.clearToken();
      }
      this.setStatus("error");
    } finally {
      this.syncInProgress = false;
    }
  }

  public async addNote(note: Note): Promise<void> {
    await this.db.addNote(note);
    if (this.lastConnectionStatus) {
      await this.syncNote(note);
    }
  }

  public async updateNote(note: Note): Promise<void> {
    await this.db.updateNote(note);
    if (this.lastConnectionStatus) {
      await this.syncNote(note);
    }
  }

  public async deleteNote(uuid: string): Promise<void> {
    await this.db.deleteNote(uuid);
    const deletedNote = await this.db
      .getAllNotes()
      .then((notes) => notes.find((n) => n.uuid === uuid));
    if (deletedNote && this.lastConnectionStatus) {
      await this.syncNote(deletedNote);
    }
  }

  public destroy() {
    this.stopPeriodicSync();
    if (this.connectionInterval) {
      clearInterval(this.connectionInterval);
      this.connectionInterval = null;
    }
  }
}
