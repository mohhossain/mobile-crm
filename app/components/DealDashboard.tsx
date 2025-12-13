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
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  MapIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  PlayCircleIcon as SolidPlayCircle
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon, 
  TrashIcon
} from '@heroicons/react/24/solid';

import DeleteDealButton from './DeleteDealButton';
import TaskCard from './TaskCard';
import DealNotes from './DealNotes';
import QuickTaskForm from './QuickTaskForm';
import DealFinances from './DealFinances';
import AddExpense from "./AddExpense";
import DealInvoices from "./DealInvoices";
import JobSheet from "./JobSheet";

interface DashboardProps {
  deal: any;
  initialTab?: string;
  user?: any;
}

interface RoadmapStage {
  id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'DONE';
}

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// NEW: Visual Stages (Matches your Kanban Default)
const VISUAL_PIPELINE = ['Lead', 'Meeting', 'Proposal', 'Negotiation', 'Won'];

export default function DealDashboard({ deal: initialDeal, initialTab, user }: DashboardProps) {
  const [deal, setDeal] = useState(initialDeal);
  const router = useRouter();
  
  const validTabs = ['overview', 'jobsheet', 'notes', 'finances', 'invoices'];
  const startTab = (initialTab && validTabs.includes(initialTab)) ? initialTab : 'overview';
  
  const [activeTab, setActiveTab] = useState<any>(startTab);

  useEffect(() => { 
    setDeal(initialDeal);
    if(Array.isArray(initialDeal.roadmap)) {
      setRoadmap(initialDeal.roadmap);
    }
  }, [initialDeal]);

  const [roadmap, setRoadmap] = useState<RoadmapStage[]>(
    Array.isArray(deal.roadmap) && deal.roadmap.length > 0 
      ? deal.roadmap 
      : [
          { id: 'stage-1', title: 'Prep', status: 'ACTIVE' }, 
          { id: 'stage-2', title: 'The Work', status: 'PENDING' },
          { id: 'stage-3', title: 'Wrap Up', status: 'PENDING' }
        ]
  );

  // Edit States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  
  const [titleInput, setTitleInput] = useState(deal.title);
  const [amountInput, setAmountInput] = useState(deal.amount);
  const [dateInput, setDateInput] = useState(deal.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : "");

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");

  // --- CALCULATIONS ---
  const totalExpenses = deal.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const netProfit = deal.amount - totalExpenses;
  
  const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 3600 * 24));
  const isStale = daysSinceUpdate > 7;

  const today = new Date();
  const closeDateObj = deal.closeDate ? new Date(deal.closeDate) : null;
  const daysToClose = closeDateObj ? Math.ceil((closeDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
  const isDueSoon = daysToClose !== null && daysToClose >= 0 && daysToClose <= 7;

  // --- ACTIONS ---
  
  const refreshDeal = async () => {
    router.refresh();
    const res = await fetch(`/api/deals/${deal.id}`);
    if(res.ok) {
        const updated = await res.json();
        setDeal(updated);
        if (updated.roadmap) setRoadmap(updated.roadmap);
    }
  };

  const updateDeal = async (updates: any) => {
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        refreshDeal();
      }
    } catch (e) {
      console.error("Failed to update deal", e);
    }
  };

  // FIX: Handle Stage Changes Correctly
  const handleStageChange = (newStage: string) => {
    let updates: any = { stage: newStage };
    
    if (newStage === 'Won') {
      updates.status = 'WON';
      updates.probability = 100;
    } else {
      // If moving back to pipeline, reactivate status to OPEN
      updates.status = 'OPEN';
      // Calculate simplistic probability
      const idx = VISUAL_PIPELINE.indexOf(newStage);
      updates.probability = Math.round(((idx + 1) / VISUAL_PIPELINE.length) * 80);
    }
    
    updateDeal(updates);
  };

  // Explicit Handler for LOST
  const markAsLost = () => {
    updateDeal({ status: 'LOST', stage: 'Lost', probability: 0 });
  }

  const handleAddStageClick = () => { setNewStageTitle(""); setShowAddStageModal(true); };
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

  const saveTitle = () => { updateDeal({ title: titleInput }); setIsEditingTitle(false); };
  const saveAmount = () => { updateDeal({ amount: parseFloat(amountInput) }); setIsEditingAmount(false); };
  const saveDate = () => {
    const newDate = dateInput ? new Date(`${dateInput}T17:00:00`).toISOString() : null;
    updateDeal({ closeDate: newDate });
    setIsEditingDate(false);
  };

  // Helper to determine active stage visually
  const currentStage = deal.stage || 'Lead';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32">
      
      {/* 1. HERO SECTION */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-200 relative overflow-hidden">
        <div className={`absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br ${deal.status === 'WON' ? 'from-success/10' : deal.status === 'LOST' ? 'from-error/10' : 'from-primary/10'} to-transparent rounded-full blur-3xl pointer-events-none opacity-50`}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1 space-y-4">
             {/* Breadcrumb / Status */}
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">
               <Link href="/deals" className="hover:text-primary transition">Pipeline</Link> 
               <span>/</span> 
               <span>{deal.status === 'OPEN' ? 'Active' : deal.status}</span>
             </div>

             {/* Editable Title */}
             <div>
               {isEditingTitle ? (
                 <input 
                   className="input input-lg text-3xl font-black w-full p-0 h-auto bg-transparent border-b-2 border-primary focus:outline-none"
                   value={titleInput}
                   onChange={e => setTitleInput(e.target.value)}
                   onBlur={saveTitle}
                   onKeyDown={e => e.key === 'Enter' && saveTitle()}
                   autoFocus
                 />
               ) : (
                 <h1 onClick={() => setIsEditingTitle(true)} className="text-3xl md:text-4xl font-black tracking-tight cursor-pointer hover:opacity-70 transition-opacity group flex items-center gap-2">
                   {deal.title}
                   <PencilSquareIcon className="w-5 h-5 opacity-0 group-hover:opacity-50" />
                 </h1>
               )}
             </div>

             {/* Pipeline Visual */}
             <div className="max-w-xl">
                <div className="w-full bg-base-200 rounded-full h-2 mb-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${deal.status === 'LOST' ? 'bg-error' : 'bg-primary'}`} 
                    style={{ width: `${deal.probability}%` }}
                  ></div>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {VISUAL_PIPELINE.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      className={`btn btn-xs rounded-full whitespace-nowrap px-3 
                        ${currentStage === stage ? 'btn-neutral' : 'btn-ghost bg-base-200/50 hover:bg-base-200'}
                        ${stage === 'Won' && currentStage === 'Won' ? 'btn-success text-white' : ''}
                      `}
                    >
                      {stage}
                    </button>
                  ))}
                  {/* Separate Lost Button */}
                  <button 
                    onClick={markAsLost}
                    className={`btn btn-xs rounded-full px-3 ${deal.status === 'LOST' ? 'btn-error text-white' : 'btn-ghost hover:bg-error/10 hover:text-error'}`}
                  >
                    Lost
                  </button>
                </div>
             </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4 min-w-[200px]">
             <div className="flex items-center gap-2">
                <DeleteDealButton dealId={deal.id} />
                {deal.shareToken && (
                  <Link href={`/portal/${deal.shareToken}`} target="_blank" className="btn btn-sm btn-outline gap-2">
                    Client Portal
                  </Link>
                )}
             </div>

             <div className="text-right">
                <div className="text-xs font-bold uppercase opacity-40 mb-1">Deal Value</div>
                {isEditingAmount ? (
                   <input 
                     type="number"
                     className="input input-lg text-4xl font-black w-48 p-0 h-auto bg-transparent border-b-2 border-success focus:outline-none text-right"
                     value={amountInput}
                     onChange={e => setAmountInput(e.target.value)}
                     onBlur={saveAmount}
                     onKeyDown={e => e.key === 'Enter' && saveAmount()}
                     autoFocus
                   />
                ) : (
                   <div onClick={() => setIsEditingAmount(true)} className="text-4xl font-black text-success cursor-pointer hover:opacity-80">
                     ${deal.amount.toLocaleString()}
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="sticky top-16 z-30 bg-base-100/80 backdrop-blur-md p-1 rounded-xl flex gap-1 overflow-x-auto no-scrollbar shadow-sm border border-base-200">
        {[
          { id: 'overview', label: 'Overview', icon: UserGroupIcon },
          { id: 'jobsheet', label: 'Job Sheet', icon: ClipboardDocumentCheckIcon, count: deal.tasks?.length },
          { id: 'finances', label: 'Finances', icon: BanknotesIcon },
          { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon, count: deal.invoices?.length },
          { id: 'notes', label: 'Notes', icon: ChatBubbleLeftRightIcon },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`flex-1 btn btn-sm whitespace-nowrap ${activeTab === tab.id ? 'btn-neutral' : 'btn-ghost'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
            {tab.count ? <span className="badge badge-xs badge-ghost ml-1">{tab.count}</span> : null}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}
      <div className="min-h-[400px]">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-left-2 duration-300">
             
             {/* LEFT COLUMN */}
             <div className="lg:col-span-2 space-y-6">
                
                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase opacity-50">
                        <BanknotesIcon className="w-4 h-4" /> Expenses
                      </div>
                      <div className="text-xl font-bold text-error">-${totalExpenses.toLocaleString()}</div>
                   </div>
                   <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase opacity-50">
                        <ArrowTrendingUpIcon className="w-4 h-4" /> Net Profit
                      </div>
                      <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                        ${netProfit.toLocaleString()}
                      </div>
                   </div>
                   <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm hover:border-primary/50 transition cursor-pointer" onClick={() => setIsEditingDate(true)}>
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase opacity-50">
                        <CalendarDaysIcon className="w-4 h-4" /> Target Close
                      </div>
                      {isEditingDate ? (
                        <input type="date" className="input input-sm input-bordered w-full p-0" value={dateInput} onChange={e => setDateInput(e.target.value)} onBlur={saveDate} autoFocus />
                      ) : (
                        <div className="text-xl font-bold flex items-center gap-2">
                          {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'Set Date'}
                          {isDueSoon && <span className="badge badge-xs badge-warning">Soon</span>}
                        </div>
                      )}
                   </div>
                </div>

                {/* Stakeholders */}
                <div className="card bg-base-100 shadow-sm border border-base-200">
                   <div className="card-body p-5">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-sm uppercase opacity-50">Stakeholders</h3>
                         <Link href={`/deals/${deal.id}/edit`} className="btn btn-xs btn-ghost text-primary">+ Edit</Link>
                      </div>
                      <div className="space-y-2">
                        {deal.contacts?.length > 0 ? deal.contacts.map((c: any) => (
                          <Link href={`/contacts/${c.id}`} key={c.id} className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg transition border border-base-200 hover:border-base-300">
                             {c.imageUrl ? <img src={c.imageUrl} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center text-[10px] font-bold">{c.name.charAt(0)}</div>}
                             <div>
                               <div className="text-sm font-bold">{c.name}</div>
                               <div className="text-xs opacity-50">{c.jobTitle || c.email}</div>
                             </div>
                          </Link>
                        )) : <div className="text-sm opacity-50 italic">No contacts linked</div>}
                      </div>
                   </div>
                </div>
             </div>

             {/* RIGHT COLUMN */}
             <div className="space-y-6">
                <div className="card bg-base-100 shadow-sm border border-base-200 h-fit">
                   <div className="p-4 border-b border-base-200 bg-base-50/50 rounded-t-xl">
                      <h3 className="font-bold text-sm uppercase opacity-60 flex items-center gap-2">
                        <ExclamationCircleIcon className="w-4 h-4 text-secondary" /> Action Center
                      </h3>
                   </div>
                   <div className="card-body p-4 gap-4">
                      <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => setShowExpenseModal(true)} className="btn btn-sm btn-outline w-full text-xs">
                           <BanknotesIcon className="w-3 h-3" /> Log Expense
                         </button>
                         <Link href={`/deals/${deal.id}/invoices/new`} className="btn btn-sm btn-outline w-full text-xs">
                           <DocumentTextIcon className="w-3 h-3" /> Create Invoice
                         </Link>
                      </div>
                      <div className="pt-2 border-t border-base-200">
                         <div className="flex justify-between items-center mb-2">
                            <div className="text-xs font-bold uppercase opacity-40">Next Up</div>
                            <button onClick={() => setActiveTab('jobsheet')} className="text-xs text-primary hover:underline">View Sheet</button>
                         </div>
                         {deal.tasks && deal.tasks.filter((t: any) => t.status !== 'DONE').length > 0 ? (
                           <div className="bg-base-200/50 p-3 rounded-lg border border-base-200 flex items-start gap-3">
                              <div className={`mt-1 w-2 h-2 rounded-full ${deal.tasks[0].priority === 3 ? 'bg-error' : 'bg-primary'}`}></div>
                              <div>
                                <div className="text-sm font-bold line-clamp-1">{deal.tasks.find((t:any) => t.status !== 'DONE')?.title}</div>
                                {deal.tasks.find((t:any) => t.status !== 'DONE')?.dueDate && <div className="text-xs opacity-50 mt-1 flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {new Date(deal.tasks.find((t:any) => t.status !== 'DONE')?.dueDate).toLocaleDateString()}</div>}
                              </div>
                           </div>
                         ) : (
                           <div className="text-sm text-base-content/40 italic">All caught up!</div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- JOB SHEET TAB --- */}
        {activeTab === 'jobsheet' && (
          <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 animate-in fade-in slide-in-from-right-4 duration-300">
             <JobSheet 
                dealId={deal.id} 
                roadmap={roadmap} 
                tasks={deal.tasks || []} 
                onUpdate={refreshDeal} 
             />
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
             <DealFinances dealId={deal.id} dealAmount={deal.amount} expenses={deal.expenses || []} />
          </div>
        )}
        
        {activeTab === 'invoices' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
             <DealInvoices deal={deal} user={user} />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="min-h-[500px] animate-in fade-in zoom-in duration-200">
             <DealNotes dealId={deal.id} initialNotes={deal.notes || []} />
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {showExpenseModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
           <div className="modal-box p-6 bg-base-100">
              <h3 className="font-bold text-lg mb-4">Log Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <AddExpense dealId={deal.id} onSuccess={() => { setShowExpenseModal(false); router.refresh(); }} onCancel={() => setShowExpenseModal(false)} />
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
                 <input autoFocus placeholder="e.g. Contract Review" className="input input-bordered w-full" value={newStageTitle} onChange={(e) => setNewStageTitle(e.target.value)} />
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