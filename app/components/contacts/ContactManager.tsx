"use client";

import { useState } from "react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserPlusIcon
} from "@heroicons/react/24/outline";
import ContactListSidebar from "./ContactListSidebar";
import ContactDetailView from "./ContactDetailView";
import AddLeads from "../AddLeads";

export default function ContactManager({ initialContacts }: { initialContacts: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Search Logic
  const filteredContacts = initialContacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedContact = initialContacts.find(c => c.id === selectedId);

  // Handlers
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsMobileDetailOpen(true);
  };

  const handleCloseMobile = () => {
    setIsMobileDetailOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-base-100 overflow-hidden relative border-t border-base-200">
      
      {/* LEFT: LIST PANEL */}
      <div className={`
        flex-col w-full lg:w-[380px] xl:w-[420px] border-r border-base-200 bg-base-100
        ${isMobileDetailOpen ? 'hidden lg:flex' : 'flex'} 
      `}>
        
        {/* Sticky Header */}
        <div className="p-4 border-b border-base-200 bg-base-100 space-y-4">
           <div className="flex justify-between items-center">
              <h1 className="font-black text-xl tracking-tight">Directory</h1>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="btn btn-sm btn-primary rounded-full shadow-lg shadow-primary/20 px-4 gap-2"
              >
                <PlusIcon className="w-4 h-4" /> Add
              </button>
           </div>
           
           <div className="relative">
             <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
             <input 
               type="text" 
               placeholder="Search contacts..." 
               className="input input-sm input-bordered w-full pl-9 rounded-lg bg-base-50 focus:bg-white transition-all"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <ContactListSidebar 
             contacts={filteredContacts} 
             selectedId={selectedId} 
             onSelect={handleSelect} 
           />
        </div>
      </div>

      {/* RIGHT: DETAIL PANEL */}
      <div className={`
        flex-1 bg-white
        ${isMobileDetailOpen ? 'fixed inset-0 z-50 flex' : 'hidden lg:flex'}
      `}>
        {selectedContact ? (
          <div className="w-full h-full animate-in fade-in slide-in-from-right-4 duration-300">
             <ContactDetailView 
               contact={selectedContact} 
               onBack={handleCloseMobile} 
             />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-base-content/30 p-8 text-center bg-base-50/50">
             <div className="w-24 h-24 bg-base-200/50 rounded-full flex items-center justify-center mb-4">
                <UserPlusIcon className="w-10 h-10 opacity-40" />
             </div>
             <h3 className="font-bold text-lg opacity-60">Select a Contact</h3>
             <p className="text-sm max-w-xs mt-2 opacity-50">View details, active deals, and history.</p>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[100]">
          <div className="modal-box p-0 bg-base-100 max-w-lg">
             <div className="p-4 border-b border-base-200 flex justify-between items-center">
               <h3 className="font-bold text-lg">New Contact</h3>
               <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
             </div>
             <div className="p-4">
                <AddLeads onSuccess={() => { setShowAddModal(false); window.location.reload(); }} onCancel={() => setShowAddModal(false)} />
             </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}></div>
        </dialog>
      )}

    </div>
  );
}