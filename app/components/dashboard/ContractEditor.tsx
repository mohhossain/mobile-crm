"use client";

import { useState } from "react";
import { 
  DocumentTextIcon, 
  CheckIcon, 
  ChevronDownIcon, 
  ArrowPathIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";

interface ContractEditorProps {
  dealId: string;
  initialTerms: string | null;
  defaultTerms: string | null;
  isSigned: boolean; // <--- New Prop
  onUpdate: () => void;
}

export default function ContractEditor({ dealId, initialTerms, defaultTerms, isSigned, onUpdate }: ContractEditorProps) {
  const [terms, setTerms] = useState(initialTerms || defaultTerms || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTerms: terms }) 
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onUpdate();
        setIsOpen(false); 
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleReset = () => {
    if(confirm("Reset to your global default terms?")) {
      setTerms(defaultTerms || "");
    }
  };

  return (
    <div className={`card bg-base-100 shadow-sm border ${isSigned ? 'border-success/20' : 'border-base-200'} overflow-visible`}>
      {/* Collapsible Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-base-50 transition-colors rounded-xl select-none"
      >
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg ${isSigned ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/70'}`}>
             {isSigned ? <LockClosedIcon className="w-5 h-5" /> : <DocumentTextIcon className="w-5 h-5" />}
           </div>
           <div>
             <h3 className="font-bold text-sm">Contract Terms</h3>
             <p className="text-xs text-base-content/50">
               {isSigned ? "Signed & Locked" : (initialTerms ? "Custom terms applied" : "Using default terms")}
             </p>
           </div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Editor Content */}
      {isOpen && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2">
          <div className="divider my-0 mb-4"></div>
          
          <div className="relative">
            <textarea 
              className={`textarea textarea-bordered w-full h-64 text-sm font-mono leading-relaxed p-4 ${isSigned ? 'bg-base-100 text-base-content/70 border-none resize-none focus:outline-none' : ''}`}
              placeholder="Enter contract terms..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              disabled={isSigned} // <--- Disable input
            />
            
            {/* Show Reset button only if NOT signed */}
            {!isSigned && (
              <button 
                onClick={handleReset}
                className="absolute top-2 right-2 btn btn-xs btn-ghost text-xs opacity-50 hover:opacity-100"
                title="Reset to Default"
              >
                <ArrowPathIcon className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Footer Actions - Hide if Signed */}
          {!isSigned ? (
            <div className="flex justify-between items-center mt-3">
               <span className="text-xs text-base-content/40">
                 Changes here only affect this specific deal.
               </span>
               <button 
                 onClick={handleSave} 
                 disabled={loading}
                 className={`btn btn-sm ${saved ? 'btn-success text-white' : 'btn-primary'} gap-2`}
               >
                 {loading ? <span className="loading loading-spinner loading-xs"></span> : saved ? <><CheckIcon className="w-4 h-4" /> Saved</> : "Save Terms"}
               </button>
            </div>
          ) : (
            <div className="mt-2 p-3 bg-base-200/50 rounded-lg text-center text-xs text-base-content/60 italic">
                This contract has been signed and cannot be edited.
            </div>
          )}
        </div>
      )}
    </div>
  );
}