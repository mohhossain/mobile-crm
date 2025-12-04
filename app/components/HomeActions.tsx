"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  BriefcaseIcon, 
  ClipboardDocumentCheckIcon, 
  UserPlusIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import AddDeals from "./AddDeals";
import AddTasks from "./AddTasks";
import AddLeads from "./AddLeads";

export default function HomeActions() {
  // Modal State
  const [activeModal, setActiveModal] = useState<'DEAL' | 'TASK' | 'CONTACT' | null>(null);

  return (
    <div className="flex gap-3 items-center">
      
      {/* 1. QUICK ACTION DROPDOWN (+) */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-primary btn-sm gap-2 shadow-lg shadow-primary/20 rounded-full px-4">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </div>
        <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-200 mt-2">
          <li>
            <button onClick={() => setActiveModal('DEAL')} className="gap-3 py-3">
              <BriefcaseIcon className="w-4 h-4 text-primary" /> New Deal
            </button>
          </li>
          <li>
            <button onClick={() => setActiveModal('TASK')} className="gap-3 py-3">
              <ClipboardDocumentCheckIcon className="w-4 h-4 text-secondary" /> New Task
            </button>
          </li>
          <li>
            <button onClick={() => setActiveModal('CONTACT')} className="gap-3 py-3">
              <UserPlusIcon className="w-4 h-4 text-accent" /> New Contact
            </button>
          </li>
          <div className="divider my-0"></div>
          <li>
            <Link href="/finance" className="gap-3 py-3 text-base-content/60">
              <BanknotesIcon className="w-4 h-4" /> Log Expense
            </Link>
          </li>
        </ul>
      </div>

      {/* 2. MODALS */}
      
      {/* Add Deal Modal */}
      {activeModal === 'DEAL' && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-box p-0 bg-transparent shadow-none overflow-visible max-w-3xl w-full">
             <div className="bg-base-100 rounded-2xl overflow-hidden h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-base-200 flex justify-between items-center shrink-0 bg-base-100 z-10">
                   <h3 className="font-bold text-lg">New Deal</h3>
                   <button onClick={() => setActiveModal(null)} className="btn btn-sm btn-circle btn-ghost">✕</button>
                </div>
                <div className="overflow-y-auto p-2 flex-1 overscroll-contain">
                   <AddDeals />
                </div>
             </div>
          </div>
          <div className="modal-backdrop" onClick={() => setActiveModal(null)}></div>
        </dialog>
      )}

      {/* Add Task Modal */}
      {activeModal === 'TASK' && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
           <div className="modal-box p-6 bg-base-100">
              <button onClick={() => setActiveModal(null)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <div className="mt-4">
                 <AddTasks />
              </div>
           </div>
           <div className="modal-backdrop" onClick={() => setActiveModal(null)}></div>
        </dialog>
      )}

      {/* Add Contact Modal */}
      {activeModal === 'CONTACT' && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
           <div className="modal-box p-6 bg-base-100">
              <h3 className="font-bold text-lg mb-4">New Contact</h3>
              <button onClick={() => setActiveModal(null)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <AddLeads onSuccess={() => setActiveModal(null)} onCancel={() => setActiveModal(null)} />
           </div>
           <div className="modal-backdrop" onClick={() => setActiveModal(null)}></div>
        </dialog>
      )}

    </div>
  );
}