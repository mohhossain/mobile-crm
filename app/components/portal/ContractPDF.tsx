"use client";

import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface ContractPDFProps {
  deal: any;
  user: any; 
  onClose: () => void;
}

export default function ContractPDF({ deal, user, onClose }: ContractPDFProps) {
  const clientName = deal.signedName || deal.contacts?.[0]?.name || "Client";
  const signedDate = deal.signedAt 
    ? new Date(deal.signedAt).toLocaleDateString() 
    : "Pending";
  const providerDate = deal.createdAt 
    ? new Date(deal.createdAt).toLocaleDateString() 
    : new Date().toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-base-100/90 backdrop-blur-sm overflow-y-auto">
      {/* PRINT FIX EXPLAINED:
         1. 'position: absolute' on #printable-contract pulls it out of the fixed modal flow.
         2. 'body * { visibility: hidden }' hides the app UI.
         3. 'height: auto' ensures the browser calculates the full document length.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 15mm; size: auto; }
          html, body { 
            height: auto !important; 
            overflow: visible !important; 
            background: white !important;
          }
          body * { visibility: hidden; }
          
          #printable-contract, #printable-contract * { 
            visibility: visible; 
          }
          
          #printable-contract {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 9999;
          }
          
          /* Hide non-print elements */
          .print\\:hidden { display: none !important; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}} />

      <div className="fixed top-4 right-4 z-[110] print:hidden">
        <button onClick={onClose} className="btn btn-circle btn-neutral shadow-lg">
            <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex justify-center min-h-screen py-10 print:py-0">
        <div id="printable-contract" className="w-full max-w-[210mm] bg-white p-10 md:p-16 text-gray-900 shadow-2xl print:shadow-none border border-gray-200 print:border-none">
            
            {/* Controls */}
            <div className="print:hidden mb-12 flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">This is a preview. Click download to save.</p>
                <button onClick={handlePrint} className="btn btn-primary btn-sm gap-2">
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download PDF
                </button>
            </div>

            {/* Header */}
            <div className="text-center mb-12 border-b-2 border-gray-900 pb-6">
                <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Service Agreement</h1>
                <p className="text-sm text-gray-500 font-mono">Reference: {deal.id?.slice(0,8).toUpperCase()}</p>
            </div>

            {/* Parties Block */}
            <div className="bg-gray-50 p-6 rounded-lg mb-12 border border-gray-100 print:bg-transparent print:border-gray-200">
                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <h3 className="font-bold text-gray-400 uppercase text-xs mb-2 tracking-wider">Service Provider</h3>
                        <p className="font-bold text-lg text-gray-900">{user.name || "Provider Name"}</p>
                        <p className="text-gray-600">{user.email || ""}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-gray-400 uppercase text-xs mb-2 tracking-wider">Client</h3>
                        <p className="font-bold text-lg text-gray-900">{clientName}</p>
                        {deal.contacts?.[0]?.company && <p className="text-gray-600 font-medium">{deal.contacts[0].company}</p>}
                        <p className="text-gray-600">{deal.contacts?.[0]?.email || ""}</p>
                    </div>
                </div>
            </div>

            {/* Terms Content */}
            <div className="prose max-w-none text-sm leading-relaxed text-justify mb-20 whitespace-pre-wrap font-serif text-gray-700">
                {deal.customTerms || user.terms || "Standard Terms of Service apply to this agreement."}
            </div>

            {/* Signatures Section */}
            <div className="mt-auto pt-8 border-t-2 border-gray-100 break-inside-avoid">
                <div className="grid grid-cols-2 gap-16 items-end">
                    
                    {/* Provider (Left) */}
                    <div>
                        <div className="h-24 mb-2 flex flex-col justify-end">
                            <span className="font-script text-3xl text-gray-800 italic transform -rotate-2 origin-bottom-left">
                                {user.name}
                            </span>
                        </div>
                        <div className="border-t border-gray-400 pt-3">
                            <p className="font-bold text-sm text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Service Provider</p>
                            <p className="text-xs text-gray-400 mt-1">Date: {providerDate}</p>
                        </div>
                    </div>

                    {/* Client (Right) */}
                    <div>
                        <div className="h-24 mb-2 relative flex flex-col justify-end">
                            {deal.signature ? (
                                <img 
                                    src={deal.signature} 
                                    alt="Client Signature" 
                                    className="h-20 object-contain object-left-bottom"
                                />
                            ) : (
                                <div className="h-full flex items-center text-red-400 text-xs italic">Pending Signature</div>
                            )}
                        </div>
                        <div className="border-t border-gray-400 pt-3">
                            <p className="font-bold text-sm text-gray-900">{deal.signedName || clientName}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Client / Authorized Rep</p>
                            <p className="text-xs text-gray-400 mt-1">Date: {signedDate}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
}