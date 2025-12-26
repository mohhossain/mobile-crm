"use client";

import { 
  XMarkIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  PencilSquareIcon, 
  BriefcaseIcon, 
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  HashtagIcon,
  ArrowDownOnSquareIcon
} from "@heroicons/react/24/outline";
import EditContactForm from "./EditContactForm";
import { useState } from "react";
import Link from "next/link";
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';

export default function ContactDrawer({ contact, onClose }: { contact: any, onClose: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const deals = contact.deals || [];

  // --- SAVE TO DEVICE LOGIC (FIXED) ---
// --- SAVE TO DEVICE LOGIC ---
  const handleSaveToDevice = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert("This feature is only available on the mobile app.");
      return;
    }

    try {
      const perm = await Contacts.requestPermissions();
      if (perm.contacts !== 'granted') return;

         await Contacts.createContact({
            contact: {
               givenName: contact.name,
               jobTitle: contact.jobTitle || "",
               organizationName: contact.company || "",
               // FIX: Add 'as any' to bypass the strict Enum check
               phones: contact.phone ? [{ type: 'mobile' as any, number: contact.phone }] : [],
               emails: contact.email ? [{ type: 'work' as any, address: contact.email }] : [],
            } as any,
         } as any);
      alert("Contact saved to your phone!");
    } catch (e) {
      console.error(e);
      alert("Failed to save contact.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-base-100 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-base-200">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
           <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost bg-base-100/50 backdrop-blur text-base-content">
             <XMarkIcon className="w-5 h-5" />
           </button>
           {!isEditing && (
             <button onClick={() => setIsEditing(true)} className="btn btn-circle btn-sm btn-ghost bg-base-100/50 backdrop-blur text-base-content">
               <PencilSquareIcon className="w-4 h-4" />
             </button>
           )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-base-100">
           {isEditing ? (
             <div className="p-6 pt-20">
                <div className="flex items-center gap-2 mb-6 text-sm font-bold opacity-50 cursor-pointer hover:opacity-100" onClick={() => setIsEditing(false)}>
                  <span>← Back to Profile</span>
                </div>
                <EditContactForm contact={contact} />
             </div>
           ) : (
             <div className="pb-10">
                
                {/* Hero Section */}
                <div className="relative pt-20 pb-8 px-6 text-center overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                   
                   <div className="relative z-10">
                      <div className="avatar placeholder mb-4">
                         <div className="w-28 h-28 rounded-3xl bg-base-100 text-base-content/80 text-5xl font-black ring-4 ring-base-200 shadow-xl flex items-center justify-center">
                            {contact.imageUrl ? (
                              <img src={contact.imageUrl} className="object-cover" /> 
                            ) : (
                              contact.name.charAt(0)
                            )}
                         </div>
                      </div>
                      
                      <h1 className="text-3xl font-black tracking-tight text-base-content mb-1">{contact.name}</h1>
                      <div className="flex items-center justify-center gap-2 text-sm font-medium text-base-content/60">
                         {contact.jobTitle && <span>{contact.jobTitle}</span>}
                         {contact.company && (
                           <>
                             <span className="w-1 h-1 rounded-full bg-base-content/30"></span>
                             <span className="flex items-center gap-1">
                               <BriefcaseIcon className="w-3 h-3" /> {contact.company}
                             </span>
                           </>
                         )}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-6 inline-flex p-1.5 bg-base-200/50 rounded-full border border-base-200/50 backdrop-blur-md shadow-sm">
                         {contact.email && (
                           <a href={`mailto:${contact.email}`} className="btn btn-circle btn-sm btn-primary shadow-lg shadow-primary/30">
                             <EnvelopeIcon className="w-4 h-4" />
                           </a>
                         )}
                         <div className="w-2"></div>
                         {contact.phone && (
                           <a href={`tel:${contact.phone}`} className="btn btn-circle btn-sm btn-success text-white shadow-lg shadow-success/30">
                             <PhoneIcon className="w-4 h-4" />
                           </a>
                         )}
                         <div className="w-2"></div>
                         <button onClick={handleSaveToDevice} className="btn btn-circle btn-sm btn-ghost text-base-content/70" title="Save to Device">
                            <ArrowDownOnSquareIcon className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="px-6 space-y-8">
                   
                   {/* Info Grid */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 p-4 rounded-2xl bg-base-200/50 border border-base-300 flex items-center gap-4 group hover:border-primary/30 transition-colors">
                         <div className="w-10 h-10 rounded-xl bg-base-100 flex items-center justify-center text-primary shadow-sm">
                            <EnvelopeIcon className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Email</div>
                            <div className="font-semibold text-sm truncate select-all">{contact.email || "—"}</div>
                         </div>
                         {contact.email && <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-50" />}
                      </div>

                      <div className="col-span-1 p-4 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col gap-3 group hover:border-success/30 transition-colors">
                         <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center text-success shadow-sm">
                            <PhoneIcon className="w-4 h-4" />
                         </div>
                         <div>
                            <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Phone</div>
                            <div className="font-semibold text-sm truncate select-all">{contact.phone || "—"}</div>
                         </div>
                      </div>

                      <div className="col-span-1 p-4 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col gap-3">
                         <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center text-secondary shadow-sm">
                            <MapPinIcon className="w-4 h-4" />
                         </div>
                         <div>
                            <div className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Location</div>
                            <div className="font-semibold text-sm truncate">{contact.location || "—"}</div>
                         </div>
                      </div>
                   </div>

                   {/* Pipeline - CLICKABLE DEALS */}
                   <div>
                      <h3 className="text-xs font-bold uppercase opacity-40 mb-4 tracking-widest flex items-center gap-2">
                        Active Pipeline <span className="badge badge-xs badge-neutral">{deals.length}</span>
                      </h3>
                      
                      {deals.length > 0 ? (
                        <div className="space-y-3">
                           {deals.map((deal: any) => (
                             <Link href={`/deals/${deal.id}`} key={deal.id} className="block relative overflow-hidden p-4 bg-base-100 border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition-all group active:scale-95">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${deal.stage === 'Won' ? 'bg-success' : 'bg-primary'}`}></div>
                                
                                <div className="flex justify-between items-start pl-2">
                                   <div>
                                      <div className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{deal.title}</div>
                                      <div className="text-xs opacity-50 mt-1 flex items-center gap-1">
                                         <CalendarDaysIcon className="w-3 h-3" /> Updated recently
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <div className="font-black text-lg tracking-tight">${deal.amount.toLocaleString()}</div>
                                      <span className={`badge badge-xs font-bold mt-1 ${deal.stage === 'Won' ? 'badge-success text-white' : 'badge-ghost'}`}>
                                         {deal.stage}
                                      </span>
                                   </div>
                                </div>
                             </Link>
                           ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center border-2 border-dashed border-base-300 rounded-2xl">
                          <BriefcaseIcon className="w-8 h-8 mx-auto opacity-20 mb-2" />
                          <p className="text-sm opacity-50 font-medium">No deals in pipeline.</p>
                        </div>
                      )}
                   </div>

                   {/* Tags */}
                   {contact.tags && contact.tags.length > 0 && (
                     <div>
                        <h3 className="text-xs font-bold uppercase opacity-40 mb-3 tracking-widest flex items-center gap-2">
                           <HashtagIcon className="w-3 h-3" /> Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {contact.tags.map((t: any) => (
                              <span key={t.id} className="badge badge-lg bg-base-200 border-none text-base-content/70 font-medium pl-3 pr-3 py-3">
                                 {t.name}
                              </span>
                           ))}
                        </div>
                     </div>
                   )}

                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}