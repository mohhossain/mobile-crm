"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function TaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "all";

  const handleFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter);
    router.push(`/tasks?${params.toString()}`);
  };

  const pills = [
    { id: 'all', label: 'All Tasks' },
    { id: 'active', label: 'Active' },
    { id: 'today', label: 'Due Today' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex overflow-x-auto no-scrollbar gap-2 pb-4">
      {pills.map((pill) => (
        <button
          key={pill.id}
          onClick={() => handleFilter(pill.id)}
          className={`
            btn btn-sm rounded-full border-none whitespace-nowrap px-4 transition-all
            ${currentFilter === pill.id 
              ? 'bg-primary text-primary-content shadow-md' 
              : 'bg-base-100 text-base-content/60 hover:bg-base-200 border border-base-200'}
          `}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}