import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Maximize, Minimize, Plus, Link, ZoomIn } from "lucide-react";
import { Note } from "../types";
import dynamic from "next/dynamic";

import "@excalidraw/excalidraw/index.css";

// 动态导入Excalidraw组件避免SSR问题
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">加载思维导图中...</p>
      </div>
    ),
  }
);

// 为TypeScript类型定义
type ExcalidrawElement = any;
type AppState = any;
type ExcalidrawImperativeAPI = any;

interface ExcalidrawGraphProps {
  notes: Note[];
  onNodeClick?: (noteId: string) => void;
  darkMode?: boolean;
}

const ExcalidrawGraph: React.FC<ExcalidrawGraphProps> = ({
  notes,
  onNodeClick,
  darkMode = false,
}) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<Note[]>(notes);
  const sceneElementsRef = useRef<ExcalidrawElement[]>([]);

  // 避免每次渲染重新创建函数
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  // 优化缩放函数 - 使用useCallback避免重新创建
  const zoomToFit = useCallback(() => {
    if (excalidrawAPI) {
      excalidrawAPI.scrollToContent(undefined, {
        zoom: true,
        fitToContent: true,
      });
    }
  }, [excalidrawAPI]);

  // 当笔记变化时更新引用，避免不必要的重复处理
  useEffect(() => {
    // 只有当notes真正变化时才更新
    if (JSON.stringify(notesRef.current) !== JSON.stringify(notes)) {
      notesRef.current = notes;

      // 延迟缩放操作，避免频繁缩放
      if (excalidrawAPI && !isInitialLoad) {
        const timer = setTimeout(() => {
          zoomToFit();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [notes, excalidrawAPI, isInitialLoad, zoomToFit]);

  // 使用useMemo缓存元素生成，只有在依赖项变化时才重新计算
  const generateElements = useMemo(() => {
    if (!notes || notes.length === 0) return [];

    // 过滤活跃笔记
    const activeNotes = notes.filter((note) => note.deleted === 0);
    if (activeNotes.length === 0) return [];

    // 为了性能，建立笔记查找映射
    const noteMap = new Map<string, Note>();
    activeNotes.forEach((note) => noteMap.set(note.uuid, note));

    let elements: ExcalidrawElement[] = [];
    let nodeMap: Record<
      string,
      { x: number; y: number; width: number; height: number }
    > = {};

    // 优化布局参数，更紧凑而且避免重叠
    const centerX = 2000;
    const centerY = 1500;

    // 根据笔记数量动态调整半径
    const baseRadius = 600;
    const notesPerRing = 12; // 每个环最多放置的笔记数

    // 计算需要多少个环
    const numRings = Math.ceil(activeNotes.length / notesPerRing);
    const ringSpacing = 350; // 环之间的间距

    // 第一步：创建节点
    activeNotes.forEach((note, index) => {
      // 确定节点在哪个环上
      const ring = Math.floor(index / notesPerRing);
      const ringSize = Math.min(
        notesPerRing,
        activeNotes.length - ring * notesPerRing
      );
      const ringIndex = index % notesPerRing;

      // 计算位置（每个环采用环形布局）
      const radius = baseRadius + ring * ringSpacing;
      const angle = (2 * Math.PI * ringIndex) / ringSize;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // 优化文本处理 - 减少字符串操作
      const contentLines = note.content.split("\n");
      const title = (contentLines[0] || "").substring(0, 30);

      let summary = "";
      if (contentLines.length > 1) {
        summary = contentLines[1].substring(0, 35);
        if (contentLines.length > 2) {
          summary += "...";
        }
      }

      // 确定颜色 - 使用简化的标签检查
      let cardColor = "#e7f5ff"; // 默认蓝色背景
      let strokeColor = darkMode ? "#adb5bd" : "#228be6";

      if (note.tags?.length > 0) {
        // 使用索引检查优化性能
        const tags = note.tags;
        if (tags.includes("重要")) {
          cardColor = "#fff5f5";
          strokeColor = darkMode ? "#ffa8a8" : "#fa5252";
        } else if (tags.includes("工作")) {
          cardColor = "#fff3bf";
          strokeColor = darkMode ? "#ffec99" : "#fab005";
        } else if (tags.includes("学习")) {
          cardColor = "#d3f9d8";
          strokeColor = darkMode ? "#8ce99a" : "#40c057";
        }
      }

      // 创建节点元素 - 改进的卡片设计
      const nodeElement = {
        id: note.uuid,
        type: "rectangle",
        x: x,
        y: y,
        width: 220,
        height: 120,
        backgroundColor: darkMode ? "#343a40" : cardColor,
        strokeColor: strokeColor,
        strokeWidth: 2,
        fillStyle: "solid",
        roundness: { type: 2, value: 12 },
      };

      // 创建文本节点
      const textElement = {
        id: `text-${note.uuid}`,
        type: "text",
        x: x + 10,
        y: y + 10,
        width: 200,
        height: 100,
        text: `${title.length > 28 ? title.substring(0, 28) + "..." : title}${
          summary ? `\n\n${summary}` : ""
        }`,
        fontSize: 16,
        fontFamily: 1,
        textAlign: "left",
        verticalAlign: "top",
        strokeColor: darkMode ? "#f8f9fa" : "#212529",
      };

      // 优化链接数量标记 - 只在真正存在链接时添加
      const linkCount = note.links?.length || 0;
      if (linkCount > 0) {
        const linkBadge = {
          id: `${note.uuid}-link-count`,
          type: "ellipse",
          x: x + 190,
          y: y + 90,
          width: 30,
          height: 30,
          backgroundColor: darkMode ? "#495057" : "#dee2e6",
          strokeColor: strokeColor,
          strokeWidth: 2,
          fillStyle: "solid",
        };

        // 链接数字文本
        const linkCountText = {
          id: `text-${note.uuid}-link-count`,
          type: "text",
          x: x + 190 + 15 - 5,
          y: y + 90 + 15 - 8,
          text: `${linkCount}`,
          fontSize: 14,
          fontFamily: 1,
          textAlign: "center",
          verticalAlign: "middle",
          strokeColor: darkMode ? "#f8f9fa" : "#212529",
        };

        elements.push(linkBadge as ExcalidrawElement);
        elements.push(linkCountText as ExcalidrawElement);
      }

      nodeMap[note.uuid] = { x, y, width: 220, height: 120 };
      elements.push(nodeElement as ExcalidrawElement);
      elements.push(textElement as ExcalidrawElement);
    });

    // 第二步：创建连接 - 优化箭头创建逻辑
    activeNotes.forEach((note) => {
      if (note.links?.length > 0) {
        // 使用Map进行快速查找
        note.links.forEach((linkedNoteId) => {
          // 确保链接的笔记存在
          if (nodeMap[linkedNoteId]) {
            const sourceNode = nodeMap[note.uuid];
            const targetNode = nodeMap[linkedNoteId];

            // 计算起始和目标点
            const startX = sourceNode.x + sourceNode.width / 2;
            const startY = sourceNode.y + sourceNode.height / 2;
            const endX = targetNode.x + targetNode.width / 2;
            const endY = targetNode.y + targetNode.height / 2;

            // 简化的箭头元素
            const arrowElement = {
              id: `arrow-${note.uuid}-${linkedNoteId}`,
              type: "arrow",
              x: startX,
              y: startY,
              width: 0,
              height: 0,
              strokeColor: darkMode ? "#adb5bd" : "#868e96",
              backgroundColor: "transparent",
              fillStyle: "hachure",
              strokeWidth: 1,
              strokeStyle: "solid",
              roughness: 0,
              opacity: 80,
              startArrowhead: null,
              endArrowhead: "arrow",
              points: [
                [0, 0],
                [endX - startX, endY - startY],
              ],
            };

            elements.push(arrowElement as ExcalidrawElement);
          }
        });
      }
    });

    // 保存当前的场景元素，用于比较更新
    sceneElementsRef.current = elements;
    return elements;
  }, [notes, darkMode]); // 只在笔记或颜色模式变化时重新计算

  // 处理节点点击事件 - 优化回调避免重新创建
  const handleChange = useCallback(
    (elements: readonly any[], appState: any) => {
      if (appState.editingElement || !onNodeClick) return;

      const selectedElements = elements.filter((el) => el.isSelected);
      if (selectedElements.length === 1) {
        const element = selectedElements[0];
        if (element.type === "rectangle" && onNodeClick) {
          onNodeClick(element.id);
        }
      }
    },
    [onNodeClick]
  );

  // 添加刷新元素的useEffect - 优化只在真正需要时刷新
  useEffect(() => {
    if (excalidrawAPI) {
      // 先获取当前元素
      const currentElements = excalidrawAPI.getSceneElements();
      // 只在颜色模式变化或元素内容变化时才更新
      const elementsChanged =
        currentElements.length !== sceneElementsRef.current.length;

      if (elementsChanged || darkMode !== excalidrawAPI.getAppState().theme) {
        // 使用定时器避免频繁更新
        const timer = setTimeout(() => {
          excalidrawAPI.updateScene({
            elements: [...sceneElementsRef.current],
            appState: {
              viewBackgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
              theme: darkMode ? "dark" : "light",
            },
          });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [darkMode, excalidrawAPI, generateElements]);

  // 当全屏模式改变时调整视图 - 减少不必要的更新
  useEffect(() => {
    if (excalidrawAPI) {
      // 使用队列定时器避免多次调用
      const timer = setTimeout(() => {
        zoomToFit();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFullScreen, excalidrawAPI, zoomToFit]);

  // 当excalidrawAPI准备好时的回调函数 - 优化初始化逻辑
  const onExcalidrawAPIReady = useCallback((api: any) => {
    setExcalidrawAPI(api);

    // API就绪后，自动缩放到内容并设置初始加载完成
    setTimeout(() => {
      api.scrollToContent(undefined, { zoom: true, fitToContent: true });
      setIsInitialLoad(false);
    }, 500);
  }, []);

  // 优化组件的初始渲染和状态更新
  const appInitialState = useMemo(
    () => ({
      viewBackgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
      theme: darkMode ? "dark" : ("light" as "dark" | "light"),
      zenModeEnabled: true,
      gridSize: undefined,
      exportWithDarkMode: darkMode,
      currentItemFontFamily: 1,
      currentItemFontSize: 16,
      currentItemTextAlign: "left",
      currentItemStrokeColor: darkMode ? "#f8f9fa" : "#212529",
      currentItemBackgroundColor: darkMode ? "#343a40" : "#e7f5ff",
      viewModeEnabled: true,
    }),
    [darkMode]
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: isFullScreen ? "100vh" : "500px",
        ...(isFullScreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1000,
              backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
            }
          : {}),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 10,
          display: "flex",
          gap: "8px",
        }}
      >
        {/* 缩放到合适大小按钮 */}
        <button
          onClick={zoomToFit}
          title="自动缩放到最佳视图"
          style={{
            padding: "8px",
            backgroundColor: darkMode ? "#343a40" : "#e9ecef",
            color: darkMode ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <ZoomIn size={16} />
        </button>

        {/* 全屏切换按钮 */}
        <button
          onClick={toggleFullScreen}
          title={isFullScreen ? "退出全屏" : "全屏显示"}
          style={{
            padding: "8px",
            backgroundColor: darkMode ? "#343a40" : "#e9ecef",
            color: darkMode ? "white" : "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

      {typeof window !== "undefined" && (
        <Excalidraw
          excalidrawAPI={onExcalidrawAPIReady}
          initialData={{
            elements: generateElements,
            appState: appInitialState,
            scrollToContent: true,
          }}
          onChange={handleChange}
          onPointerUpdate={() => {}}
          zenModeEnabled
          viewModeEnabled
          gridModeEnabled={false}
          theme={darkMode ? "dark" : "light"}
        />
      )}

      {notes.length === 0 && (
        <div
          className="empty-state-container"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: darkMode ? "#343a40" : "#f8f9fa",
            padding: "20px 30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "80%",
            maxWidth: "400px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Link
              size={48}
              style={{ color: darkMode ? "#74c0fc" : "#228be6", opacity: 0.7 }}
            />
          </div>
          <h3
            style={{
              margin: "0 0 8px 0",
              color: darkMode ? "#f8f9fa" : "#212529",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            思维导图为空
          </h3>
          <p
            style={{
              margin: "0",
              color: darkMode ? "#ced4da" : "#495057",
              fontSize: "14px",
            }}
          >
            通过在笔记中使用 [[笔记名称]] 格式创建链接，构建您的知识网络
          </p>
        </div>
      )}

      {isInitialLoad && notes.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: darkMode
              ? "rgba(33, 37, 41, 0.8)"
              : "rgba(248, 249, 250, 0.8)",
            padding: "12px 20px",
            borderRadius: "8px",
            color: darkMode ? "#f8f9fa" : "#212529",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "fadeOut 5s forwards",
          }}
        >
          正在加载并调整视图...
        </div>
      )}
    </div>
  );
};

export default ExcalidrawGraph;
