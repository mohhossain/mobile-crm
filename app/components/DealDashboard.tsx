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
  MapIcon,
  DocumentTextIcon, // Used for Invoice Tab Icon
  ArrowTrendingUpIcon
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
import DealInvoices from "./DealInvoices"; // Import the Invoice List

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

const generateId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};
export default function DealDashboard({ deal: initialDeal, initialTab, user }: DashboardProps) {
  const [deal, setDeal] = useState(initialDeal);
  const router = useRouter();
  
  const validTabs = ['overview', 'tasks', 'notes', 'finances', 'invoices'];
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
      : [{ id: '1', title: 'Onboarding', status: 'PENDING' }, { id: '2', title: 'Delivery', status: 'PENDING' }]
  );

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
  const profitMargin = deal.amount > 0 ? (netProfit / deal.amount) * 100 : 0;
  
  const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 3600 * 24));
  const isStale = daysSinceUpdate > 7;

  // Calculate "Due In"
  const today = new Date();
  const closeDateObj = deal.closeDate ? new Date(deal.closeDate) : null;
  const daysToClose = closeDateObj ? Math.ceil((closeDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
  const isDueSoon = daysToClose !== null && daysToClose >= 0 && daysToClose <= 7;

  const PIPELINE = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];

  // --- ACTIONS ---
  
  const handleTaskAdded = (newTask: any) => {
    setDeal((prev: any) => ({ ...prev, tasks: [...(prev.tasks || []), newTask] }));
  };

  const updateDeal = async (updates: any) => {
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setDeal({ ...data.deal, expenses: deal.expenses, tasks: deal.tasks, notes: deal.notes, invoices: deal.invoices });
        router.refresh();
      }
    } catch (e) {
      console.error("Failed to update deal", e);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'WON') updates.probability = 100;
    if (newStatus === 'LOST') updates.probability = 0;
    updateDeal(updates);
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32">
      
      {/* 1. HEADER */}
      <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-200 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${deal.status === 'WON' ? 'from-success/20' : deal.status === 'LOST' ? 'from-error/20' : 'from-primary/10'} to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none`}></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">
               <span>Deals</span>
               <span>/</span>
               <span>{deal.status}</span>
             </div>
             <div className="flex items-center gap-2">
               {isDueSoon && deal.status !== 'WON' && (
                 <div className="badge badge-info gap-1 text-xs">
                   <ClockIcon className="w-3 h-3" /> Due in {daysToClose} days
                 </div>
               )}
               {isStale && deal.status !== 'WON' && (
                 <div className="badge badge-warning gap-1 text-xs animate-pulse">
                   <ClockIcon className="w-3 h-3" /> Stale ({daysSinceUpdate}d)
                 </div>
               )}
               <DeleteDealButton dealId={deal.id} />
             </div>
          </div>

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
                 <h1 onClick={() => setIsEditingTitle(true)} className="text-2xl md:text-3xl font-black tracking-tight cursor-pointer hover:opacity-70 transition-opacity">
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

          <div className="mt-8">
             <div className="w-full bg-base-200 rounded-full h-3 mb-6 relative overflow-hidden">
               <div 
                 className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${deal.status === 'LOST' ? 'bg-error' : 'bg-primary'}`} 
                 style={{ width: `${deal.probability}%` }}
               ></div>
             </div>
             
             <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
              {PIPELINE.map((stage) => (
                <button
                  key={stage}
                  onClick={() => handleStatusChange(stage)}
                  className={`btn btn-sm flex-none whitespace-nowrap px-4 ${deal.status === stage ? 'btn-primary shadow-sm' : 'btn-ghost bg-base-200'}`}
                >
                  {stage.charAt(0) + stage.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-base-content/5">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-success/10 text-success rounded-lg"><CurrencyDollarIcon className="w-5 h-5" /></div>
               <div><div className="text-[10px] uppercase font-bold text-base-content/40">Value</div><div className="font-bold">${deal.amount.toLocaleString()}</div></div>
             </div>
             <div className="flex items-center gap-2">
               <div className="p-2 bg-error/10 text-error rounded-lg"><BanknotesIcon className="w-5 h-5" /></div>
               <div><div className="text-[10px] uppercase font-bold text-base-content/40">Expenses</div><div className="font-bold text-error">-${totalExpenses.toLocaleString()}</div></div>
             </div>
             <div className="flex items-center gap-2">
               <div className="p-2 bg-primary/10 text-primary rounded-lg"><ArrowTrendingUpIcon className="w-5 h-5" /></div>
               <div><div className="text-[10px] uppercase font-bold text-base-content/40">Net Profit</div><div className={`font-bold ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>${netProfit.toLocaleString()}</div></div>
             </div>
             <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsEditingDate(true)}>
               <div className="p-2 bg-base-200 text-base-content/70 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition"><CalendarDaysIcon className="w-5 h-5" /></div>
               <div>
                 <div className="text-[10px] uppercase font-bold text-base-content/40">Target Close</div>
                 {isEditingDate ? (
                   <input type="date" className="input input-xs input-bordered w-full" value={dateInput} onChange={e => setDateInput(e.target.value)} onBlur={saveDate} onKeyDown={e => e.key === 'Enter' && saveDate()} autoFocus />
                 ) : (
                   <div className="font-bold text-sm flex items-center gap-1">
                     {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'Set Date'}
                     <PencilSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="sticky top-16 z-30 bg-base-300/95 backdrop-blur-md p-1 rounded-xl flex gap-1 overflow-x-auto no-scrollbar shadow-sm border border-base-content/5">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 btn btn-sm whitespace-nowrap ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}>
          <UserGroupIcon className="w-4 h-4" /> Overview
        </button>
        <button onClick={() => setActiveTab('tasks')} className={`flex-1 btn btn-sm whitespace-nowrap ${activeTab === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}>
          <ClipboardDocumentListIcon className="w-4 h-4" /> Tasks
          {deal.tasks?.length > 0 && <span className="badge badge-xs badge-neutral ml-1">{deal.tasks.length}</span>}
        </button>
        <button onClick={() => setActiveTab('finances')} className={`flex-1 btn btn-sm whitespace-nowrap ${activeTab === 'finances' ? 'btn-primary' : 'btn-ghost'}`}>
          <BanknotesIcon className="w-4 h-4" /> Finances
        </button>
        <button onClick={() => setActiveTab('invoices')} className={`flex-1 btn btn-sm whitespace-nowrap ${activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`}>
          <DocumentTextIcon className="w-4 h-4" /> Invoices
          {deal.invoices?.length > 0 && <span className="badge badge-xs badge-neutral ml-1">{deal.invoices.length}</span>}
        </button>
        <button onClick={() => setActiveTab('notes')} className={`flex-1 btn btn-sm whitespace-nowrap ${activeTab === 'notes' ? 'btn-primary' : 'btn-ghost'}`}>
          <ChatBubbleLeftRightIcon className="w-4 h-4" /> Notes
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-200">
             
             {/* Financial Summary Card (Replaces Forecast) */}
             <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-5">
                   <h3 className="card-title text-sm uppercase text-gray-500 mb-4 flex items-center gap-2"><BanknotesIcon className="w-4 h-4 text-primary" /> Financial Summary</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-base-200 pb-2">
                         <span className="text-sm">Revenue</span>
                         <span className="font-bold text-base-content">${deal.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-base-200 pb-2">
                         <span className="text-sm">Expenses</span>
                         <span className="font-bold text-error">-${totalExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold">Net Profit</span>
                         <span className={`font-black ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>${netProfit.toLocaleString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Link href={`/deals/${deal.id}/invoices/new`} className="btn btn-sm btn-primary w-full gap-2">
                           <DocumentTextIcon className="w-4 h-4" /> Create Invoice
                        </Link>
                        <button onClick={() => setShowExpenseModal(true)} className="btn btn-sm btn-outline w-full">Log Expense</button>
                      </div>
                   </div>
                </div>
             </div>

             {/* Contacts Card */}
             <div className="card bg-base-100 shadow-sm border border-base-200">
               <div className="card-body p-5">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-sm uppercase text-gray-500">Stakeholders</h3>
                    <Link href={`/deals/${deal.id}/edit`} className="btn btn-xs btn-ghost">+ Add</Link>
                 </div>
                 <div className="space-y-3">
                   {deal.contacts?.map((c: any) => (
                     <Link href={`/contacts/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition">
                        {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-xs">{c.name.charAt(0)}</div>}
                        <div><div className="font-bold text-sm">{c.name}</div><div className="text-xs text-gray-500">{c.jobTitle || c.email}</div></div>
                     </Link>
                   ))}
                 </div>
               </div>
             </div>
             
             {/* Roadmap (Moved to Overview) */}
             <div className="card bg-base-100 shadow-sm border border-base-200 md:col-span-2">
                <div className="card-body p-5">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold uppercase text-base-content/50 flex items-center gap-2"><MapIcon className="w-4 h-4" /> Roadmap</h3>
                     <button onClick={handleAddStageClick} className="btn btn-xs btn-ghost text-primary">+ Add Stage</button>
                   </div>
                   <div className="space-y-4">
                     {roadmap.map((step, idx) => (
                       <div key={step.id} className="flex items-center gap-4 relative group">
                          {idx !== roadmap.length - 1 && <div className={`absolute left-3.5 top-8 bottom-0 w-0.5 ${step.status === 'DONE' ? 'bg-success/30' : 'bg-base-200'}`}></div>}
                          <button onClick={() => toggleStageStatus(step.id)} className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all hover:scale-110 z-10 ${step.status === 'DONE' ? 'bg-success text-success-content border-success' : step.status === 'ACTIVE' ? 'bg-base-100 border-primary text-primary shadow-sm' : 'bg-base-100 border-base-300 text-base-content/20'}`}>
                            {step.status === 'DONE' ? <SolidCheck className="w-4 h-4" /> : step.status === 'ACTIVE' ? <SolidPlay className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                          </button>
                          <div className="flex-1 p-3 bg-base-200/30 rounded-xl flex justify-between items-center border border-base-200">
                             <span className="text-sm font-medium">{step.title}</span><span className="text-[10px] font-bold uppercase tracking-wider opacity-30">{step.status}</span>
                          </div>
                       </div>
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
                <QuickTaskForm dealId={deal.id} onSuccess={handleTaskAdded} />
             </div>
             <div className="space-y-3">
               {deal.tasks?.map((task: any) => <TaskCard key={task.id} task={task} />)}
             </div>
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