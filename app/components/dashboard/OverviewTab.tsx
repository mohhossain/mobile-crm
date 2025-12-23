"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  CalendarDaysIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import LineItemsManager from "./LineItemsManager";

interface OverviewProps {
  deal: any;
  onUpdate: (updates: any) => void;
  onRefresh: () => void;
  onOpenPayment: () => void; // Record Payment
  onOpenExpense: () => void;
  onOpenPaymentConfig: () => void; // Configure Payment (Deposit/Methods)
  onViewContract: () => void;
  onSendProposal: () => void;
  onGenerateLink: () => void;
  onNavigateTab: (tab: string) => void;
}

export default function OverviewTab({ 
  deal, 
  onUpdate, 
  onRefresh, 
  onOpenPayment, 
  onOpenExpense,
  onOpenPaymentConfig, 
  onViewContract,
  onSendProposal,
  onGenerateLink,
  onNavigateTab
}: OverviewProps) {
  
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateInput, setDateInput] = useState(deal.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : "");

  // Calculations
  const totalExpenses = deal.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const netProfit = deal.amount - totalExpenses;
  const isDueSoon = deal.closeDate && new Date(deal.closeDate) > new Date() && 
    (new Date(deal.closeDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7;

  // Handlers
  const saveDate = () => {
    const newDate = dateInput ? new Date(`${dateInput}T17:00:00`).toISOString() : null;
    onUpdate({ closeDate: newDate });
    setIsEditingDate(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-left-2 duration-300">
       
       {/* LEFT COLUMN: Scope, Financials, Details */}
       <div className="lg:col-span-2 space-y-6">
          
          {/* Scope of Work */}
          <LineItemsManager dealId={deal.id} initialItems={deal.lineItems || []} onUpdate={onRefresh} />
          
          {/* Financial Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {/* Payment Terms (Renamed from Deposit) */}
             <div 
               className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm cursor-pointer hover:border-primary/50 transition group relative overflow-hidden"
               onClick={onOpenPaymentConfig}
             >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-50">
                        <CreditCardIcon className="w-4 h-4" /> Payment Terms
                    </div>
                    <Cog6ToothIcon className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />
                </div>
                
                <div className="text-xl font-bold">
                   {deal.depositAmount > 0 ? (
                       <span className="flex flex-col">
                           <span>${deal.depositAmount.toLocaleString()} <span className="text-xs font-normal opacity-50">Deposit</span></span>
                       </span>
                   ) : (
                       <span className="text-base font-normal opacity-60">Full on Completion</span>
                   )}
                </div>
                
                {/* Visual Indicator for Configured Methods */}
                {(deal.paymentLink || (deal.paymentMethods && Object.keys(deal.paymentMethods).length > 0)) && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                    </div>
                )}
             </div>
             
             {/* Net Profit Card */}
             <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase opacity-50">
                  <ArrowTrendingUpIcon className="w-4 h-4" /> Net Profit
                </div>
                <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                  ${netProfit.toLocaleString()}
                </div>
             </div>
             
             {/* Target Date Card */}
             <div className="bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm col-span-2 md:col-span-1 cursor-pointer hover:border-primary/50 transition" onClick={() => setIsEditingDate(true)}>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase opacity-50">
                  <CalendarDaysIcon className="w-4 h-4" /> Target Close
                </div>
                {isEditingDate ? (
                  <input 
                    type="date" 
                    className="input input-sm w-full p-0 focus:outline-none" 
                    value={dateInput} 
                    onChange={e => setDateInput(e.target.value)} 
                    onBlur={saveDate} 
                    autoFocus 
                  />
                ) : (
                  <div className="text-xl font-bold flex items-center gap-2">
                    {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : <span className="text-xs opacity-50">Set Date</span>}
                    {isDueSoon && <span className="badge badge-xs badge-warning">Soon</span>}
                  </div>
                )}
             </div>
          </div>

          {/* Contract Status */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
             <div className="card-body p-5">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-sm uppercase opacity-50">Contract Status</h3>
                   {deal.signedAt && <span className="badge badge-success text-white gap-1">Signed</span>}
                </div>
                {deal.signedAt ? (
                   <div className="bg-base-50 p-4 rounded-xl flex items-center gap-4">
                      <div className="flex-1">
                         <p className="text-sm font-bold">Contract signed by Client</p>
                         <p className="text-xs opacity-50">On {new Date(deal.signedAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={onViewContract} className="btn btn-sm btn-ghost gap-2">View</button>
                   </div>
                ) : (
                   <div className="bg-base-50 p-4 rounded-xl text-center">
                      <p className="text-sm opacity-60 mb-2">No contract signed yet.</p>
                      {deal.shareToken ? (
                          <button onClick={onSendProposal} className="btn btn-sm btn-primary btn-outline">Send Proposal</button>
                      ) : (
                          <button onClick={onGenerateLink} className="btn btn-sm btn-primary gap-2">Generate Magic Link</button>
                      )}
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

       {/* RIGHT COLUMN: Action Center */}
       <div className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200 h-fit">
             <div className="p-4 border-b border-base-200 bg-base-50/50 rounded-t-xl">
                <h3 className="font-bold text-sm uppercase opacity-60 flex items-center gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 text-secondary" /> Action Center
                </h3>
             </div>
             <div className="card-body p-4 gap-4">
                <div className="grid grid-cols-1 gap-2">
                   <button 
                     onClick={onOpenPayment}
                     className="btn btn-sm btn-primary w-full text-xs shadow-md"
                   >
                     <BanknotesIcon className="w-3 h-3" /> Record Payment
                   </button>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-base-200 pt-3">
                   <button onClick={onOpenExpense} className="btn btn-sm btn-outline w-full text-xs">
                     <BanknotesIcon className="w-3 h-3" /> Expense
                   </button>
                   <Link href={`/deals/${deal.id}/invoices/new`} className="btn btn-sm btn-outline w-full text-xs">
                     <DocumentTextIcon className="w-3 h-3" /> Invoice
                   </Link>
                </div>
                {/* Next Up Task */}
             </div>
          </div>
       </div>
    </div>
  );
}