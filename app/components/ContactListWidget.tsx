"use client";

import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";

interface Contact {
  id: string;
  name: string;
  jobTitle: string | null;
  company: string | null;
  imageUrl: string | null;
  lastContactedAt: Date | string | null;
}

export default function ContactListWidget({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="p-6 bg-base-100 rounded-xl border border-dashed border-base-300 text-center">
        <p className="text-xs text-base-content/40">No recent interactions.</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-base-200 flex justify-between items-center">
        <h3 className="font-bold text-sm">Recently Active</h3>
        <Link href="/contacts" className="text-xs link link-hover opacity-50">View All</Link>
      </div>
      <div className="divide-y divide-base-100">
        {contacts.map((c) => (
          <Link href={`/contacts/${c.id}`} key={c.id} className="flex items-center gap-3 p-3 hover:bg-base-50 transition-colors group">
             <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-base-200 ring-1 ring-base-300 group-hover:ring-primary/30 transition-all">
                   {c.imageUrl ? (
                     <img src={c.imageUrl} alt={c.name} />
                   ) : (
                     <span className="flex items-center justify-center h-full text-xs font-bold opacity-40">{c.name.charAt(0)}</span>
                   )}
                </div>
             </div>
             <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{c.name}</div>
                <div className="text-xs text-base-content/50 truncate">
                  {c.jobTitle ? `${c.jobTitle} ${c.company ? '@ ' + c.company : ''}` : c.company || "Contact"}
                </div>
             </div>
             <div className="text-[10px] text-base-content/30 whitespace-nowrap">
               {c.lastContactedAt ? new Date(c.lastContactedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : ''}
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}