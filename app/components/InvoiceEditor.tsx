"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentCheckIcon, 
  CalendarDaysIcon,
  HashtagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

interface Deal {
  id: string;
  title: string;
  amount: number;
  lineItems: { name: string; quantity: number; price: number }[];
  contacts: { name: string; email: string | null; company: string | null }[];
}

export default function InvoiceEditor({ deal }: { deal: Deal }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Invoice State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState(""); // Added Notes field
  
  // Initialize items from Deal Line Items or default
  const [items, setItems] = useState<LineItem[]>(() => {
    if (deal.lineItems && deal.lineItems.length > 0) {
      return deal.lineItems.map(li => ({ description: li.name, quantity: li.quantity, price: li.price }));
    }
    return [{ description: deal.title || "Consulting Services", quantity: 1, price: deal.amount || 0 }];
  });

  // Set Net 30 default for due date on mount
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  // Safe Client Access
  const client = deal.contacts?.[0] || { name: "Unknown Client", email: "", company: "" };

  // --- Handlers ---
  
  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    // Basic Validation
    if (!invoiceNumber.trim()) {
      setError("Invoice number is required");
      setLoading(false);
      return;
    }
    if (items.length === 0) {
      setError("At least one line item is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id,
          number: invoiceNumber,
          issueDate,
          dueDate,
          items,
          notes
        })
      });

      if (res.ok) {
        setSuccess(true);
        // Delay redirect slightly to show success state
        setTimeout(() => {
           router.push(`/deals/${deal.id}?tab=invoices`);
           router.refresh();
        }, 1000);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to create invoice");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card bg-base-100 shadow-xl border border-success/20 max-w-4xl mx-auto p-12 text-center animate-in zoom-in duration-300">
        <div className="flex flex-col items-center gap-4">
          <CheckCircleIcon className="w-16 h-16 text-success" />
          <h2 className="text-2xl font-bold">Invoice Generated!</h2>
          <p className="text-base-content/60">Redirecting you back to the deal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 max-w-4xl mx-auto">
      <div className="card-body p-6 sm:p-10">
        
        {/* Error Alert */}
        {error && (
          <div role="alert" className="alert alert-error mb-6 shadow-sm">
            <ExclamationCircleIcon className="w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-base-content tracking-tight">New Invoice</h1>
            <p className="text-sm text-base-content/60 mt-1">
              Creating invoice for <span className="font-semibold text-base-content">{deal.title}</span>
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
             <div className="join w-full shadow-sm">
               <div className="btn btn-sm join-item bg-base-200 border-base-300 no-animation cursor-default px-3">
                 <HashtagIcon className="w-4 h-4 opacity-50" />
               </div>
               <input 
                 className="input input-sm input-bordered join-item w-full md:w-40 font-mono font-bold"
                 value={invoiceNumber}
                 onChange={(e) => setInvoiceNumber(e.target.value)}
                 placeholder="INV-001"
               />
             </div>
             
             <div className="flex gap-2">
               <div className="form-control w-1/2 md:w-36">
                 <label className="label py-0 pb-1 text-[10px] font-bold uppercase opacity-50">Issued</label>
                 <input type="date" className="input input-sm input-bordered w-full" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
               </div>
               <div className="form-control w-1/2 md:w-36">
                 <label className="label py-0 pb-1 text-[10px] font-bold uppercase opacity-50">Due</label>
                 <input type="date" className="input input-sm input-bordered w-full" value={dueDate} onChange={e => setDueDate(e.target.value)} />
               </div>
             </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 p-5 bg-base-200/40 rounded-xl border border-base-200/60 flex flex-col md:flex-row gap-8">
           <div className="flex-1">
             <h3 className="text-xs font-bold uppercase opacity-40 mb-2 tracking-wider">Bill To</h3>
             {client.name !== "Unknown Client" ? (
               <>
                 <div className="font-bold text-lg">{client.name}</div>
                 {client.company && <div className="text-sm font-medium opacity-80">{client.company}</div>}
                 <div className="text-sm opacity-60 mt-1">{client.email}</div>
               </>
             ) : (
                <div className="text-warning text-sm flex items-center gap-2">
                  <ExclamationCircleIcon className="w-4 h-4" /> No contact linked to this deal.
                </div>
             )}
           </div>
           
           <div className="flex-1 md:border-l md:border-base-300 md:pl-8">
              <h3 className="text-xs font-bold uppercase opacity-40 mb-2 tracking-wider">Notes / Terms</h3>
              <textarea 
                className="textarea textarea-bordered textarea-sm w-full h-20 resize-none bg-base-100"
                placeholder="e.g. Thanks for your business! Payment due within 30 days."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
           </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
           <div className="grid grid-cols-12 gap-4 text-[10px] font-bold uppercase opacity-40 px-2 tracking-wider">
              <div className="col-span-6 md:col-span-7">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 md:col-span-2 text-right">Price</div>
              <div className="col-span-1"></div>
           </div>

           <div className="space-y-2">
             {items.map((item, idx) => (
               <div key={idx} className="grid grid-cols-12 gap-3 items-center group">
                 <div className="col-span-6 md:col-span-7">
                    <input 
                      className="input input-sm input-bordered w-full" 
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Item description"
                      autoFocus={idx === items.length - 1 && items.length > 1}
                    />
                 </div>
                 <div className="col-span-2">
                    <input 
                      type="number" 
                      min="0"
                      className="input input-sm input-bordered w-full text-center px-1" 
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    />
                 </div>
                 <div className="col-span-3 md:col-span-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs opacity-40">$</span>
                      <input 
                        type="number" 
                        min="0"
                        className="input input-sm input-bordered w-full text-right pl-5" 
                        value={item.price}
                        onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                      />
                    </div>
                 </div>
                 <div className="col-span-1 text-right">
                    <button 
                      onClick={() => removeItem(idx)} 
                      className="btn btn-ghost btn-xs btn-square text-base-content/30 hover:text-error hover:bg-error/10 transition-colors"
                      tabIndex={-1}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                 </div>
               </div>
             ))}
           </div>
           
           <button onClick={addItem} className="btn btn-sm btn-ghost gap-2 pl-0 hover:bg-transparent hover:text-primary text-base-content/60 transition-colors">
             <PlusIcon className="w-4 h-4" /> Add Line Item
           </button>
        </div>

        {/* Totals & Actions */}
        <div className="mt-8 pt-8 border-t border-base-200 flex flex-col md:flex-row justify-end items-center gap-6">
           <div className="w-full md:w-72 space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="opacity-60">Subtotal</span>
                <span className="font-mono">${total.toLocaleString()}</span>
             </div>
             {/* Tax calculation could go here */}
             <div className="flex justify-between items-center text-xl font-black text-primary border-t border-base-200 pt-4">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
             </div>
             
             <button 
               onClick={handleSave} 
               disabled={loading}
               className="btn btn-primary w-full shadow-lg shadow-primary/20 mt-4"
             >
               {loading ? <span className="loading loading-spinner"></span> : <><DocumentCheckIcon className="w-5 h-5" /> Generate Invoice</>}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}