"use client";

import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  EllipsisHorizontalIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

interface ContactProps {
  contact: any;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (contact: any) => void;
}

export default function ContactCard({ contact, onClick, onDelete, onEdit }: ContactProps) {
  return (
    <div 
      onClick={onClick}
      className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full"
    >
      <div className="card-body p-5">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="avatar placeholder">
            <div className="w-12 h-12 mask mask-squircle bg-base-200 text-base-content/50 font-bold text-xl">
              {contact.imageUrl ? (
                <img src={contact.imageUrl} alt={contact.name} />
              ) : (
                contact.name?.charAt(0) || "?"
              )}
            </div>
          </div>
          
          {/* Working Dropdown Menu */}
          <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-xs opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-40 border border-base-200">
              <li><a onClick={() => onEdit?.(contact)}><PencilIcon className="w-4 h-4" /> Edit</a></li>
              <li><a onClick={() => onDelete?.(contact.id)} className="text-error"><TrashIcon className="w-4 h-4" /> Delete</a></li>
            </ul>
          </div>
        </div>

        {/* Identity */}
        <div className="mb-4">
          <h3 className="font-bold text-base text-base-content leading-tight truncate">{contact.name}</h3>
          <p className="text-primary text-xs font-bold uppercase tracking-wide truncate mt-0.5">{contact.jobTitle || "Contact"}</p>
        </div>

        {/* Info Rows (Clickable Links) */}
        <div className="space-y-2 text-sm flex-1">
          <div className="flex items-center gap-2 text-base-content/70">
            <BuildingOfficeIcon className="w-4 h-4 shrink-0 opacity-50" />
            <span className="truncate text-xs">{contact.company || "-"}</span>
          </div>
          
          {contact.email && (
            <a 
              href={`mailto:${contact.email}`} 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4 shrink-0 opacity-50" />
              <span className="truncate text-xs">{contact.email}</span>
            </a>
          )}

          {contact.phone && (
            <a 
              href={`tel:${contact.phone}`} 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
            >
              <PhoneIcon className="w-4 h-4 shrink-0 opacity-50" />
              <span className="truncate text-xs">{contact.phone}</span>
            </a>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-4 h-6 overflow-hidden">
          {contact.tags?.slice(0, 3).map((tag: any) => (
            <span key={tag.id || tag.name} className="badge badge-xs bg-base-200 border-none text-[10px] text-base-content/60 font-medium">
              {tag.name}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}