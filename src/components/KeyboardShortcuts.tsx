import React, { useEffect } from "react";
import { X } from "lucide-react";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "⌘/", description: "聚焦搜索" },
    { key: "⌘M", description: "新建笔记" },
    { key: "⌘G", description: "切换视图" },
    { key: "⌘K", description: "显示快捷键" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            键盘快捷键
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map(({ key, description }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-300">
                  {description}
                </span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded">
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcuts;
