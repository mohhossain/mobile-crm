"use client";

import { useState } from "react";
import { 
  CheckCircleIcon,
  PrinterIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
// FIX: Correct import path for InvoicePDF (Up one level from 'portal' to 'components')
import InvoicePDF from "../InvoicePDF"; 

interface ProposalViewProps {
  deal: any;
  onAccept: () => void;
}

export default function ProposalView({ deal, onAccept }: ProposalViewProps) {
  // Toggle for the Print/PDF Overlay
  const [showPrintView, setShowPrintView] = useState(false);

  // FIX: Robust Name Logic
  // 1. Try Contact Name (e.g. "Emily Chen")
  // 2. Try Company Name (e.g. "Acme Corp")
  // 3. Fallback to "Valued Client"
  const contactName = deal.contacts?.[0]?.name;
  const companyName = deal.company?.name || (deal.contacts?.[0]?.company);
  
  const displayName = contactName || companyName || "Valued Client";
  const displayEmail = deal.contacts?.[0]?.email || deal.company?.email || "";

  // Totals Logic
  const lineItems = deal.lineItems || [];
  const total = lineItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* PRINT OVERLAY: Renders the clean InvoicePDF component */}
      {showPrintView && (
         <div className="fixed inset-0 z-[100] bg-base-100/90 backdrop-blur-sm overflow-y-auto flex justify-center">
            <div className="fixed top-4 right-4 z-[110] print:hidden">
                <button onClick={() => setShowPrintView(false)} className="btn btn-circle btn-neutral shadow-lg">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            {/* Wrapper ensures correct width for PDF generation */}
            <div className="w-full max-w-[210mm] mt-8 mb-8 print:mt-0 print:mb-0 print:w-full print:max-w-none">
               <InvoicePDF deal={deal} user={deal.user} />
            </div>
         </div>
      )}

      {/* WEB VIEW UI */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden print:hidden">
          
          {/* Invoice Header */}
          <div className="p-8 border-b border-base-200 flex flex-col sm:flex-row justify-between gap-6 bg-base-50/30">
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tight">Invoice</h2>
              <p className="text-sm opacity-50">#{deal.invoiceNumber || deal.id.split('-')[0].toUpperCase()}</p>
              <div className="pt-4">
                 <p className="text-xs font-bold uppercase opacity-40">Prepared For</p>
                 {/* FIX: Use the resolved display name */}
                 <p className="font-bold text-lg">{displayName}</p>
                 {displayEmail && <p className="text-sm opacity-60">{displayEmail}</p>}
                 {/* Show company too if it exists and differs from contact name */}
                 {companyName && companyName !== displayName && <p className="text-sm opacity-60">{companyName}</p>}
              </div>
            </div>
           
            <div className="sm:text-right space-y-1">
              <p className="text-xs font-bold uppercase opacity-40">From</p>
              <p className="font-bold">{deal.user.name}</p>
              <p className="text-sm opacity-60">{deal.user.email}</p>
              <p className="text-sm opacity-60">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-0 overflow-x-auto">
            <table className="table w-full border-collapse">
              <thead className="bg-base-50">
                <tr className="border-b border-base-200">
                  <th className="text-xs uppercase opacity-50 py-4 px-8">Description</th>
                  <th className="text-xs uppercase opacity-50 py-4 text-center">Qty</th>
                  <th className="text-xs uppercase opacity-50 py-4 text-right px-8">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item: any) => (
                  <tr key={item.id} className="border-b border-base-100 hover:bg-base-50/30 transition-colors">
                    <td className="py-6 px-8">
                      <div className="font-bold text-base">{item.name}</div>
                      {item.description && <div className="text-xs opacity-50 mt-1 max-w-xs">{item.description}</div>}
                    </td>
                    <td className="text-center font-mono opacity-60">{item.quantity}</td>
                    <td className="text-right px-8 font-bold font-mono">${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-8 flex flex-col items-end space-y-3 bg-base-50/30 border-t border-base-200">
             <div className="flex justify-between w-full max-w-[240px] text-sm opacity-60">
                <span>Subtotal</span>
                <span>${total.toLocaleString()}</span>
             </div>
             {deal.depositAmount > 0 && (
                <div className="flex justify-between w-full max-w-[240px] text-sm text-primary font-bold">
                  <span>Deposit Required</span>
                  <span>${deal.depositAmount.toLocaleString()}</span>
                </div>
             )}
             <div className="flex justify-between w-full max-w-[240px] text-2xl font-black pt-2 border-t border-base-200">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
           {/* FIX: Opens the Print/PDF Overlay instead of window.print() directly */}
           <button 
             onClick={() => setShowPrintView(true)}
             className="btn btn-outline flex-1 gap-2 rounded-2xl"
           >
             <PrinterIcon className="w-5 h-5" /> Download PDF / Print
           </button>
           
           {!deal.signedAt && (
             <button 
               onClick={onAccept}
               className="btn btn-primary flex-[2] gap-2 rounded-2xl shadow-lg shadow-primary/20"
             >
               Continue to Sign Contract <CheckCircleIcon className="w-5 h-5" />
             </button>
           )}
        </div>
      </div>
    </>
  );
}