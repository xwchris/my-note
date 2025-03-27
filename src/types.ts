export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Tag {
  name: string;
  count: number;
}

export interface NoteListProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  selectedNoteId?: string;
  filter?: string;
}

export interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
}

export interface NoteInputProps {
  onSubmit: (note: Omit<Note, "id" | "createdAt">) => void;
  initialValue?: Partial<Note>;
}

export interface SidebarProps {
  tags: Tag[];
  selectedTag?: string;
  onTagSelect: (tag: string) => void;
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
