"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowsUpDownIcon,
  CalendarIcon,
  UserIcon
} from "@heroicons/react/24/outline";

interface Deal {
  id: string;
  title: string;
  amount: number;
  status: string;
  updatedAt: Date | string;
  closeDate?: Date | string | null;
  contacts: { id: string; name: string; imageUrl?: string }[];
}

export default function DealsList({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'date';

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.push(`/deals?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WON': return 'badge-success';
      case 'LOST': return 'badge-error';
      case 'NEGOTIATION': return 'badge-info';
      case 'PENDING': return 'badge-warning';
      default: return 'badge-ghost';
    }
  };

  return (
    <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm">
      {/* Table Header (Desktop) */}
      <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-base-200 bg-base-200/30 text-xs font-bold uppercase tracking-wider text-base-content/50">
        <div className="col-span-5 pl-2 cursor-pointer hover:text-base-content" onClick={() => handleSort('name')}>Deal Name</div>
        <div className="col-span-2 cursor-pointer hover:text-base-content" onClick={() => handleSort('amount')}>Value</div>
        <div className="col-span-2">Stage</div>
        <div className="col-span-3 text-right pr-2 cursor-pointer hover:text-base-content" onClick={() => handleSort('date')}>Target Close</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-base-100">
        {deals.length === 0 && (
          <div className="p-8 text-center text-sm text-base-content/40">No deals found.</div>
        )}
        
        {deals.map((deal) => (
          <Link 
            key={deal.id} 
            href={`/deals/${deal.id}`}
            className="group block hover:bg-base-50 transition-colors"
          >
            {/* Mobile View: Stacked Card */}
            <div className="md:hidden p-4 flex justify-between items-start">
               <div className="min-w-0 flex-1 pr-4">
                  <div className="font-bold text-sm truncate mb-1">{deal.title}</div>
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <span className={`badge badge-xs ${getStatusBadge(deal.status)}`}></span>
                    {deal.status}
                    <span>•</span>
                    <span>{deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'No Date'}</span>
                  </div>
               </div>
               <div className="font-mono font-bold">${deal.amount.toLocaleString()}</div>
            </div>

            {/* Desktop View: Grid */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center text-sm">
               <div className="col-span-5 font-medium flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-xs font-bold text-base-content/40">
                    {deal.contacts[0]?.imageUrl ? <img src={deal.contacts[0].imageUrl} className="w-full h-full rounded-full" /> : deal.title.charAt(0)}
                  </div>
                  <span className="truncate">{deal.title}</span>
               </div>
               <div className="col-span-2 font-mono opacity-80">${deal.amount.toLocaleString()}</div>
               <div className="col-span-2">
                 <span className={`badge badge-sm ${getStatusBadge(deal.status)}`}>{deal.status}</span>
               </div>
               <div className="col-span-3 text-right font-mono text-xs opacity-50 flex justify-end items-center gap-2">
                 {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : '-'}
                 <CalendarIcon className="w-4 h-4" />
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}