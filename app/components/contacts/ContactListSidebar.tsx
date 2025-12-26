"use client";

interface ContactListProps {
  contacts: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ContactListSidebar({ contacts, selectedId, onSelect }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="p-10 text-center opacity-40 text-sm">
        No contacts match your search.
      </div>
    );
  }

  return (
    <div className="divide-y divide-base-200">
      {contacts.map((c) => {
        const isActive = selectedId === c.id;
        const initials = c.name.charAt(0).toUpperCase();

        return (
          <div 
            key={c.id} 
            onClick={() => onSelect(c.id)}
            className={`
              p-4 flex items-center gap-4 cursor-pointer transition-all duration-200
              ${isActive ? 'bg-primary/5 border-l-4 border-primary pl-[12px]' : 'hover:bg-base-50 border-l-4 border-transparent'}
            `}
          >
            {/* Avatar */}
            <div className={`avatar placeholder ${isActive ? 'online' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isActive ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/60'}`}>
                 {c.imageUrl ? <img src={c.imageUrl} alt={c.name} /> : initials}
              </div>
            </div>

            {/* Text Info */}
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-baseline mb-0.5">
                 <h3 className={`font-bold text-sm truncate ${isActive ? 'text-primary' : 'text-base-content'}`}>
                   {c.name}
                 </h3>
               </div>
               
               <p className="text-xs text-base-content/60 truncate">
                 {c.jobTitle && c.company ? (
                   <span>{c.jobTitle} @ {c.company}</span>
                 ) : (
                   c.email || "No details"
                 )}
               </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}