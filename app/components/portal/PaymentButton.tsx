"use client";

import { useState } from "react";
import { 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentIcon, 
  CheckIcon, 
  ArrowRightIcon, 
  InformationCircleIcon 
} from "@heroicons/react/24/outline";

interface PaymentButtonProps {
  deal: any;
}

export default function PaymentButton({ deal }: PaymentButtonProps) {
  const [copied, setCopied] = useState<string | null>(null);

  /**
   * 1. CRITICAL GUARD: 
   * The error "Cannot read properties of undefined (reading 'paymentMethods')" 
   * happens if this component renders before the 'deal' data is loaded. 
   * We must return early if deal is missing.
   */
  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-base-100 rounded-3xl border border-dashed border-base-300 opacity-40">
        <span className="loading loading-spinner loading-md mb-2 text-primary"></span>
        <p className="text-xs font-bold uppercase tracking-widest text-center">Loading Payment Info...</p>
      </div>
    );
  }

  /**
   * 2. DATA EXTRACTION WITH SAFETY:
   * Even with the guard above, 'deal.user' might be undefined if the 
   * relation wasn't included in the Prisma query or hasn't hydrated yet. 
   * We use optional chaining (?.) and fallbacks to prevent any runtime crashes.
   */
  const dealMethods = deal?.paymentMethods || {};
  const userMethods = deal?.user?.paymentMethods || {};
  
  // Merge methods: Deal-specific settings override global user settings
  const paymentMethods = { ...userMethods, ...dealMethods };

  const instructions = deal?.paymentInstructions || deal?.user?.paymentInstructions || "";
  const primaryLink = deal?.paymentLink || deal?.user?.defaultPaymentLink;

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info: Amount & Primary CTA */}
      <div className="bg-primary text-primary-content p-6 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
         <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
               <p className="text-xs font-bold uppercase tracking-widest opacity-70 text-white/80">Amount Due</p>
               <h2 className="text-4xl font-black">
                  ${(deal.depositAmount > 0 ? deal.depositAmount : deal.amount).toLocaleString()}
               </h2>
               {deal.depositAmount > 0 && <p className="text-xs mt-1 opacity-70 font-medium text-white/90">Project Deposit required to start</p>}
            </div>
            {primaryLink && (
               <a 
                 href={primaryLink} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="btn btn-secondary w-full sm:w-auto px-8 gap-2 rounded-2xl shadow-lg border-none"
               >
                 Pay Now <ArrowRightIcon className="w-4 h-4" />
               </a>
            )}
         </div>
      </div>

      {/* Grid of Copy-to-Pay Methods (Zelle, CashApp, Venmo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Method: Zelle */}
         {paymentMethods.zelle && (
            <div className="bg-base-100 p-5 rounded-3xl border border-base-200 flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">Z</div>
                  <span className="font-bold">Zelle</span>
               </div>
               <div className="bg-base-50 p-3 rounded-xl flex items-center justify-between border border-base-200">
                  <span className="text-sm font-mono truncate mr-2">{paymentMethods.zelle}</span>
                  <button 
                    onClick={() => handleCopy(paymentMethods.zelle, 'zelle')} 
                    className={`btn btn-xs btn-square ${copied === 'zelle' ? 'btn-success text-white' : 'btn-ghost opacity-40 hover:opacity-100'}`}
                  >
                     {copied === 'zelle' ? <CheckIcon className="w-3 h-3" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
                  </button>
               </div>
            </div>
         )}

         {/* Method: CashApp */}
         {paymentMethods.cashapp && (
            <div className="bg-base-100 p-5 rounded-3xl border border-base-200 flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center font-bold">$</div>
                  <span className="font-bold">CashApp</span>
               </div>
               <div className="bg-base-50 p-3 rounded-xl flex items-center justify-between border border-base-200">
                  <span className="text-sm font-mono truncate mr-2">{paymentMethods.cashapp}</span>
                  <button 
                    onClick={() => handleCopy(paymentMethods.cashapp, 'cashapp')} 
                    className={`btn btn-xs btn-square ${copied === 'cashapp' ? 'btn-success text-white' : 'btn-ghost opacity-40 hover:opacity-100'}`}
                  >
                     {copied === 'cashapp' ? <CheckIcon className="w-3 h-3" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
                  </button>
               </div>
            </div>
         )}

         {/* Method: Venmo */}
         {paymentMethods.venmo && (
            <div className="bg-base-100 p-5 rounded-3xl border border-base-200 flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">V</div>
                  <span className="font-bold">Venmo</span>
               </div>
               <div className="bg-base-50 p-3 rounded-xl flex items-center justify-between border border-base-200">
                  <span className="text-sm font-mono truncate mr-2">{paymentMethods.venmo}</span>
                  <button 
                    onClick={() => handleCopy(paymentMethods.venmo, 'venmo')} 
                    className={`btn btn-xs btn-square ${copied === 'venmo' ? 'btn-success text-white' : 'btn-ghost opacity-40 hover:opacity-100'}`}
                  >
                     {copied === 'venmo' ? <CheckIcon className="w-3 h-3" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
                  </button>
               </div>
            </div>
         )}
      </div>

      {/* Manual Instructions / Wire Info */}
      {instructions && (instructions.trim() !== "") && (
         <div className="bg-base-100 p-6 rounded-3xl border border-base-200 space-y-3 shadow-sm">
            <h4 className="font-bold text-sm flex items-center gap-2 text-base-content/80"><CreditCardIcon className="w-4 h-4" /> Bank Transfer & Other Info</h4>
            <div className="bg-base-50 p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line opacity-80 border border-base-200 font-mono">
               {instructions}
            </div>
         </div>
      )}

      {/* Footer Alert */}
      <div className="alert bg-base-100 border border-base-200 rounded-2xl text-xs py-4 shadow-sm flex items-start gap-3">
         <InformationCircleIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
         <p>Please notify <strong>{deal?.user?.name || 'the provider'}</strong> once payment is sent to expedite your project start.</p>
      </div>

    </div>
  );
}