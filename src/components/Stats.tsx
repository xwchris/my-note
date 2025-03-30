import React, { useMemo } from "react";
import { Note, ActivityData } from "../types";
import {
  BarChart2,
  Calendar,
  Hash,
  Tag,
  Clock,
  Link,
  FileText,
  TrendingUp,
  Bookmark,
  Calendar as CalendarIcon,
  Activity,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
);

interface StatsProps {
  notes: Note[];
  activityData: ActivityData[];
  darkMode: boolean;
}

function Stats({ notes, activityData, darkMode }: StatsProps) {
  // 1. 计算基础统计数据
  const statsData = useMemo(() => {
    const validNotes = notes.filter((note) => note.deleted === 0);

    // 计算标签统计
    const tagMap = new Map<string, number>();
    let totalTags = 0;

    validNotes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        totalTags++;
      });
    });

    // 按使用次数排序的标签
    const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);

    // 计算链接统计
    const notesWithLinks = validNotes.filter(
      (note) => note.links && note.links.length > 0
    );
    const totalLinks = validNotes.reduce(
      (sum, note) => sum + (note.links?.length || 0),
      0
    );

    // 时间统计
    const creationDates = validNotes.map((note) => new Date(note.createdAt));
    const oldestNote =
      creationDates.length > 0
        ? new Date(Math.min(...creationDates.map((d) => d.getTime())))
        : null;
    const newestNote =
      creationDates.length > 0
        ? new Date(Math.max(...creationDates.map((d) => d.getTime())))
        : null;

    // 计算创建日期分布
    const creationByMonth = new Map<string, number>();
    creationDates.forEach((date) => {
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      creationByMonth.set(monthKey, (creationByMonth.get(monthKey) || 0) + 1);
    });

    // 计算内容长度分析
    const contentLengths = validNotes.map((note) => note.content.length);
    const totalContentLength = contentLengths.reduce(
      (sum, len) => sum + len,
      0
    );
    const averageContentLength = validNotes.length
      ? Math.round(totalContentLength / validNotes.length)
      : 0;
    const maxContentLength = contentLengths.length
      ? Math.max(...contentLengths)
      : 0;
    const minContentLength = contentLengths.length
      ? Math.min(...contentLengths)
      : 0;

    // 计算连接性最强的笔记（拥有最多连接的）
    const mostConnectedNotes = [...validNotes]
      .sort((a, b) => (b.links?.length || 0) - (a.links?.length || 0))
      .slice(0, 5);

    // 计算使用的不同标签数量
    const uniqueTagsCount = tagMap.size;

    // 计算每个笔记平均标签数
    const avgTagsPerNote = validNotes.length
      ? totalTags / validNotes.length
      : 0;

    // 计算笔记长度分布
    const lengthDistribution = {
      short: validNotes.filter((note) => note.content.length < 100).length,
      medium: validNotes.filter(
        (note) => note.content.length >= 100 && note.content.length < 500
      ).length,
      long: validNotes.filter((note) => note.content.length >= 500).length,
    };

    return {
      totalNotes: validNotes.length,
      totalTags: totalTags,
      uniqueTagsCount,
      avgTagsPerNote,
      topTags: sortedTags.slice(0, 10),
      notesWithLinks: notesWithLinks.length,
      notesWithoutLinks: validNotes.length - notesWithLinks.length,
      totalLinks,
      avgLinksPerNote: validNotes.length ? totalLinks / validNotes.length : 0,
      oldestNote,
      newestNote,
      avgContentLength: averageContentLength,
      maxContentLength,
      minContentLength,
      mostConnectedNotes,
      activityByMonth: Array.from(creationByMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12), // 最近12个月
      lengthDistribution,
    };
  }, [notes]);

  // 定义图表的配色方案
  const chartColors = useMemo(() => {
    return darkMode
      ? {
          primary: "#6366F1", // indigo-500
          secondary: "#8B5CF6", // violet-500
          tertiary: "#EC4899", // pink-500
          quaternary: "#10B981", // emerald-500
          background: "#1F2937", // gray-800
          text: "#F9FAFB", // gray-50
          grid: "#374151", // gray-700
          accent: [
            "#6366F1",
            "#8B5CF6",
            "#EC4899",
            "#10B981",
            "#F59E0B",
            "#3B82F6",
            "#EF4444",
          ],
        }
      : {
          primary: "#6366F1", // indigo-500
          secondary: "#8B5CF6", // violet-500
          tertiary: "#EC4899", // pink-500
          quaternary: "#10B981", // emerald-500
          background: "#FFFFFF", // white
          text: "#1F2937", // gray-800
          grid: "#E5E7EB", // gray-200
          accent: [
            "#6366F1",
            "#8B5CF6",
            "#EC4899",
            "#10B981",
            "#F59E0B",
            "#3B82F6",
            "#EF4444",
          ],
        };
  }, [darkMode]);

  // 格式化日期
  const formatDate = (date: Date | null) => {
    if (!date) return "暂无数据";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // 计算活跃度百分比 (最近14天有笔记的天数比例)
  const activityPercentage = useMemo(() => {
    if (!activityData || activityData.length === 0) return 0;
    const daysWithActivity = activityData.filter((d) => d.count > 0).length;
    return Math.round((daysWithActivity / activityData.length) * 100);
  }, [activityData]);

  // 准备标签分布饼图数据
  const tagChartData = useMemo(() => {
    const tagNames = statsData.topTags.slice(0, 7).map(([tag]) => tag);
    const tagCounts = statsData.topTags.slice(0, 7).map(([_, count]) => count);

    // 如果有超过7个标签，将剩余的归为"其他"类别
    if (statsData.topTags.length > 7) {
      const otherTagsCount = statsData.topTags
        .slice(7)
        .reduce((sum, [_, count]) => sum + count, 0);
      tagNames.push("其他");
      tagCounts.push(otherTagsCount);
    }

    return {
      labels: tagNames,
      datasets: [
        {
          data: tagCounts,
          backgroundColor: chartColors.accent,
          borderColor: darkMode ? "#111827" : "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [statsData.topTags, chartColors, darkMode]);

  // 准备活动数据图表
  const activityChartData = useMemo(() => {
    return {
      labels: activityData.map((item) => format(parseISO(item.date), "MM-dd")),
      datasets: [
        {
          label: "笔记数量",
          data: activityData.map((item) => item.count),
          backgroundColor: chartColors.primary,
          borderColor: chartColors.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [activityData, chartColors]);

  // 准备笔记长度分布饼图数据
  const lengthDistributionData = useMemo(() => {
    return {
      labels: ["短笔记 (<100字)", "中等长度 (100-500字)", "长笔记 (>500字)"],
      datasets: [
        {
          data: [
            statsData.lengthDistribution.short,
            statsData.lengthDistribution.medium,
            statsData.lengthDistribution.long,
          ],
          backgroundColor: [
            chartColors.accent[4],
            chartColors.accent[0],
            chartColors.accent[2],
          ],
          borderColor: darkMode ? "#111827" : "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [statsData.lengthDistribution, chartColors, darkMode]);

  // 准备月度活动图表数据
  const monthlyActivityData = useMemo(() => {
    return {
      labels: statsData.activityByMonth.map(([month]) => {
        const [year, monthNum] = month.split("-");
        return `${year}-${monthNum}`;
      }),
      datasets: [
        {
          label: "笔记数量",
          data: statsData.activityByMonth.map(([_, count]) => count),
          backgroundColor: chartColors.secondary,
          borderColor: chartColors.secondary,
          borderWidth: 1,
          tension: 0.2,
        },
      ],
    };
  }, [statsData.activityByMonth, chartColors]);

  // 图表配置选项
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: chartColors.text,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode
          ? "rgba(17, 24, 39, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
        titleColor: darkMode ? "#F9FAFB" : "#1F2937",
        bodyColor: darkMode ? "#D1D5DB" : "#4B5563",
        borderColor: darkMode ? "#374151" : "#E5E7EB",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: chartColors.grid,
        },
        ticks: {
          color: chartColors.text,
        },
      },
      y: {
        grid: {
          color: chartColors.grid,
        },
        ticks: {
          color: chartColors.text,
        },
        beginAtZero: true,
      },
    },
  };

  // 饼图配置
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: chartColors.text,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode
          ? "rgba(17, 24, 39, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
        titleColor: darkMode ? "#F9FAFB" : "#1F2937",
        bodyColor: darkMode ? "#D1D5DB" : "#4B5563",
        borderColor: darkMode ? "#374151" : "#E5E7EB",
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6 py-5">
      <div className="mb-4">
        <h2
          className={`text-xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          笔记统计
        </h2>
        <p
          className={`mt-1 text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          查看关于您笔记的有用见解和统计数据
        </p>
      </div>

      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 总笔记数卡片 */}
        <div
          className={`rounded-xl shadow-sm p-4 sm:p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                笔记总数
              </p>
              <h3
                className={`text-3xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {statsData.totalNotes}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
              <FileText size={20} />
            </div>
          </div>
          <div
            className={`text-xs mt-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            最早记录: {formatDate(statsData.oldestNote)}
          </div>
        </div>

        {/* 标签统计 */}
        <div
          className={`rounded-xl shadow-sm p-4 sm:p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                使用的标签
              </p>
              <h3
                className={`text-3xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {statsData.uniqueTagsCount}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
              <Tag size={20} />
            </div>
          </div>
          <div
            className={`text-xs mt-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            平均 {statsData.avgTagsPerNote.toFixed(1)} 标签/笔记
          </div>
        </div>

        {/* 连接统计 */}
        <div
          className={`rounded-xl shadow-sm p-4 sm:p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                笔记连接
              </p>
              <h3
                className={`text-3xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {statsData.totalLinks}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Link size={20} />
            </div>
          </div>
          <div
            className={`text-xs mt-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {statsData.notesWithLinks} 笔记包含连接 (
            {Math.round(
              (statsData.notesWithLinks / statsData.totalNotes) * 100 || 0
            )}
            %)
          </div>
        </div>

        {/* 活跃度 */}
        <div
          className={`rounded-xl shadow-sm p-4 sm:p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                近期活跃度
              </p>
              <h3
                className={`text-3xl font-bold mt-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {activityPercentage}%
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div
            className={`text-xs mt-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            最近14天的写作活跃度
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 最近活动图 */}
        <div
          className={`rounded-xl shadow-sm p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md h-auto sm:h-64 flex flex-col`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" />
              最近活动
            </div>
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-full">
              <Bar data={activityChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* 标签分布图 */}
        <div
          className={`rounded-xl shadow-sm p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md h-auto sm:h-64 flex flex-col`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Hash size={18} className="text-indigo-500" />
              标签分布
            </div>
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-4/5 h-4/5">
              <Pie
                data={tagChartData}
                options={{
                  ...pieOptions,
                  plugins: {
                    ...pieOptions.plugins,
                    legend: {
                      position: "right",
                      labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                          size: 11,
                        },
                        color: darkMode ? "#e5e7eb" : "#4b5563",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* 每月笔记趋势 */}
        <div
          className={`rounded-xl shadow-sm p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md h-auto sm:h-64 flex flex-col`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              月度趋势
            </div>
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-full">
              <Line data={monthlyActivityData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* 笔记长度分布 */}
        <div
          className={`rounded-xl shadow-sm p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md h-auto sm:h-64 flex flex-col`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              笔记长度分布
            </div>
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-4/5 h-4/5">
              <Pie
                data={lengthDistributionData}
                options={{
                  ...pieOptions,
                  plugins: {
                    ...pieOptions.plugins,
                    legend: {
                      position: "right",
                      labels: {
                        boxWidth: 12,
                        padding: 10,
                        font: {
                          size: 11,
                        },
                        color: darkMode ? "#e5e7eb" : "#4b5563",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部详细统计区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 内容长度 */}
        <div
          className={`rounded-xl shadow-sm p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              内容长度分析
            </div>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                平均长度
              </span>
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {statsData.avgContentLength} 字符
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                最短笔记
              </span>
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {statsData.minContentLength} 字符
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                最长笔记
              </span>
              <span
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {statsData.maxContentLength} 字符
              </span>
            </div>
          </div>
        </div>

        {/* 连接最多的笔记 */}
        <div
          className={`rounded-xl shadow-sm p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Link size={18} className="text-indigo-500" />
              连接最多的笔记
            </div>
          </h3>

          <div className="space-y-3">
            {statsData.mostConnectedNotes.length > 0 ? (
              statsData.mostConnectedNotes.map((note, index) => (
                <div
                  key={note.uuid}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                  title={note.content}
                >
                  <div
                    className={`text-xs font-medium rounded-full w-6 h-6 shrink-0 flex items-center justify-center ${
                      index < 3
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div
                    className={`flex-1 text-sm truncate ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {note.content.slice(0, 35)}
                    {note.content.length > 35 ? "..." : ""}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 shrink-0 rounded-full font-medium ${
                      darkMode
                        ? "bg-indigo-900/30 text-indigo-300"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {note.links?.length || 0} 连接
                  </div>
                </div>
              ))
            ) : (
              <div
                className={`text-center py-6 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                暂无连接数据
              </div>
            )}
          </div>
        </div>

        {/* 时间统计 */}
        <div
          className={`rounded-xl shadow-sm p-5 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } border transition-all hover:shadow-md`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" />
              时间统计
            </div>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                最早笔记日期
              </span>
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {formatDate(statsData.oldestNote)}
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                最新笔记日期
              </span>
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {formatDate(statsData.newestNote)}
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                近两周记录天数
              </span>
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {activityData.filter((d) => d.count > 0).length} 天
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
