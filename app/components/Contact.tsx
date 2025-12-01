"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Contact {
  id: string;
  name: string | null;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  imageUrl: string | null;
  tags: { name: string }[];
}

interface ContactCardProps {
  contact: Contact;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelectionMode?: boolean;
}

export default function ContactCard({ 
  contact, 
  isSelected = false, 
  onToggleSelect, 
  onDelete, 
  isSelectionMode = false 
}: ContactCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect(contact.id);
    } else {
      router.push(`/contacts/${contact.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        card bg-base-100 min-w-72 shadow-sm hover:shadow-md transition-all cursor-pointer border 
        active:scale-95 relative group
        ${isSelected ? 'border-primary bg-primary/5' : 'border-base-200'}
      `}
    >
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="absolute top-3 right-3 z-10">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => onToggleSelect(contact.id)}
            onClick={(e) => e.stopPropagation()}
            className={`checkbox checkbox-sm checkbox-primary transition-opacity ${
              isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`} 
          />
        </div>
      )}

      <div className="card-body p-4 flex flex-row items-center gap-4">
        {contact.imageUrl ? (
          <img
            src={contact.imageUrl}
            alt={contact.name ?? ""}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-base-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-neutral text-neutral-content flex items-center justify-center text-lg font-bold ring-2 ring-base-200">
            {(contact.name?.charAt(0)?.toUpperCase() ?? "?")}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base truncate">{contact.name}</h2>
          
          <p className="text-xs text-base-content/60 truncate">
            {contact.jobTitle && contact.company 
              ? `${contact.jobTitle} @ ${contact.company}`
              : contact.company 
                ? contact.company
                : contact.email
            }
          </p>
          
          <div className="flex gap-1 mt-1.5 overflow-hidden h-5">
             {contact.tags.slice(0, 2).map((t, i) => (
               <span key={i} className="badge badge-xs badge-ghost border-base-content/20 text-base-content/60 px-1.5 py-2">
                 {typeof t === 'string' ? t : t.name}
               </span>
             ))}
          </div>
        </div>
      </div>

      {/* Delete Button (Visible on Hover only if not selecting) */}
      {onDelete && !isSelectionMode && (
        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onDelete(contact.id);
             }}
             className="btn btn-xs btn-circle btn-ghost text-error hover:bg-error/10"
             title="Delete Contact"
           >
             <TrashIcon className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
}