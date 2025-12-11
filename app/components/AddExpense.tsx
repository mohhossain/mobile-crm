"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BanknotesIcon, CalendarIcon } from "@heroicons/react/24/outline";

const IRS_CATEGORIES = [
  "Advertising", "Car & Truck Expenses", "Commissions", "Contract Labor", 
  "Legal & Professional Services", "Office Expenses", "Rent or Lease", 
  "Repairs & Maintenance", "Supplies", "Taxes & Licenses", "Travel", 
  "Meals", "Utilities", "Software & Subscriptions", "Other"
];

// FIX: Added optional dealId prop
export default function AddExpense({ 
  onSuccess, 
  onCancel, 
  dealId 
}: { 
  onSuccess?: () => void, 
  onCancel?: () => void, 
  dealId?: string 
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          category,
          date,
          dealId // Pass the dealId if it exists
        })
      });

      if (res.ok) {
        setDescription(""); setAmount("");
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        alert("Failed to save expense.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-32">
      <div className="form-control">
        <label className="label font-semibold text-sm">Description</label>
        <input 
          className="input input-bordered w-full" 
          placeholder="e.g. Flight to NYC" 
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label font-semibold text-sm">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input 
              type="number" 
              className="input input-bordered w-full pl-7" 
              placeholder="0.00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label font-semibold text-sm">Date</label>
          <input 
            type="date" 
            className="input input-bordered w-full" 
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label font-semibold text-sm">Tax Category</label>
        <select 
          className="select select-bordered w-full" 
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {IRS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        {onCancel && <button type="button" onClick={onCancel} className="btn btn-ghost flex-1">Cancel</button>}
        <button type="submit" disabled={loading} className="btn btn-primary flex-1">
          {loading ? "Saving..." : "Log Expense"}
        </button>
      </div>
    </form>
  );
}