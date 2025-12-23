"use client";

import { useRef, useState } from "react";
import SignatureCanvas from 'react-signature-canvas'; // Ensure this is installed
import { PencilSquareIcon, TrashIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function ContractSigner({ deal, onSign }: { deal: any, onSign: (sig: string) => void }) {
  const sigPad = useRef<any>({});
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigPad.current.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (sigPad.current.isEmpty()) return alert("Please sign the contract first.");
    const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    onSign(signatureData);
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
       
       <div className="p-6 border-b border-base-200 bg-base-50/50">
          <h2 className="font-bold text-lg flex items-center gap-2">
             <PencilSquareIcon className="w-5 h-5 text-primary" /> Service Agreement
          </h2>
       </div>

       {/* Terms Text */}
       <div className="p-6 max-h-[300px] overflow-y-auto bg-base-50 text-sm leading-relaxed border-b border-base-200 font-serif text-base-content/80">
          {deal.user.terms ? (
             <p className="whitespace-pre-wrap">{deal.user.terms}</p>
          ) : (
             <div className="opacity-50 italic">
                <p><strong>Standard Terms of Service</strong></p>
                <p className="mt-2">1. The Client agrees to pay the Total Estimate defined in the proposal.</p>
                <p>2. A deposit may be required to secure the booking.</p>
                <p>3. All intellectual property rights remain with the Creator until full payment is received.</p>
             </div>
          )}
       </div>
       
       {/* Signature Area */}
       <div className="p-6 space-y-4">
          <div className="flex justify-between items-end">
             <p className="text-xs font-bold uppercase opacity-50 tracking-wider">Sign Below</p>
             <button onClick={clear} className="btn btn-xs btn-ghost text-error gap-1 hover:bg-error/10">
                <TrashIcon className="w-3 h-3" /> Clear
             </button>
          </div>
          
          <div className="border-2 border-dashed border-base-300 rounded-xl overflow-hidden bg-white hover:border-primary/50 transition-colors cursor-crosshair relative">
             {!isEmpty && <div className="absolute top-2 right-2 text-xs text-success font-bold flex items-center gap-1"><CheckBadgeIcon className="w-3 h-3" /> Signed</div>}
             <SignatureCanvas 
                ref={sigPad}
                penColor="black"
                onBegin={() => setIsEmpty(false)}
                canvasProps={{width: 600, height: 200, className: 'w-full h-48'}} 
             />
          </div>

          <div className="pt-2">
             <button onClick={save} className="btn btn-primary w-full btn-lg shadow-xl gap-2">
                Accept & Sign Contract
             </button>
             <p className="text-center text-[10px] text-base-content/40 mt-3">
                By clicking accept, you agree to the terms above. IP Address and Timestamp will be recorded.
             </p>
          </div>
       </div>
    </div>
  );
}