import React, { useState } from "react";
import {
  Tag,
  Clock,
  Trash2,
  Edit2,
  X,
  Check,
  Link as LinkIcon,
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
}

function NoteCard({
  note,
  allNotes,
  onUpdate,
  onDelete,
  onNoteClick,
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="写点什么..."
            className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={4}
            autoFocus
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {editTags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-sm"
              >
                <Tag size={14} />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="添加标签（回车确认）"
              className="w-full md:flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <div className="flex w-full md:w-auto gap-2 justify-between md:justify-start">
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <LinkIcon size={16} />
                <span>添加链接</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors"
                >
                  <Check size={20} />
                </button>
              </div>
            </div>
          </div>

          {showLinkModal && (
            <NoteLink
              currentNoteUuid={note.uuid}
              notes={allNotes.filter((n) => n.deleted === 0)}
              existingLinks={editLinks}
              onSelect={addLink}
              onClose={() => setShowLinkModal(false)}
            />
          )}

          {editLinks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                引用
              </h4>
              <div className="space-y-2">
                {linkedNotes.map((linkedNote) => (
                  <div
                    key={`link-${linkedNote.uuid}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {linkedNote.content}
                    </span>
                    <button
                      onClick={() => removeLink(linkedNote.uuid)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="prose prose-lg dark:prose-invert max-w-none mb-4">
            <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {note.content}
            </p>
          </div>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {note.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-sm"
                  title={tag}
                >
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {linkedNotes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                引用 ({linkedNotes.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {linkedNotes.map((linkedNote) => (
                  <button
                    key={`linked-${linkedNote.uuid}`}
                    onClick={() => onNoteClick(linkedNote.uuid)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LinkIcon size={14} />
                    <span className="truncate max-w-[150px] md:max-w-[200px]">
                      {linkedNote.content}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span className="hidden md:inline">
                  {formatDate(note.createdAt)}
                </span>
                <span className="md:hidden">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div
              className={`flex gap-2 transition-opacity duration-200 ${
                showActions ? "opacity-100" : "opacity-0 md:opacity-0"
              }`}
            >
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="编辑笔记"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(note.uuid)}
                className="p-1 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label="删除笔记"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {backlinks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                被引用 ({backlinks.length})
              </h4>
              <div className="space-y-3">
                {backlinks.map((backlinkNote) => (
                  <button
                    key={`backlink-${backlinkNote.uuid}`}
                    onClick={() => onNoteClick(backlinkNote.uuid)}
                    className="w-full text-left group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {backlinkNote.content}
                      </p>
                      <LinkIcon
                        size={16}
                        className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-1 flex-shrink-0"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NoteCard;
