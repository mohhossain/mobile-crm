"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon, 
  BanknotesIcon,
  UserPlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

// Import standalone forms as requested
import AddDeals from "./AddDeals";
import AddTasks from "./AddTasks";
import AddLeads from "./AddLeads";
import AddExpense from "./AddExpense";

export default function HomeActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'DEAL' | 'TASK' | 'CONTACT' | 'EXPENSE' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const openModal = (type: 'DEAL' | 'TASK' | 'CONTACT' | 'EXPENSE') => {
    setIsOpen(false);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    router.refresh(); 
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Trigger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="btn btn-primary gap-2 shadow-lg hover:scale-105 transition-transform"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Create</span>
          <span className="sm:hidden">Add</span>
        </button>

        {isOpen && (
          <>
            {/* Mobile Backdrop for easier closing */}
            <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] sm:hidden" onClick={() => setIsOpen(false)}></div>
            
            {/* ALIGNMENT FIX:
               - Mobile: 'left-0' aligns the left edge of dropdown with left edge of button (grows right -> stays on screen).
               - Desktop: 'sm:left-auto sm:right-0' aligns right edge with button (standard dropdown behavior).
            */}
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-64 p-2 bg-base-100 rounded-xl shadow-xl border border-base-200 animate-in fade-in slide-in-from-top-2 origin-top-left sm:origin-top-right">
               <div className="flex flex-col gap-1">
                  
                  <button onClick={() => openModal('DEAL')} className="btn btn-ghost justify-start gap-3 h-auto py-3 group">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <CurrencyDollarIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">New Deal</div>
                      <div className="text-[10px] opacity-60 font-normal">Pipeline & Sales</div>
                    </div>
                  </button>

                  <button onClick={() => openModal('TASK')} className="btn btn-ghost justify-start gap-3 h-auto py-3 group">
                    <div className="p-2 bg-secondary/10 rounded-lg text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">New Task</div>
                      <div className="text-[10px] opacity-60 font-normal">To-do & Reminders</div>
                    </div>
                  </button>

                  <button onClick={() => openModal('CONTACT')} className="btn btn-ghost justify-start gap-3 h-auto py-3 group">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <UserPlusIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">New Contact</div>
                      <div className="text-[10px] opacity-60 font-normal">Client or Lead</div>
                    </div>
                  </button>

                  <div className="divider my-0 opacity-50"></div>

                  <button onClick={() => openModal('EXPENSE')} className="btn btn-ghost justify-start gap-3 h-auto py-3 group">
                    <div className="p-2 bg-error/10 rounded-lg text-error group-hover:bg-error group-hover:text-white transition-colors">
                      <BanknotesIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm">Log Expense</div>
                      <div className="text-[10px] opacity-60 font-normal">Track spending</div>
                    </div>
                  </button>

               </div>
            </div>
          </>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Deal Modal */}
      {activeModal === 'DEAL' && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[60]">
          <div className="modal-box p-0 bg-transparent shadow-none overflow-visible max-w-3xl w-full">
             <div className="bg-base-100 rounded-2xl overflow-hidden h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl relative">
                {/* Header for mobile spacing */}
                <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100 sticky top-0 z-10">
                   <h3 className="font-bold text-lg">New Deal</h3>
                   <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">✕</button>
                </div>
                <div className="overflow-y-auto p-2 flex-1 overscroll-contain">
                   <AddDeals />
                </div>
             </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </dialog>
      )}

      {/* Task Modal */}
      {activeModal === 'TASK' && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[60]">
           <div className="modal-box p-6 bg-base-100">
              <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <div className="mt-2">
                 <AddTasks />
              </div>
           </div>
           <div className="modal-backdrop" onClick={closeModal}></div>
        </dialog>
      )}

      {/* Contact Modal */}
      {activeModal === 'CONTACT' && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[60]">
           <div className="modal-box p-6 bg-base-100">
              <h3 className="font-bold text-lg mb-4">New Contact</h3>
              <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <AddLeads onSuccess={closeModal} onCancel={closeModal} />
           </div>
           <div className="modal-backdrop" onClick={closeModal}></div>
        </dialog>
      )}

      {/* Expense Modal */}
      {activeModal === 'EXPENSE' && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[60]">
           <div className="modal-box p-6 bg-base-100">
              <h3 className="font-bold text-lg mb-4">Log Expense</h3>
              <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <AddExpense onSuccess={closeModal} onCancel={closeModal} />
           </div>
           <div className="modal-backdrop" onClick={closeModal}></div>
        </dialog>
      )}
    </>
  );
}