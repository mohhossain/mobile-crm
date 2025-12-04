"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, BanknotesIcon, TagIcon, CalculatorIcon } from "@heroicons/react/24/outline";

import InputTags from "./InputTags";
import AddLeads from "./AddLeads";
import ContactMultiSelect, { Contact } from "./ContactMultiSelect";
import AddNotes from "./AddNotes";

interface ExpenseDraft {
  description: string;
  amount: string;
  category: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
}

interface LineItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
}

const AddDeals = () => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [closeDateDate, setCloseDateDate] = useState("");
  const [closeDateTime, setCloseDateTime] = useState("");

  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState<ExpenseDraft>({
    description: "",
    amount: "",
    category: "OTHER",
    date: new Date().toISOString().split('T')[0]
  });

  // NEW: Product & Line Item State
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { name: "Consulting Services", quantity: 1, price: 0 } // Default empty item
  ]);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, productsRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/products")
        ]);
        
        const contactsData = await contactsRes.json();
        setContactOptions(Array.isArray(contactsData) ? contactsData : contactsData.contacts || []);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  // Recalculate total whenever line items change
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCalculatedAmount(total);
  }, [lineItems]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { name: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...lineItems];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        name: product.name,
        price: product.unitPrice
      };
      setLineItems(newItems);
    }
  };

  // ... (Keep existing expense handlers: handleAddExpense, handleRemoveExpense)
  const handleAddExpense = () => {
    if(!newExpense.description || !newExpense.amount) return;
    setExpenses([...expenses, newExpense]);
    setNewExpense({
      description: "",
      amount: "",
      category: "OTHER",
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleRemoveExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    let finalCloseDate = null;
    if (closeDateDate) {
      const timePart = closeDateTime || "17:00"; 
      finalCloseDate = new Date(`${closeDateDate}T${timePart}:00`).toISOString();
    }

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: calculatedAmount, // Use the calculated total
          status,
          tags,
          closeDate: finalCloseDate,
          contactIds: selectedContacts.map((c) => c.id),
          notes,
          expenses,
          lineItems // Send line items to API
        }),
      });

      if (!response.ok) throw new Error("Failed to add deal");

      setSuccess(true);
      setTitle(""); 
      setLineItems([{ name: "Consulting Services", quantity: 1, price: 0 }]);
      setStatus("OPEN"); 
      setTags([]);
      setSelectedContacts([]); 
      setCloseDateDate(""); setCloseDateTime("");
      setNotes([]); setExpenses([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="max-w-3xl mx-auto p-6 pb-32 space-y-8" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center">Create New Deal</h2>
        
        {error && <div className="alert alert-error text-sm">{error}</div>}
        {success && <div className="alert alert-success text-sm">Deal added successfully!</div>}

        <div className="space-y-6">
          
          {/* Title & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 form-control">
              <label className="label font-semibold">Deal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Redesign"
                required
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label font-semibold">Status</label>
              <select className="select select-bordered w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="PENDING">Pending</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
          </div>

          {/* NEW: LINE ITEMS BUILDER */}
          <div className="bg-base-100 rounded-xl border border-base-300 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
               <label className="label font-semibold py-0 flex items-center gap-2">
                 <TagIcon className="w-4 h-4" /> Services & Products
               </label>
               <div className="badge badge-primary badge-outline text-sm font-bold">
                 Total: ${calculatedAmount.toLocaleString()}
               </div>
            </div>
            
            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-base-200/50 p-2 rounded-lg group">
                   {/* Product Selector */}
                   {products.length > 0 && (
                     <select 
                       className="select select-sm select-bordered w-full sm:w-32"
                       value={item.productId || ""}
                       onChange={(e) => handleProductSelect(idx, e.target.value)}
                     >
                       <option value="">Custom Item</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                   )}
                   
                   {/* Name Input */}
                   <input 
                     className="input input-sm input-bordered w-full sm:flex-1" 
                     placeholder="Service Description"
                     value={item.name}
                     onChange={(e) => updateLineItem(idx, 'name', e.target.value)}
                   />

                   {/* Qty & Price */}
                   <div className="flex gap-2 w-full sm:w-auto">
                     <input 
                       type="number" 
                       className="input input-sm input-bordered w-16 text-center" 
                       value={item.quantity}
                       onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                       placeholder="Qty"
                     />
                     <input 
                       type="number" 
                       className="input input-sm input-bordered w-24 text-right" 
                       value={item.price}
                       onChange={(e) => updateLineItem(idx, 'price', parseFloat(e.target.value) || 0)}
                       placeholder="$"
                     />
                   </div>

                   {/* Delete */}
                   <button type="button" onClick={() => handleRemoveLineItem(idx)} className="btn btn-xs btn-ghost btn-square text-gray-400 hover:text-error">
                     <TrashIcon className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
            
            <button type="button" onClick={handleAddLineItem} className="btn btn-xs btn-ghost mt-2 gap-1">
              <PlusIcon className="w-3 h-3" /> Add Item
            </button>
          </div>

          {/* Date & Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label font-semibold">Target Close</label>
              <div className="flex gap-2">
                <input type="date" className="input input-bordered w-full" value={closeDateDate} onChange={(e) => setCloseDateDate(e.target.value)} />
                <input type="time" className="input input-bordered w-28" value={closeDateTime} onChange={(e) => setCloseDateTime(e.target.value)} />
              </div>
            </div>

            <div className="form-control">
              <label className="label font-semibold">Contacts</label>
              <ContactMultiSelect
                contacts={contactOptions}
                selected={selectedContacts}
                onChange={(newSelected) => setSelectedContacts(newSelected)}
              />
              <button type="button" className="btn btn-ghost btn-xs mt-1 self-start" onClick={() => setShowAddContactModal(true)}>+ Create New</button>
            </div>
          </div>

          {/* Expenses (Keep existing logic) */}
          <div className="bg-base-200/50 p-6 rounded-xl border border-base-300">
            <div className="flex justify-between items-center mb-4">
              <label className="label font-semibold py-0 flex items-center gap-2 text-lg">
                <BanknotesIcon className="w-5 h-5" /> Initial Expenses
              </label>
              <button type="button" onClick={() => setShowExpenseForm(!showExpenseForm)} className="btn btn-sm btn-ghost">{showExpenseForm ? "Hide" : "+ Add Expense"}</button>
            </div>
            {expenses.length > 0 && (
              <div className="space-y-3 mb-4">
                {expenses.map((exp, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm bg-base-100 p-3 rounded-lg border border-base-200 shadow-sm gap-2">
                    <div>
                       <span className="font-medium block sm:inline">{exp.description}</span>
                       <span className="text-xs opacity-60 sm:ml-2 block sm:inline">{exp.category} • {new Date(exp.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                      <span className="text-error font-mono font-bold">-${exp.amount}</span>
                      <button type="button" onClick={() => handleRemoveExpense(idx)} className="btn btn-ghost btn-xs btn-square text-gray-400 hover:text-error"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showExpenseForm && (
              <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 bg-base-100 p-4 rounded-lg border border-base-200">
                <div className="w-full sm:flex-1 min-w-[200px]">
                   <input placeholder="Description" className="input input-sm input-bordered w-full" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                </div>
                <div className="w-1/2 sm:w-24">
                   <input type="number" placeholder="$" className="input input-sm input-bordered w-full" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                </div>
                <div className="w-1/2 sm:w-32">
                   <select className="select select-sm select-bordered w-full" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                      <option value="OTHER">Other</option><option value="LABOR">Labor</option><option value="SOFTWARE">Software</option><option value="MATERIAL">Material</option>
                   </select>
                </div>
                <div className="w-full sm:w-auto">
                    <input type="date" className="input input-sm input-bordered w-full" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                </div>
                <div className="w-full sm:w-auto">
                  <button type="button" onClick={handleAddExpense} className="btn btn-sm btn-primary w-full"><PlusIcon className="w-5 h-5" /> Add</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
             <div className="w-full">
               <AddNotes notes={notes} onNotesInput={(n) => setNotes(n)} />
             </div>
             <div className="w-full flex flex-col">
                <label className="label font-semibold">Tags</label>
                <InputTags tags={tags} onTagsInput={setTags} />
             </div>
          </div>

          <div className="pt-4">
            <button type="submit" className={`btn btn-primary w-full btn-lg ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? "Creating Deal..." : "Create Deal"}
            </button>
          </div>
        </div>
      </form>

      {/* Contact Modal (Same as before) */}
      {showAddContactModal && (
        <dialog open className="modal">
          <div className="modal-box relative">
            <button onClick={() => setShowAddContactModal(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <h3 className="text-lg font-bold mb-2">Create New Contact</h3>
            <AddLeads onSuccess={(newContact) => {
                const c: Contact = { id: newContact.id, name: newContact.name, email: newContact.email, imageUrl: newContact.imageUrl };
                setContactOptions((prev) => [...prev, c]);
                setSelectedContacts((prev) => [...prev, c]);
                setShowAddContactModal(false);
              }}
            />
          </div>
        </dialog>
      )}
    </>
  );
};

export default AddDeals;