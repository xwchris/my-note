import React from "react";
import { Hash, Calendar, Tag as TagIcon, X } from "lucide-react";
import type { Note, Tag } from "@/types";

interface SidebarProps {
  notes: Note[];
  tags: Tag[];
  selectedTag?: string;
  onTagSelect: (tag: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({
  notes,
  tags,
  selectedTag,
  onTagSelect,
  isOpen = false,
  onClose = () => {},
}: SidebarProps) {
  const daysWithNotes = new Set(
    notes.map((note) => new Date(note.createdAt).toISOString().split("T")[0])
  ).size;

  const totalTagsUsed = notes.reduce((acc, note) => acc + note.tags.length, 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-80`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              思绪笔记
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              统计信息
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <Hash
                      className="text-indigo-600 dark:text-indigo-400"
                      size={16}
                    />
                    <span>笔记</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {notes.length}
                  </span>
                </div>
                <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <TagIcon
                      className="text-indigo-600 dark:text-indigo-400"
                      size={16}
                    />
                    <span>标签</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {totalTagsUsed}
                  </span>
                </div>
                <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <Calendar
                      className="text-indigo-600 dark:text-indigo-400"
                      size={16}
                    />
                    <span>天</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {daysWithNotes}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              标签
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => onTagSelect("")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedTag
                    ? "bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                所有笔记
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => onTagSelect(tag.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedTag === tag.name
                      ? "bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash size={16} />
                    {tag.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {tag.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
