"use client";

import { useState } from "react";
import { 
  BanknotesIcon, 
  LinkIcon, 
  BuildingLibraryIcon,
  PaperAirplaneIcon,
  QrCodeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface PaymentMethods {
  zelle?: string;
  venmo?: string;
  cashapp?: string;
  wire?: string;
}

interface PaymentConfigModalProps {
  deal: any;
  user: any;
  onClose: () => void;
  onUpdate: (updates: any) => void;
}

export default function PaymentConfigModal({ deal, user, onClose, onUpdate }: PaymentConfigModalProps) {
  // 1. DEPOSIT STATE
  const [hasDeposit, setHasDeposit] = useState((deal.depositAmount || 0) > 0);
  const [depositAmount, setDepositAmount] = useState<string>(deal.depositAmount?.toString() || "0");

  // 2. PAYMENT METHODS STATE
  // Merge user defaults with deal overrides
  const initialMethods = (deal.paymentMethods || user.paymentMethods || {}) as PaymentMethods;
  
  // Toggles for UI Cleanliness
  const [showZelle, setShowZelle] = useState(!!initialMethods.zelle);
  const [showVenmo, setShowVenmo] = useState(!!initialMethods.venmo);
  const [showCashApp, setShowCashApp] = useState(!!initialMethods.cashapp);
  const [showWire, setShowWire] = useState(!!initialMethods.wire);

  // Values
  const [methods, setMethods] = useState<PaymentMethods>(initialMethods);
  const [link, setLink] = useState(deal.paymentLink || user.defaultPaymentLink || "");
  const [instructions, setInstructions] = useState(deal.paymentInstructions || user.paymentInstructions || "");

  const updateMethod = (key: keyof PaymentMethods, value: string) => {
    setMethods(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const amount = hasDeposit ? parseFloat(depositAmount) : 0;
    
    // Clean up empty methods based on toggles
    const finalMethods: PaymentMethods = {};
    if (showZelle) finalMethods.zelle = methods.zelle;
    if (showVenmo) finalMethods.venmo = methods.venmo;
    if (showCashApp) finalMethods.cashapp = methods.cashapp;
    if (showWire) finalMethods.wire = methods.wire;

    const updates = {
      depositAmount: isNaN(amount) ? 0 : amount,
      paymentLink: link,
      paymentInstructions: instructions,
      paymentMethods: finalMethods
    };

    onUpdate(updates);
    onClose();
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-base-100 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="flex-none p-5 border-b border-base-200 flex justify-between items-center bg-base-50/50">
         <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
               <BanknotesIcon className="w-5 h-5 text-primary" /> Setup Payment
            </h3>
            <p className="text-xs text-base-content/60">Configure how this client pays you.</p>
         </div>
         <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost"><XMarkIcon className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
         
         {/* 1. DEPOSIT SECTION */}
         <section className="space-y-4">
            <div className="flex justify-between items-center">
               <div>
                  <h4 className="font-bold text-sm">Require Deposit?</h4>
                  <p className="text-xs text-base-content/60">Client pays this first to secure the booking.</p>
               </div>
               <input 
                 type="checkbox" 
                 className="toggle toggle-primary" 
                 checked={hasDeposit} 
                 onChange={(e) => setHasDeposit(e.target.checked)} 
               />
            </div>

            {hasDeposit && (
               <div className="animate-in fade-in slide-in-from-top-2">
                  <div className="join w-full">
                     <div className="join-item bg-base-200 flex items-center px-4 border border-base-300 font-bold text-base-content/60">$</div>
                     <input 
                        type="number" 
                        className="input input-bordered join-item w-full font-mono font-bold text-lg"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                     />
                  </div>
                  <div className="text-xs text-right mt-1 opacity-50">
                     Remaining Balance: ${(deal.amount - (parseFloat(depositAmount) || 0)).toLocaleString()}
                  </div>
               </div>
            )}
         </section>

         <div className="divider my-0"></div>

         {/* 2. PAYMENT METHODS (Toggle List) */}
         <section className="space-y-4">
            <h4 className="font-bold text-sm mb-2">Accepted Methods</h4>
            
            {/* Primary Link */}
            <div className="form-control">
               <label className="label cursor-pointer justify-start gap-3">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  <span className="label-text font-medium flex-1">Primary Payment Link (Stripe/Card)</span>
               </label>
               <input 
                  className="input input-sm input-bordered w-full mt-1" 
                  placeholder="https://buy.stripe.com/..." 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
               />
            </div>

            {/* Venmo */}
            <div className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-xl">
               <input type="checkbox" checked={showVenmo} onChange={(e) => setShowVenmo(e.target.checked)} /> 
               <div className="collapse-title font-medium text-sm flex items-center gap-3">
                  <PaperAirplaneIcon className="w-4 h-4 text-[#008CFF]" /> Venmo
               </div>
               <div className="collapse-content">
                  <input 
                     className="input input-sm input-bordered w-full" 
                     placeholder="@username" 
                     value={methods.venmo || ""} 
                     onChange={(e) => updateMethod('venmo', e.target.value)} 
                  />
               </div>
            </div>

            {/* Zelle */}
            <div className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-xl">
               <input type="checkbox" checked={showZelle} onChange={(e) => setShowZelle(e.target.checked)} /> 
               <div className="collapse-title font-medium text-sm flex items-center gap-3">
                  <QrCodeIcon className="w-4 h-4 text-[#6d1ed4]" /> Zelle
               </div>
               <div className="collapse-content">
                  <input 
                     className="input input-sm input-bordered w-full" 
                     placeholder="Phone or Email" 
                     value={methods.zelle || ""} 
                     onChange={(e) => updateMethod('zelle', e.target.value)} 
                  />
               </div>
            </div>

            {/* CashApp */}
            <div className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-xl">
               <input type="checkbox" checked={showCashApp} onChange={(e) => setShowCashApp(e.target.checked)} /> 
               <div className="collapse-title font-medium text-sm flex items-center gap-3">
                  <CurrencyDollarIcon className="w-4 h-4 text-[#00D632]" /> CashApp
               </div>
               <div className="collapse-content">
                  <input 
                     className="input input-sm input-bordered w-full" 
                     placeholder="$cashtag" 
                     value={methods.cashapp || ""} 
                     onChange={(e) => updateMethod('cashapp', e.target.value)} 
                  />
               </div>
            </div>

            {/* Bank Wire / Manual */}
            <div className="collapse collapse-arrow border border-base-200 bg-base-100 rounded-xl">
               <input type="checkbox" checked={showWire} onChange={(e) => setShowWire(e.target.checked)} /> 
               <div className="collapse-title font-medium text-sm flex items-center gap-3">
                  <BuildingLibraryIcon className="w-4 h-4" /> Bank Wire / Manual Info
               </div>
               <div className="collapse-content">
                  <textarea 
                     className="textarea textarea-sm textarea-bordered w-full h-24" 
                     placeholder="Bank Name, Routing, Account..." 
                     value={instructions}
                     onChange={(e) => setInstructions(e.target.value)} 
                  />
               </div>
            </div>

         </section>
      </div>

      <div className="flex-none p-5 border-t border-base-200 bg-base-50/50 flex justify-end gap-2">
         <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
         <button onClick={handleSave} className="btn btn-primary btn-sm px-6">Save Changes</button>
      </div>
    </div>
  );
}