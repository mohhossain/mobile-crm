"use client";

import { useState } from "react";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ArrowLeftIcon,
  PencilSquareIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";
import EditContactForm from "../EditContactForm"; // Reusing your existing component

export default function ContactDetailView({ contact, onBack }: { contact: any, onBack: () => void }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="h-full overflow-y-auto bg-base-100 p-4">
        <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-ghost mb-4 gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Cancel Edit
        </button>
        {/* We reuse your existing edit form here */}
        <EditContactForm contact={contact} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      
      {/* 1. HERO HEADER */}
      <div className="relative bg-base-50/50 border-b border-base-200 p-6 sm:p-10 shrink-0">
         {/* Mobile Back Button */}
         <button onClick={onBack} className="lg:hidden absolute top-4 left-4 btn btn-circle btn-ghost btn-sm text-base-content/50">
           <ArrowLeftIcon className="w-5 h-5" />
         </button>

         <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mt-6 lg:mt-0">
            {/* Big Avatar */}
            <div className="avatar placeholder">
              <div className="w-24 h-24 rounded-3xl bg-base-100 border border-base-200 shadow-xl flex items-center justify-center text-4xl font-black text-base-content/80">
                 {contact.imageUrl ? <img src={contact.imageUrl} /> : contact.name.charAt(0)}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
               <h1 className="text-3xl font-black text-base-content tracking-tight leading-tight">{contact.name}</h1>
               <p className="text-lg text-base-content/60 font-medium mt-1">
                 {contact.jobTitle} {contact.company && <span className="opacity-60">at {contact.company}</span>}
               </p>
               
               {/* Action Bar */}
               <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-6">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="btn btn-sm btn-primary rounded-full gap-2 shadow-lg shadow-primary/20">
                      <EnvelopeIcon className="w-4 h-4" /> Email
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="btn btn-sm btn-outline rounded-full gap-2 bg-base-100">
                      <PhoneIcon className="w-4 h-4" /> Call
                    </a>
                  )}
                  <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-ghost rounded-full gap-2">
                    <PencilSquareIcon className="w-4 h-4" /> Edit
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* 2. SCROLLABLE DATA AREA */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 custom-scrollbar bg-white">
         
         {/* Grid: Contact Info & Tags */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase opacity-40 tracking-wider mb-4">Contact Info</h4>
               
               <div className="flex flex-col gap-3">
                 {contact.email && (
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-base-50 border border-base-100">
                     <EnvelopeIcon className="w-5 h-5 text-base-content/40" />
                     <span className="text-sm font-medium select-all">{contact.email}</span>
                   </div>
                 )}
                 {contact.phone && (
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-base-50 border border-base-100">
                     <PhoneIcon className="w-5 h-5 text-base-content/40" />
                     <span className="text-sm font-medium select-all">{contact.phone}</span>
                   </div>
                 )}
                 {contact.location && (
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-base-50 border border-base-100">
                     <MapPinIcon className="w-5 h-5 text-base-content/40" />
                     <span className="text-sm font-medium">{contact.location}</span>
                   </div>
                 )}
               </div>
            </div>

            <div>
               <h4 className="text-xs font-bold uppercase opacity-40 tracking-wider mb-4">Tags</h4>
               <div className="flex flex-wrap gap-2">
                 {contact.tags?.map((t: any) => (
                   <span key={t.id} className="badge badge-lg badge-outline py-3 px-4 text-xs font-bold"># {t.name}</span>
                 ))}
                 {(!contact.tags || contact.tags.length === 0) && <span className="text-sm opacity-40 italic">No tags</span>}
               </div>
            </div>
         </div>

         {/* History / Context */}
         <div>
            <div className="flex items-center gap-3 mb-6 border-b border-base-200 pb-4">
               <h3 className="font-bold text-lg">Active Pipeline</h3>
            </div>
            
            <div className="space-y-3">
               {contact.deals && contact.deals.length > 0 ? (
                 contact.deals.map((d: any) => (
                   <div key={d.id} className="flex items-center justify-between p-4 bg-base-100 border border-base-200 rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-success/10 text-success rounded-lg">
                           <BriefcaseIcon className="w-5 h-5" />
                         </div>
                         <div>
                           <div className="font-bold text-sm">{d.title}</div>
                           <div className="text-xs opacity-50 uppercase font-bold tracking-wide">{d.stage}</div>
                         </div>
                      </div>
                      <div className="font-mono font-bold">${d.amount.toLocaleString()}</div>
                   </div>
                 ))
               ) : (
                 <div className="p-8 text-center bg-base-50 rounded-xl border border-dashed border-base-200 opacity-60 text-sm">
                   No active deals linked to this contact.
                 </div>
               )}
            </div>
         </div>

      </div>
    </div>
  );
}