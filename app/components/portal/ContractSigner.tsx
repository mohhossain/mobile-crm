"use client";

import { useRef, useState, useEffect } from "react";
import SignatureCanvas from 'react-signature-canvas';
import { PencilSquareIcon, TrashIcon, CheckBadgeIcon, UserIcon } from "@heroicons/react/24/outline";

export default function ContractSigner({ deal, onSign }: { deal: any, onSign: (sig: string, name: string) => void }) {
  const sigPad = useRef<any>({});
  const [isEmpty, setIsEmpty] = useState(true);
  const [printedName, setPrintedName] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString());
  }, []);

  const clear = () => {
    sigPad.current.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (!printedName.trim()) return alert("Please type your full name.");
    if (sigPad.current.isEmpty()) return alert("Please sign the contract.");
    onSign(sigPad.current.getTrimmedCanvas().toDataURL('image/png'), printedName);
  };

  const termsContent = deal.customTerms || deal.user.terms || "Standard Terms of Service apply.";

  return (
    <div className="rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 border border-base-200">
       
       {/* DESIGN FIX: 
          Forcing 'bg-white' and 'text-gray-900' ensures high contrast 
          even if the user's system/browser is in Dark Mode. 
       */}
       <div className="bg-white text-gray-900">
           
           {/* Header */}
           <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <PencilSquareIcon className="w-6 h-6 text-primary" /> Service Agreement
                </h2>
                <p className="text-sm text-gray-500 mt-1">Please read carefully before signing.</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-gray-200 rounded text-gray-600">
                  Ref: {deal.id.slice(0,8).toUpperCase()}
              </span>
           </div>

           {/* Terms Text */}
           <div className="p-10 max-h-[400px] overflow-y-auto font-serif text-sm leading-relaxed text-gray-800 text-justify whitespace-pre-wrap shadow-inner bg-white">
              {termsContent}
           </div>

           {/* Signature Zone */}
           <div className="p-10 bg-gray-50 border-t border-gray-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Acceptance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Printed Name Input */}
                  <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Full Legal Name</label>
                      <div className="relative">
                          <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          {/* Force dark text on input */}
                          <input 
                            type="text" 
                            placeholder="Type Name Here" 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-900 placeholder:text-gray-300" 
                            value={printedName}
                            onChange={(e) => setPrintedName(e.target.value)}
                          />
                      </div>
                  </div>

                  {/* Date Display */}
                  <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Date</label>
                      <div className="w-full px-4 py-3 bg-gray-200 border border-transparent rounded-lg text-gray-500 font-mono">
                          {dateStr}
                      </div>
                  </div>
              </div>

              {/* Signature Pad */}
              <div className="mb-2">
                  <div className="flex justify-between items-end mb-2">
                     <label className="text-xs font-bold uppercase text-gray-500">Draw Signature</label>
                     <button onClick={clear} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors">
                        <TrashIcon className="w-3 h-3" /> Clear
                     </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white relative group hover:border-primary/40 transition-colors">
                     {!isEmpty && <div className="absolute top-3 right-3 text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full"><CheckBadgeIcon className="w-3 h-3" /> Signed</div>}
                     <SignatureCanvas 
                        ref={sigPad}
                        penColor="#1f2937" // Dark gray ink
                        onBegin={() => setIsEmpty(false)}
                        canvasProps={{width: 600, height: 200, className: 'w-full h-48 cursor-crosshair'}} 
                     />
                     {isEmpty && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                            <span className="text-4xl font-script text-gray-400">Sign Here</span>
                        </div>
                     )}
                  </div>
              </div>
           </div>
       </div>

       {/* Action Footer (Matches App Theme) */}
       <div className="bg-base-200 p-6 border-t border-base-300">
          <button onClick={save} className="btn btn-primary w-full btn-lg shadow-xl gap-3 text-lg">
             <CheckBadgeIcon className="w-6 h-6" /> Accept & Sign Agreement
          </button>
          <div className="text-center mt-4 text-xs opacity-50 flex flex-col gap-1">
             <p>By clicking accept, you agree to be legally bound by the terms above.</p>
             <p>IP Address and Timestamp will be recorded for security.</p>
          </div>
       </div>

    </div>
  );
}