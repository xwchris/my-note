import React, { useState, useRef, useEffect } from "react";
import { X, Hash, Save } from "lucide-react";
import toast from "react-hot-toast";

interface NoteInputProps {
  onSubmit: (content: string, tags: string[]) => void;
  onCancel: () => void;
}

function NoteInput({ onSubmit, onCancel }: NoteInputProps) {
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 自动聚焦到文本区域
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    } else if (e.metaKey || e.ctrlKey) {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      // 当标签输入框为空且按下退格键时，删除最后一个标签
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("请输入笔记内容");
      return;
    }
    onSubmit(content.trim(), tags);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 笔记内容输入区 */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="写下你的想法..."
            className="w-full min-h-[200px] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none"
            style={{ fontSize: "16px", lineHeight: "1.6" }}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500 dark:text-gray-400">
            {content.length} 字
          </div>
        </div>

        {/* 标签输入区 */}
        <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Hash size={16} className="text-gray-400" />
          {tags.map((tag) => (
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
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? "添加标签..." : ""}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* 操作按钮区 */}
        <div className="flex justify-end items-center gap-3 pt-2">
          <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
            按 ⌘ + Enter 保存，Esc 取消
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            保存笔记
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteInput;
