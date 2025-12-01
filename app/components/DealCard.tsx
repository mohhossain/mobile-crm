"use client";

import React from "react";
import Link from "next/link";
import { 
  CalendarDaysIcon, 
  UserIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

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
  probability?: number; // Optional in case older deals don't have it
  updatedAt: Date | string;
  contacts: Contact[];
  tags: Tag[];
}

export default function DealCard({ deal }: { deal: Deal }) {
  // Safety check for probability
  const probability = deal.probability ?? (
    deal.status === 'WON' ? 100 : 
    deal.status === 'LOST' ? 0 : 
    deal.status === 'NEGOTIATION' ? 75 : 
    deal.status === 'PENDING' ? 50 : 10
  );

  const statusColors: Record<string, string> = {
    WON: 'border-success bg-success/5 text-success',
    LOST: 'border-error bg-error/5 text-error',
    NEGOTIATION: 'border-info bg-info/5 text-info',
    PENDING: 'border-warning bg-warning/5 text-warning',
    OPEN: 'border-primary bg-primary/5 text-primary'
  };

  const themeColor = statusColors[deal.status] || 'border-base-content/10';

  return (
    <Link href={`/deals/${deal.id}`} className="block group">
      <div className={`card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${themeColor.split(' ')[0]} border-t border-r border-b border-base-200`}>
        <div className="card-body p-5">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="badge badge-ghost badge-sm font-bold tracking-wide opacity-70">
              {deal.status}
            </div>
            <span className="text-[10px] text-base-content/40 font-mono flex items-center gap-1">
              <CalendarDaysIcon className="w-3 h-3" />
              {new Date(deal.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Title & Amount */}
          <div>
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1" title={deal.title}>
              {deal.title}
            </h3>
            <div className="text-2xl font-black mt-1 text-base-content">
              ${deal.amount.toLocaleString()}
            </div>
          </div>

          {/* Probability Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-bold uppercase text-base-content/40 mb-1">
              <span>Probability</span>
              <span>{probability}%</span>
            </div>
            <div className="h-1.5 w-full bg-base-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  deal.status === 'WON' ? 'bg-success' : 
                  deal.status === 'LOST' ? 'bg-error' : 'bg-primary'
                }`} 
                style={{ width: `${probability}%` }}
              ></div>
            </div>
          </div>

          {/* Footer: Contacts & Tags */}
          <div className="flex justify-between items-end mt-4 pt-4 border-t border-base-100">
            
            {/* Avatar Stack */}
            <div className="flex -space-x-2 overflow-hidden p-1">
              {deal.contacts.length > 0 ? (
                deal.contacts.slice(0, 3).map((contact) => (
                  <div key={contact.id} className="avatar placeholder ring-2 ring-base-100 rounded-full" title={contact.name}>
                    <div className="bg-neutral text-neutral-content rounded-full w-6 h-6 text-xs">
                      {contact.imageUrl ? (
                        <img src={contact.imageUrl} alt={contact.name} />
                      ) : (
                        <span>{contact.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-base-content/30 italic pl-1">No contacts</div>
              )}
              {deal.contacts.length > 3 && (
                <div className="avatar placeholder ring-2 ring-base-100 rounded-full">
                   <div className="w-6 h-6 bg-base-200 text-[10px] text-base-content/60">
                     +{deal.contacts.length - 3}
                   </div>
                </div>
              )}
            </div>

            {/* First Tag */}
            {deal.tags.length > 0 && (
              <span className="badge badge-xs badge-outline text-base-content/50">
                {deal.tags[0].name}
              </span>
            )}
          </div>

        </div>
      </div>
    </Link>
  );
}