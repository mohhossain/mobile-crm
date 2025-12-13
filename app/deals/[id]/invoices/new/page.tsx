import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import InvoiceEditor from '@/app/components/InvoiceEditor';
import { notFound } from 'next/navigation';

export default async function NewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div>Please log in</div>;

  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      contacts: {
        include: { company: true }
      },
      lineItems: true
    }
  });

  if (!deal) notFound();

  // FIX: Use 'any' for the map argument to handle potential nulls in relations safely
  const formattedDeal = {
    ...deal,
    contacts: deal.contacts.map((c: any) => ({
      name: c.name,
      email: c.email,
      company: c.company?.name || null
    })),
    // Ensure lineItems is always an array
    lineItems: deal.lineItems || []
  };

  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-80px)]">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <a href={`/deals/${id}`} className="btn btn-sm btn-ghost">
            ← Back
            </a>
            <h1 className="text-xl font-bold">New Invoice</h1>
        </div>
      </div>
      
      {/* FIX: Render the InvoiceEditor instead of the static InvoicePDF */}
      <InvoiceEditor deal={formattedDeal} />
    </div>
  );
}