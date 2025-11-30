"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { 
  FunnelIcon, 
  ArrowsUpDownIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function TaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter") || "all";
  const currentSort = searchParams.get("sort") || "date";

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter);
    router.push(`/tasks?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`/tasks?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 mb-6">
      
      {/* Filter Tabs */}
      <div role="tablist" className="tabs tabs-boxed bg-base-200">
        <a 
          role="tab" 
          className={`tab ${currentFilter === 'all' ? 'tab-active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All
        </a>
        <a 
          role="tab" 
          className={`tab ${currentFilter === 'active' ? 'tab-active' : ''}`}
          onClick={() => handleFilterChange('active')}
        >
          Active
        </a>
        <a 
          role="tab" 
          className={`tab ${currentFilter === 'completed' ? 'tab-active' : ''}`}
          onClick={() => handleFilterChange('completed')}
        >
          Completed
        </a>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />
        <select 
          className="select select-bordered select-sm w-full max-w-xs"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="date">Due Date (Soonest)</option>
          <option value="priority">Priority (High to Low)</option>
          <option value="newest">Newest Created</option>
        </select>
      </div>
    </div>
  );
}