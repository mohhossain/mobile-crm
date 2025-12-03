"use client";

import React from "react";
import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

interface Contact {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Deal {
  id: string;
  title: string;
  amount: number;
  status: string;
  probability?: number;
  updatedAt: Date | string;
  closeDate?: Date | string | null;
  contacts: Contact[];
  tags: Tag[];
}

export default function DealCard({ deal }: { deal: Deal }) {
  const probability = deal.probability ?? (
    deal.status === 'WON' ? 100 : deal.status === 'LOST' ? 0 : 50
  );

  const statusColors: Record<string, string> = {
    WON: 'bg-success',
    LOST: 'bg-error',
    NEGOTIATION: 'bg-info',
    PENDING: 'bg-warning',
    OPEN: 'bg-primary'
  };

  const barColor = statusColors[deal.status] || 'bg-base-content/20';
  
  // Date Logic
  const displayDate = deal.closeDate ? new Date(deal.closeDate) : new Date(deal.updatedAt);
  const dateLabel = deal.closeDate ? (deal.status === 'WON' ? 'Closed' : 'Due') : 'Updated';

  return (
    <Link href={`/deals/${deal.id}`} className="block group relative overflow-hidden rounded-xl bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="p-4">
        {/* Top Row: Title & Amount */}
        <div className="flex justify-between items-start gap-4 mb-2">
           <div className="min-w-0 flex-1">
             <div className="flex items-center gap-2 mb-0.5">
               <span className={`w-2 h-2 rounded-full ${barColor}`}></span>
               <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">{deal.status}</span>
             </div>
             <h3 className="font-bold text-base truncate leading-tight group-hover:text-primary transition-colors">
               {deal.title}
             </h3>
           </div>
           <div className="font-black text-lg tracking-tight">
             ${deal.amount.toLocaleString()}
           </div>
        </div>

        {/* Bottom Row: Details */}
        <div className="flex justify-between items-end mt-2">
           <div className="flex -space-x-2 overflow-hidden">
              {deal.contacts.slice(0, 3).map((contact) => (
                <div key={contact.id} className="avatar placeholder ring-1 ring-base-100 rounded-full w-6 h-6" title={contact.name}>
                  {contact.imageUrl ? (
                    <img src={contact.imageUrl} alt={contact.name} />
                  ) : (
                    <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-[9px] font-bold">
                      {contact.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
           </div>
           
           <div className="text-[10px] text-base-content/40 font-medium flex items-center gap-1 bg-base-200/50 px-2 py-1 rounded-md">
              <CalendarDaysIcon className="w-3 h-3" />
              {dateLabel} {displayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
           </div>
        </div>
      </div>

      {/* Slim Progress Bar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-base-200">
        <div 
          className={`h-full ${barColor} transition-all duration-500`} 
          style={{ width: `${probability}%` }}
        ></div>
      </div>
    </Link>
  );
}