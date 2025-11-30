"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  deal?: { title: string } | null;
}

export default function DownloadExpensesButton({ expenses }: { expenses: Expense[] }) {
  const handleDownload = () => {
    // 1. Define CSV Headers
    const headers = ["Date", "Description", "Category", "Amount", "Deal"];
    
    // 2. Format Data Rows
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString(), // Format Date
      `"${e.description.replace(/"/g, '""')}"`, // Escape quotes in description
      e.category,
      e.amount.toFixed(2),
      e.deal ? `"${e.deal.title.replace(/"/g, '""')}"` : "" // Escape quotes in deal title
    ]);

    // 3. Combine into CSV String
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // 4. Create Blob and Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleDownload} 
      className="btn btn-outline btn-sm w-full mt-2 gap-2"
    >
      <ArrowDownTrayIcon className="w-4 h-4" /> Download CSV
    </button>
  );
}