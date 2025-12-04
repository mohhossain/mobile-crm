"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

// Mock user type if needed, or use any
export default function InvoiceButton({ deal, user }: { deal: any, user: any }) {
  // Only show for WON deals
  if (deal.status !== 'WON') return null;

  return (
    <div className="mt-4">
       <PDFDownloadLink
         document={<InvoicePDF deal={deal} user={user} />}
         fileName={`invoice-${deal.title.replace(/\s+/g, '-').toLowerCase()}.pdf`}
         className="btn btn-primary btn-sm w-full gap-2 shadow-lg shadow-primary/20"
       >
         {/* @ts-ignore - loading state provided by library */}
         {({ blob, url, loading, error }) => (
            loading ? 'Preparing Invoice...' : (
              <>
                <DocumentArrowDownIcon className="w-4 h-4" /> Generate Invoice
              </>
            )
         )}
       </PDFDownloadLink>
       <p className="text-xs text-center mt-2 text-base-content/40">
         Ready to bill? Create a professional PDF instantly.
       </p>
    </div>
  );
}