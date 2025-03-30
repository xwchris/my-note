import React, { useMemo, useCallback, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Note } from "../types";

interface NoteGraphProps {
  notes: Note[];
  onNodeClick: (uuid: string) => void;
  darkMode: boolean;
  onTagClick?: (tag: string) => void;
}

// 笔记详情卡片组件
function NoteDetailCard({
  note,
  onClose,
  darkMode,
  onTagClick,
}: {
  note: Note;
  onClose: () => void;
  darkMode: boolean;
  onTagClick?: (tag: string) => void;
}) {
  if (!note) return null;

  // 格式化创建时间
  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "未知时间";

  // 处理标签点击
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
      onClose(); // 关闭详情卡片
    }
  };

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        ${darkMode ? "bg-gray-800" : "bg-white"} 
        rounded-xl z-50 w-full max-w-2xl max-h-[80vh] overflow-hidden`}
      style={{
        boxShadow: `0 25px 50px -12px ${
          darkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.25)"
        }`,
      }}
    >
      {/* 彩色标题栏 */}
      <div
        className={`px-6 py-4 flex justify-between items-center bg-gradient-to-r ${
          darkMode
            ? "from-indigo-800 to-purple-800 text-white"
            : "from-indigo-500 to-purple-500 text-white"
        }`}
      >
        <h2 className="text-xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          笔记详情
        </h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-white/20 flex-shrink-0"
          aria-label="关闭"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 正文内容区，可滚动 */}
      <div
        className={`p-6 overflow-y-auto custom-scrollbar ${
          darkMode ? "text-gray-100" : "text-gray-900"
        }`}
        style={{ maxHeight: "calc(80vh - 130px)" }}
      >
        {/* 时间信息 */}
        <div
          className={`inline-flex items-center px-3 py-1 mb-4 rounded-full text-sm ${
            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formattedDate}
        </div>

        {/* 笔记内容 */}
        <div
          className={`whitespace-pre-line break-words text-base leading-relaxed ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {note.content}
        </div>

        {/* 标签区域 */}
        {note.tags && note.tags.length > 0 && (
          <div className="mt-6">
            <h3
              className={`text-sm font-medium mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={(e) => handleTagClick(tag, e)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    darkMode
                      ? "bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  } transition-colors`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 相关笔记区域 */}
        {note.links && note.links.length > 0 && (
          <div className="mt-6">
            <h3
              className={`text-sm font-medium mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              相关笔记
            </h3>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-lg text-sm ${
                darkMode
                  ? "bg-blue-900/30 text-blue-200"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"
                />
              </svg>
              {note.links.length} 个关联
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 背景遮罩组件
function Overlay({ onClose }: { onClose: () => void }) {
  // 当遮罩显示时，禁止body滚动
  React.useEffect(() => {
    // 保存原始样式
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // 阻止背景滚动
    document.body.style.overflow = "hidden";

    // 组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
      onClick={onClose}
    />
  );
}

function NoteGraph({
  notes,
  onNodeClick,
  darkMode,
  onTagClick,
}: NoteGraphProps) {
  // 添加详情模态框状态
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // 处理双击节点事件
  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();
      const foundNote = notes.find((note) => note.uuid === node.id);
      if (foundNote) {
        setSelectedNote(foundNote);
      }
    },
    [notes]
  );

  // 关闭详情模态框
  const closeDetailCard = useCallback(() => {
    setSelectedNote(null);
  }, []);

  // 处理标签点击
  const handleTagClick = useCallback(
    (tag: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onTagClick) {
        onTagClick(tag);
      }
    },
    [onTagClick]
  );

  const { nodes, edges } = useMemo(() => {
    const validNotes = notes.filter((note) => note.deleted === 0);

    // 创建一个图连接映射，记录每个节点的连接数
    const connectionsMap = new Map<string, Set<string>>();
    validNotes.forEach((note) => {
      if (!connectionsMap.has(note.uuid)) {
        connectionsMap.set(note.uuid, new Set());
      }

      (note.links || []).forEach((linkUuid) => {
        if (validNotes.some((n) => n.uuid === linkUuid)) {
          // 添加双向连接
          const connections = connectionsMap.get(note.uuid);
          if (connections) {
            connections.add(linkUuid);
          }

          if (!connectionsMap.has(linkUuid)) {
            connectionsMap.set(linkUuid, new Set());
          }
          const targetConnections = connectionsMap.get(linkUuid);
          if (targetConnections) {
            targetConnections.add(note.uuid);
          }
        }
      });
    });

    // 找出孤立节点（没有连接的节点）
    const isolatedNodes = validNotes.filter(
      (note) =>
        !connectionsMap.has(note.uuid) ||
        connectionsMap.get(note.uuid)?.size === 0
    );

    // 找出连接的节点
    const connectedNodes = validNotes.filter(
      (note) =>
        connectionsMap.has(note.uuid) &&
        connectionsMap.get(note.uuid) !== undefined &&
        connectionsMap.get(note.uuid)!.size > 0
    );

    // 使用深度优先搜索找出所有连通分量（相互关联的笔记组）
    const findConnectedComponents = () => {
      const components: Note[][] = [];
      const visited = new Set<string>();

      // 深度优先搜索找出连通分量
      const dfs = (note: Note, currentComponent: Note[]) => {
        visited.add(note.uuid);
        currentComponent.push(note);

        const connections = connectionsMap.get(note.uuid);
        if (connections) {
          connections.forEach((connectionId) => {
            if (!visited.has(connectionId)) {
              const connectedNote = connectedNodes.find(
                (n) => n.uuid === connectionId
              );
              if (connectedNote) {
                dfs(connectedNote, currentComponent);
              }
            }
          });
        }
      };

      // 寻找所有连通分量
      connectedNodes.forEach((note) => {
        if (!visited.has(note.uuid)) {
          const newComponent: Note[] = [];
          dfs(note, newComponent);
          components.push(newComponent);
        }
      });

      // 按照连通分量大小排序（先显示大分量）
      return components.sort((a, b) => b.length - a.length);
    };

    const connectedComponents = findConnectedComponents();

    // 为每个连通分量构建层次关系（类似于树）
    const buildComponentHierarchy = (component: Note[]) => {
      // 找出最佳根节点（连接数最多的节点）
      const rootNode = [...component].sort((a, b) => {
        const aConnections = connectionsMap.get(a.uuid)?.size || 0;
        const bConnections = connectionsMap.get(b.uuid)?.size || 0;
        return bConnections - aConnections;
      })[0];

      // 使用BFS构建层次结构
      const hierarchy: Note[][] = [];
      const visited = new Set<string>();

      // 第一层是根节点
      hierarchy.push([rootNode]);
      visited.add(rootNode.uuid);

      // 逐层构建
      let currentLevel = 0;
      while (true) {
        const nextLevel: Note[] = [];

        // 遍历当前层的所有节点
        for (const node of hierarchy[currentLevel]) {
          const connections = connectionsMap.get(node.uuid);
          if (connections) {
            // 将所有未访问的连接节点加入下一层
            connections.forEach((connectionId) => {
              if (!visited.has(connectionId)) {
                const connectedNote = component.find(
                  (n) => n.uuid === connectionId
                );
                if (connectedNote) {
                  nextLevel.push(connectedNote);
                  visited.add(connectionId);
                }
              }
            });
          }
        }

        // 如果没有下一层，结束循环
        if (nextLevel.length === 0) break;

        // 添加下一层到层次结构
        hierarchy.push(nextLevel);
        currentLevel++;
      }

      return hierarchy;
    };

    // 使用网格布局算法，从左到右排列各连通分量
    const nodePositions = new Map<string, { x: number; y: number }>();
    const cardWidth = 240; // 卡片宽度加间距
    const cardHeight = 200; // 卡片高度加间距
    let groupXOffset = -800; // 组的起始x坐标

    // 为每个连通分量计算布局
    connectedComponents.forEach((component) => {
      // 获取该组件的层次结构
      const hierarchy = buildComponentHierarchy(component);

      // 计算该组的最大宽度，以确定占用的空间
      const maxLevelWidth = Math.max(...hierarchy.map((level) => level.length));

      // 为这个组内的节点计算位置
      hierarchy.forEach((level, levelIndex) => {
        // 计算该层的起始水平位置，使其居中
        const levelStartX =
          groupXOffset + (maxLevelWidth - level.length) * (cardWidth / 2);

        // 放置该层的每个节点
        level.forEach((note, nodeIndex) => {
          // 水平位置：从起始位置开始，按间距排列
          const x = levelStartX + nodeIndex * cardWidth;
          // 垂直位置：按层级向下增加
          const y = levelIndex * cardHeight;

          nodePositions.set(note.uuid, { x, y });
        });
      });

      // 移动到下一个组的位置
      groupXOffset += maxLevelWidth * cardWidth + 350; // 组间距增大
    });

    // 孤立节点放在最右侧，垂直排列
    if (isolatedNodes.length > 0) {
      const itemsPerColumn = 6; // 每列最多显示6个孤立节点

      isolatedNodes.forEach((note, index) => {
        const column = Math.floor(index / itemsPerColumn);
        const row = index % itemsPerColumn;

        const x = groupXOffset + column * cardWidth;
        const y = -400 + row * cardHeight;

        nodePositions.set(note.uuid, { x, y });
      });
    }

    const graphNodes: Node[] = validNotes.map((note) => {
      const pos = nodePositions.get(note.uuid) || { x: 0, y: 0 };
      // 计算连接数量以决定节点尺寸
      const connectionCount = connectionsMap.get(note.uuid)?.size || 0;

      // 找出此节点所属的组编号（用于颜色编码）
      let componentIndex = -1; // -1表示孤立节点
      if (connectionCount > 0) {
        componentIndex = connectedComponents.findIndex((component) =>
          component.some((n) => n.uuid === note.uuid)
        );
      }

      // 为每个组使用不同的颜色（循环使用一组颜色）
      const componentColors = [
        "#EF4444", // 红色
        "#F59E0B", // 橙色
        "#10B981", // 绿色
        "#3B82F6", // 蓝色
        "#6366F1", // 靛蓝色
        "#8B5CF6", // 紫色
        "#EC4899", // 粉色
      ];

      // 计算摘要和其他信息
      const createdDate = note.createdAt
        ? new Date(note.createdAt).toLocaleDateString()
        : "未知日期";

      // 设置边框颜色 - 使用组的颜色或灰色（孤立节点）
      const borderColor =
        componentIndex >= 0
          ? componentColors[componentIndex % componentColors.length]
          : "#9CA3AF";

      return {
        id: note.uuid,
        position: pos,
        style: {
          width: 220,
          minHeight: 120,
          maxHeight: 180,
          padding: "12px",
          borderRadius: "12px",
          background: darkMode
            ? "linear-gradient(to bottom, #1F2937, #111827)"
            : "linear-gradient(to bottom, #FFFFFF, #F9FAFB)",
          boxShadow: `0 4px 8px ${
            darkMode ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.1)"
          }`,
          border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
          cursor: "pointer", // 添加指针样式，提示可点击
        },
        data: {
          label: (
            <div className="overflow-hidden h-full flex flex-col">
              {/* 顶部彩色条 */}
              <div
                className="h-1 w-full mb-2 rounded"
                style={{
                  background: `linear-gradient(to right, ${borderColor}, ${borderColor}88)`,
                }}
              ></div>

              {/* 连接信息和日期 */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    connectionCount > 0
                      ? `bg-${borderColor.replace(
                          "#",
                          ""
                        )}/20 text-${borderColor.replace("#", "")}/90`
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {connectionCount > 0 ? `${connectionCount}个连接` : "无连接"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {createdDate}
                </div>
              </div>

              {/* 笔记内容预览 */}
              <div
                className={`text-sm overflow-hidden flex-grow text-left ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <div className="line-clamp-4 whitespace-pre-line break-words text-left">
                  {note.content}
                </div>
              </div>

              {/* 标签预览（如果有） */}
              {note.tags && note.tags.length > 0 && (
                <div className="mt-auto pt-2 flex flex-wrap gap-1 text-left">
                  {note.tags.slice(0, 2).map((tag, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleTagClick(tag, e)}
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {note.tags.length > 2 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          ),
          componentIndex, // 存储组信息，以便边可以使用
        },
        className: `text-left ${
          darkMode ? "dark text-gray-100" : "text-gray-900"
        } rounded-lg custom-card`,
      };
    });

    const graphEdges: Edge[] = validNotes.flatMap((note) =>
      (note.links || [])
        .filter((linkUuid) => validNotes.some((n) => n.uuid === linkUuid))
        .map((linkUuid) => {
          // 找出源节点和目标节点的分组
          const sourceNode = graphNodes.find((node) => node.id === note.uuid);
          const targetNode = graphNodes.find((node) => node.id === linkUuid);

          // 如果源节点和目标节点都有分组信息，并且属于同一个分组
          const sameComponent =
            sourceNode &&
            targetNode &&
            sourceNode.data.componentIndex >= 0 &&
            sourceNode.data.componentIndex === targetNode.data.componentIndex;

          // 根据两端节点的连接数量确定边的样式
          const sourceConnections = connectionsMap.get(note.uuid)?.size || 0;
          const targetConnections = connectionsMap.get(linkUuid)?.size || 0;
          const isImportantEdge =
            sourceConnections > 3 || targetConnections > 3;

          // 确定边的颜色 - 如果在同一分组中使用该分组的颜色
          const componentColors = [
            "#EF4444", // 红色
            "#F59E0B", // 橙色
            "#10B981", // 绿色
            "#3B82F6", // 蓝色
            "#6366F1", // 靛蓝色
            "#8B5CF6", // 紫色
            "#EC4899", // 粉色
          ];

          let edgeColor = "#9CA3AF"; // 默认灰色
          if (sameComponent && sourceNode.data.componentIndex >= 0) {
            edgeColor =
              componentColors[
                sourceNode.data.componentIndex % componentColors.length
              ];
          } else if (isImportantEdge) {
            edgeColor = "#6366F1"; // 高优先级边使用靛蓝色
          }

          // 为同一组内的连接设置曲线类型，提高可视性
          let edgeType = "default";
          if (sameComponent) {
            edgeType = "smoothstep"; // 使用平滑曲线
          }

          return {
            id: `${note.uuid}-${linkUuid}`,
            source: note.uuid,
            target: linkUuid,
            type: edgeType,
            className: darkMode ? "dark:stroke-gray-400" : "stroke-gray-400",
            animated: isImportantEdge,
            style: {
              stroke: edgeColor,
              strokeWidth: isImportantEdge ? 2 : 1,
            },
          };
        })
    );

    return { nodes: graphNodes, edges: graphEdges };
  }, [notes, darkMode, handleTagClick]);

  const [nodesState, , onNodesChange] = useNodesState(nodes);
  const [edgesState, , onEdgesChange] = useEdgesState(edges);

  const handleFitView = useCallback(() => {
    // 这里保留空实现，因为ReactFlow的fitView属性会自动处理
  }, []);

  if (notes.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">没有可显示的笔记</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        onNodeDoubleClick={handleNodeDoubleClick}
        fitView
        zoomOnScroll
        zoomOnPinch
        fitViewOptions={{ padding: 0.3 }}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background
          color={darkMode ? "#374151" : "#E5E7EB"}
          className={darkMode ? "dark:stroke-gray-700" : "stroke-gray-200"}
          gap={20}
          size={1}
        />
        <Controls
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          style={{
            backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
            borderColor: darkMode ? "#374151" : "#E5E7EB",
            color: darkMode ? "#D1D5DB" : "#4B5563",
          }}
        />
        <MiniMap
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          nodeColor={darkMode ? "#374151" : "#E5E7EB"}
          maskColor={
            darkMode ? "rgba(17, 24, 39, 0.7)" : "rgba(249, 250, 251, 0.7)"
          }
          style={{
            backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
            borderColor: darkMode ? "#374151" : "#E5E7EB",
          }}
        />
        <Panel
          position="top-right"
          className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
        >
          <button
            onClick={handleFitView}
            className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            居中显示
          </button>
        </Panel>
      </ReactFlow>

      {/* 详情模态框 */}
      {selectedNote && (
        <>
          <Overlay onClose={closeDetailCard} />
          <NoteDetailCard
            note={selectedNote}
            onClose={closeDetailCard}
            darkMode={darkMode}
            onTagClick={onTagClick}
          />
        </>
      )}

      {/* 添加全局样式 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? "#1F2937" : "#F3F4F6"};
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? "#4B5563" : "#D1D5DB"};
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "#6B7280" : "#9CA3AF"};
        }
        .custom-card {
          transition: all 0.3s ease;
        }
        .custom-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px
            ${darkMode ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"};
        }
      `}</style>
    </div>
  );
}

export default NoteGraph;
