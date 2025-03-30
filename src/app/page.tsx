"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PlusCircle,
  Search,
  List,
  X,
  Share2,
  Keyboard,
  LogOut,
  Hash,
  Filter,
  BarChart2,
  Loader2,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import NoteList from "@/components/NoteList";
import NoteGraph from "@/components/NoteGraph";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SyncStatus from "@/components/SyncStatus";
import LoginPage from "@/components/LoginPage";
import { useNotes } from "@/hooks/useNotes";
import { AuthService, AUTH_EVENTS } from "@/services/AuthService";
import Stats from "@/components/Stats";
import "./index.css";

function App() {
  // 状态定义...
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    syncStatus,
    activityData,
    triggerSync,
  } = useNotes();
  const [showInput, setShowInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [focusNoteUuid, setFocusNoteUuid] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 处理关闭关系图时清除焦点笔记
  const handleCloseGraph = useCallback(() => {
    setShowGraph(false);
    setFocusNoteUuid(null);
  }, []);

  // 处理登录态过期
  const handleAuthError = useCallback(() => {
    setIsAuthenticated(false);
    toast.error("登录已过期，请重新登录");
  }, []);

  // 在组件挂载后初始化客户端状态
  useEffect(() => {
    setMounted(true);

    // 确保拦截器已设置
    AuthService.setupAxiosInterceptors();

    // 初始化认证状态
    const initAuth = async () => {
      setIsAuthenticating(true);
      const isAuth = AuthService.isAuthenticated();

      if (isAuth) {
        // 如果有token，验证它是否有效
        const isValid = await AuthService.validateToken();
        setIsAuthenticated(isValid);

        if (!isValid) {
          toast.error("登录已过期，请重新登录");
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthenticating(false);
    };

    initAuth();

    // 添加自定义事件监听器
    const handleCloseNoteGraph = () => {
      handleCloseGraph();
    };

    // 监听关系图关闭事件
    window.addEventListener("closeNoteGraph", handleCloseNoteGraph);

    // 监听认证事件
    window.addEventListener(AUTH_EVENTS.AUTH_ERROR, handleAuthError);
    window.addEventListener(AUTH_EVENTS.AUTH_LOGOUT, handleAuthError);

    // 清理函数
    return () => {
      window.removeEventListener("closeNoteGraph", handleCloseNoteGraph);
      window.removeEventListener(AUTH_EVENTS.AUTH_ERROR, handleAuthError);
      window.removeEventListener(AUTH_EVENTS.AUTH_LOGOUT, handleAuthError);
    };
  }, [handleCloseGraph, handleAuthError]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "/":
            e.preventDefault();
            setShowTagFilter(true);
            break;
          case "m":
            e.preventDefault();
            setShowInput(true);
            break;
          case "g":
            e.preventDefault();
            setShowGraph(!showGraph);
            break;
          case "k":
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
          case "f":
            e.preventDefault();
            setShowTagFilter((prev) => !prev);
            break;
          case "s":
            e.preventDefault();
            setShowStats(!showStats);
            setShowGraph(false);
            break;
        }
      }
    },
    [showGraph, showStats]
  );

  useEffect(() => {
    if (!mounted) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, mounted]);

  const handleLogout = useCallback(() => {
    AuthService.logout();
    setIsAuthenticated(false);
  }, []);

  const handleNoteClick = useCallback((uuid: string) => {
    // 查找目标笔记元素
    const element = document.querySelector(`[data-note-uuid="${uuid}"]`);

    if (element) {
      // 添加高亮动画效果
      element.classList.add("highlight-note");

      // 滚动到目标元素
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // 3秒后移除高亮效果
      setTimeout(() => {
        element.classList.remove("highlight-note");
      }, 3000);
    }
  }, []);

  // 添加处理标签点击的函数
  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === "" ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesTag = selectedTag === null || note.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const allTags = useMemo(
    () => Array.from(new Set(notes.flatMap((note) => note.tags))).sort(),
    [notes]
  );

  // 处理显示单个笔记的关系图
  const handleShowRelationGraph = useCallback((noteUuid: string) => {
    setFocusNoteUuid(noteUuid);
    setShowGraph(true);
  }, []);

  // 在客户端渲染完成前不显示内容
  if (!mounted) {
    return null;
  }

  // 显示加载状态
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 flex items-center justify-center mb-6 shadow-sm">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 3V5H12V9H9V21H7V9H4V5H7V3H9Z" fill="white" />
            <path
              d="M14 3V15H11V19H15V21H11V19H13V17H14V15H17V13H14V3H16V13H19V15H16V17H15V19H17V21H15V19H19V17H20V13H17V3H14Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-3">
            <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
            <p className="text-gray-700 font-medium">验证登录中...</p>
          </div>
          <div className="h-1 w-48 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors flex flex-col">
      <Toaster position="top-right" />

      {/* 顶部导航栏 - 简洁风格 */}
      <header className="py-3 px-4 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* 左侧：应用名称和LOGO */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 flex items-center justify-center mr-3 shadow-sm">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 3V5H12V9H9V21H7V9H4V5H7V3H9Z" fill="white" />
                <path
                  d="M14 3V15H11V19H15V21H11V19H13V17H14V15H17V13H14V3H16V13H19V15H16V17H15V19H17V21H15V19H19V17H20V13H17V3H14Z"
                  fill="white"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              My Note
            </h1>
          </div>

          {/* 中间：搜索框 */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索笔记内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 bg-gray-100 border-0 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-300"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 右侧：功能按钮 */}
          <div className="flex items-center gap-2">
            {/* 标签筛选按钮 */}
            <button
              onClick={() => setShowTagFilter(!showTagFilter)}
              aria-label="筛选"
              className={`relative rounded-xl p-2 ${
                showTagFilter
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Filter size={20} />
              {allTags.length > 0 && !showTagFilter && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
              )}
            </button>

            {/* 统计按钮 */}
            <button
              onClick={() => {
                setShowStats(!showStats);
                if (!showStats) setShowGraph(false);
              }}
              aria-label="查看统计"
              className={`rounded-xl p-2 ${
                showStats
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              title="⌘S"
            >
              <BarChart2 size={20} />
            </button>

            <button
              onClick={() => {
                setShowGraph(!showGraph);
                if (!showGraph) setShowStats(false);
              }}
              aria-label="切换视图"
              className={`rounded-xl p-2 ${
                showGraph
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {showGraph ? <List size={20} /> : <Share2 size={20} />}
            </button>

            {/* 新建笔记按钮 */}
            <button
              onClick={() => setShowInput(true)}
              className="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              title="⌘M"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline font-medium">新建笔记</span>
            </button>
          </div>
        </div>
      </header>

      {/* 标签筛选区 - 悬浮卡片样式，仅在展开时显示 */}
      {showTagFilter && (
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">标签筛选</h3>
              <button
                onClick={() => setShowTagFilter(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 py-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                全部
              </button>

              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    selectedTag === tag
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Hash size={14} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 - 占满剩余空间 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* 当前视图标题和状态 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {showStats ? "" : selectedTag ? `#${selectedTag}` : "所有笔记"}
            </h2>
            {selectedTag && !showStats && (
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-xl"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* 视图切换器 - 隐藏统计视图下的切换器 */}
          {!showStats && (
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setShowGraph(false)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !showGraph
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                列表视图
              </button>
              <button
                onClick={() => setShowGraph(true)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  showGraph
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                关系图
              </button>
            </div>
          )}
        </div>

        {/* 笔记内容区 */}
        {showStats ? (
          <Stats notes={notes} activityData={activityData} darkMode={false} />
        ) : showGraph ? (
          <div className="h-[calc(100vh-8rem)]">
            <NoteGraph
              notes={notes}
              onNodeClick={handleNoteClick}
              darkMode={false}
              onTagClick={handleTagClick}
              focusNoteUuid={focusNoteUuid}
            />
            <button
              onClick={handleCloseGraph}
              className="fixed bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              aria-label="关闭图谱视图"
            >
              <List size={24} />
            </button>
          </div>
        ) : (
          <div>
            <NoteList
              notes={filteredNotes}
              allNotes={notes}
              showInput={showInput}
              onNoteAdd={addNote}
              onNoteUpdate={updateNote}
              onNoteDelete={deleteNote}
              onInputClose={() => setShowInput(false)}
              onNoteClick={handleNoteClick}
              onTagClick={handleTagClick}
              onShowRelationGraph={handleShowRelationGraph}
            />
          </div>
        )}
      </main>

      {/* 工具栏 - 同步状态和设置 - 固定在右下角 */}
      <div className="fixed right-6 bottom-6 flex flex-col items-end gap-2 z-10">
        <SyncStatus status={syncStatus} onSyncRequest={triggerSync} />

        <button
          onClick={() => setShowKeyboardShortcuts(true)}
          className="p-2.5 rounded-xl bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200 transition-colors"
          aria-label="键盘快捷键"
        >
          <Keyboard size={20} className="text-indigo-600" />
        </button>

        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200 transition-colors"
          aria-label="退出登录"
        >
          <LogOut size={20} className="text-red-600" />
        </button>
      </div>

      {/* 键盘快捷键模态框 */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* 移动端搜索框 */}
      <div className="sm:hidden fixed bottom-6 left-6 right-24 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
