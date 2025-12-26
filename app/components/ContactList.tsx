"use client";

import { useState, useEffect } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ContactCard from "./Contact"; 
import ContactDrawer from "../components/ContactDrawer"; 
import AddLeads from "./AddLeads"; 
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  imageUrl: string | null;
  tags: { id: string; name: string }[];
  deals?: any[];
}

export default function ContactList({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => { setContacts(initialContacts); }, [initialContacts]);

  const filtered = contacts.filter(c => 
    (c.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (c.company?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if(!confirm("Delete contact?")) return;
    try {
        await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        setContacts(prev => prev.filter(c => c.id !== id));
        router.refresh();
    } catch(e) { alert("Error deleting"); }
  };

  return (
    <div className="min-h-screen pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
         <div>
            <h1 className="text-3xl font-black text-base-content tracking-tight">Contacts</h1>
            <p className="text-base-content/60 mt-1">Your network of partners and clients.</p>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="input input-sm input-bordered w-full pl-9 rounded-full bg-base-100"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <button onClick={() => setShowAddModal(true)} className="btn btn-sm btn-primary rounded-full gap-2 px-4 shadow-lg shadow-primary/20">
               <PlusIcon className="w-4 h-4" /> <span className="hidden sm:inline">Add Contact</span>
            </button>
         </div>
      </div>

      {/* GRID (Fixed size issue: xl:grid-cols-4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         
         {filtered.map((contact) => (
            <div key={contact.id} className="h-full">
              <ContactCard 
                 contact={contact} 
                 onClick={() => setSelectedContact(contact)} 
                 onDelete={handleDelete}
                 onEdit={(c) => { setSelectedContact(c); /* Open drawer directly to edit could be handled here if we pass state */ }}
              />
            </div>
         ))}

         {/* "Create New" Card */}
         <button 
            onClick={() => setShowAddModal(true)}
            className="card border-2 border-dashed border-base-300 bg-base-50/50 hover:bg-base-100 hover:border-primary/50 transition-all duration-300 min-h-[220px] flex flex-col items-center justify-center group cursor-pointer h-full"
         >
            <div className="w-12 h-12 rounded-full bg-base-200 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors mb-2">
               <PlusIcon className="w-6 h-6 opacity-40 group-hover:opacity-100" />
            </div>
            <h3 className="font-bold text-sm text-base-content/60 group-hover:text-primary transition-colors">Add Contact</h3>
         </button>

      </div>

      {/* DRAWER */}
      {selectedContact && (
         <ContactDrawer 
            contact={selectedContact} 
            onClose={() => setSelectedContact(null)} 
         />
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[100]">
          <div className="modal-box">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Add New Contact</h3>
                <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
             </div>
             <AddLeads onSuccess={(newContact) => { 
                 setShowAddModal(false); 
                 // Optimistic update or reload
                 setContacts(prev => [newContact, ...prev]);
                 router.refresh();
             }} onCancel={() => setShowAddModal(false)} />
          </div>
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}></div>
        </dialog>
      )}

    </div>
  );
}