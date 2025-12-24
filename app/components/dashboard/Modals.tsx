"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BanknotesIcon, 
  ExclamationCircleIcon 
} from "@heroicons/react/24/outline";
import AddExpense from "../AddExpense";
import PaymentConfigModal from "./PaymentConfigModal"; // Import the new modal
import ContractPDF from "../portal/ContractPDF";

interface ModalsProps {
  deal: any;
  user: any;
  showExpense: boolean;
  setShowExpense: (v: boolean) => void;
  showPayment: boolean; // Record Payment
  setShowPayment: (v: boolean) => void;
  showPaymentConfig: boolean; // Configure Payment (Deposit/Methods) -> NEW
  setShowPaymentConfig: (v: boolean) => void;
  showContract: boolean;
  setShowContract: (v: boolean) => void;
  showWarning: boolean;
  setShowWarning: (v: boolean) => void;
  onRefresh: () => void;
  onUpdateDeal: (updates: any) => void;
}

export default function Modals({ 
  deal, 
  user,
  showExpense, setShowExpense,
  showPayment, setShowPayment,
  showPaymentConfig, setShowPaymentConfig, // New prop
  showContract, setShowContract,
  showWarning, setShowWarning,
  onRefresh,
  onUpdateDeal
}: ModalsProps) {

  const [paymentAmount, setPaymentAmount] = useState(deal.depositAmount > 0 ? deal.depositAmount : deal.amount);
  const [paymentNote, setPaymentNote] = useState("");

  const confirmPayment = async () => {
    try {
        const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dealId: deal.id,
                amount: paymentAmount,
                status: 'PAID',
                issueDate: new Date(),
                dueDate: new Date(),
                items: [{ name: paymentNote || "Payment Received", price: paymentAmount, quantity: 1 }]
            })
        });

        if (res.ok) {
            if (paymentAmount >= deal.amount) onUpdateDeal({ status: 'WON', stage: 'Won', probability: 100 });
            else onRefresh();
            setShowPayment(false);
            alert("Payment Recorded!");
        }
    } catch (e) { alert("Failed to record."); }
  };

  return (
    <>
      {/* 1. EXPENSE MODAL */}
      {showExpense && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
           <div className="modal-box p-6 bg-base-100">
              <h3 className="font-bold text-lg mb-4">Log Expense</h3>
              <button onClick={() => setShowExpense(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              <AddExpense dealId={deal.id} onSuccess={() => { setShowExpense(false); onRefresh(); }} onCancel={() => setShowExpense(false)} />
           </div>
           <div className="modal-backdrop" onClick={() => setShowExpense(false)}></div>
        </dialog>
      )}

      {/* 2. PAYMENT CONFIG MODAL (NEW) */}
      {showPaymentConfig && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[80]">
           <div className="modal-box p-0 bg-base-100 w-full max-w-2xl">
              <button onClick={() => setShowPaymentConfig(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10">✕</button>
              <PaymentConfigModal 
                deal={deal} 
                user={user} 
                onClose={() => setShowPaymentConfig(false)} 
                onUpdate={onUpdateDeal} 
              />
           </div>
           <div className="modal-backdrop" onClick={() => setShowPaymentConfig(false)}></div>
        </dialog>
      )}

      {/* 3. RECORD PAYMENT MODAL */}
      {showPayment && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[70]">
           <div className="modal-box bg-base-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <BanknotesIcon className="w-5 h-5 text-success" /> Record Payment
              </h3>
              <button onClick={() => setShowPayment(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              
              <div className="space-y-4">
                 <div className="form-control">
                    <label className="label"><span className="label-text font-bold">Amount Received</span></label>
                    <div className="relative">
                       <span className="absolute left-3 top-3 text-base-content/40">$</span>
                       <input 
                          type="number" 
                          className="input input-bordered w-full pl-8 font-mono text-lg" 
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                       />
                    </div>
                 </div>
                 <div className="form-control">
                    <label className="label"><span className="label-text">Note (Optional)</span></label>
                    <input 
                       placeholder="e.g. Deposit via Venmo" 
                       className="input input-bordered w-full"
                       value={paymentNote}
                       onChange={(e) => setPaymentNote(e.target.value)}
                    />
                 </div>
                 <div className="alert alert-info text-xs">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>This will create a PAID invoice and add to your revenue.</span>
                 </div>
                 <div className="modal-action">
                    <button onClick={confirmPayment} className="btn btn-success text-white w-full">Confirm & Record</button>
                 </div>
              </div>
           </div>
           <div className="modal-backdrop" onClick={() => setShowPayment(false)}></div>
        </dialog>
      )}

      {/* 4. CONTRACT VIEW MODAL */}
      {showContract && deal.signature && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[70]">
           <div className="modal-box w-11/12 max-w-2xl bg-base-100">
              <h3 className="font-bold text-lg mb-4">Signed Contract</h3>
              <button onClick={() => setShowContract(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              
              <div className="space-y-4">
                 <div className="p-4 bg-base-50 rounded-lg text-sm border border-base-200 max-h-48 overflow-y-auto">
                    <p className="font-bold mb-2">Terms Agreed:</p>
                    <p className="opacity-80">{user.terms || "Standard Terms: Client agrees to pay the total estimate."}</p>
                 </div>
                 <div className="border border-base-200 rounded-xl p-4 bg-white text-center">
                    <p className="text-xs font-bold uppercase opacity-40 mb-2">Signature</p>
                    <img src={deal.signature} alt="Client Signature" className="max-h-24 mx-auto" />
                 </div>
                 <div className="text-xs text-center opacity-50">
                    Signed on {new Date(deal.signedAt).toLocaleString()}
                 </div>
              </div>
           </div>
           <div className="modal-backdrop" onClick={() => setShowContract(false)}></div>
        </dialog>
      )}

      {showContract && deal.signature && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[70]">
           {/* Render ContractPDF directly - it handles the full screen overlay style */}
           <ContractPDF 
              deal={deal} 
              user={user} 
              onClose={() => setShowContract(false)} 
           />
        </dialog>
      )}

      {/* 5. PAYMENT SETUP WARNING MODAL */}
      {showWarning && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-[80]">
           <div className="modal-box bg-base-100 border-l-4 border-warning">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-warning">
                 <ExclamationCircleIcon className="w-6 h-6" /> Payment Setup Needed
              </h3>
              <p className="text-sm mb-6">
                 You haven't set up any payment methods. The client won't be able to pay you through the portal.
              </p>
              <div className="flex gap-2 justify-end">
                 <button onClick={() => setShowWarning(false)} className="btn btn-ghost">Ignore</button>
                 <Link href="/settings/payments" className="btn btn-warning">Go to Settings</Link>
              </div>
           </div>
           <div className="modal-backdrop" onClick={() => setShowWarning(false)}></div>
        </dialog>
      )}
    </>
  );
}