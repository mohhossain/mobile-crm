"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  DocumentTextIcon, 
  PlusIcon, 
  ArrowDownTrayIcon, 
  ClockIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
  items: any;
}

export default function DealInvoices({ deal }: { deal: any }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const invoices = deal.invoices || [];

  const handleDelete = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setDeletingId(invoiceId);

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete invoice.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting invoice.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Action Card */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-base-100 p-6 rounded-2xl border border-base-200 shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-secondary/10 text-secondary rounded-xl shrink-0">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div>
             <h3 className="font-bold text-lg leading-tight">Invoices</h3>
             <p className="text-sm text-base-content/60">{invoices.length} generated</p>
          </div>
        </div>
        <Link href={`/deals/${deal.id}/invoices/new`} className="btn btn-secondary gap-2 w-full sm:w-auto shadow-lg shadow-secondary/20">
          <PlusIcon className="w-5 h-5" /> Create New Invoice
        </Link>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {invoices.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-base-200 rounded-2xl bg-base-100/50">
             <div className="bg-base-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                <DocumentTextIcon className="w-6 h-6" />
             </div>
             <p className="text-sm text-base-content/40 font-medium">No invoices yet.</p>
             <p className="text-xs text-base-content/30 mt-1">Create one to start billing.</p>
          </div>
        )}

        {invoices.map((inv: Invoice) => {
          const snapshotDeal = {
             ...deal,
             lineItems: inv.items
          };

          return (
            <div key={inv.id} className="card bg-base-100 shadow-sm border border-base-200 group hover:border-secondary/20 transition-all">
              <div className="card-body p-4 sm:p-5 flex-row items-center justify-between gap-4">
                 
                 <div className="flex items-center gap-4 min-w-0">
                   <div className="min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                       <span className="font-mono font-bold text-sm text-secondary">{inv.number}</span>
                       <span className={`badge badge-xs font-bold ${
                         inv.status === 'PAID' ? 'badge-success text-white' : 
                         inv.status === 'SENT' ? 'badge-info text-white' : 
                         inv.status === 'OVERDUE' ? 'badge-error text-white' : 'badge-ghost'
                       }`}>
                         {inv.status}
                       </span>
                     </div>
                     <div className="text-xs opacity-50 flex items-center gap-1">
                       <ClockIcon className="w-3 h-3" />
                       Due: {new Date(inv.dueDate).toLocaleDateString()}
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-3 sm:gap-6">
                   <div className="text-right">
                     <div className="font-black text-lg">${inv.amount.toLocaleString()}</div>
                     <div className="text-[10px] uppercase font-bold opacity-30 hidden sm:block">Total Amount</div>
                   </div>
                   
                   <div className="flex gap-1">
                     {/* Download Button */}
                     <PDFDownloadLink
                       document={<InvoicePDF deal={snapshotDeal} user={{ name: "Me", email: "me@pulse.com" }} />}
                       fileName={`invoice-${inv.number}.pdf`}
                       className="btn btn-square btn-sm btn-ghost text-base-content/40 hover:text-secondary hover:bg-secondary/10 transition-colors"
                       title="Download PDF"
                     >
                       {/* @ts-ignore */}
                       {({ loading }) => (loading ? <span className="loading loading-spinner loading-xs"></span> : <ArrowDownTrayIcon className="w-5 h-5" />)}
                     </PDFDownloadLink>

                     {/* Delete Button */}
                     <button 
                       onClick={() => handleDelete(inv.id)}
                       disabled={deletingId === inv.id}
                       className="btn btn-square btn-sm btn-ghost text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
                       title="Delete Invoice"
                     >
                       {deletingId === inv.id ? (
                         <span className="loading loading-spinner loading-xs"></span>
                       ) : (
                         <TrashIcon className="w-5 h-5" />
                       )}
                     </button>
                   </div>
                 </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}