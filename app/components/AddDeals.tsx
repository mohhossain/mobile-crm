"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  TrashIcon, 
  BanknotesIcon, 
  TagIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CheckIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

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

const STEPS = [
  { id: 1, title: "The Basics", icon: ClipboardDocumentListIcon },
  { id: 2, title: "Financials", icon: ShoppingBagIcon },
  { id: 3, title: "People", icon: UserGroupIcon },
  { id: 4, title: "Context", icon: TagIcon },
];

const AddDeals = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  
  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [closeDateDate, setCloseDateDate] = useState("");
  const [closeDateTime, setCloseDateTime] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { name: "Consulting Services", quantity: 1, price: 0 }
  ]);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const [expenses, setExpenses] = useState<ExpenseDraft[]>([]);
  const [newExpense, setNewExpense] = useState<ExpenseDraft>({
    description: "", amount: "", category: "OTHER", date: new Date().toISOString().split('T')[0]
  });
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  const [notes, setNotes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- FETCH DATA ---
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

  // --- LOGIC ---
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCalculatedAmount(total);
  }, [lineItems]);

  const handleNext = () => {
    if (currentStep === 1 && !title) return alert("Please enter a deal title.");
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Line Item Handlers
  const handleAddLineItem = () => setLineItems([...lineItems, { name: "", quantity: 1, price: 0 }]);
  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== index));
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
      newItems[index] = { ...newItems[index], productId: product.id, name: product.name, price: product.unitPrice };
      setLineItems(newItems);
    }
  };

  // Expense Handlers
  const handleAddExpense = () => {
    if(!newExpense.description || !newExpense.amount) return;
    setExpenses([...expenses, newExpense]);
    setNewExpense({ description: "", amount: "", category: "OTHER", date: new Date().toISOString().split('T')[0] });
    setShowExpenseForm(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

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
          amount: calculatedAmount,
          status,
          tags,
          closeDate: finalCloseDate,
          contactIds: selectedContacts.map((c) => c.id),
          notes,
          expenses,
          lineItems
        }),
      });

      if (!response.ok) throw new Error("Failed to add deal");
      router.refresh();
      // Optional: Close modal logic could be handled by parent if passed as prop, 
      // but router refresh usually triggers UI updates. We'll reset state just in case.
      setCurrentStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      
      {/* 1. WIZARD HEADER */}
      <div className="px-6 py-4 bg-base-100 border-b border-base-200">
        <ul className="steps steps-vertical sm:steps-horizontal w-full">
          {STEPS.map((step) => (
            <li 
              key={step.id} 
              className={`step text-xs font-bold ${currentStep >= step.id ? 'step-primary' : ''}`}
              data-content={currentStep > step.id ? "✓" : step.id}
            >
              {step.title}
            </li>
          ))}
        </ul>
      </div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-base-100">
        
        {/* STEP 1: BASICS */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="form-control w-full">
              <label className="label font-bold">What is this deal?</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Redesign for Acme"
                className="input input-lg input-bordered w-full text-xl font-bold placeholder:font-normal"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label font-semibold">Pipeline Stage</label>
                <select className="select select-bordered w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="OPEN">Open</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="PENDING">Pending</option>
                  <option value="WON">Won</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label font-semibold">Target Close Date</label>
                <div className="flex gap-2">
                  <input type="date" className="input input-bordered w-full" value={closeDateDate} onChange={(e) => setCloseDateDate(e.target.value)} />
                  <input type="time" className="input input-bordered w-32" value={closeDateTime} onChange={(e) => setCloseDateTime(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FINANCIALS */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-base-200 pb-2">
                 <label className="font-bold text-lg">Revenue Items</label>
                 <span className="text-2xl font-black text-success">${calculatedAmount.toLocaleString()}</span>
              </div>
              
              {lineItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 bg-base-200/50 p-3 rounded-xl border border-base-200">
                   {products.length > 0 && (
                     <select 
                       className="select select-sm select-ghost w-full sm:w-1/3"
                       value={item.productId || ""}
                       onChange={(e) => handleProductSelect(idx, e.target.value)}
                     >
                       <option value="">Custom Service</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                   )}
                   <input className="input input-sm input-ghost w-full sm:flex-1 font-medium" placeholder="Description" value={item.name} onChange={(e) => updateLineItem(idx, 'name', e.target.value)} />
                   <div className="flex gap-2">
                     <input type="number" className="input input-sm input-bordered w-16 text-center" value={item.quantity} onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Qty" />
                     <input type="number" className="input input-sm input-bordered w-24 text-right" value={item.price} onChange={(e) => updateLineItem(idx, 'price', parseFloat(e.target.value) || 0)} placeholder="$" />
                   </div>
                   <button onClick={() => handleRemoveLineItem(idx)} className="btn btn-sm btn-ghost btn-square text-error"><TrashIcon className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={handleAddLineItem} className="btn btn-xs btn-outline border-dashed w-full">+ Add Item</button>
            </div>

            {/* Expenses */}
            <div className="bg-base-200 p-4 rounded-xl border border-base-300">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-sm text-base-content/60 uppercase">Initial Costs</h3>
                 <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="btn btn-xs btn-ghost">+ Add Expense</button>
               </div>
               
               {expenses.length > 0 && (
                 <div className="space-y-2 mb-3">
                   {expenses.map((exp, i) => (
                     <div key={i} className="flex justify-between text-xs bg-base-100 p-2 rounded border border-base-200">
                        <span>{exp.description}</span>
                        <span className="text-error font-mono">-${exp.amount}</span>
                     </div>
                   ))}
                 </div>
               )}

               {showExpenseForm && (
                 <div className="grid grid-cols-2 gap-2 animate-in fade-in">
                    <input className="input input-xs input-bordered col-span-2" placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                    <input type="number" className="input input-xs input-bordered" placeholder="$ Amount" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                    <select className="select select-xs select-bordered" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                      <option value="OTHER">Other</option><option value="LABOR">Labor</option><option value="SOFTWARE">Software</option>
                    </select>
                    <button onClick={handleAddExpense} className="btn btn-xs btn-primary col-span-2">Add Expense</button>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* STEP 3: PEOPLE */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl">Who is this deal for?</h3>
                <p className="text-sm text-base-content/60">Attach contacts to track communication history.</p>
             </div>

             <div className="form-control">
                <ContactMultiSelect
                  contacts={contactOptions}
                  selected={selectedContacts}
                  onChange={setSelectedContacts}
                />
             </div>
             
             <div className="divider text-xs text-base-content/40">OR</div>
             
             <button type="button" className="btn btn-outline btn-block" onClick={() => setShowAddContactModal(true)}>
               <PlusIcon className="w-4 h-4" /> Create New Contact
             </button>
          </div>
        )}

        {/* STEP 4: CONTEXT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="form-control">
               <label className="label font-bold">Deal Notes</label>
               <AddNotes notes={notes} onNotesInput={setNotes} />
             </div>

             <div className="form-control">
               <label className="label font-bold">Tags</label>
               <InputTags tags={tags} onTagsInput={setTags} />
             </div>
             
             {error && <div className="alert alert-error text-sm">{error}</div>}
          </div>
        )}

      </div>

      {/* 3. WIZARD FOOTER */}
      <div className="p-4 bg-base-100 border-t border-base-200 flex justify-between items-center">
         {currentStep > 1 ? (
           <button onClick={handleBack} className="btn btn-ghost gap-2">
             <ArrowLeftIcon className="w-4 h-4" /> Back
           </button>
         ) : (
           <div></div> // Spacer
         )}

         {currentStep < 4 ? (
           <button onClick={handleNext} className="btn btn-primary px-8 gap-2">
             Next <ArrowRightIcon className="w-4 h-4" />
           </button>
         ) : (
           <button onClick={handleSubmit} disabled={loading} className="btn btn-success px-8 gap-2 shadow-lg shadow-success/20 text-white">
             {loading ? <span className="loading loading-spinner"></span> : <><CheckIcon className="w-4 h-4" /> Create Deal</>}
           </button>
         )}
      </div>

      {/* CREATE CONTACT MODAL */}
      {showAddContactModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[60]">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">New Contact</h3>
            <AddLeads onSuccess={(newContact) => {
                const c: Contact = { id: newContact.id, name: newContact.name, email: newContact.email, imageUrl: newContact.imageUrl };
                setContactOptions((prev) => [...prev, c]);
                setSelectedContacts((prev) => [...prev, c]);
                setShowAddContactModal(false);
              }}
              onCancel={() => setShowAddContactModal(false)}
            />
          </div>
        </dialog>
      )}

    </div>
  );
};

export default AddDeals;