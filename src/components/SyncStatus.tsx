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
  }, [status]);

  if (displayStatus === "idle") return null;

  const statusConfig = {
    syncing: {
      text: "text-gray-500 dark:text-gray-400",
      message: "正在同步...",
      icon: <ArrowUpDown className="animate-pulse" size={14} />,
    },
    error: {
      text: "text-red-500 dark:text-red-400",
      message: "同步失败",
      icon: <ArrowUpDown size={14} />,
    },
    offline: {
      text: "text-gray-500 dark:text-gray-400",
      message: "离线模式",
      icon: <ArrowUpDown size={14} />,
    },
  };

  const config = statusConfig[displayStatus];

  return (
    <div className={`flex items-center gap-1 text-xs ${config.text}`}>
      {config.icon}
      <span>{config.message}</span>
    </div>
  );
}

export default SyncStatus;
