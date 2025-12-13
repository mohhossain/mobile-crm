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
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.revenue, d.expense)), 
    1000
  ) * 1.1;

  // 2. Dynamic Minimum Width
  // Force scrolling if bars would be too squished (e.g. < 24px wide)
  // On Month view (30 items) -> 30 * 32px = 960px width. Mobile (350px) will scroll.
  // On Week view (7 items) -> 7 * 32px = 224px. Fits on mobile.
  const minContentWidth = Math.max(data.length * 32, 100); 

  return (
    <div className="w-full h-[300px] relative select-none flex">
      
      {/* LEFT: Fixed Y-Axis Labels (Does not scroll) */}
      <div className="w-10 h-full flex flex-col justify-between text-[10px] text-base-content/30 pb-8 shrink-0 bg-base-100 z-20">
        {[100, 75, 50, 25, 0].map((tick) => (
          <div key={tick} className="flex items-center justify-end h-0 relative">
             <span className="-translate-y-1/2 pr-2">{tick === 0 ? '0' : `${Math.round((maxValue * tick) / 100 / 1000)}k`}</span>
          </div>
        ))}
      </div>

      {/* RIGHT: Scrollable Chart Area */}
      <div className="flex-1 h-full overflow-x-auto custom-scrollbar relative">
        
        {/* Container that forces width */}
        <div style={{ minWidth: `${minContentWidth}px` }} className="h-full relative pr-4">
            
            {/* Background Grid Lines (Span full scroll width) */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none pl-2">
            {[100, 75, 50, 25, 0].map((tick) => (
                <div key={tick} className="w-full h-px bg-base-content/5"></div>
            ))}
            </div>

            {/* Bars Render Area */}
            <div className="h-full flex items-end justify-between pb-8 pl-2 gap-1 lg:gap-2">
            {data.map((d, i) => {
                const revHeight = (d.revenue / maxValue) * 100;
                const expHeight = (d.expense / maxValue) * 100;

                // Adjust positioning for tooltips near edges
                const isFarLeft = i < 2;
                const isFarRight = i > data.length - 3;

                return (
                <div 
                    key={i} 
                    className="relative h-full flex flex-col justify-end group flex-1 min-w-[20px]" 
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    // Mobile Touch Support
                    onClick={() => setHoverIndex(hoverIndex === i ? null : i)}
                >
                    {/* Tooltip */}
                    <div 
                    className={`
                        absolute bottom-full mb-2 z-30 
                        bg-base-300 text-base-content text-xs rounded-lg shadow-xl border border-base-content/10 p-2 min-w-[120px] pointer-events-none transition-all duration-200
                        ${hoverIndex === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                        ${isFarLeft ? 'left-0 origin-bottom-left' : isFarRight ? 'right-0 origin-bottom-right' : 'left-1/2 -translate-x-1/2 origin-bottom'}
                    `}
                    >
                    <div className="font-bold border-b border-base-content/10 pb-1 mb-1 text-center whitespace-nowrap">
                        {d.label}
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-success">Rev:</span>
                        <span className="font-mono font-bold">${d.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-error">Exp:</span>
                        <span className="font-mono font-bold">${d.expense.toLocaleString()}</span>
                    </div>
                    </div>

                    {/* Bar Group */}
                    <div className="w-full flex justify-center items-end gap-[2px] h-full relative z-10">
                    {/* Hover Highlight Area */}
                    <div className="absolute inset-0 bg-base-content/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity -z-10"></div>
                    
                    {/* Revenue Bar */}
                    <div 
                        className="w-1/2 max-w-[24px] bg-success rounded-t-sm transition-all duration-500 ease-out"
                        style={{ height: `${Math.max(revHeight, d.revenue > 0 ? 1 : 0)}%` }}
                    ></div>
                    
                    {/* Expense Bar */}
                    <div 
                        className="w-1/2 max-w-[24px] bg-error rounded-t-sm transition-all duration-500 ease-out"
                        style={{ height: `${Math.max(expHeight, d.expense > 0 ? 1 : 0)}%` }}
                    ></div>
                    </div>

                    {/* X-Axis Label */}
                    <div className="absolute top-full left-0 right-0 text-center mt-2">
                    <span className={`text-[10px] font-medium truncate block ${hoverIndex === i ? 'text-primary font-bold' : 'text-base-content/50'}`}>
                        {d.label}
                    </span>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
}