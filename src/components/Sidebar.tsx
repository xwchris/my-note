import React, { useState } from "react";
import {
  Hash,
  BarChart2,
  Calendar,
  Tag as TagIcon,
  X,
  Home,
  ChevronRight,
  Star,
  Clock,
  PlusCircle,
  Search,
  Settings,
  BookOpen,
} from "lucide-react";
import { Note, ActivityData } from "../types";
import ActivityChart from "./ActivityChart";

interface SidebarProps {
  notes: Note[];
  tags: string[];
  activityData: ActivityData[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({
  notes,
  tags,
  activityData,
  selectedTag,
  onTagSelect,
  darkMode,
  isOpen,
  onClose,
}: SidebarProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [searchTag, setSearchTag] = useState("");
  const [activeSection, setActiveSection] = useState<"home" | "tags" | "stats">(
    "home"
  );

  // 计算标签计数
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = notes.filter((note) => note.tags.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  // 过滤出最常用的标签（排名前5）
  const topTags = [...tags]
    .sort((a, b) => tagCounts[b] - tagCounts[a])
    .slice(0, 5);

  // 根据搜索过滤标签
  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(searchTag.toLowerCase())
  );

  // 计算统计信息
  const daysWithNotes = new Set(
    notes.map((note) => new Date(note.createdAt).toISOString().split("T")[0])
  ).size;

  const totalTagsUsed = notes.reduce((acc, note) => acc + note.tags.length, 0);

  // 计算最近7天的笔记数量
  const last7DaysNotes = notes.filter((note) => {
    const noteDate = new Date(note.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - noteDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out z-30 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-80`}
      >
        {/* 侧边栏头部 */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen
              className="text-indigo-600 dark:text-indigo-400"
              size={22}
            />
            思绪笔记
          </h1>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 侧边栏导航按钮 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 p-3 text-center transition-colors ${
              activeSection === "home"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("home")}
          >
            <Home size={18} className="mx-auto mb-1" />
            <span className="text-xs font-medium">主页</span>
          </button>
          <button
            className={`flex-1 p-3 text-center transition-colors ${
              activeSection === "tags"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("tags")}
          >
            <TagIcon size={18} className="mx-auto mb-1" />
            <span className="text-xs font-medium">标签</span>
          </button>
          <button
            className={`flex-1 p-3 text-center transition-colors ${
              activeSection === "stats"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("stats")}
          >
            <BarChart2 size={18} className="mx-auto mb-1" />
            <span className="text-xs font-medium">统计</span>
          </button>
        </div>

        {/* 侧边栏内容区 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeSection === "home" && (
            <div className="space-y-6">
              {/* 最近概览卡片 */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Star className="text-amber-500 mr-2" size={18} />
                  快速概览
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      全部笔记
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {notes.length}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      近7天
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {last7DaysNotes}
                    </p>
                  </div>
                </div>
              </div>

              {/* 快速访问 */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider px-1">
                  快速访问
                </h2>
                <div className="space-y-1">
                  <button
                    onClick={() => onTagSelect(null)}
                    className="w-full flex items-center p-2 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Home
                      size={18}
                      className="mr-3 text-indigo-600 dark:text-indigo-400"
                    />
                    所有笔记
                    <span className="ml-auto bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
                      {notes.length}
                    </span>
                  </button>
                  <button className="w-full flex items-center p-2 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Clock
                      size={18}
                      className="mr-3 text-green-600 dark:text-green-400"
                    />
                    最近编辑
                  </button>
                  <button className="w-full flex items-center p-2 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Star size={18} className="mr-3 text-amber-500" />
                    收藏笔记
                  </button>
                </div>
              </div>

              {/* 常用标签 */}
              {topTags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                      常用标签
                    </h2>
                    <button
                      onClick={() => setActiveSection("tags")}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      查看全部
                    </button>
                  </div>
                  <div className="space-y-1">
                    {topTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagSelect(tag)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                          selectedTag === tag
                            ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="flex items-center">
                          <Hash
                            size={16}
                            className="mr-2 text-gray-500 dark:text-gray-400"
                          />
                          {tag}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          {tagCounts[tag]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "tags" && (
            <div className="space-y-4">
              {/* 标签搜索 */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="搜索标签..."
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-300 dark:focus:ring-indigo-600 focus:border-indigo-300 dark:focus:border-indigo-600"
                />
              </div>

              {/* 标签列表 */}
              <div>
                <button
                  onClick={() => onTagSelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTag === null
                      ? "bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  所有笔记
                  <span className="float-right text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {notes.length}
                  </span>
                </button>

                <div className="mt-3 space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagSelect(tag)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          selectedTag === tag
                            ? "bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="flex items-center truncate">
                          <Hash size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{tag}</span>
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                          {tagCounts[tag]}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      没有找到标签
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "stats" && (
            <div className="space-y-5">
              {/* 统计卡片 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
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
                <div className="flex flex-col p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <TagIcon
                      className="text-indigo-600 dark:text-indigo-400"
                      size={16}
                    />
                    <span>标签</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {tags.length}
                  </span>
                </div>
                <div className="flex flex-col p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
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

              {/* 活动图表 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                  <BarChart2
                    className="text-indigo-600 dark:text-indigo-400"
                    size={18}
                  />
                  <span>活动记录</span>
                </h3>
                <ActivityChart data={activityData} darkMode={darkMode} />
              </div>

              {/* 标签使用分布 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                  <TagIcon
                    className="text-indigo-600 dark:text-indigo-400"
                    size={18}
                  />
                  <span>标签使用</span>
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {topTags.map((tag) => (
                    <div key={tag} className="flex items-center">
                      <span className="truncate text-sm text-gray-700 dark:text-gray-200 mr-2 flex-grow-0 min-w-[80px] max-w-[120px]">
                        {tag}
                      </span>
                      <div className="flex-grow bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                          style={{
                            width: `${(tagCounts[tag] / notes.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {tagCounts[tag]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 侧边栏底部 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors">
            <Settings size={16} />
            <span className="text-sm font-medium">设置</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
