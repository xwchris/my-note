import axios from "axios";
import { Note, SyncStatus, ActivityData } from "@/types";
import { NotesDatabase } from "@/db/database";
import debounce from "lodash.debounce";

const API_URL = "/api";
const SYNC_DEBOUNCE_DELAY = 2000; // 2秒防抖延迟

export class SyncService {
  private db: NotesDatabase;
  private setStatus: (status: SyncStatus) => void;
  private onStatsUpdate: (
    activityData: ActivityData[],
    totalDays: number
  ) => void;
  private syncInProgress: boolean = false;
  private pendingSyncs: number = 0;
  private lastConnectionStatus: boolean = true;
  private initialSyncDone: boolean = false;

  constructor(
    setStatus: (status: SyncStatus) => void,
    onStatsUpdate: (activityData: ActivityData[], totalDays: number) => void
  ) {
    this.db = new NotesDatabase();
    this.setStatus = setStatus;
    this.onStatsUpdate = onStatsUpdate;
    this.performInitialSync();
  }

  private getAuthHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/ping`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private updateSyncStatus() {
    if (this.pendingSyncs > 0) {
      this.setStatus("syncing");
    } else if (!this.lastConnectionStatus) {
      this.setStatus("offline");
    } else {
      this.setStatus("idle");
    }
  }

  private async fetchRemoteNotes(): Promise<Note[]> {
    const response = await axios.get(`${API_URL}/notes`);
    return response.data;
  }

  private async fetchStats() {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  }

  private async handleConflict(localNote: Note, serverNote: Note) {
    // 在这里可以实现更复杂的冲突解决策略
    // 目前简单地采用服务器版本
    await this.db.updateNote({ ...serverNote, syncStatus: "synced" });
  }

  private debouncedSync = debounce(async (note: Note) => {
    if (!this.lastConnectionStatus || !this.initialSyncDone) {
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
      this.setStatus("error");
    } finally {
      this.pendingSyncs--;
      this.updateSyncStatus();
    }
  }, SYNC_DEBOUNCE_DELAY);

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

      const pendingNotes = await this.db.getPendingNotes();
      for (const note of pendingNotes) {
        await this.debouncedSync(note);
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
      this.initialSyncDone = true;
      this.updateSyncStatus();
    } catch (error) {
      console.error("Full sync failed:", error);
      this.setStatus("error");
    } finally {
      this.syncInProgress = false;
    }
  }

  private async performInitialSync() {
    this.lastConnectionStatus = await this.checkConnection();
    if (this.lastConnectionStatus) {
      await this.performFullSync();
    } else {
      this.setStatus("offline");
    }

    // 设置连接状态检查定时器
    const checkAndUpdateConnection = async () => {
      const newStatus = await this.checkConnection();
      if (newStatus !== this.lastConnectionStatus) {
        this.lastConnectionStatus = newStatus;
        if (newStatus) {
          await this.performFullSync();
        } else {
          this.setStatus("offline");
        }
      }
      // 无论连接状态是否改变，都更新状态显示
      this.updateSyncStatus();
    };

    // 立即执行一次连接检查和状态更新
    await checkAndUpdateConnection();

    // 然后设置定时重复执行
    setInterval(checkAndUpdateConnection, 30000); // 每30秒检查一次连接状态
  }

  async addNote(note: Note): Promise<void> {
    await this.db.addNote(note);
    await this.debouncedSync(note);
  }

  async updateNote(note: Note): Promise<void> {
    await this.db.updateNote(note);
    await this.debouncedSync(note);
  }

  async deleteNote(uuid: string): Promise<void> {
    await this.db.deleteNote(uuid);
    const note = await this.db.getNote(uuid);
    if (note) {
      await this.debouncedSync(note);
    }
  }

  destroy() {
    this.debouncedSync.cancel();
  }

  // 添加一个公共方法，允许手动触发同步
  async triggerSync(): Promise<void> {
    // 检查连接状态
    const isOnline = await this.checkConnection();

    if (!isOnline) {
      this.setStatus("offline");
      return;
    }

    // 执行完整同步
    try {
      await this.performFullSync();
    } catch (error) {
      console.error("手动同步失败:", error);
      this.setStatus("error");
    }
  }
}
