import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Share2,
  Keyboard,
  LogOut,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import NoteList from "./components/NoteList";
import NoteGraph from "./components/NoteGraph";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import SyncStatus from "./components/SyncStatus";
import LoginPage from "./components/LoginPage";
import { useNotes } from "./hooks/useNotes";
import { AuthService } from "./services/AuthService";
// import { getActivityData } from "./utils/stats";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    AuthService.isAuthenticated()
  );
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    syncStatus,
    activityData,
    totalDays,
  } = useNotes();
  const [showInput, setShowInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [showGraph, setShowGraph] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "/":
            e.preventDefault();
            setShowSearch(true);
            break;
          case "m":
            e.preventDefault();
            setShowInput(true);
            break;
          case "g":
            e.preventDefault();
            setShowGraph((prev) => !prev);
            break;
          case "b":
            e.preventDefault();
            setSidebarOpen((prev) => !prev);
            break;
          case "d":
            e.preventDefault();
            setDarkMode((prev) => !prev);
            break;
          case "k":
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
  };

  const handleNoteClick = (uuid: string) => {
    const element = document.querySelector(`[data-note-uuid="${uuid}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

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

  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags))
  ).sort();

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors`}
    >
      <Toaster position="top-right" />
      <Sidebar
        notes={notes}
        tags={allTags}
        activityData={activityData}
        totalDays={totalDays}
        selectedTag={selectedTag}
        onTagSelect={(tag) => {
          setSelectedTag(tag);
          if (window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        darkMode={darkMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "md:pl-80" : "pl-0"
        }`}
      >
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="切换侧边栏"
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {showSearch ? (
                  <div className="relative w-full md:w-96">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="搜索笔记..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      autoFocus
                      onBlur={() => {
                        if (!searchTerm) {
                          setShowSearch(false);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Search size={20} />
                  </button>
                )}

                <div className="hidden md:relative md:block md:w-96">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="搜索笔记..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SyncStatus status={syncStatus} />

                <button
                  onClick={() => setShowGraph(!showGraph)}
                  className="hidden md:block p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="切换关系图视图"
                  title="⌘G"
                >
                  <Share2 size={20} />
                </button>

                <button
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className="hidden md:block p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="显示快捷键"
                  title="⌘K"
                >
                  <Keyboard size={20} />
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="切换暗色模式"
                  title="⌘D"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="退出登录"
                >
                  <LogOut size={20} />
                </button>

                <button
                  onClick={() => setShowInput(true)}
                  className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  title="⌘M"
                >
                  <PlusCircle size={20} />
                  <span className="hidden md:inline">新建笔记</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {showGraph ? (
            <NoteGraph
              notes={notes}
              onNodeClick={handleNoteClick}
              darkMode={darkMode}
            />
          ) : (
            <NoteList
              notes={filteredNotes}
              allNotes={notes}
              showInput={showInput}
              onNoteAdd={addNote}
              onNoteUpdate={updateNote}
              onNoteDelete={deleteNote}
              onInputClose={() => setShowInput(false)}
              onNoteClick={handleNoteClick}
            />
          )}
        </main>
      </div>

      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
}

export default App;
