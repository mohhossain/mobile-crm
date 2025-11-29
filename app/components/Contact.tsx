"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  imageUrl: string | null;
  tags: string[];
}

export default function ContactCard({ contact }: { contact: Contact }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/contacts/${contact.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="card bg-base-100 min-w-72 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-base-200"
    >
      <div className="card-body p-4 flex flex-row items-center gap-4">
        {contact.imageUrl ? (
          <img
            src={contact.imageUrl}
            alt={contact.name ?? ""}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-neutral text-neutral-content flex items-center justify-center text-lg font-bold">
            {(contact.name?.charAt(0)?.toUpperCase() ?? "?")}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h2 className="card-title text-base truncate">{contact.name}</h2>
          <p className="text-xs text-gray-500 truncate">{contact.email}</p>
          <div className="flex gap-1 mt-1 overflow-hidden">
             {contact.tags.slice(0, 2).map(t => (
               <span key={t} className="badge badge-xs badge-outline">{t}</span>
             ))}
          </div>
        </div>

        <div className={`badge badge-sm ${contact.status === 'NEW' ? 'badge-primary' : 'badge-ghost'}`}>
          {contact.status}
        </div>
      </div>
    </div>
  );
}