"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";

export default function DealsFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine current view (Default to 'board' if missing)
  const currentView = searchParams.get("view") || "board";
  const isListView = currentView === "list";

  // State for all filters
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "updatedAt");
  const [dir, setDir] = useState(searchParams.get("dir") || "desc");
  
  // Advanced Filter State
  const [minAmount, setMinAmount] = useState(searchParams.get("minAmount") || "");
  const [maxAmount, setMaxAmount] = useState(searchParams.get("maxAmount") || "");
  const [closingWithin, setClosingWithin] = useState(searchParams.get("closingWithin") || "");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce Search Text
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Apply filters to URL
  const applyFilters = (overrideSort?: string, overrideDir?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Search
    if (query) params.set("q", query); else params.delete("q");
    
    // Sort (Use overrides if provided, otherwise state)
    params.set("sort", overrideSort || sort);
    params.set("dir", overrideDir || dir);

    // Advanced Filters
    if (minAmount) params.set("minAmount", minAmount); else params.delete("minAmount");
    if (maxAmount) params.set("maxAmount", maxAmount); else params.delete("maxAmount");
    if (closingWithin) params.set("closingWithin", closingWithin); else params.delete("closingWithin");

    router.push(`/deals?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSort, newDir] = e.target.value.split("-");
    setSort(newSort);
    setDir(newDir);
    applyFilters(newSort, newDir);
  };

  const clearAdvancedFilters = () => {
    setMinAmount("");
    setMaxAmount("");
    setClosingWithin("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minAmount");
    params.delete("maxAmount");
    params.delete("closingWithin");
    // Preserve Search/Sort/View
    if (query) params.set("q", query);
    params.set("sort", sort);
    params.set("dir", dir);
    if (currentView) params.set("view", currentView);
    
    router.push(`/deals?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const activeFilterCount = [minAmount, maxAmount, closingWithin].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 mb-4 w-full">
      
      {/* Top Row: Search & Sort */}
      <div className="flex gap-2 w-full">
        {/* Search Input - Always Visible */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="Search deals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Sort & Filter Controls - Only visible in List View */}
        {isListView && (
          <>
            {/* Sort Dropdown (Desktop) */}
            <div className="hidden sm:block">
              <select 
                className="select select-bordered" 
                value={`${sort}-${dir}`}
                onChange={handleSortChange}
              >
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
                <option value="closeDate-asc">Closing: Soonest</option>
                <option value="closeDate-desc">Closing: Latest</option>
              </select>
            </div>

            {/* Filter Toggle Button */}
            <button 
              className={`btn ${activeFilterCount > 0 ? 'btn-primary' : 'btn-outline'} gap-2`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && <span className="badge badge-sm badge-neutral text-white">{activeFilterCount}</span>}
            </button>
          </>
        )}
      </div>

      {/* Mobile Sort (Only visible in List View on small screens) */}
      {isListView && (
        <div className="sm:hidden">
          <select 
            className="select select-bordered w-full" 
            value={`${sort}-${dir}`}
            onChange={handleSortChange}
          >
            <option value="updatedAt-desc">Sort: Recently Updated</option>
            <option value="amount-desc">Sort: Amount High-Low</option>
            <option value="amount-asc">Sort: Amount Low-High</option>
            <option value="closeDate-asc">Sort: Closing Soon</option>
          </select>
        </div>
      )}

      {/* Advanced Filters Panel (Only visible in List View when toggled) */}
      {isListView && isFilterOpen && (
        <div className="bg-base-100 border border-base-300 p-4 rounded-xl shadow-sm animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm uppercase opacity-50">Advanced Filters</h3>
            <button onClick={() => setIsFilterOpen(false)}><XMarkIcon className="w-4 h-4" /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount Range */}
            <div className="form-control">
              <label className="label text-xs">Min Amount ($)</label>
              <input 
                type="number" 
                className="input input-sm input-bordered" 
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label text-xs">Max Amount ($)</label>
              <input 
                type="number" 
                className="input input-sm input-bordered" 
                placeholder="No Limit"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="form-control">
              <label className="label text-xs">Closing within (Days)</label>
              <input 
                type="number" 
                className="input input-sm input-bordered" 
                placeholder="e.g. 30"
                value={closingWithin}
                onChange={(e) => setClosingWithin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-base-200">
            <button onClick={clearAdvancedFilters} className="btn btn-sm btn-ghost">Clear All</button>
            <button onClick={() => { applyFilters(); setIsFilterOpen(false); }} className="btn btn-sm btn-primary">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}