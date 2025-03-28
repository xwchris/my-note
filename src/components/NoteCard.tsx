import React, { useState } from "react";
import {
  Tag,
  Clock,
  Trash2,
  Edit2,
  X,
  Check,
  Link as LinkIcon,
  Hash,
} from "lucide-react";
import { Note } from "../types";
import NoteLink from "./NoteLink";

interface NoteCardProps {
  note: Note;
  allNotes: Note[];
  onUpdate: (
    uuid: string,
    content: string,
    tags: string[],
    links: string[]
  ) => void;
  onDelete: (uuid: string) => void;
  onNoteClick: (uuid: string) => void;
  isSelected: boolean;
  onClick: () => void;
}

function NoteCard({
  note,
  allNotes,
  onUpdate,
  onDelete,
  onNoteClick,
  isSelected,
  onClick,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState<string[]>(note.tags);
  const [editLinks, setEditLinks] = useState<string[]>(note.links || []);
  const [tagInput, setTagInput] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(note.uuid, editContent.trim(), editTags, editLinks);
      setIsEditing(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!editTags.includes(tagInput.trim())) {
        setEditTags([...editTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((tag) => tag !== tagToRemove));
  };

  const addLink = (targetNoteUuid: string) => {
    if (!editLinks.includes(targetNoteUuid)) {
      setEditLinks([...editLinks, targetNoteUuid]);
    }
    setShowLinkModal(false);
  };

  const removeLink = (targetNoteUuid: string) => {
    setEditLinks(editLinks.filter((uuid) => uuid !== targetNoteUuid));
  };

  // Get linked notes (outgoing references)
  const linkedNotes = allNotes.filter(
    (n) => n.deleted === 0 && editLinks.includes(n.uuid)
  );

  // Get backlinks (incoming references)
  const backlinks = allNotes.filter(
    (n) => n.deleted === 0 && (n.links || []).includes(note.uuid)
  );

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500"
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {note.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {note.content}
      </p>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <Hash size={12} />
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {new Date(note.updatedAt || note.createdAt).toLocaleString("zh-CN")}
      </div>
    </div>
  );
}

export default NoteCard;
