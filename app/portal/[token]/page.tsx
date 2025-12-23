"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  BoltIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/solid";
import ProposalView from "@/app/components/portal/ProposalView";
import ContractSigner from "@/app/components/portal/ContractSigner";
import PaymentButton from "@/app/components/portal/PaymentButton";

export default function ClientPortal() {
  const { token } = useParams();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // CHANGED: Default tab is now INVOICE (formerly PROPOSAL)
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'CONTRACT' | 'PAYMENT'>('INVOICE');
  
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/public/deals/${token}`);
        if (res.ok) {
          const data = await res.json();
          setDeal(data);
          
          if (data.signedAt) {
             setIsSigned(true);
             // Even if signed, we might want to stay on Invoice/Payment
             // But if payment is pending, maybe Payment tab?
             // User asked to prioritize Invoice view.
             // We'll stick to INVOICE as default unless user action changes it.
             if (data.status === 'WON' || data.invoices.some((i: any) => i.status === 'PAID')) {
                // If fully paid/won, stay on invoice/summary
             } else {
                // If signed but not paid, maybe suggest payment
                setActiveTab('PAYMENT');
             }
          }
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchDeal();
  }, [token]);

  const handleContractSigned = async (signatureData: string) => {
    try {
      const res = await fetch(`/api/public/deals/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureData })
      });
      
      if (res.ok) {
        setIsSigned(true);
        setActiveTab('PAYMENT');
        const updated = await res.json();
        setDeal((prev: any) => ({ ...prev, ...updated.deal }));
      } else {
        alert("Failed to save signature. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving signature.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!deal) return <div className="min-h-screen flex items-center justify-center bg-base-200 text-base-content/50">Project not found or link expired.</div>;

  return (
    <div className="min-h-screen bg-base-200 font-sans pb-32">
      
      {/* HEADER */}
      <div className="bg-base-100 border-b border-base-200 sticky top-0 z-20 backdrop-blur-md bg-base-100/80">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
              {deal.user.avatar ? (
                 <img src={deal.user.avatar} className="w-8 h-8 rounded-full border border-base-200" />
              ) : (
                 <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <BoltIcon className="w-5 h-5" />
                 </div>
              )}
              <span className="font-bold text-sm hidden sm:inline">{deal.user.name}</span>
           </div>
           <div className="badge badge-ghost gap-2">
              {deal.status === 'WON' ? <span className="w-2 h-2 rounded-full bg-success"></span> : <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>}
              {deal.status}
           </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
        
        {/* HERO */}
        <div className="text-center space-y-2">
           <div className="text-xs font-bold uppercase tracking-widest text-base-content/40">Invoice & Project</div>
           <h1 className="text-3xl sm:text-4xl font-black text-base-content leading-tight">{deal.title}</h1>
           <p className="text-base-content/60">Prepared for {deal.company?.name || "Client"}</p>
        </div>

        {/* PROGRESS STEPS */}
        <ul className="steps w-full text-xs opacity-80">
          <li className={`step ${activeTab === 'INVOICE' || isSigned ? 'step-primary' : ''}`}>Invoice</li>
          <li className={`step ${activeTab === 'CONTRACT' || isSigned ? 'step-primary' : ''}`}>Contract</li>
          <li className={`step ${activeTab === 'PAYMENT' ? 'step-primary' : ''}`}>Pay</li>
        </ul>

        {/* CONTENT AREA */}
        <div className="min-h-[400px]">
           {/* Reusing ProposalView but conceptually it's the Invoice/Breakdown */}
           {activeTab === 'INVOICE' && <ProposalView deal={deal} onAccept={() => setActiveTab('CONTRACT')} />}
           
           {activeTab === 'CONTRACT' && (
              isSigned ? (
                 <div className="text-center p-12 bg-base-100 rounded-2xl border border-base-200">
                    <CheckBadgeIcon className="w-16 h-16 text-success mx-auto mb-4" />
                    <h3 className="font-bold text-xl">Contract Signed!</h3>
                    <p className="text-sm opacity-60 mb-6">We are ready to move forward.</p>
                    <button onClick={() => setActiveTab('PAYMENT')} className="btn btn-outline">Go to Payment</button>
                 </div>
              ) : (
                 <ContractSigner deal={deal} onSign={handleContractSigned} />
              )
           )}

           {activeTab === 'PAYMENT' && <PaymentButton deal={deal} />}
        </div>

      </div>
    </div>
  );
}