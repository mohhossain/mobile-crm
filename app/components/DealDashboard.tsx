"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share } from '@capacitor/share'; 
import { 
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Sub-components
import DealHeader from "./dashboard/DealHeader";
import OverviewTab from "./dashboard/OverviewTab";
import Modals from "./dashboard/Modals";

// Tab Views
import DealNotes from './DealNotes';
import DealFinances from './DealFinances';
import DealInvoices from './DealInvoices';
import JobSheet from "./JobSheet";

interface DashboardProps {
  deal: any;
  initialTab?: string;
  user?: any;
}

export default function DealDashboard({ deal: initialDeal, initialTab, user }: DashboardProps) {
  const [deal, setDeal] = useState(initialDeal);
  const router = useRouter();
  
  // Tab State
  const validTabs = ['overview', 'jobsheet', 'notes', 'finances', 'invoices'];
  const startTab = (initialTab && validTabs.includes(initialTab)) ? initialTab : 'overview';
  const [activeTab, setActiveTab] = useState<any>(startTab);

  // Modal States
  const [showExpense, setShowExpense] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentConfig, setShowPaymentConfig] = useState(false); 
  const [showContract, setShowContract] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => { setDeal(initialDeal); }, [initialDeal]);

  // Data Refreshers
  const refreshDeal = async () => {
    router.refresh();
    const res = await fetch(`/api/deals/${deal.id}`);
    if(res.ok) setDeal(await res.json());
  };

  const updateDeal = async (updates: any) => {
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) refreshDeal();
    } catch (e) { console.error(e); }
  };

  // --- SMART SHARE LOGIC ---
  const handleSmartShare = async () => {
    // 1. Generate Token if missing
    let currentToken = deal.shareToken;
    if (!currentToken) {
       const newToken = crypto.randomUUID();
       await updateDeal({ shareToken: newToken });
       currentToken = newToken;
    }

    // 2. Check for Payment/Terms Readiness
    const hasPayment = 
        user?.defaultPaymentLink ||
        user?.paymentInstructions || 
        (user?.paymentMethods && Object.keys(user.paymentMethods).length > 0) || 
        deal.paymentLink || 
        deal.paymentInstructions ||
        (deal.paymentMethods && Object.keys(deal.paymentMethods).length > 0);

    if (!hasPayment) {
       setShowWarning(true);
       return;
    }

    // 3. Construct the Message
    // IMPORTANT: Ensure NEXT_PUBLIC_APP_URL is set in .env for production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const link = `${baseUrl}/portal/${currentToken}`;
    const message = `Hi! Here is the proposal for ${deal.title}. Please review and sign here: ${link}`;

    // 4. Attempt Native Share (Wrapped in try/catch for Android robustness)
    try {
        await Share.share({
            title: `Proposal: ${deal.title}`,
            text: message,
            url: link,
            dialogTitle: 'Send Proposal'
        });
    } catch (e) {
        console.warn("Native share failed or dismissed, falling back to clipboard", e);
        
        // 5. Fallback: Copy to Clipboard (Desktop or if Share fails)
        if (navigator.clipboard && window.isSecureContext) {
             navigator.clipboard.writeText(link)
                .then(() => alert("Link copied to clipboard! You can paste it into a message."))
                .catch(() => prompt("Copy this link:", link));
        } else {
             prompt("Copy this link:", link);
        }
    }
  };

  const handleGenerateLink = async () => {
      const newToken = crypto.randomUUID();
      await updateDeal({ shareToken: newToken });
      setTimeout(() => alert("New Magic Link Generated"), 500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-32">
      
      {/* 1. Header Section */}
      <DealHeader deal={deal} onUpdate={updateDeal} onRefresh={refreshDeal} />

      {/* 2. Navigation Tabs (Sticky) */}
      <div className="sticky top-16 z-30 bg-base-100/80 backdrop-blur-md p-1 rounded-xl flex gap-1 overflow-x-auto no-scrollbar shadow-sm border border-base-200">
        {[
          { id: 'overview', label: 'Overview', icon: UserGroupIcon },
          { id: 'jobsheet', label: 'Job Sheet', icon: ClipboardDocumentCheckIcon, count: deal.tasks?.length },
          { id: 'finances', label: 'Finances', icon: BanknotesIcon },
          { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon, count: deal.invoices?.length },
          { id: 'notes', label: 'Notes', icon: ChatBubbleLeftRightIcon },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`flex-1 btn btn-sm whitespace-nowrap ${activeTab === tab.id ? 'btn-neutral' : 'btn-ghost'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
            {tab.count ? <span className="badge badge-xs badge-ghost ml-1">{tab.count}</span> : null}
          </button>
        ))}
      </div>

      {/* 3. Main Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <OverviewTab 
            deal={deal}
            user={user}
            onUpdate={updateDeal}
            onRefresh={refreshDeal}
            onOpenPayment={() => setShowPayment(true)}
            onOpenExpense={() => setShowExpense(true)}
            onOpenPaymentConfig={() => setShowPaymentConfig(true)}
            onViewContract={() => setShowContract(true)}
            onSendProposal={handleSmartShare}
            onGenerateLink={handleGenerateLink}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'jobsheet' && (
           <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 animate-in fade-in slide-in-from-right-4 duration-300">
              <JobSheet dealId={deal.id} roadmap={deal.roadmap || []} tasks={deal.tasks || []} onUpdate={refreshDeal} />
           </div>
        )}
        
        {activeTab === 'finances' && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-200">
              <DealFinances dealId={deal.id} dealAmount={deal.amount} expenses={deal.expenses || []} />
           </div>
        )}
        
        {activeTab === 'invoices' && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-200">
              <DealInvoices deal={deal} user={user} />
           </div>
        )}
        
        {activeTab === 'notes' && (
           <div className="min-h-[500px] animate-in fade-in zoom-in duration-200">
              <DealNotes dealId={deal.id} initialNotes={deal.notes || []} />
           </div>
        )}
      </div>

      {/* 4. Global Modals */}
      <Modals 
         deal={deal}
         user={user}
         showExpense={showExpense} setShowExpense={setShowExpense}
         showPayment={showPayment} setShowPayment={setShowPayment}
         showPaymentConfig={showPaymentConfig} setShowPaymentConfig={setShowPaymentConfig}
         showContract={showContract} setShowContract={setShowContract}
         showWarning={showWarning} setShowWarning={setShowWarning}
         onRefresh={refreshDeal}
         onUpdateDeal={updateDeal}
      />

    </div>
  );
}