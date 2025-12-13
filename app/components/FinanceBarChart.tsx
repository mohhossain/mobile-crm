"use client";

import { useState } from "react";

interface ChartData {
  label: string;
  revenue: number;
  expense: number;
  dateStr: string;
}

export default function FinanceBarChart({ data }: { data: ChartData[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 1. Calculate Scales
  // Find the max value to scale the Y-axis (add buffer)
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.revenue, d.expense)), 
    1000 // Minimum scale
  ) * 1.1;

  // Chart Dimensions
  const chartHeight = 250;
  const barWidthPercent = 60; // Percent of the slot width

  return (
    <div className="w-full h-[300px] relative select-none">
      {/* Y-Axis Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between text-xs text-base-content/30 pointer-events-none pb-8 pr-4">
        {[100, 75, 50, 25, 0].map((tick) => (
          <div key={tick} className="flex items-center w-full">
            <span className="w-10 text-right pr-2">
              {tick === 0 ? '0' : `${Math.round((maxValue * tick) / 100 / 1000)}k`}
            </span>
            <div className="h-px bg-base-content/5 flex-1"></div>
          </div>
        ))}
      </div>

      {/* Bars Container */}
      <div className="absolute inset-0 ml-10 pb-8 flex items-end justify-between pl-2 pr-2">
        {data.map((d, i) => {
          // Calculate heights (0% to 100%)
          const revHeight = (d.revenue / maxValue) * 100;
          const expHeight = (d.expense / maxValue) * 100;

          return (
            <div 
              key={i} 
              className="relative h-full flex flex-col justify-end group flex-1"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              
              {/* Tooltip (CSS + State) */}
              <div 
                className={`
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 
                  bg-base-300 text-base-content text-xs rounded-lg shadow-xl border border-base-content/10 p-2 min-w-[120px] pointer-events-none transition-all duration-200
                  ${hoverIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                `}
              >
                <div className="font-bold border-b border-base-content/10 pb-1 mb-1 text-center">{d.label}</div>
                <div className="flex justify-between gap-3">
                  <span className="text-success">Rev:</span>
                  <span className="font-mono font-bold">${d.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-error">Exp:</span>
                  <span className="font-mono font-bold">${d.expense.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-3 mt-1 pt-1 border-t border-base-content/10">
                  <span className="opacity-60">Net:</span>
                  <span className={`font-mono font-bold ${(d.revenue - d.expense) >= 0 ? 'text-base-content' : 'text-error'}`}>
                    ${(d.revenue - d.expense).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* The Bar Slot */}
              <div className="w-full flex justify-center items-end gap-[2px] sm:gap-1 px-[2px] h-full relative z-10">
                {/* Hover Highlight Background */}
                <div className="absolute inset-0 bg-base-content/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity -z-10"></div>

                {/* Revenue Bar */}
                <div 
                  className="w-1/2 max-w-[20px] bg-success rounded-t-sm transition-all duration-500 ease-out hover:brightness-110"
                  style={{ height: `${Math.max(revHeight, 1)}%` }} // Min 1% to show empty bars
                ></div>
                
                {/* Expense Bar */}
                <div 
                  className="w-1/2 max-w-[20px] bg-error rounded-t-sm transition-all duration-500 ease-out hover:brightness-110"
                  style={{ height: `${Math.max(expHeight, 1)}%` }}
                ></div>
              </div>

              {/* X-Axis Label */}
              <div className="absolute top-full left-0 right-0 text-center mt-2">
                <span className={`text-[10px] sm:text-xs font-medium truncate px-0.5 block ${hoverIndex === i ? 'text-primary font-bold' : 'text-base-content/50'}`}>
                  {d.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}