"use client";

import { useEffect } from "react";

interface InvoiceProps {
  deal: any;
  user: any;
}

export default function InvoicePDF({ deal, user }: InvoiceProps) {
  // Safety check
  if (!deal || !user) {
    return <div className="p-4 text-red-500">Error: Missing invoice data.</div>;
  }

  const contact = deal.contacts?.[0] || {};
  
  // 1. Use the specific invoice number if passed, otherwise fallback to deal id
  const invoiceNumber = deal.invoiceNumber || deal.id?.slice(0, 8).toUpperCase() || '0000';

  // 2. Use specific dates from the invoice if available
  const invoiceDate = deal.issueDate 
    ? new Date(deal.issueDate).toLocaleDateString() 
    : new Date().toLocaleDateString();

  const dueDateString = deal.dueDate
    ? new Date(deal.dueDate).toLocaleDateString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  // Ensure line items exist
  const items = deal.lineItems && deal.lineItems.length > 0 ? deal.lineItems : [
    { 
      name: deal.title || 'Service', 
      description: deal.description || '', 
      quantity: 1, 
      price: deal.amount || 0
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice {
            position: absolute;
            left: 0; top: 0; width: 100%;
            margin: 0; padding: 0;
            background: white;
            box-shadow: none;
          }
          .print\\:hidden { display: none !important; }
        }
      `}} />

      <div id="printable-invoice" className="w-full max-w-[210mm] mx-auto bg-white p-10 md:p-12 text-gray-900 font-sans shadow-lg my-8 print:shadow-none print:m-0 print:w-full print:max-w-none border border-gray-100">
        
        {/* Print Controls */}
        <div className="print:hidden mb-8 flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            To save as PDF, click the button and select <strong>"Save as PDF"</strong> as the destination.
          </p>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-sm flex items-center transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download / Print
          </button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-gray-900 uppercase mb-2">Invoice</h1>
            <p className="text-sm text-gray-500 font-mono">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">{user.name || 'Your Company'}</h2>
            <p className="text-sm text-gray-500">{user.email || 'email@example.com'}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex justify-between mb-12">
          {/* Bill To */}
          <div className="w-5/12">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Bill To</h3>
            <p className="text-lg font-bold text-gray-900">{contact.name || "Valued Client"}</p>
            {contact.company && <p className="text-gray-700">{contact.company}</p>}
            <p className="text-gray-600 text-sm mt-1">{contact.email}</p>
          </div>

          {/* Details */}
          <div className="w-5/12">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Details</h3>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-sm text-gray-600">Date Issued:</span>
              <span className="text-sm font-medium">{invoiceDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-sm text-gray-600">Due Date:</span>
              <span className="text-sm font-medium">{dueDateString}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <div className="flex bg-gray-50 rounded-t border-b border-gray-200 py-2 px-4">
            <div className="w-1/2 text-xs font-bold text-gray-500 uppercase">Description</div>
            <div className="w-1/6 text-xs font-bold text-gray-500 uppercase text-center">Qty</div>
            <div className="w-1/6 text-xs font-bold text-gray-500 uppercase text-right">Price</div>
            <div className="w-1/6 text-xs font-bold text-gray-500 uppercase text-right">Total</div>
          </div>

          {items.map((item: any, i: number) => (
            <div key={i} className="flex border-b border-gray-100 py-4 px-4 items-start">
              <div className="w-1/2 pr-4">
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 italic whitespace-pre-wrap">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="w-1/6 text-sm text-gray-700 text-center pt-1">
                {item.quantity}
              </div>
              <div className="w-1/6 text-sm text-gray-700 text-right pt-1">
                ${Number(item.price).toLocaleString()}
              </div>
              <div className="w-1/6 text-sm font-medium text-gray-900 text-right pt-1">
                ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-1/2 lg:w-5/12">
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-gray-600">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">${deal.amount?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
              <span className="text-base font-bold text-gray-900">Total Due</span>
              <span className="text-xl font-bold text-blue-600">${deal.amount?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Thank you for your business.</p>
          <p className="text-xs text-gray-400 mt-1">Generated by Pulse</p>
        </div>

      </div>
    </>
  );
}