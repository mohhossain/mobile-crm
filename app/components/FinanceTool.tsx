"use client";

import { useState, useMemo } from "react";
import { 
  CurrencyDollarIcon, 
  CalculatorIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

interface Deal {
  id: string;
  amount: number;
  status: string;
}

export default function FinanceTool({ deals }: { deals: Deal[] }) {
  // Interactive State
  const [revenueTarget, setRevenueTarget] = useState(50000);
  const [expenses, setExpenses] = useState(15000); // Budgeting aspect
  const [includePending, setIncludePending] = useState(true);
  const [includeNegotiation, setIncludeNegotiation] = useState(false);

  // Real-time Calculations
  const stats = useMemo(() => {
    // 1. Secured Revenue (WON)
    const won = deals.filter(d => d.status === 'WON').reduce((sum, d) => sum + d.amount, 0);
    
    // 2. Potential Revenue based on toggles
    const pending = includePending 
      ? deals.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + d.amount, 0) 
      : 0;
    
    const negotiation = includeNegotiation 
      ? deals.filter(d => d.status === 'NEGOTIATION').reduce((sum, d) => sum + d.amount, 0) 
      : 0;

    const totalRevenue = won + pending + negotiation;
    const netProfit = totalRevenue - expenses;
    const progress = Math.min((totalRevenue / revenueTarget) * 100, 100);
    const gap = revenueTarget - totalRevenue;

    return { won, pending, negotiation, totalRevenue, netProfit, progress, gap };
  }, [deals, revenueTarget, expenses, includePending, includeNegotiation]);

  return (
    <div className="card bg-base-100 shadow-lg border border-primary/20">
      <div className="card-body p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="card-title flex items-center gap-2 text-primary">
            <CalculatorIcon className="w-6 h-6" />
            Financial Planner
          </h2>
          <div className="badge badge-primary badge-outline text-xs">Interactive</div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="form-control">
            <label className="label py-0">
              <span className="label-text text-xs font-bold uppercase text-gray-500">Revenue Goal</span>
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input 
                type="number" 
                className="input input-bordered input-sm w-full pl-6 font-bold" 
                value={revenueTarget}
                onChange={(e) => setRevenueTarget(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label py-0">
              <span className="label-text text-xs font-bold uppercase text-gray-500">Est. Expenses</span>
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input 
                type="number" 
                className="input input-bordered input-sm w-full pl-6 text-error font-bold" 
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Scenario Toggles */}
        <div className="flex flex-col gap-2 mb-6 p-3 bg-base-200 rounded-lg">
           <span className="text-xs font-bold uppercase text-gray-500 mb-1">Forecast Scenarios</span>
           <div className="flex justify-between items-center">
             <span className="text-sm">Include Pending Deals</span>
             <input type="checkbox" className="toggle toggle-warning toggle-sm" checked={includePending} onChange={e => setIncludePending(e.target.checked)} />
           </div>
           <div className="flex justify-between items-center">
             <span className="text-sm">Include Negotiations</span>
             <input type="checkbox" className="toggle toggle-info toggle-sm" checked={includeNegotiation} onChange={e => setIncludeNegotiation(e.target.checked)} />
           </div>
        </div>

        {/* Visualization */}
        <div className="space-y-4">
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Progress to Goal</span>
              <span className="font-bold">{Math.round(stats.progress)}%</span>
            </div>
            <div className="flex h-3 w-full bg-base-200 rounded-full overflow-hidden">
              <div style={{ width: `${(stats.won / revenueTarget) * 100}%` }} className="bg-success h-full" title="Won"></div>
              <div style={{ width: `${(stats.pending / revenueTarget) * 100}%` }} className="bg-warning h-full" title="Pending"></div>
              <div style={{ width: `${(stats.negotiation / revenueTarget) * 100}%` }} className="bg-info h-full" title="Negotiation"></div>
            </div>
          </div>

          {/* Results Cards */}
          <div className="grid grid-cols-2 gap-3">
             <div className="stats bg-base-200 shadow-sm border border-base-300">
               <div className="stat p-3">
                 <div className="stat-title text-[10px] uppercase font-bold text-gray-500">Projected Revenue</div>
                 <div className="stat-value text-lg text-primary">${stats.totalRevenue.toLocaleString()}</div>
               </div>
             </div>
             
             <div className={`stats shadow-sm border ${stats.netProfit > 0 ? 'bg-success/10 border-success/20' : 'bg-error/10 border-error/20'}`}>
               <div className="stat p-3">
                 <div className="stat-title text-[10px] uppercase font-bold text-gray-500">Net Profit</div>
                 <div className={`stat-value text-lg ${stats.netProfit > 0 ? 'text-success' : 'text-error'}`}>
                   ${stats.netProfit.toLocaleString()}
                 </div>
               </div>
             </div>
          </div>

          {/* Alert Message */}
          <div className={`alert text-xs py-2 ${stats.gap <= 0 ? 'alert-success' : 'alert-warning'}`}>
            <BanknotesIcon className="w-4 h-4" />
            {stats.gap <= 0 ? (
              <span>Target Met! Surplus of <strong>${Math.abs(stats.gap).toLocaleString()}</strong></span>
            ) : (
              <span>Gap: You need <strong>${stats.gap.toLocaleString()}</strong> more to hit target.</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}