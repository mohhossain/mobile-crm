"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  BriefcaseIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import DeleteDealButton from './DeleteDealButton';
import TaskCard from './TaskCard';
import DealNotes from './DealNotes';
import QuickTaskForm from './QuickTaskForm';
import DealFinances from './DealFinances';

interface DashboardProps {
  deal: any; 
}

export default function DealDashboard({ deal: initialDeal }: DashboardProps) {
  const [deal, setDeal] = useState(initialDeal);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'notes' | 'finances'>('overview');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  
  // Forecast Editing State
  const [isEditingForecast, setIsEditingForecast] = useState(false);
  const [forecastInput, setForecastInput] = useState("");

  const [titleInput, setTitleInput] = useState(deal.title);
  const [amountInput, setAmountInput] = useState(deal.amount);
  const router = useRouter();

  // --- SMART CALCULATIONS ---
  const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 3600 * 24));
  const isStale = daysSinceUpdate > 7;
  const weightedRevenue = deal.amount * (deal.probability / 100);

  // Pipeline Stages in Order
  const PIPELINE = ['OPEN', 'NEGOTIATION', 'PENDING', 'WON'];

  // --- ACTIONS ---

  const updateDeal = async (updates: any) => {
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setDeal(data.deal);
        router.refresh();
      }
    } catch (e) {
      console.error("Failed to update deal", e);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    // If moving to WON, set probability to 100 automatically
    const updates: any = { status: newStatus };
    if (newStatus === 'WON') updates.probability = 100;
    if (newStatus === 'LOST') updates.probability = 0;
    updateDeal(updates);
  };

  const handleProbabilityChange = (val: number) => {
    updateDeal({ probability: val });
  };

  const saveTitle = () => {
    updateDeal({ title: titleInput });
    setIsEditingTitle(false);
  };

  const saveAmount = () => {
    updateDeal({ amount: parseFloat(amountInput) });
    setIsEditingAmount(false);
  };

  // New function to handle manual forecast entry
  const saveForecast = () => {
    let val = parseFloat(forecastInput);
    if (isNaN(val)) val = 0;
    
    // Cap at deal value
    if (val > deal.amount) val = deal.amount;
    if (val < 0) val = 0;
    
    // Calculate probability based on the amount entered
    // We use Math.round to get the nearest integer percentage
    const newProb = deal.amount > 0 ? Math.round((val / deal.amount) * 100) : 0;
    
    updateDeal({ probability: newProb });
    setIsEditingForecast(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      
      {/* 1. INTELLIGENT HEADER */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-200 relative overflow-hidden">
        {/* Dynamic Background Glow based on Status */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${deal.status === 'WON' ? 'from-success/20' : deal.status === 'LOST' ? 'from-error/20' : 'from-primary/10'} to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none`}></div>

        <div className="relative z-10">
          {/* Top Row: Breadcrumbs & Actions */}
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">
               <span>Deals</span>
               <span>/</span>
               <span>{deal.status}</span>
             </div>
             <div className="flex items-center gap-2">
               {isStale && deal.status !== 'WON' && deal.status !== 'LOST' && (
                 <div className="badge badge-warning gap-1 text-xs animate-pulse">
                   <ClockIcon className="w-3 h-3" /> Stale ({daysSinceUpdate}d)
                 </div>
               )}
               <DeleteDealButton dealId={deal.id} />
             </div>
          </div>

          {/* Title & Value (Inline Editable) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="w-full md:max-w-2xl">
               {isEditingTitle ? (
                 <input 
                   className="input input-lg text-3xl font-black w-full p-0 h-auto bg-transparent border-b border-primary focus:outline-none"
                   value={titleInput}
                   onChange={e => setTitleInput(e.target.value)}
                   onBlur={saveTitle}
                   onKeyDown={e => e.key === 'Enter' && saveTitle()}
                   autoFocus
                 />
               ) : (
                 <h1 
                   onClick={() => setIsEditingTitle(true)}
                   className="text-4xl font-black tracking-tight cursor-pointer hover:text-primary/80 transition-colors"
                 >
                   {deal.title}
                   <PencilSquareIcon className="w-5 h-5 inline-block ml-2 opacity-0 hover:opacity-100 text-base-content/30" />
                 </h1>
               )}
            </div>

            <div className="text-right">
               <div className="text-xs font-bold uppercase opacity-50 mb-1">Deal Value</div>
               {isEditingAmount ? (
                 <input 
                   type="number"
                   className="input input-lg text-3xl font-black w-40 p-0 h-auto bg-transparent border-b border-success focus:outline-none text-right"
                   value={amountInput}
                   onChange={e => setAmountInput(e.target.value)}
                   onBlur={saveAmount}
                   onKeyDown={e => e.key === 'Enter' && saveAmount()}
                   autoFocus
                 />
               ) : (
                 <div 
                   onClick={() => setIsEditingAmount(true)}
                   className="text-4xl font-black text-success cursor-pointer hover:opacity-80 transition-opacity"
                 >
                   ${deal.amount.toLocaleString()}
                 </div>
               )}
            </div>
          </div>

          {/* 2. VISUAL PIPELINE STEPPER */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
               <span className="text-xs font-bold uppercase opacity-60">Pipeline Stage</span>
               <span className="text-xs font-bold opacity-60">Probability: {deal.probability}%</span>
            </div>
            
            <div className="w-full bg-base-200 rounded-full h-3 mb-6 relative overflow-hidden">
               {/* Probability Fill */}
               <div 
                 className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${deal.status === 'LOST' ? 'bg-error' : 'bg-primary'}`} 
                 style={{ width: `${deal.probability}%` }}
               ></div>
               
               {/* Step Markers */}
               <div className="absolute inset-0 flex justify-between px-[12.5%]">
                 {[1, 2, 3].map(i => <div key={i} className="w-0.5 h-full bg-base-100/20"></div>)}
               </div>
            </div>

            {/* Stage Selectors */}
            <div className="grid grid-cols-4 gap-2">
              {PIPELINE.map((stage) => (
                <button
                  key={stage}
                  onClick={() => handleStatusChange(stage)}
                  className={`btn btn-sm ${deal.status === stage ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                >
                  {stage}
                </button>
              ))}
            </div>
            
            {/* Lost Button (Separate) */}
            <div className="mt-4 flex justify-end">
               {deal.status !== 'LOST' ? (
                 <button onClick={() => handleStatusChange('LOST')} className="btn btn-xs btn-ghost text-error hover:bg-error/10">
                   Mark as Lost
                 </button>
               ) : (
                 <span className="badge badge-error badge-outline">Deal Lost</span>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TAB NAVIGATION */}
      <div className="sticky top-0 z-40 bg-base-300/80 backdrop-blur-md p-1 rounded-xl flex gap-1 overflow-x-auto no-scrollbar shadow-sm border border-white/5">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}>
          <UserGroupIcon className="w-4 h-4" /> Overview
        </button>
        <button onClick={() => setActiveTab('tasks')} className={`flex-1 btn btn-sm ${activeTab === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}>
          <ClipboardDocumentListIcon className="w-4 h-4" /> Tasks
          {deal.tasks?.length > 0 && <span className="badge badge-xs badge-neutral ml-1">{deal.tasks.length}</span>}
        </button>
        <button onClick={() => setActiveTab('finances')} className={`flex-1 btn btn-sm ${activeTab === 'finances' ? 'btn-primary' : 'btn-ghost'}`}>
          <BanknotesIcon className="w-4 h-4" /> Finances
        </button>
        <button onClick={() => setActiveTab('notes')} className={`flex-1 btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-ghost'}`}>
          <ChatBubbleLeftRightIcon className="w-4 h-4" /> Notes
        </button>
      </div>

      {/* 4. TAB CONTENT */}
      <div className="min-h-[400px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-200">
             
             {/* Forecast Card */}
             <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-5">
                   <h3 className="card-title text-sm uppercase text-gray-500 mb-4 flex items-center gap-2">
                     <FireIcon className="w-4 h-4 text-orange-500" /> Forecast
                   </h3>
                   <div className="flex justify-between items-end">
                      <div>
                        {isEditingForecast ? (
                          <div className="flex items-center">
                            <span className="text-3xl font-bold text-base-content mr-1">$</span>
                            <input 
                              type="number"
                              className="input input-sm text-3xl font-bold h-auto w-40 p-0 bg-transparent border-b border-primary focus:outline-none"
                              value={forecastInput}
                              onChange={e => setForecastInput(e.target.value)}
                              onBlur={saveForecast}
                              onKeyDown={e => e.key === 'Enter' && saveForecast()}
                              autoFocus
                              max={deal.amount}
                            />
                          </div>
                        ) : (
                          <div 
                            className="text-3xl font-bold text-base-content cursor-pointer hover:text-primary/80 transition-colors"
                            onClick={() => {
                              setForecastInput(Math.round(weightedRevenue).toString());
                              setIsEditingForecast(true);
                            }}
                          >
                            ${Math.round(weightedRevenue).toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs opacity-60">Weighted Revenue ({deal.probability}%)</div>
                      </div>
                      <div className="w-1/2">
                         <input 
                           type="range" 
                           min="0" 
                           max="100" 
                           value={deal.probability} 
                           onChange={(e) => handleProbabilityChange(parseInt(e.target.value))}
                           className="range range-xs range-primary" 
                         />
                      </div>
                   </div>
                </div>
             </div>

             {/* Contacts */}
             <div className="card bg-base-100 shadow-sm border border-base-200">
               <div className="card-body p-5">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-sm uppercase text-gray-500">Stakeholders</h3>
                    <Link href={`/deals/${deal.id}/edit`} className="btn btn-xs btn-ghost">+ Add</Link>
                 </div>
                 <div className="space-y-3">
                   {deal.contacts?.map((c: any) => (
                     <Link href={`/contacts/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-xs">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.jobTitle || c.email}</div>
                        </div>
                     </Link>
                   ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-200">
             <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
                <QuickTaskForm dealId={deal.id} />
             </div>
             <div className="space-y-3">
               {deal.tasks?.map((task: any) => (
                 <TaskCard key={task.id} task={task} />
               ))}
             </div>
          </div>
        )}

        {/* FINANCES TAB */}
        {activeTab === 'finances' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
             <DealFinances dealId={deal.id} dealAmount={deal.amount} expenses={deal.expenses || []} />
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="min-h-[500px] animate-in fade-in zoom-in duration-200">
             <DealNotes dealId={deal.id} initialNotes={deal.notes || []} />
          </div>
        )}

      </div>
    </div>
  );
}