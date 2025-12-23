"use client";

import { 
  DocumentArrowDownIcon, 
  CheckCircleIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";

interface ProposalViewProps {
  deal: any;
  onAccept: () => void;
}

export default function ProposalView({ deal, onAccept }: ProposalViewProps) {
  const lineItems = deal.lineItems || [];
  const total = lineItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden print:shadow-none print:border-none">
        
        {/* Invoice Header */}
        <div className="p-8 border-b border-base-200 flex flex-col sm:flex-row justify-between gap-6 bg-base-50/30">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tight">Invoice</h2>
            <p className="text-sm opacity-50">#{deal.id.split('-')[0].toUpperCase()}</p>
            <div className="pt-4">
               <p className="text-xs font-bold uppercase opacity-40">Prepared For</p>
               <p className="font-bold">{deal.company?.name || "Client"}</p>
               <p className="text-sm opacity-60">{deal.contacts?.[0]?.name}</p>
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
         <button 
           onClick={handlePrint}
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
  );
}