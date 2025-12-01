"use client";

import { useState, useEffect } from "react";
import ContactCard from "./Contact";
import { TrashIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string | null;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  imageUrl: string | null;
  tags: { id: string; name: string }[];
}

export default function ContactList({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'SINGLE' | 'MASS' | null;
    targetId?: string;
  }>({ isOpen: false, type: null });

  const router = useRouter();

  // Sync local state if server props change
  useEffect(() => {
    setContacts(initialContacts);
    setSelectedIds(new Set());
  }, [initialContacts]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    }
  };

  // Trigger Modal for Single Delete
  const requestDeleteOne = (id: string) => {
    setModalConfig({ isOpen: true, type: 'SINGLE', targetId: id });
  };

  // Trigger Modal for Mass Delete
  const requestMassDelete = () => {
    if (selectedIds.size === 0) return;
    setModalConfig({ isOpen: true, type: 'MASS' });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null });
  };

  // Actual Delete Logic
  const performDelete = async () => {
    if (!modalConfig.type) return;
    setLoading(true);

    try {
      if (modalConfig.type === 'SINGLE' && modalConfig.targetId) {
        const res = await fetch(`/api/leads/${modalConfig.targetId}`, { method: "DELETE" });
        if (res.ok) {
          setContacts(prev => prev.filter(c => c.id !== modalConfig.targetId));
          router.refresh();
        }
      } else if (modalConfig.type === 'MASS') {
        const res = await fetch("/api/leads", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedIds) }),
        });

        if (res.ok) {
          setContacts(prev => prev.filter(c => !selectedIds.has(c.id)));
          setSelectedIds(new Set());
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      // Only use alert as a last resort fallback for network errors
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const isSelectionMode = selectedIds.size > 0;

  return (
    <div className="space-y-4 relative">
      {/* Bulk Action Bar */}
      {isSelectionMode && (
        <div className="sticky top-20 z-30 bg-base-200/90 backdrop-blur shadow-lg rounded-xl p-3 flex justify-between items-center animate-in slide-in-from-top-2 border border-base-300">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedIds(new Set())} className="btn btn-ghost btn-xs btn-circle">
               <XMarkIcon className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm">{selectedIds.size} Selected</span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={selectAll} className="btn btn-ghost btn-xs">
               {selectedIds.size === contacts.length ? "Deselect All" : "Select All"}
             </button>
             <button 
               onClick={requestMassDelete} 
               disabled={loading} 
               className="btn btn-error btn-sm shadow-sm text-white"
             >
               <TrashIcon className="w-4 h-4" /> Delete ({selectedIds.size})
             </button>
          </div>
        </div>
      )}

      {/* Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(c => (
          <ContactCard 
            key={c.id} 
            contact={c} 
            isSelected={selectedIds.has(c.id)}
            onToggleSelect={toggleSelect}
            onDelete={requestDeleteOne}
            isSelectionMode={isSelectionMode}
          />
        ))}
        {contacts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
             No contacts found.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalConfig.isOpen && (
        <dialog open className="modal modal-middle bg-black/60 backdrop-blur-sm z-[60]">
          <div className="modal-box border border-error/20 shadow-2xl">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6" />
              Confirm Deletion
            </h3>
            <p className="py-4">
              {modalConfig.type === 'MASS' 
                ? `Are you sure you want to delete these ${selectedIds.size} contacts?` 
                : "Are you sure you want to delete this contact?"
              }
              <br/>
              <span className="text-sm opacity-70">This action cannot be undone.</span>
            </p>
            <div className="modal-action">
              <button className="btn" onClick={closeModal} disabled={loading}>Cancel</button>
              <button 
                className="btn btn-error" 
                onClick={performDelete} 
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : "Yes, Delete"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}