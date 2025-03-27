export interface Note {
  uuid: string;
  content: string;
  tags: string[];
  createdAt: string;
  lastEdited?: string;
  links: string[]; // Changed from number[] to string[] to store UUIDs
  version: number;
  syncStatus: "pending" | "synced" | "error";
  deleted: number; // 0 = not deleted, 1 = deleted
}

export interface ActivityData {
  date: string;
  count: number;
}

export interface BacklinkReference {
  uuid: string; // Changed from id to uuid
  content: string;
  excerpt: string;
}

export interface SyncMetadata {
  key: string;
  value: string;
  lastSync: string;
}

export type SyncStatus = "idle" | "syncing" | "error" | "offline";
