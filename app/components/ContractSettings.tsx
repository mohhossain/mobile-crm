"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function ContractSettings({ initialTerms }: { initialTerms?: string | null }) {
  const [terms, setTerms] = useState(initialTerms || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT", // We'll reuse the settings endpoint
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terms }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save terms.");
    } finally {
      setLoading(false);
    }
  };

  const DEFAULT_TERMS = `1. SERVICES. Provider agrees to perform the services defined in the attached Proposal.
2. PAYMENT. Client agrees to pay the Total Amount according to the schedule. A deposit is required to begin work.
3. OWNERSHIP. Provider retains all IP rights until full payment is received.
4. CANCELLATION. Deposit is non-refundable if cancelled within 7 days of project start.`;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
             <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Default Contract Terms</h3>
            <p className="text-xs text-base-content/60">
              This text will appear in the "Contract" tab of your Client Portal.
            </p>
          </div>
        </div>

        <textarea 
          className="textarea textarea-bordered h-64 font-mono text-sm leading-relaxed"
          placeholder="Enter your legal terms here..."
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
        />

        <div className="flex justify-between items-center mt-2">
           <button 
             onClick={() => setTerms(DEFAULT_TERMS)}
             className="btn btn-xs btn-ghost text-base-content/50"
           >
             Load Standard Template
           </button>

           <button 
              onClick={handleSave} 
              disabled={loading}
              className={`btn ${saved ? 'btn-success text-white' : 'btn-primary'} min-w-[140px]`}
           >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : saved ? <><CheckCircleIcon className="w-5 h-5" /> Saved</> : 'Save Terms'}
           </button>
        </div>
      </div>
    </div>
  );
}