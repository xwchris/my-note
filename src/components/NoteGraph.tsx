import React, { useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Note } from "../types";

interface NoteGraphProps {
  notes: Note[];
  onNodeClick: (uuid: string) => void;
  darkMode: boolean;
}

function NoteGraph({ notes, onNodeClick, darkMode }: NoteGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const validNotes = notes.filter((note) => note.deleted === 0);

    const nodePositions = new Map<string, { x: number; y: number }>();
    const radius = Math.max(validNotes.length * 50, 300);
    const centerX = 0;
    const centerY = 0;

    validNotes.forEach((note, index) => {
      const angle = (2 * Math.PI * index) / validNotes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions.set(note.uuid, { x, y });
    });

    const graphNodes: Node[] = validNotes.map((note) => {
      const pos = nodePositions.get(note.uuid) || { x: 0, y: 0 };
      return {
        id: note.uuid,
        position: pos,
        data: {
          label:
            note.content.slice(0, 30) + (note.content.length > 30 ? "..." : ""),
        },
        className: `${
          darkMode ? "dark" : ""
        } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm`,
      };
    });

    const graphEdges: Edge[] = validNotes.flatMap((note) =>
      (note.links || [])
        .filter((linkUuid) => validNotes.some((n) => n.uuid === linkUuid))
        .map((linkUuid) => ({
          id: `${note.uuid}-${linkUuid}`,
          source: note.uuid,
          target: linkUuid,
          className: darkMode ? "dark:stroke-gray-400" : "stroke-gray-400",
          animated: true,
          style: { stroke: darkMode ? "#9CA3AF" : "#9CA3AF" },
        }))
    );

    return { nodes: graphNodes, edges: graphEdges };
  }, [notes, darkMode]);

  const [nodesState, , onNodesChange] = useNodesState(nodes);
  const [edgesState, , onEdgesChange] = useEdgesState(edges);

  if (notes.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">没有可显示的笔记</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-12rem)] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        fitView
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Background
          color={darkMode ? "#374151" : "#E5E7EB"}
          className={darkMode ? "dark:stroke-gray-700" : "stroke-gray-200"}
        />
        <Controls
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          style={{
            backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
            borderColor: darkMode ? "#374151" : "#E5E7EB",
            color: darkMode ? "#D1D5DB" : "#4B5563",
          }}
          // style={{
          //   button: {
          //     backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
          //     borderColor: darkMode ? "#374151" : "#E5E7EB",
          //     color: darkMode ? "#D1D5DB" : "#4B5563",
          //   },
          // }}
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
      </ReactFlow>
    </div>
  );
}

export default NoteGraph;
