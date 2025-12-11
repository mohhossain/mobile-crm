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
  ShoppingBagIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowDownOnSquareStackIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid"; 

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

// IRS Compliant Categories
const IRS_CATEGORIES = [
  "Advertising",
  "Car & Truck Expenses",
  "Commissions",
  "Contract Labor",
  "Legal & Professional Services",
  "Office Expenses",
  "Rent or Lease",
  "Repairs & Maintenance",
  "Supplies",
  "Taxes & Licenses",
  "Travel",
  "Meals",
  "Utilities",
  "Software & Subscriptions",
  "Other"
];

// 1. Wizard Steps Configuration (Updated with separate Expenses step)
const STEPS = [
  { id: 1, title: "Client", icon: UserGroupIcon },
  { id: 2, title: "Revenue", icon: BanknotesIcon },
  { id: 3, title: "Expenses", icon: ShoppingBagIcon },
  { id: 4, title: "Details", icon: ClipboardDocumentListIcon },
  { id: 5, title: "Context", icon: TagIcon },
];

const AddDeals = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  
  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);

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
    description: "",
    amount: "",
    category: "Other", // Default to Other
    date: new Date().toISOString().split('T')[0]
  });
  const [showExpenseForm, setShowExpenseForm] = useState(true); // Default open on separate step

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

  // --- SMART LOGIC ---
  
  // Auto-calculate Total Amount
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCalculatedAmount(Math.max(0, total));
  }, [lineItems]);

  // Auto-Generate Title
  useEffect(() => {
    if (isTitleManuallyEdited) return;

    const clientName = selectedContacts[0]?.name;
    const primaryService = lineItems[0]?.name;
    
    if (clientName && primaryService && primaryService !== "Consulting Services") {
      setTitle(`${clientName} - ${primaryService}`);
    } else if (clientName) {
      setTitle(`${clientName} Project`);
    } else if (primaryService && primaryService !== "Consulting Services") {
      setTitle(`${primaryService} Deal`);
    }
  }, [selectedContacts, lineItems, isTitleManuallyEdited]);


  const handleNext = () => {
    // Validation for Step 4 (Details) which holds the title
    if (currentStep === 4 && !title) return alert("Please enter a deal title.");
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
    if ((field === 'price' || field === 'quantity') && typeof value === 'number') {
        if (value < 0) value = 0; 
    }
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'name') {
        newItems[index].productId = undefined;
    }
    setLineItems(newItems);
  };
  
  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...lineItems];
      newItems[index] = { ...newItems[index], productId: product.id, name: product.name, price: product.unitPrice };
      setLineItems(newItems);
    } else {
        const newItems = [...lineItems];
        newItems[index] = { ...newItems[index], productId: undefined, name: "", price: 0 };
        setLineItems(newItems);
    }
  };

  const handleSaveToCatalog = async (index: number) => {
    const item = lineItems[index];
    if (!item.name || !item.price) return;

    try {
        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: item.name, unitPrice: item.price })
        });
        
        if (res.ok) {
            const newProduct = await res.json();
            setProducts(prev => [...prev, newProduct]);
            const newItems = [...lineItems];
            newItems[index].productId = newProduct.id;
            setLineItems(newItems);
        }
    } catch (e) {
        console.error("Failed to save product", e);
    }
  };

  // Expense Handlers
  const handleAddExpense = () => {
    if(!newExpense.description || !newExpense.amount) return;
    setExpenses([...expenses, newExpense]);
    setNewExpense({ description: "", amount: "", category: "Other", date: new Date().toISOString().split('T')[0] });
    // Keep form visible for rapid entry
  };
  const handleRemoveExpense = (index: number) => setExpenses(expenses.filter((_, i) => i !== index));

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
      
      router.push('/deals');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      
      {/* 1. MODERN WIZARD HEADER */}
      <div className="px-4 py-4 bg-base-100 border-b border-base-200">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-base-200 -z-10"></div>
          <div 
             className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transition-all duration-300 ease-out"
             style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>

          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = isCompleted ? CheckCircleIcon : step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-1 group cursor-default">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-base-100 z-10
                    ${isActive ? 'bg-primary text-primary-content scale-110 shadow-lg' : 
                      isCompleted ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/30'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`
                  text-[10px] font-bold uppercase tracking-wider bg-base-100 px-1
                  ${isActive ? 'text-primary' : isCompleted ? 'text-base-content/60' : 'text-base-content/30'}
                  ${isActive ? 'block' : 'hidden sm:block'}
                `}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 bg-base-100">
        <div className="space-y-6">
        
          {/* STEP 1: PEOPLE (Who?) */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2 mb-8">
                  <h3 className="text-xl font-semibold">Who is this deal for?</h3>
                  <p className="text-sm text-base-content/60">Select the client or stakeholder.</p>
              </div>

              <div className="form-control">
                  <ContactMultiSelect
                    contacts={contactOptions}
                    selected={selectedContacts}
                    onChange={setSelectedContacts}
                  />
              </div>
              
              <div className="divider text-xs text-base-content/40">OR</div>
              
              <button type="button" className="btn btn-outline btn-block border-dashed rounded-md font-normal" onClick={() => setShowAddContactModal(true)}>
                <PlusIcon className="w-4 h-4" /> Create New Contact
              </button>
            </div>
          )}

          {/* STEP 2: REVENUE (Line Items) */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-2 border-b border-base-200">
                  <label className="text-lg font-semibold">Services & Products</label>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold opacity-50">Total Value</div>
                    <span className="text-2xl font-black text-success">${calculatedAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="bg-base-200/40 p-4 rounded-xl border border-base-200 relative group transition-all hover:border-base-300 hover:bg-base-200/60">
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        
                        {/* Row 1: Product Select & Name - UPDATED TO MULTI-LINE/GRID */}
                        <div className="md:col-span-12 lg:col-span-6 flex flex-col gap-2 w-full">
                           <label className="text-[10px] font-bold uppercase opacity-40 px-1">Service / Item</label>
                           
                             {products.length > 0 && (
                               <select 
                                 className="select select-sm select-bordered w-full rounded-md"
                                 value={item.productId || ""}
                                 onChange={(e) => handleProductSelect(idx, e.target.value)}
                               >
                                 <option value="">Select from Catalog...</option>
                                 <option value="">Custom Item</option>
                                 {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                               </select>
                             )}
                             <div className="relative w-full">
                               <input 
                                 className="input input-sm input-bordered w-full rounded-md font-medium" 
                                 placeholder="Service Name" 
                                 value={item.name} 
                                 onChange={(e) => updateLineItem(idx, 'name', e.target.value)} 
                               />
                               {/* Save to Catalog Button */}
                               {!item.productId && item.name && (
                                 <button 
                                   onClick={() => handleSaveToCatalog(idx)}
                                   className="absolute right-1 top-1 bottom-1 btn btn-xs btn-ghost text-primary opacity-50 hover:opacity-100"
                                   title="Save to Catalog"
                                 >
                                   <ArrowDownOnSquareStackIcon className="w-4 h-4" />
                                 </button>
                               )}
                             </div>
                        </div>

                        {/* Row 2: Qty, Price, Total */}
                        <div className="md:col-span-12 lg:col-span-6 flex gap-3 w-full">
                          <div className="flex-1">
                             <label className="text-[10px] font-bold uppercase opacity-40 px-1 block">Qty</label>
                             <input 
                               type="number" 
                               min="0"
                               className="input input-sm input-bordered w-full text-center rounded-md px-3" 
                               value={item.quantity || ''} 
                               onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} 
                               placeholder="1" 
                             />
                          </div>
                          <div className="flex-[2]">
                             <label className="text-[10px] font-bold uppercase opacity-40 px-1 block">Price</label>
                             <div className="relative">
                               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs opacity-50">$</span>
                               <input 
                                 type="number" 
                                 min="0"
                                 className="input input-sm input-bordered w-full text-right pl-5 pr-2 rounded-md px-3" 
                                 value={item.price || ''} 
                                 onChange={(e) => updateLineItem(idx, 'price', parseFloat(e.target.value) || 0)} 
                                 placeholder="0.00" 
                               />
                             </div>
                          </div>
                           <div className="flex items-end">
                              <button onClick={() => handleRemoveLineItem(idx)} className="btn btn-sm btn-ghost btn-square text-gray-400 hover:text-error rounded-md">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                           </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
                
                <button onClick={handleAddLineItem} className="btn btn-sm btn-outline border-dashed w-full rounded-md font-normal">+ Add Another Item</button>
              </div>
            </div>
          )}

          {/* STEP 3: EXPENSES (Separate Step) */}
          {currentStep === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="text-center space-y-2 mb-6">
                  <h3 className="text-xl font-semibold">Initial Costs</h3>
                  <p className="text-sm text-base-content/60">Did you spend money to get this deal?</p>
               </div>

               <div className="bg-base-200/40 p-5 rounded-xl border border-base-200">
                  {/* Expense Entry Form - UPDATED LAYOUT */}
                  <div className="flex flex-col gap-4 animate-in fade-in bg-base-100 p-4 rounded-lg border border-base-200 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label text-xs font-bold opacity-60 py-1">Description</label>
                          <input className="input input-sm input-bordered w-full rounded-md" placeholder="e.g. Flight to NYC" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                        </div>
                        <div className="form-control">
                           <label className="label text-xs font-bold opacity-60 py-1">Category</label>
                           <select className="select select-sm select-bordered w-full rounded-md" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                            {IRS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="form-control">
                            <label className="label text-xs font-bold opacity-60 py-1">Amount</label>
                            <input type="number" min="0" className="input input-sm input-bordered w-full rounded-md" placeholder="$0.00" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                         </div>
                         <div className="form-control">
                            <label className="label text-xs font-bold opacity-60 py-1">Date</label>
                            <input type="date" className="input input-sm input-bordered w-full rounded-md" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                         </div>
                      </div>

                      <button onClick={handleAddExpense} className="btn btn-sm btn-primary w-full rounded-md gap-2 mt-2">
                        <PlusIcon className="w-4 h-4" /> Add Expense
                      </button>
                  </div>

                  {/* Expense List */}
                  {expenses.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <h4 className="text-xs font-bold uppercase opacity-40 px-1">Added Expenses</h4>
                      {expenses.map((exp, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-base-100 p-3 rounded-md border border-base-200 shadow-sm">
                            <div className="flex flex-col">
                               <span className="font-medium">{exp.description}</span>
                               <span className="text-xs opacity-50">{exp.category} • {exp.date}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-error font-mono">-${exp.amount}</span>
                               <button onClick={() => handleRemoveExpense(i)} className="text-gray-400 hover:text-error"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             </div>
          )}

          {/* STEP 4: DETAILS (Title & Status) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="form-control w-full relative">
                <label className="label font-semibold flex justify-between">
                  <span>Deal Title</span>
                  {!isTitleManuallyEdited && title && <span className="label-text-alt text-primary flex items-center gap-1"><SparklesIcon className="w-3 h-3" /> Auto-Generated</span>}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsTitleManuallyEdited(true);
                  }}
                  placeholder="e.g. Website Redesign for Acme"
                  className="input input-lg input-bordered w-full text-xl font-semibold placeholder:font-normal rounded-md"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label font-medium text-sm">Pipeline Stage</label>
                  <select className="select select-bordered w-full rounded-md" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="OPEN">Open</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="PENDING">Pending</option>
                    <option value="WON">Won</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label font-medium text-sm">Target Close Date</label>
                  <div className="flex gap-2">
                    <input type="date" className="input input-bordered w-full rounded-md" value={closeDateDate} onChange={(e) => setCloseDateDate(e.target.value)} />
                    <input type="time" className="input input-bordered w-32 rounded-md" value={closeDateTime} onChange={(e) => setCloseDateTime(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONTEXT */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="form-control">
                <label className="label font-semibold">Deal Notes</label>
                <AddNotes notes={notes} onNotesInput={setNotes} />
              </div>

              <div className="form-control">
                <label className="label font-semibold">Tags</label>
                <InputTags tags={tags} onTagsInput={setTags} />
              </div>
              
              {error && <div className="alert alert-error text-sm rounded-md">{error}</div>}
            </div>
          )}

        </div>

        {/* 3. WIZARD FOOTER */}
        <div className="flex justify-between items-center pt-8 pb-20 sm:pb-4 border-t border-base-200 mt-6">
          {currentStep > 1 ? (
            <button onClick={handleBack} className="btn btn-ghost gap-2 rounded-md">
              <ArrowLeftIcon className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div> 
          )}

          {currentStep < 5 ? (
            <button onClick={handleNext} className="btn btn-primary px-8 gap-2 rounded-md">
              Next <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn btn-success px-8 gap-2 shadow-lg shadow-success/20 text-white rounded-md">
              {loading ? <span className="loading loading-spinner"></span> : <><CheckIcon className="w-4 h-4" /> Create Deal</>}
            </button>
          )}
        </div>

      </div>

      {/* CREATE CONTACT MODAL */}
      {showAddContactModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[60]">
          <div className="modal-box rounded-xl">
            <h3 className="font-bold text-lg mb-4">New Contact</h3>
            <AddLeads onSuccess={(newContact: { id: any; name: any; email: any; imageUrl: any; }) => {
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