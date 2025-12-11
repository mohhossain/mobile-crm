import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import InvoicePDF from '@/app/components/InvoicePDF';
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
    }))
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice Preview</h1>
        <a href={`/deals/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Deal
        </a>
      </div>
      
      {/* Render the printable invoice component */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-gray-50 p-4 flex justify-center">
        <InvoicePDF deal={formattedDeal} user={user} />
      </div>
    </div>
  );
}