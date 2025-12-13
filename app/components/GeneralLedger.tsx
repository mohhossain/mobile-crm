"use client";

import { useState } from "react";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  FunnelIcon, 
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export type LedgerItem = {
  id: string;
  date: Date;
  type: 'INCOME' | 'EXPENSE';
  entity: string; // Client Name or Vendor/Description
  category: string;
  amount: number;
  status: string;
  reference?: string; // Invoice # or Deal Title
};

export default function GeneralLedger({ items }: { items: LedgerItem[] }) {
  const [sortField, setSortField] = useState<keyof LedgerItem>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [search, setSearch] = useState("");

  // 1. Filter & Sort
  const filteredItems = items
    .filter(item => {
      if (filterType !== 'ALL' && item.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.entity.toLowerCase().includes(q) || 
          item.category.toLowerCase().includes(q) ||
          item.reference?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (valA === undefined || valB === undefined) return 0;

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof LedgerItem) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc'); // Default to newest/highest
    }
  };

  const getSortIcon = (field: keyof LedgerItem) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ArrowUpIcon className="w-3 h-3 ml-1 inline" /> : <ArrowDownIcon className="w-3 h-3 ml-1 inline" />;
  };

  const exportCSV = () => {
    const headers = ["Date", "Type", "Entity", "Category", "Amount", "Status", "Reference"];
    const rows = filteredItems.map(item => [
      new Date(item.date).toLocaleDateString(),
      item.type,
      `"${item.entity}"`,
      item.category,
      item.amount.toFixed(2),
      item.status,
      item.reference || ""
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-0">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-base-200 flex flex-col sm:flex-row justify-between gap-4 bg-base-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">General Ledger</h2>
            <span className="badge badge-sm badge-neutral">{filteredItems.length}</span>
          </div>

          <div className="flex gap-2">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input 
                className="input input-sm input-bordered pl-9 w-full sm:w-48" 
                placeholder="Search ledger..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Type */}
            <div className="join">
              <button 
                onClick={() => setFilterType('ALL')} 
                className={`btn btn-sm join-item ${filterType === 'ALL' ? 'btn-active' : 'bg-base-100'}`}
              >All</button>
              <button 
                onClick={() => setFilterType('INCOME')} 
                className={`btn btn-sm join-item ${filterType === 'INCOME' ? 'btn-active' : 'bg-base-100'}`}
              >Income</button>
              <button 
                onClick={() => setFilterType('EXPENSE')} 
                className={`btn btn-sm join-item ${filterType === 'EXPENSE' ? 'btn-active' : 'bg-base-100'}`}
              >Expense</button>
            </div>

            {/* Export */}
            <button onClick={exportCSV} className="btn btn-sm btn-ghost btn-square" title="Export CSV">
              <DocumentArrowDownIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="table table-zebra table-pin-rows">
            <thead className="text-xs uppercase bg-base-100 text-base-content/50">
              <tr>
                <th className="cursor-pointer hover:text-base-content" onClick={() => handleSort('date')}>Date {getSortIcon('date')}</th>
                <th className="cursor-pointer hover:text-base-content" onClick={() => handleSort('type')}>Type {getSortIcon('type')}</th>
                <th className="cursor-pointer hover:text-base-content" onClick={() => handleSort('entity')}>Entity / Description {getSortIcon('entity')}</th>
                <th className="hidden md:table-cell cursor-pointer hover:text-base-content" onClick={() => handleSort('category')}>Category {getSortIcon('category')}</th>
                <th className="hidden md:table-cell cursor-pointer hover:text-base-content" onClick={() => handleSort('reference')}>Ref {getSortIcon('reference')}</th>
                <th className="text-right cursor-pointer hover:text-base-content" onClick={() => handleSort('amount')}>Amount {getSortIcon('amount')}</th>
                <th className="text-center cursor-pointer hover:text-base-content" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-base-content/40 italic">
                    No transactions found for this period.
                  </td>
                </tr>
              )}
              {filteredItems.map((item) => (
                <tr key={item.id} className="group hover:bg-base-200/50 transition-colors">
                  <td className="font-mono text-xs whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: '2-digit'})}
                  </td>
                  <td>
                    {item.type === 'INCOME' ? (
                      <span className="badge badge-xs badge-success badge-outline gap-1 pl-1 pr-2">
                        <ArrowUpIcon className="w-2 h-2" /> Inc
                      </span>
                    ) : (
                      <span className="badge badge-xs badge-error badge-outline gap-1 pl-1 pr-2">
                        <ArrowDownIcon className="w-2 h-2" /> Exp
                      </span>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate font-medium">
                    {item.entity}
                  </td>
                  <td className="hidden md:table-cell text-xs opacity-70">
                    <span className="bg-base-200 px-2 py-1 rounded-md">{item.category}</span>
                  </td>
                  <td className="hidden md:table-cell text-xs font-mono opacity-50">
                    {item.reference || '-'}
                  </td>
                  <td className={`text-right font-mono font-bold ${item.type === 'INCOME' ? 'text-success' : 'text-base-content'}`}>
                    {item.type === 'EXPENSE' && '-'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">
                    <span className={`badge badge-xs ${
                      item.status === 'PAID' ? 'badge-success' : 
                      item.status === 'OVERDUE' ? 'badge-error' : 
                      item.status === 'SENT' ? 'badge-info' : 'badge-ghost'
                    }`}>
                      {item.status}
                    </span>
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