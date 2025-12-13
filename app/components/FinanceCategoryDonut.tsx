"use client";

import { useState } from "react";

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function FinanceCategoryDonut({ expenses }: { expenses: any[] }) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. Process Data
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const rawCategories = expenses.reduce((acc, e) => {
    const cat = e.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
  ];

  const categories: CategoryData[] = Object.entries(rawCategories)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([name, amount], index) => ({
      name,
      amount: amount as number,
      percentage: total > 0 ? ((amount as number) / total) * 100 : 0,
      color: COLORS[index % COLORS.length]
    }));

  // 2. Generate SVG Paths
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full overflow-hidden">
      <div className="card-body p-5">
        <h3 className="text-sm font-bold uppercase opacity-50 mb-4 text-center xl:text-left">Expense Breakdown</h3>
        
        {/* Changed layout to vertical stack for better responsiveness */}
        <div className="flex flex-col items-center gap-6 h-full">
          
          {/* Donut Chart - Constrained Size */}
          <div className="relative w-48 h-48 shrink-0">
            {total === 0 ? (
              <div className="w-full h-full rounded-full border-4 border-base-200 flex items-center justify-center text-xs opacity-40">
                No Data
              </div>
            ) : (
              <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full overflow-visible">
                {categories.map((cat, i) => {
                  const start = cumulativePercent;
                  cumulativePercent += cat.percentage / 100;
                  const end = cumulativePercent;

                  if (cat.percentage > 99.9) {
                    return (
                      <circle
                        key={cat.name}
                        cx="0"
                        cy="0"
                        r="0.8"
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth="0.4"
                      />
                    );
                  }

                  const [startX, startY] = getCoordinatesForPercent(start);
                  const [endX, endY] = getCoordinatesForPercent(end);
                  const largeArcFlag = cat.percentage > 50 ? 1 : 0;

                  return (
                    <path
                      key={cat.name}
                      d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="0.4"
                      strokeLinecap="butt"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(cat.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{ 
                        opacity: hoveredCategory && hoveredCategory !== cat.name ? 0.3 : 1,
                        strokeWidth: hoveredCategory === cat.name ? 0.45 : 0.4
                      }}
                    />
                  );
                })}
              </svg>
            )}
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold opacity-40">Total</span>
              <span className="text-lg font-bold font-mono tracking-tight">
                {/* FIX: Ensure we format currency cleanly */}
                ${total >= 1000 ? `${(total/1000).toFixed(1)}k` : total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Legend - Scrollable vertical list */}
          <div className="w-full flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-1">
              {categories.map((cat) => (
                <div 
                  key={cat.name} 
                  className={`flex justify-between items-center text-xs p-2 rounded-lg transition-colors cursor-pointer group ${hoveredCategory === cat.name ? 'bg-base-200' : 'hover:bg-base-50'}`}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                    <span className="font-medium truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="opacity-40 text-[10px]">{cat.percentage.toFixed(0)}%</span>
                    {/* FIX: Formatted output */}
                    <span className="font-mono font-bold group-hover:text-primary transition-colors">${cat.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}