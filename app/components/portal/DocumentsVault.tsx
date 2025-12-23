"use client";

import { 
  DocumentIcon, 
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

interface DocumentsVaultProps {
  deal: any;
}

export default function DocumentsVault({ deal }: DocumentsVaultProps) {
  const documents = [
    { 
      id: 'contract', 
      name: 'Executed Service Agreement', 
      date: deal.signedAt, 
      status: 'Signed', 
      icon: ShieldCheckIcon,
      type: 'PDF'
    },
    ...deal.invoices.map((inv: any, idx: number) => ({
       id: inv.id,
       name: `Invoice #${inv.number || idx + 1}`,
       date: inv.issueDate,
       status: inv.status,
       icon: DocumentIcon,
       type: 'PDF'
    }))
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center justify-between px-2">
         <h3 className="font-bold text-sm uppercase opacity-40 tracking-widest">Document Vault</h3>
         <span className="text-xs opacity-40">Secured with SSL</span>
      </div>

      <div className="grid gap-3">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-base-100 p-4 rounded-2xl border border-base-200 flex items-center gap-4 hover:border-primary/30 transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.status === 'PAID' || doc.status === 'Signed' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/40'}`}>
              <doc.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-bold text-sm truncate">{doc.name}</p>
               <p className="text-xs opacity-50">{new Date(doc.date).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
               {doc.status === 'PAID' && <span className="badge badge-success badge-sm text-white">Paid</span>}
               <button 
                 onClick={() => window.print()} 
                 className="btn btn-ghost btn-sm btn-square opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <ArrowDownTrayIcon className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3 mt-6">
         <CheckBadgeIcon className="w-5 h-5 text-primary mt-0.5" />
         <p className="text-xs text-primary/80 leading-relaxed">
            All agreements and financial documents are stored here. You can return to this link at any time to download your records.
         </p>
      </div>
    </div>
  );
}