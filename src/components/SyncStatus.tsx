import React, { useEffect, useState, useRef } from "react";
import { ArrowUpDown, Wifi, WifiOff } from "lucide-react";
import { SyncStatus as SyncStatusType } from "../types";

interface SyncStatusProps {
  status: SyncStatusType;
  onSyncRequest?: () => void;
}

// 为状态配置添加类型定义
interface StatusConfig {
  text: string;
  bg: string;
  message: string;
  icon: React.ReactNode;
  animation?: string;
}

function SyncStatus({ status, onSyncRequest }: SyncStatusProps) {
  const [displayStatus, setDisplayStatus] = useState<SyncStatusType>("idle");
  const [showIdleText, setShowIdleText] = useState(true);
  const displayStatusRef = useRef<SyncStatusType>(displayStatus);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 更新 ref 以跟踪最新状态
  useEffect(() => {
    console.log("Status from props:", status);
    displayStatusRef.current = displayStatus;
  }, [displayStatus]);

  useEffect(() => {
    console.log("Status changed:", status);
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 确保状态有效
    const newStatus = status || "idle";

    // 直接设置显示状态
    setDisplayStatus(newStatus);

    // 如果状态刚刚变为idle，显示文字，然后设置定时器隐藏文字
    if (newStatus === "idle" && displayStatusRef.current !== "idle") {
      setShowIdleText(true);

      timerRef.current = setTimeout(() => {
        // 使用CSS过渡动画，先设置状态
        setShowIdleText(false);
      }, 1500); // 缩短为1.5秒
    } else if (newStatus !== "idle") {
      // 非idle状态下总是显示文字
      setShowIdleText(true);
    }

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  // 处理点击事件
  const handleClick = () => {
    // 只有在非同步状态下才能触发同步
    if (displayStatus !== "syncing" && onSyncRequest) {
      onSyncRequest();
    }
  };

  const statusConfig: Record<SyncStatusType, StatusConfig> = {
    syncing: {
      text: "text-indigo-600",
      bg: "bg-white",
      message: "正在同步...",
      icon: <ArrowUpDown className="animate-pulse" size={20} />,
    },
    initializing: {
      text: "text-blue-600",
      bg: "bg-white",
      message: "正在初始化...",
      icon: <ArrowUpDown className="animate-pulse" size={20} />,
    },
    error: {
      text: "text-red-600",
      bg: "bg-white",
      message: "同步失败",
      icon: <ArrowUpDown size={20} />,
    },
    offline: {
      text: "text-amber-600",
      bg: "bg-white",
      message: "离线模式",
      icon: <WifiOff size={20} />,
      animation: "animate-pulse",
    },
    idle: {
      text: "text-green-600",
      bg: "bg-white",
      message: "已连接",
      icon: <Wifi size={20} />,
    },
  };

  // 使用当前显示状态
  const config = statusConfig[displayStatus];
  console.log(displayStatus, config);

  // 如果是idle状态且不显示文字，使用更小巧的样式
  const isCompact = displayStatus === "idle" && !showIdleText;

  return (
    <div
      onClick={handleClick}
      className={`p-2.5 ${config.bg} rounded-xl shadow-sm flex items-center ${
        isCompact ? "" : "gap-2"
      } text-sm font-medium ${config.text} ${
        config.animation || ""
      } border border-gray-200 transition-all duration-300 hover:bg-gray-100 cursor-pointer`}
      title={displayStatus === "syncing" ? "正在同步" : "点击手动同步"}
    >
      {config.icon}
      <div
        style={{
          width: isCompact ? 0 : "auto",
          maxWidth: isCompact ? 0 : "80px",
          opacity: isCompact ? 0 : 1,
          transition: "all 300ms ease-in-out",
        }}
        className="overflow-hidden whitespace-nowrap"
      >
        {config.message}
      </div>
    </div>
  );
}

export default SyncStatus;
