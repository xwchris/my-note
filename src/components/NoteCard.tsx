import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Edit2,
  X,
  Check,
  Link as LinkIcon,
  Calendar,
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
  onTagClick?: (tag: string) => void;
}

function NoteCard({
  note,
  allNotes,
  onUpdate,
  onDelete,
  onNoteClick,
  onTagClick,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState<string[]>(note.tags);
  const [editLinks, setEditLinks] = useState<string[]>(note.links || []);
  const [tagInput, setTagInput] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.style.height = "auto";
      editTextareaRef.current.style.height =
        editTextareaRef.current.scrollHeight + "px";
    }
  }, [isEditing, editContent]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSave();
    }
  };

  // Get linked notes (outgoing references)
  const linkedNotes = allNotes.filter(
    (n) => n.deleted === 0 && editLinks.includes(n.uuid)
  );

  // Get backlinks (incoming references)
  const backlinks = allNotes.filter(
    (n) => n.deleted === 0 && (n.links || []).includes(note.uuid)
  );

  // 处理标签点击
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden"
      onKeyDown={handleKeyDown}
      data-note-uuid={note.uuid}
    >
      {/* 卡片主体内容 */}
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-4">
            {/* 编辑区域 */}
            <textarea
              ref={editTextareaRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="写下你的想法..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none transition-all duration-200"
              style={{ minHeight: "120px" }}
            />

            {/* 标签编辑区 */}
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <Hash size={16} className="text-gray-400" />
              {editTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm"
                >
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
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="添加标签..."
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* 链接编辑区 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LinkIcon size={16} />
                <span>添加链接</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                >
                  <Check size={16} />
                  保存
                </button>
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

            {/* 已添加的链接列表 */}
            {linkedNotes.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  已添加的链接
                </h4>
                <div className="space-y-2">
                  {linkedNotes.map((linkedNote) => (
                    <div
                      key={linkedNote.uuid}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 group/linkitem hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <button
                        onClick={() => onNoteClick(linkedNote.uuid)}
                        className="text-sm text-gray-700 dark:text-gray-300 truncate text-left flex-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span className="line-clamp-1">
                          {linkedNote.content}
                        </span>
                      </button>
                      <button
                        onClick={() => removeLink(linkedNote.uuid)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2"
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
            {/* 展示模式 */}
            <div className="relative group">
              {/* 笔记内容 */}
              <div className="prose prose-lg dark:prose-invert max-w-none mb-4">
                <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                  {note.content}
                </p>
              </div>

              {/* 标签展示 */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={(e) => handleTagClick(tag, e)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-100 transition-colors"
                    >
                      <Hash size={14} />
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* 链接展示 */}
              {linkedNotes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    链接 ({linkedNotes.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {linkedNotes.map((linkedNote) => (
                      <button
                        key={linkedNote.uuid}
                        onClick={() => onNoteClick(linkedNote.uuid)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group/link"
                      >
                        <LinkIcon
                          size={14}
                          className="text-gray-400 group-hover/link:text-indigo-500"
                        />
                        <span className="truncate max-w-[200px]">
                          {linkedNote.content}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded"
                    title="编辑笔记"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(note.uuid)}
                    className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded"
                    title="删除笔记"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 卡片底部信息 */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{formatDate(note.createdAt)}</span>
            </div>
            {backlinks.length > 0 && (
              <button
                onClick={() =>
                  document
                    .getElementById(`backlinks-${note.uuid}`)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors"
              >
                <LinkIcon size={14} />
                <span>{backlinks.length} 个引用</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 反向链接面板 */}
      {!isEditing && backlinks.length > 0 && (
        <div
          id={`backlinks-${note.uuid}`}
          className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
        >
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            被引用 ({backlinks.length})
          </h4>
          <div className="space-y-2">
            {backlinks.map((backlinkNote) => (
              <button
                key={backlinkNote.uuid}
                onClick={() => onNoteClick(backlinkNote.uuid)}
                className="w-full text-left group p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
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
    </div>
  );
}

export default NoteCard;
