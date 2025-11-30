"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  deal?: { title: string } | null;
}

export default function ExpenseList({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [filter, setFilter] = useState("ALL");
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense record?")) return;
    try {
      const res = await fetch("/api/expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredExpenses = filter === "ALL" 
    ? expenses 
    : expenses.filter(e => e.category === filter);

  return (
    <div className="card bg-base-100 shadow border border-base-200">
      <div className="card-body p-0">
        
        {/* Header / Filter */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-50 rounded-t-xl">
          <h2 className="font-bold text-lg">Transaction History</h2>
          <select 
            className="select select-bordered select-xs" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="LABOR">Labor</option>
            <option value="SOFTWARE">Software</option>
            <option value="MATERIAL">Material</option>
            <option value="TRAVEL">Travel</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="table table-pin-rows">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">No expenses found.</td>
                </tr>
              )}
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover">
                  <td className="text-xs text-gray-500 font-mono">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="font-semibold text-sm">{expense.description}</div>
                    {expense.deal && (
                      <div className="text-[10px] text-primary opacity-70">
                        Deal: {expense.deal.title}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-ghost badge-sm text-[10px]">{expense.category}</span>
                  </td>
                  <td className="font-bold text-error text-right">
                    -${expense.amount.toLocaleString()}
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => handleDelete(expense.id)}
                      className="btn btn-ghost btn-xs text-gray-400 hover:text-error"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}