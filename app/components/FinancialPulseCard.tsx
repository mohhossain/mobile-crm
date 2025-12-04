"use client";

import Link from "next/link";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface Financials {
  revenue: number;
  expenses: number;
  profit: number;
}

export default function FinancialPulseCard({ financials }: { financials: Financials }) {
  const isProfitable = financials.profit >= 0;
  
  // Simple SVG path for a decorative "Trend Line" background
  // This adds visual flair without needing real data points for the quick view
  const trendPath = isProfitable 
    ? "M0,80 C30,80 30,40 60,40 C90,40 90,10 120,10 L120,100 L0,100 Z" // Upward curve
    : "M0,20 C30,20 30,60 60,60 C90,60 90,90 120,90 L120,100 L0,100 Z"; // Downward curve

  return (
    <Link href="/finance" className="block group relative overflow-hidden rounded-3xl bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      
      {/* Background Gradient & SVG */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br ${isProfitable ? 'from-emerald-500 to-teal-500' : 'from-rose-500 to-orange-500'}`}></div>
      <svg className={`absolute bottom-0 right-0 w-1/2 h-24 opacity-10 ${isProfitable ? 'text-success' : 'text-error'}`} viewBox="0 0 120 100" preserveAspectRatio="none" fill="currentColor">
         <path d={trendPath} />
      </svg>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
           <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${isProfitable ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {isProfitable ? <ArrowTrendingUpIcon className="w-5 h-5" /> : <ArrowTrendingDownIcon className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Net Profit</span>
           </div>
           <div className="bg-base-100/50 backdrop-blur px-2 py-1 rounded-full border border-base-content/5">
             <ChevronRightIcon className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
           </div>
        </div>

        {/* Big Number */}
        <div className="mt-2">
           <h2 className={`text-4xl sm:text-5xl font-black tracking-tight ${isProfitable ? 'text-success' : 'text-error'}`}>
             {financials.profit >= 0 ? '+' : '-'}${Math.abs(financials.profit).toLocaleString()}
           </h2>
           <p className="text-sm font-medium opacity-60 mt-1">
             {isProfitable ? "You're in the green this month." : "Expenses exceeding revenue."}
           </p>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-base-content/5">
           <div>
             <div className="text-[10px] uppercase font-bold opacity-40 mb-1">Revenue</div>
             <div className="text-lg font-bold">${financials.revenue.toLocaleString()}</div>
           </div>
           <div className="text-right">
             <div className="text-[10px] uppercase font-bold opacity-40 mb-1">Expenses</div>
             <div className="text-lg font-bold text-error">${financials.expenses.toLocaleString()}</div>
           </div>
        </div>
      </div>
    </Link>
  );
}