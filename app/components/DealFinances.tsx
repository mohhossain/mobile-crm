"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BanknotesIcon, 
  PlusIcon, 
  TrashIcon, 
  CalendarIcon
} from "@heroicons/react/24/outline";
import AddExpense from "./AddExpense";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date | string;
}

interface Props {
  dealId: string;
  dealAmount: number;
  expenses: Expense[];
}

export default function DealFinances({ dealId, dealAmount, expenses }: Props) {
  const [items, setItems] = useState<Expense[]>(expenses);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setItems(expenses || []);
  }, [expenses]);

  const totalExpenses = items.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = dealAmount - totalExpenses;
  const profitMargin = dealAmount !== 0 ? (netProfit / dealAmount) * 100 : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete expense?")) return;
    try {
      await fetch("/api/expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSuccess = () => {
    setIsAdding(false);
    router.refresh();
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <BanknotesIcon className="w-5 h-5 text-success" /> Financials
        </h3>

        {/* Profit Summary Card */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-base-200 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 uppercase">Expenses</div>
            <div className="font-bold text-error">-${totalExpenses.toLocaleString()}</div>
          </div>
          <div className={`p-3 rounded-lg text-center border ${netProfit >= 0 ? 'bg-success/10 border-success/20' : 'bg-error/10 border-error/20'}`}>
            <div className="text-xs text-gray-500 uppercase">Net Profit</div>
            <div className={`font-bold ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>
              ${netProfit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Profit Margin</span>
            <span className="font-bold">{profitMargin.toFixed(1)}%</span>
          </div>
          <progress 
            className={`progress w-full h-2 ${profitMargin > 30 ? 'progress-success' : profitMargin > 0 ? 'progress-warning' : 'progress-error'}`} 
            value={Math.max(0, profitMargin)} 
            max="100"
          ></progress>
        </div>

        {/* Add Button / Form */}
        <div className="mb-4">
          {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="btn btn-sm btn-ghost w-full border-dashed border-base-300">
              <PlusIcon className="w-4 h-4" /> Add Expense
            </button>
          ) : (
            <div className="bg-base-200 p-3 rounded-xl animate-in fade-in slide-in-from-top-1 border border-base-300">
              {/* FIX: Using the standalone AddExpense component instead of inline form */}
              <AddExpense 
                dealId={dealId} 
                onSuccess={handleAddSuccess} 
                onCancel={() => setIsAdding(false)} 
              />
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {items.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No expenses recorded.</p>}
          
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-base-50 rounded-lg border border-base-200 hover:border-base-300 transition-colors group">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.description}</span>
                  <span className="text-[10px] font-bold opacity-60 badge badge-xs badge-ghost">{item.category}</span>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-error font-mono font-bold">-${item.amount.toLocaleString()}</span>
                
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 btn btn-ghost btn-xs btn-square text-gray-400 hover:text-error transition-opacity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}