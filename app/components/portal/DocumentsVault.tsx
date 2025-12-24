"use client";

import { useState } from "react";
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  ShieldCheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import ContractPDF from "./ContractPDF";
// Import your existing InvoicePDF component (Update path if necessary)
import InvoicePDF from "@/app/components/InvoicePDF"; 

interface DocumentsVaultProps {
  deal: any;
  user: any; 
}

export default function DocumentsVault({ deal, user }: DocumentsVaultProps) {
  const [viewingDoc, setViewingDoc] = useState<{ type: 'CONTRACT' | 'INVOICE', data?: any } | null>(null);

  const documents = [
    { 
      id: 'contract', 
      name: 'Executed Service Agreement', 
      date: deal.signedAt, 
      status: 'Signed', 
      icon: ShieldCheckIcon,
      type: 'CONTRACT',
      available: !!deal.signedAt,
      data: null
    },
    ...(deal.invoices || []).map((inv: any, idx: number) => ({
       id: inv.id,
       name: `Invoice #${inv.number || idx + 1}`,
       date: inv.issueDate,
       status: inv.status,
       icon: DocumentTextIcon,
       type: 'INVOICE',
       data: inv,
       available: true
    }))
  ];

  // --- RENDER OVERLAYS ---

  if (viewingDoc?.type === 'CONTRACT') {
      return <ContractPDF deal={deal} user={user} onClose={() => setViewingDoc(null)} />;
  }

  if (viewingDoc?.type === 'INVOICE') {
      // Create a snapshot combining Deal + Invoice data for the PDF
      const invoiceDealSnapshot = { 
          ...deal, 
          invoiceNumber: viewingDoc.data.number,
          issueDate: viewingDoc.data.issueDate,
          dueDate: viewingDoc.data.dueDate,
          amount: viewingDoc.data.amount,
          lineItems: viewingDoc.data.items 
      };

      return (
        <div className="fixed inset-0 z-[100] bg-base-100 overflow-y-auto flex justify-center">
            <div className="fixed top-4 right-4 z-[110] print:hidden">
                <button onClick={() => setViewingDoc(null)} className="btn btn-circle btn-neutral shadow-lg">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="w-full max-w-[210mm] mt-8 mb-8">
               <InvoicePDF deal={invoiceDealSnapshot} user={user} />
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
         <h3 className="font-bold text-lg">Documents Vault</h3>
      </div>

      <div className="grid gap-3">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            onClick={() => doc.available && setViewingDoc({ type: doc.type as any, data: doc.data })}
            className={`
              bg-base-100 p-4 rounded-2xl border border-base-200 flex items-center gap-4 transition-all group
              ${doc.available ? 'cursor-pointer hover:border-primary/30 hover:shadow-md' : 'opacity-60 cursor-not-allowed bg-base-50'}
            `}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${doc.status === 'PAID' || doc.status === 'Signed' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/40'}`}>
              <doc.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-bold text-sm truncate">{doc.name}</p>
               {doc.date ? (
                   <p className="text-xs opacity-50">{new Date(doc.date).toLocaleDateString()}</p>
               ) : (
                   <p className="text-xs text-warning font-medium">Pending Signature</p>
               )}
            </div>
            <div className="flex items-center gap-3">
               {doc.status === 'PAID' && <span className="badge badge-success badge-sm text-white">Paid</span>}
               {doc.available && (
                   <button className="btn btn-ghost btn-sm btn-square text-base-content/40 group-hover:text-primary">
                     <ArrowDownTrayIcon className="w-5 h-5" />
                   </button>
               )}
            </div>
          </div>
        ))}
        {documents.length === 0 && <div className="text-center py-12 text-base-content/40 italic">No documents available.</div>}
      </div>
    </div>
  );
}