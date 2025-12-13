"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { format, add, sub, parseISO, startOfToday, isValid } from "date-fns";

type Period = 'week' | 'month' | 'year' | 'all';

export default function FinanceControls() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Parse Params
  const period = (searchParams.get("period") as Period) || "month";
  const dateParam = searchParams.get("date");
  
  const currentDate = dateParam && isValid(parseISO(dateParam)) 
    ? parseISO(dateParam) 
    : startOfToday();

  // 2. Navigation Handlers
  const handlePeriodChange = (newPeriod: Period) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", newPeriod);
    params.set("date", startOfToday().toISOString());
    router.push(`/finance?${params.toString()}`);
  };

  const handleTimeTravel = (direction: 'prev' | 'next') => {
    if (period === 'all') return; 

    const amount = direction === 'prev' ? -1 : 1;
    let newDate = new Date(currentDate);

    switch (period) {
      case 'week':
        newDate = add(newDate, { weeks: amount });
        break;
      case 'month':
        newDate = add(newDate, { months: amount });
        break;
      case 'year':
        newDate = add(newDate, { years: amount });
        break;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate.toISOString());
    router.push(`/finance?${params.toString()}`);
  };

  // 3. Label Logic
  const getLabel = () => {
    if (period === 'all') return "All Time";
    if (period === 'year') return format(currentDate, "yyyy");
    if (period === 'month') return format(currentDate, "MMMM yyyy");
    if (period === 'week') {
      const start = format(currentDate, "MMM d");
      return `Week of ${start}`;
    }
    return "";
  };

  return (
    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center bg-base-100 p-2 sm:p-1.5 rounded-xl border border-base-200 shadow-sm gap-3 sm:gap-4">
      
      {/* Period Selector - Full width on mobile, auto on desktop */}
      <div className="w-full sm:w-auto join bg-base-200 p-1 rounded-lg grid grid-cols-4 sm:flex">
        {[
          { id: 'week', label: '7D' },
          { id: 'month', label: 'Month' },
          { id: 'year', label: 'Year' },
          { id: 'all', label: 'All' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => handlePeriodChange(p.id as Period)}
            className={`join-item btn btn-sm border-none shadow-none text-xs flex-1 sm:flex-none ${
              period === p.id ? 'btn-active bg-base-100 font-bold' : 'btn-ghost'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Time Travel Controls - Full width justified on mobile */}
      {period !== 'all' && (
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start sm:gap-4 px-2 sm:px-0">
          <button onClick={() => handleTimeTravel('prev')} className="btn btn-sm btn-circle btn-ghost bg-base-200 sm:bg-transparent">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 font-bold min-w-[120px] justify-center text-sm sm:text-base">
            <CalendarDaysIcon className="w-4 h-4 text-primary" />
            <span>{getLabel()}</span>
          </div>

          <button onClick={() => handleTimeTravel('next')} className="btn btn-sm btn-circle btn-ghost bg-base-200 sm:bg-transparent">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}