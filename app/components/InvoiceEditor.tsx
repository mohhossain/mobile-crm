"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentCheckIcon, 
  CalendarDaysIcon,
  HashtagIcon
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
  
  // Invoice State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  
  // Initialize items from Deal Line Items or default
  const [items, setItems] = useState<LineItem[]>(
    deal.lineItems.length > 0 
      ? deal.lineItems.map(li => ({ description: li.name, quantity: li.quantity, price: li.price }))
      : [{ description: deal.title, quantity: 1, price: deal.amount }]
  );

  // Set Net 30 default for due date
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const client = deal.contacts[0] || { name: "Client", email: "", company: "" };

  // --- Handlers ---
  
  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id,
          number: invoiceNumber,
          issueDate,
          dueDate,
          items
        })
      });

      if (res.ok) {
        // Redirect to the deal page or a view invoice page (once built)
        router.push(`/deals/${deal.id}?tab=invoices`);
        router.refresh();
      } else {
        alert("Failed to create invoice");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 max-w-4xl mx-auto">
      <div className="card-body p-6 sm:p-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-base-content">New Invoice</h1>
            <p className="text-sm text-base-content/60 mt-1">Create a draft for {client.name}</p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
             <div className="join w-full">
               <div className="btn btn-sm join-item bg-base-200 border-base-300 no-animation">
                 <HashtagIcon className="w-4 h-4" />
               </div>
               <input 
                 className="input input-sm input-bordered join-item w-full md:w-32 font-mono"
                 value={invoiceNumber}
                 onChange={(e) => setInvoiceNumber(e.target.value)}
                 placeholder="INV-001"
               />
             </div>
             <div className="flex gap-2">
               <div className="form-control w-1/2 md:w-32">
                 <label className="label py-0 text-[10px] font-bold uppercase opacity-50">Issued</label>
                 <input type="date" className="input input-xs input-bordered" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
               </div>
               <div className="form-control w-1/2 md:w-32">
                 <label className="label py-0 text-[10px] font-bold uppercase opacity-50">Due</label>
                 <input type="date" className="input input-xs input-bordered" value={dueDate} onChange={e => setDueDate(e.target.value)} />
               </div>
             </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 p-4 bg-base-200/30 rounded-xl border border-base-200">
           <h3 className="text-xs font-bold uppercase opacity-40 mb-2">Bill To</h3>
           <div className="font-bold">{client.name}</div>
           {client.company && <div className="text-sm">{client.company}</div>}
           <div className="text-sm opacity-60">{client.email}</div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
           <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase opacity-40 px-2">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Price</div>
              <div className="col-span-1"></div>
           </div>

           <div className="space-y-2">
             {items.map((item, idx) => (
               <div key={idx} className="grid grid-cols-12 gap-4 items-center group">
                 <div className="col-span-6">
                    <input 
                      className="input input-sm input-bordered w-full" 
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Service description"
                    />
                 </div>
                 <div className="col-span-2">
                    <input 
                      type="number" 
                      className="input input-sm input-bordered w-full text-center" 
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    />
                 </div>
                 <div className="col-span-3">
                    <input 
                      type="number" 
                      className="input input-sm input-bordered w-full text-right" 
                      value={item.price}
                      onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                    />
                 </div>
                 <div className="col-span-1 text-right">
                    <button onClick={() => removeItem(idx)} className="btn btn-ghost btn-xs btn-square text-error">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                 </div>
               </div>
             ))}
           </div>
           
           <button onClick={addItem} className="btn btn-xs btn-ghost gap-2 pl-0 hover:bg-transparent hover:text-primary">
             <PlusIcon className="w-4 h-4" /> Add Line Item
           </button>
        </div>

        {/* Totals & Actions */}
        <div className="mt-8 pt-8 border-t border-base-200 flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="text-xs text-base-content/40 max-w-xs">
             Terms: Payment is due within 30 days. Please include invoice number on your check.
           </div>
           
           <div className="w-full md:w-64 space-y-4">
             <div className="flex justify-between items-center text-xl font-black">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
             </div>
             <button 
               onClick={handleSave} 
               disabled={loading}
               className="btn btn-primary w-full shadow-lg shadow-primary/20"
             >
               {loading ? <span className="loading loading-spinner"></span> : <><DocumentCheckIcon className="w-5 h-5" /> Save & Generate</>}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}