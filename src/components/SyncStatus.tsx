import React, { useEffect, useState, useRef } from "react";
import { ArrowUpDown } from "lucide-react";
import { SyncStatus as SyncStatusType } from "../types";

interface SyncStatusProps {
  status: SyncStatusType;
}

function SyncStatus({ status }: SyncStatusProps) {
  const [displayStatus, setDisplayStatus] = useState<SyncStatusType>("idle");
  const displayStatusRef = useRef<SyncStatusType>(displayStatus);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 更新 ref 以跟踪最新状态
  useEffect(() => {
    displayStatusRef.current = displayStatus;
  }, [displayStatus]);

  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 状态转换逻辑
    if (status === "idle" && displayStatusRef.current !== "idle") {
      timerRef.current = setTimeout(() => {
        setDisplayStatus("idle");
      }, 1000);
    } else {
      setDisplayStatus(status);
    }

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]); // 只依赖于status属性变化

  if (displayStatus === "idle") return null;

  const statusConfig = {
    syncing: {
      text: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
      message: "正在同步...",
      icon: <ArrowUpDown className="animate-pulse" size={16} />,
    },
    error: {
      text: "text-red-600",
      bg: "bg-red-50 border-red-100",
      message: "同步失败",
      icon: <ArrowUpDown size={16} />,
    },
    offline: {
      text: "text-gray-600",
      bg: "bg-gray-50 border-gray-200",
      message: "离线模式",
      icon: <ArrowUpDown size={16} />,
    },
  };

  const config = statusConfig[displayStatus];

  return (
    <div
      className={`px-3 py-1.5 ${config.bg} rounded-xl shadow-sm flex items-center gap-2 text-xs font-medium ${config.text}`}
    >
      {config.icon}
      <span>{config.message}</span>
    </div>
  );
}

export default SyncStatus;
