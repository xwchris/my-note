import React, { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { SyncStatus as SyncStatusType } from "../types";

interface SyncStatusProps {
  status: SyncStatusType;
}

function SyncStatus({ status }: SyncStatusProps) {
  const [displayStatus, setDisplayStatus] = useState<SyncStatusType>("idle");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }

    if (status === "idle" && displayStatus !== "idle") {
      const newTimer = setTimeout(() => {
        setDisplayStatus("idle");
      }, 1000);
      setTimer(newTimer);
    } else {
      setDisplayStatus(status);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [status, timer, displayStatus]);

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
