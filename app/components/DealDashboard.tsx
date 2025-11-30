"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  BriefcaseIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import DeleteDealButton from './DeleteDealButton';
import TaskCard from './TaskCard';
import DealNotes from './DealNotes';
import QuickTaskForm from './QuickTaskForm';
import DealFinances from './DealFinances';

// Types simplified for props
interface DashboardProps {
  deal: any; // We trust the server component to pass the correct shape
}

export default function DealDashboard({ deal }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'notes' | 'finances'>('overview');

  const statusColors: Record<string, string> = {
    WON: 'badge-success',
    LOST: 'badge-error',
    PENDING: 'badge-warning',
    NEGOTIATION: 'badge-info',
    OPEN: 'badge-primary'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      
      {/* 1. COMPACT HEADER */}
      <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`badge badge-lg font-bold ${statusColors[deal.status] || 'badge-ghost'}`}>
                {deal.status}
              </span>
              {deal.tags.map((tag: any) => (
                <span key={tag.id} className="badge badge-outline text-xs">{tag.name}</span>
              ))}
            </div>
            <h1 className="text-3xl font-extrabold break-all">{deal.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
             <Link href={`/deals/${deal.id}/edit`} className="btn btn-outline btn-sm">
               <PencilSquareIcon className="w-4 h-4" /> Edit
             </Link>
             <DeleteDealButton dealId={deal.id} />
          </div>
        </div>

        {/* Header Metrics Summary */}
        <div className="flex gap-6 mt-6 pt-4 border-t border-base-200">
           <div className="flex items-center gap-2">
             <div className="p-2 bg-success/10 text-success rounded-lg">
               <CurrencyDollarIcon className="w-5 h-5" />
             </div>
             <div>
               <div className="text-[10px] uppercase font-bold text-base-content/40">Value</div>
               <div className="font-bold">${deal.amount.toLocaleString()}</div>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <div className="p-2 bg-base-200 text-base-content/70 rounded-lg">
               <CalendarDaysIcon className="w-5 h-5" />
             </div>
             <div>
               <div className="text-[10px] uppercase font-bold text-base-content/40">Closing</div>
               <div className="font-bold text-sm">
                 {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'N/A'}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION (Sticky on Mobile) */}
      <div className="sticky top-0 z-40 bg-base-300/80 backdrop-blur-md p-1 rounded-xl flex gap-1 overflow-x-auto no-scrollbar shadow-sm">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-1 btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <UserGroupIcon className="w-4 h-4" /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 btn btn-sm ${activeTab === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <ClipboardDocumentListIcon className="w-4 h-4" /> Tasks
          {deal.tasks.length > 0 && <span className="badge badge-xs badge-neutral ml-1">{deal.tasks.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('finances')}
          className={`flex-1 btn btn-sm ${activeTab === 'finances' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <BanknotesIcon className="w-4 h-4" /> Finances
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" /> Notes
        </button>
      </div>

      {/* 3. TAB CONTENT AREA */}
      <div className="min-h-[400px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-200">
             {/* Contacts Card */}
             <div className="card bg-base-100 shadow-sm border border-base-200">
               <div className="card-body p-5">
                 <h3 className="card-title text-sm uppercase text-gray-500 mb-4">Contacts Involved</h3>
                 {deal.contacts.length === 0 ? (
                   <div className="text-center py-8 bg-base-200/50 rounded-xl border border-dashed border-base-300">
                     <p className="text-gray-400 text-sm">No contacts assigned.</p>
                     <Link href={`/deals/${deal.id}/edit`} className="btn btn-xs btn-ghost mt-2">Assign Contact</Link>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {deal.contacts.map((c: any) => (
                       <Link href={`/contacts/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold">
                              {c.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-sm">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.email}</div>
                          </div>
                       </Link>
                     ))}
                   </div>
                 )}
               </div>
             </div>

             {/* Simple Stats Card */}
             <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-5">
                   <h3 className="card-title text-sm uppercase text-gray-500 mb-4">Quick Stats</h3>
                   <div className="stats stats-vertical w-full bg-transparent">
                      <div className="stat px-0 py-2">
                        <div className="stat-title text-xs">Created</div>
                        <div className="stat-value text-base">{new Date(deal.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="stat px-0 py-2">
                        <div className="stat-title text-xs">Last Updated</div>
                        <div className="stat-value text-base">{new Date(deal.updatedAt).toLocaleDateString()}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-200">
             <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
                <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">Add New Task</h3>
                <QuickTaskForm dealId={deal.id} />
             </div>

             <div className="space-y-3">
               {deal.tasks.length === 0 ? (
                 <div className="text-center py-12">
                   <BriefcaseIcon className="w-12 h-12 text-base-300 mx-auto mb-2" />
                   <p className="text-gray-400">No tasks yet. Stay organized!</p>
                 </div>
               ) : (
                 deal.tasks.map((task: any) => (
                   <TaskCard key={task.id} task={task} />
                 ))
               )}
             </div>
          </div>
        )}

        {/* FINANCES TAB */}
        {activeTab === 'finances' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
             <DealFinances 
               dealId={deal.id} 
               dealAmount={deal.amount} 
               expenses={deal.expenses || []} 
             />
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in duration-200">
             <div className="min-h-[500px]">
                <DealNotes dealId={deal.id} initialNotes={deal.notes} />
             </div>
          </div>
        )}

      </div>
    </div>
  );
}