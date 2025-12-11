"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClockIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as SolidCheck, 
  PlayCircleIcon as SolidPlay 
} from '@heroicons/react/24/solid';

import DeleteDealButton from './DeleteDealButton';
import TaskCard from './TaskCard';
import DealNotes from './DealNotes';
import QuickTaskForm from './QuickTaskForm';
import DealFinances from './DealFinances';
import SharePortalButton from './SharePortalButton';
import InvoiceButton from "./InvoiceButton";
import AddExpense from "./AddExpense";

interface DashboardProps {
  deal: any; 
}

interface RoadmapStage {
  id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'DONE';
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export default function DealDashboard({ deal: initialDeal }: DashboardProps) {
  const [deal, setDeal] = useState(initialDeal);
  const router = useRouter();
  
  const [roadmap, setRoadmap] = useState<RoadmapStage[]>(
    Array.isArray(deal.roadmap) && deal.roadmap.length > 0 
      ? deal.roadmap 
      : [
          { id: '1', title: 'Onboarding', status: 'PENDING' },
          { id: '2', title: 'Delivery', status: 'PENDING' }
        ]
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(deal.title);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'notes' | 'finances'>('overview');
  
  // Forecast Editing State
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isEditingForecast, setIsEditingForecast] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [amountInput, setAmountInput] = useState(deal.amount);
  const [forecastInput, setForecastInput] = useState("");
  const [dateInput, setDateInput] = useState(deal.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : "");

  useEffect(() => { 
    setDeal(initialDeal);
    if(Array.isArray(initialDeal.roadmap)) {
      setRoadmap(initialDeal.roadmap);
    }
  }, [initialDeal]);

  // --- CALCULATIONS ---
  const totalExpenses = deal.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const netProfit = deal.amount - totalExpenses;
  const profitMargin = deal.amount > 0 ? (netProfit / deal.amount) * 100 : 0;
  
  const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 3600 * 24));
  const isStale = daysSinceUpdate > 7;
  const weightedRevenue = deal.amount * (deal.probability / 100);

  const PIPELINE = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];

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
        setDeal({ ...data.deal, expenses: deal.expenses, tasks: deal.tasks, notes: deal.notes });
        router.refresh();
      }
    } catch (e) {
      console.error("Failed to update deal", e);
    }
  };

  const handleAddStageClick = () => {
    setNewStageTitle("");
    setShowAddStageModal(true);
  };

  const confirmAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim()) return;

    const newStage: RoadmapStage = { id: generateId(), title: newStageTitle, status: 'PENDING' };
    const newRoadmap = [...roadmap, newStage];
    
    setRoadmap(newRoadmap);
    updateDeal({ roadmap: newRoadmap });
    setShowAddStageModal(false);
  };

  const toggleStageStatus = (stageId: string) => {
    const newRoadmap = roadmap.map(step => {
      if (step.id !== stageId) return step;
      const nextStatus: 'PENDING' | 'ACTIVE' | 'DONE' = step.status === 'PENDING' ? 'ACTIVE' : step.status === 'ACTIVE' ? 'DONE' : 'PENDING';
      return { ...step, status: nextStatus };
    });
    setRoadmap(newRoadmap);
    updateDeal({ roadmap: newRoadmap });
  };

  const handleStatusChange = (newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'WON') updates.probability = 100;
    if (newStatus === 'LOST') updates.probability = 0;
    updateDeal(updates);
  };

  const handleProbabilityChange = (val: number) => updateDeal({ probability: val });
  const saveTitle = () => { updateDeal({ title: titleInput }); setIsEditingTitle(false); };
  const saveAmount = () => { updateDeal({ amount: parseFloat(amountInput) }); setIsEditingAmount(false); };
  const saveDate = () => {
    const newDate = dateInput ? new Date(`${dateInput}T17:00:00`).toISOString() : null;
    updateDeal({ closeDate: newDate });
    setIsEditingDate(false);
  };
  const saveForecast = () => {
    let val = parseFloat(forecastInput);
    if (isNaN(val)) val = 0;
    if (val > deal.amount) val = deal.amount;
    if (val < 0) val = 0;
    const newProb = deal.amount > 0 ? Math.round((val / deal.amount) * 100) : 0;
    updateDeal({ probability: newProb });
    setIsEditingForecast(false);
  };
  const handleTaskAdded = (newTask: any) => {
    setDeal((prev: any) => ({ ...prev, tasks: [...(prev.tasks || []), newTask] }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
        <div className="w-full">
           <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
                 <span className="badge badge-outline text-[10px]">{deal.status}</span>
                 {isStale && <span className="text-warning flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Stale</span>}
              </div>
              <div className="flex items-center gap-2">
                 {/* Share Button (Client Portal) */}
                 <SharePortalButton shareToken={deal.shareToken} />
                 <div className="md:hidden">
                    <DeleteDealButton dealId={deal.id} />
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col md:flex-row md:items-end gap-4 w-full">
             <div className="flex-1">
               {isEditingTitle ? (
                 <input 
                   className="input input-lg text-2xl md:text-3xl font-black w-full p-0 h-auto bg-transparent border-b border-primary focus:outline-none"
                   value={titleInput}
                   onChange={e => setTitleInput(e.target.value)}
                   onBlur={saveTitle}
                   onKeyDown={e => e.key === 'Enter' && saveTitle()}
                   autoFocus
                 />
               ) : (
                 <h1 onClick={() => setIsEditingTitle(true)} className="text-2xl md:text-3xl font-black tracking-tight cursor-pointer hover:opacity-70 transition-opacity">
                   {deal.title}
                 </h1>
               )}
               <div className="flex items-center gap-2 mt-1 text-sm text-base-content/60">
                 <CalendarDaysIcon className="w-4 h-4" />
                 <span>Target: {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'No Date Set'}</span>
               </div>
             </div>

             {/* Status Pipeline Buttons */}
             <div className="flex flex-wrap gap-1 bg-base-200/50 p-1 rounded-lg">
               {PIPELINE.map((s) => (
                 <button 
                   key={s} 
                   onClick={() => handleStatusChange(s)}
                   className={`btn btn-xs sm:btn-sm border-none ${deal.status === s ? 'btn-primary shadow-sm' : 'btn-ghost bg-transparent'}`}
                 >
                   {s.charAt(0) + s.slice(1).toLowerCase()}
                 </button>
               ))}
             </div>
             
             {/* Desktop Actions */}
             <div className="hidden md:flex items-center gap-2">
                <DeleteDealButton dealId={deal.id} />
             </div>
           </div>
        </div>
      </div>

      {/* 2. WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: EXECUTION */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* ROADMAP / MILESTONES (Interactive) */}
           <div className="card bg-base-100 shadow-sm border border-base-200">
             <div className="card-body p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase text-base-content/50 flex items-center gap-2">
                    <MapIcon className="w-4 h-4" /> Roadmap
                  </h3>
                  <button onClick={handleAddStageClick} className="btn btn-xs btn-ghost text-primary hover:bg-primary/10">+ Add Stage</button>
                </div>
                
                <div className="space-y-4">
                  {roadmap.length === 0 && <div className="text-center py-4 text-xs opacity-40 italic">No stages defined.</div>}
                  {roadmap.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-4 relative group">
                       {/* Connector Line */}
                       {idx !== roadmap.length - 1 && (
                         <div className={`absolute left-3.5 top-8 bottom-0 w-0.5 ${step.status === 'DONE' ? 'bg-success/30' : 'bg-base-200'}`}></div>
                       )}
                       
                       <button 
                         onClick={() => toggleStageStatus(step.id)}
                         className={`
                           w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all hover:scale-110 z-10
                           ${step.status === 'DONE' ? 'bg-success text-success-content border-success' : 
                             step.status === 'ACTIVE' ? 'bg-base-100 border-primary text-primary shadow-[0_0_10px_rgba(var(--p),0.4)]' : 
                             'bg-base-100 border-base-300 text-base-content/20'}
                         `}
                       >
                         {step.status === 'DONE' ? <SolidCheck className="w-4 h-4" /> : 
                          step.status === 'ACTIVE' ? <SolidPlay className="w-4 h-4" /> : 
                          <div className="w-2 h-2 rounded-full bg-current"></div>}
                       </button>
                       
                       <div className="flex-1 p-3 bg-base-200/30 rounded-xl flex justify-between items-center border border-base-200 hover:border-base-300 transition-colors">
                          <span className={`text-sm font-medium ${step.status === 'PENDING' ? 'opacity-50' : ''}`}>{step.title}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                             step.status === 'DONE' ? 'text-success' : 
                             step.status === 'ACTIVE' ? 'text-primary' : 'opacity-30'
                          }`}>
                            {step.status}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
           </div>

           {/* TASKS */}
           <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
               <h3 className="font-bold text-lg">Tasks</h3>
               <span className="badge badge-neutral">{deal.tasks?.length || 0}</span>
             </div>
             
             <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
                <QuickTaskForm dealId={deal.id} onSuccess={handleTaskAdded} />
             </div>

             <div className="space-y-2">
               {(!deal.tasks || deal.tasks.length === 0) ? (
                 <div className="text-center py-10 opacity-40 text-sm italic">No tasks created yet.</div>
               ) : (
                 deal.tasks.map((task: any) => (
                   <TaskCard key={task.id} task={task} />
                 ))
               )}
             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: CONTEXT */}
        <div className="space-y-6">
           
           {/* FINANCIAL CARD */}
           <div className="card bg-base-100 shadow-lg border border-base-200 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
              <div className="card-body p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-black text-base-content">${deal.amount.toLocaleString()}</h2>
                      <p className="text-xs font-bold uppercase opacity-40">Deal Value</p>
                    </div>
                    {deal.status === 'WON' && <div className="badge badge-success text-white font-bold">WON</div>}
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-base-content/5">
                    <div>
                      <div className="text-error font-bold text-lg">-${totalExpenses.toLocaleString()}</div>
                      <div className="text-[10px] uppercase font-bold opacity-40">Expenses</div>
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                        ${netProfit.toLocaleString()}
                      </div>
                      <div className="text-[10px] uppercase font-bold opacity-40">Net Profit ({profitMargin.toFixed(0)}%)</div>
                    </div>
                 </div>

                 {/* EXPENSES LIST IN CARD */}
                 {deal.expenses && deal.expenses.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-base-content/5 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                     <div className="text-[10px] uppercase font-bold opacity-40 mb-1">Recent Costs</div>
                     {deal.expenses.slice(0, 5).map((exp: any) => (
                       <div key={exp.id} className="flex justify-between text-xs opacity-70">
                         <span className="truncate pr-2">{exp.description}</span>
                         <span className="text-error font-mono">-${exp.amount.toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-2 mt-6">
                   <button 
                     onClick={() => setShowExpenseModal(true)} 
                     className="btn btn-sm btn-outline border-base-300"
                   >
                     Log Expense
                   </button>
                   <InvoiceButton deal={deal} user={{ name: "Me", email: "me@pulse.com" }} />
                 </div>
              </div>
           </div>

           {/* STAKEHOLDERS */}
           <div className="card bg-base-100 shadow-sm border border-base-200">
             <div className="card-body p-5">
               <h3 className="card-title text-xs font-bold uppercase text-base-content/40 mb-3 flex items-center gap-2">
                 <UserGroupIcon className="w-4 h-4" /> Stakeholders
               </h3>
               {deal.contacts?.length === 0 ? (
                 <p className="text-xs opacity-50 italic">No contacts linked.</p>
               ) : (
                 <div className="space-y-2">
                   {deal.contacts?.map((c: any) => (
                     <Link href={`/contacts/${c.id}`} key={c.id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg transition-colors">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-xs">{c.name.charAt(0)}</div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{c.name}</div>
                          <div className="text-xs opacity-50 truncate">{c.jobTitle || c.email}</div>
                        </div>
                     </Link>
                   ))}
                 </div>
               )}
             </div>
           </div>

           {/* NOTES */}
           <div className="card bg-base-100 shadow-sm border border-base-200 h-[400px]">
              <div className="card-body p-0 flex flex-col h-full">
                 <div className="p-4 border-b border-base-200 bg-base-200/30">
                   <h3 className="font-bold text-sm flex items-center gap-2">
                     <ChatBubbleLeftRightIcon className="w-4 h-4" /> Activity & Notes
                   </h3>
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <DealNotes dealId={deal.id} initialNotes={deal.notes || []} />
                 </div>
              </div>
           </div>

        </div>

      </div>

      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
           <div className="modal-box p-6 bg-base-100">
              <h3 className="font-bold text-lg mb-4">Log Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              
              {/* FIX: Passed dealId to AddExpense to ensure linking */}
              <AddExpense 
                dealId={deal.id}
                onSuccess={() => { setShowExpenseModal(false); router.refresh(); }} 
                onCancel={() => setShowExpenseModal(false)} 
              />
           </div>
           <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}></div>
        </dialog>
      )}

      {showAddStageModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[60]">
           <div className="modal-box p-6 bg-base-100">
              <h3 className="font-bold text-lg mb-4">Add New Stage</h3>
              <button onClick={() => setShowAddStageModal(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <form onSubmit={confirmAddStage} className="space-y-4">
                 <input 
                   autoFocus
                   placeholder="e.g. Contract Review" 
                   className="input input-bordered w-full"
                   value={newStageTitle}
                   onChange={(e) => setNewStageTitle(e.target.value)}
                 />
                 <div className="flex gap-2 justify-end">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddStageModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={!newStageTitle.trim()}>Add Stage</button>
                 </div>
              </form>
           </div>
           <div className="modal-backdrop" onClick={() => setShowAddStageModal(false)}></div>
        </dialog>
      )}

    </div>
  );
}