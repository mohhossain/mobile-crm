"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, BanknotesIcon, CalendarIcon } from "@heroicons/react/24/outline";

import InputTags from "./InputTags";
import AddLeads from "./AddLeads";
import ContactMultiSelect from "./ContactMultiSelect";
import AddNotes from "./AddNotes";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  imageUrl?: string | null;
}

interface ExpenseDraft {
  description: string;
  amount: string;
  category: string;
  date: string;
}

const AddDeals = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
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
  
  const router = useRouter();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        const contacts = Array.isArray(data) ? data : data.contacts;
        setContactOptions(contacts || []);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, []);

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
          amount: parseFloat(amount),
          status,
          tags,
          closeDate: finalCloseDate,
          contactIds: selectedContacts.map((c) => c.id),
          notes,
          expenses
        }),
      });

      if (!response.ok) throw new Error("Failed to add deal");

      setSuccess(true);
      setTitle(""); setAmount(""); setStatus("OPEN"); setTags([]);
      setSelectedContacts([]); setCloseDateDate(""); setCloseDateTime("");
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
      <form
        className="max-w-3xl mx-auto p-6 pb-32 space-y-8"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center">Create New Deal</h2>
        
        {error && <div className="alert alert-error text-sm">{error}</div>}
        {success && <div className="alert alert-success text-sm">Deal added successfully!</div>}

        <div className="space-y-6">
          
          {/* Basic Info */}
          <div className="form-control w-full">
            <label className="label font-semibold text-lg">Deal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign for Acme"
              required
              className="input input-bordered w-full input-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label font-semibold">Value ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label font-semibold">Status</label>
              <select className="select select-bordered w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="PENDING">Pending</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
                <option value="NEGOTIATION">Negotiation</option>
              </select>
            </div>
          </div>

          {/* Closing Date */}
          <div className="form-control">
            <label className="label font-semibold">Target Close Date</label>
            <div className="flex gap-2">
              <input type="date" className="input input-bordered w-full flex-grow" value={closeDateDate} onChange={(e) => setCloseDateDate(e.target.value)} />
              <input type="time" className="input input-bordered w-32 shrink-0" value={closeDateTime} onChange={(e) => setCloseDateTime(e.target.value)} />
            </div>
            <label className="label"><span className="label-text-alt text-gray-500">Time is optional</span></label>
          </div>

          <div className="form-control">
            <ContactMultiSelect
              contacts={contactOptions}
              selected={selectedContacts}
              onChange={(newSelected) => setSelectedContacts(newSelected)}
            />
            <button type="button" className="btn btn-ghost btn-sm mt-2 self-start" onClick={() => setShowAddContactModal(true)}>+ Create New Contact</button>
          </div>

          {/* EXPENSES SECTION - REDESIGNED */}
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
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 animate-in fade-in slide-in-from-top-2 bg-base-100 p-4 rounded-lg border border-base-200">
                {/* Description */}
                <div className="sm:col-span-4">
                   <input placeholder="Description" className="input input-sm input-bordered w-full" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                </div>
                {/* Amount */}
                <div className="sm:col-span-2">
                   <input type="number" placeholder="$" className="input input-sm input-bordered w-full" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                </div>
                 {/* Category */}
                <div className="sm:col-span-3">
                   <select className="select select-sm select-bordered w-full" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                      <option value="OTHER">Other</option><option value="LABOR">Labor</option><option value="SOFTWARE">Software</option><option value="MATERIAL">Material</option>
                   </select>
                </div>
                {/* Date */}
                <div className="sm:col-span-2">
                    <input type="date" className="input input-sm input-bordered w-full" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                </div>
                {/* Add Button */}
                <div className="sm:col-span-1">
                  <button type="button" onClick={handleAddExpense} className="btn btn-sm btn-primary w-full px-0"><PlusIcon className="w-5 h-5 mx-auto" /></button>
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

      {/* MODAL */}
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