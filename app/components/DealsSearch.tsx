"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function DealsSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync initial query from URL
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push(`/deals?${params.toString()}`);
    }, 300); // 300ms delay for API-based search

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      {/* Backdrop when focused */}
      {isFocused && (
        <div 
          className="fixed inset-0 bg-base-300/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsFocused(false)}
        ></div>
      )}

      {/* Search Bar Container */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isFocused 
            ? 'fixed top-safe left-0 right-0 z-50 p-4 pt-2 bg-base-100 shadow-xl border-b border-base-200' 
            : 'relative w-full'
          }
        `}
      >
        <div className="relative flex items-center gap-2">
          {isFocused && (
             <button onClick={() => setIsFocused(false)} className="btn btn-ghost btn-circle btn-sm">
               <XMarkIcon className="w-5 h-5" />
             </button>
          )}
          
          <div className="relative flex-1">
            <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-primary' : 'text-base-content/40'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              // blur is handled manually by clicking backdrop or cancel to keep keyboard open
              className={`input input-bordered w-full pl-10 ${isFocused ? 'input-primary shadow-inner' : ''}`}
              placeholder={isFocused ? "Search by deal title..." : "Search deals..."}
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-base-200 text-base-content/40"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters (Only visible when focused) */}
        {isFocused && (
           <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
             <div className="badge badge-outline gap-1 p-3 cursor-pointer hover:bg-base-200">
               <FunnelIcon className="w-3 h-3" /> Value &gt; $1k
             </div>
             <div className="badge badge-outline gap-1 p-3 cursor-pointer hover:bg-base-200">
               Closing Soon
             </div>
           </div>
        )}
      </div>
    </>
  );
}