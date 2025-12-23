"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BuildingLibraryIcon,
  LinkIcon,
  CheckCircleIcon,
  QrCodeIcon,
  BanknotesIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

interface PaymentMethods {
  zelle?: string;
  venmo?: string;
  cashapp?: string;
  wire?: string;
}

export default function PaymentSettings({ 
  initialLink, 
  initialInstructions,
  initialMethods 
}: { 
  initialLink?: string | null, 
  initialInstructions?: string | null,
  initialMethods?: PaymentMethods | null
}) {
  const [link, setLink] = useState(initialLink || "");
  const [instructions, setInstructions] = useState(initialInstructions || "");
  
  // Structured Methods
  const [methods, setMethods] = useState<PaymentMethods>(initialMethods || {});
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          defaultPaymentLink: link,
          paymentInstructions: instructions,
          paymentMethods: methods
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateMethod = (key: keyof PaymentMethods, value: string) => {
    setMethods(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. PRIMARY BUTTON LINK */}
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="bg-base-50/50 p-4 border-b border-base-200 flex justify-between items-center">
           <h3 className="font-bold text-sm uppercase opacity-70 flex items-center gap-2">
             <LinkIcon className="w-4 h-4" /> Default "Pay Now" Link
           </h3>
           <span className="badge badge-primary badge-outline text-xs">Primary</span>
        </div>
        <div className="p-6">
           <p className="text-sm text-base-content/60 mb-4">
             Where should the big "Pay Now" button redirect to? (Stripe Payment Link, PayPal.me, etc). 
             <br/><span className="text-xs opacity-50 italic">Note: You can override this for specific deals.</span>
           </p>
           <input 
             type="url" 
             placeholder="https://buy.stripe.com/..." 
             className="input input-bordered w-full"
             value={link}
             onChange={(e) => setLink(e.target.value)}
           />
        </div>
      </div>

      {/* 2. ALTERNATIVE METHODS (Structured) */}
      <div className="grid md:grid-cols-2 gap-6">
         
         {/* Venmo */}
         <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
               <h4 className="font-bold text-sm flex items-center gap-2 text-[#008CFF]">
                  <PaperAirplaneIcon className="w-4 h-4" /> Venmo
               </h4>
               <input 
                  type="text" 
                  placeholder="@username" 
                  className="input input-sm input-bordered w-full"
                  value={methods.venmo || ""}
                  onChange={(e) => updateMethod('venmo', e.target.value)}
               />
            </div>
         </div>

         {/* CashApp */}
         <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
               <h4 className="font-bold text-sm flex items-center gap-2 text-[#00D632]">
                  <CurrencyDollarIcon className="w-4 h-4" /> CashApp
               </h4>
               <input 
                  type="text" 
                  placeholder="$cashtag" 
                  className="input input-sm input-bordered w-full"
                  value={methods.cashapp || ""}
                  onChange={(e) => updateMethod('cashapp', e.target.value)}
               />
            </div>
         </div>

         {/* Zelle */}
         <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
               <h4 className="font-bold text-sm flex items-center gap-2 text-[#6d1ed4]">
                  <QrCodeIcon className="w-4 h-4" /> Zelle
               </h4>
               <input 
                  type="text" 
                  placeholder="Phone or Email" 
                  className="input input-sm input-bordered w-full"
                  value={methods.zelle || ""}
                  onChange={(e) => updateMethod('zelle', e.target.value)}
               />
            </div>
         </div>

         {/* Bank Wire */}
         <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
               <h4 className="font-bold text-sm flex items-center gap-2 text-base-content">
                  <BuildingLibraryIcon className="w-4 h-4" /> Wire / ACH
               </h4>
               <textarea 
                  placeholder="Bank Name, Routing, Account #" 
                  className="textarea textarea-sm textarea-bordered w-full h-24 font-mono text-xs"
                  value={methods.wire || ""}
                  onChange={(e) => updateMethod('wire', e.target.value)}
               />
            </div>
         </div>
      </div>

      {/* 3. ADDITIONAL INSTRUCTIONS */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
           <h3 className="font-bold text-sm uppercase opacity-70 mb-2">Additional Notes</h3>
           <textarea 
             className="textarea textarea-bordered w-full h-24 text-sm"
             placeholder="e.g. Please include Invoice # in payment notes."
             value={instructions}
             onChange={(e) => setInstructions(e.target.value)}
           />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-base-100/80 backdrop-blur-md border-t border-base-200 flex justify-end gap-4 lg:static lg:bg-transparent lg:border-none lg:p-0 z-20">
         <button className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
         <button 
            onClick={handleSave} 
            disabled={loading}
            className={`btn ${saved ? 'btn-success text-white' : 'btn-primary'} min-w-[140px] shadow-lg`}
         >
            {loading ? <span className="loading loading-spinner loading-xs"></span> : saved ? <><CheckCircleIcon className="w-5 h-5" /> Saved</> : 'Save Changes'}
         </button>
      </div>

    </div>
  );
}