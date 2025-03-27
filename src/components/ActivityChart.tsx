import React from 'react';
import { ActivityData } from '../types';

interface ActivityChartProps {
  data: ActivityData[];
  darkMode: boolean;
}

function ActivityChart({ data, darkMode }: ActivityChartProps) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="flex items-end h-24 gap-1">
      {data.map((item, index) => (
        <div
          key={index}
          className={`flex-1 ${darkMode ? 'bg-indigo-400 hover:bg-indigo-500' : 'bg-indigo-200 hover:bg-indigo-300'} rounded-t transition-all duration-300`}
          style={{
            height: `${(item.count / maxCount) * 100}%`,
            minHeight: item.count > 0 ? '4px' : '0',
          }}
          title={`${item.date}: ${item.count} 条笔记`}
        />
      ))}
    </div>
  );
}

export default ActivityChart;