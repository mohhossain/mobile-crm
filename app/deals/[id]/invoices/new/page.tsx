import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import BackButton from "@/app/components/BackButton";
import InvoiceEditor from "@/app/components/InvoiceEditor";

export default async function NewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) return <div>Unauthorized</div>;

  // Fetch deal with line items and contacts to pre-fill the invoice
  const deal = await prisma.deal.findUnique({
    where: { id, userId: user.id },
    include: {
      lineItems: true,
      contacts: {
        select: { name: true, email: true, company: { select: { name: true } } }
      }
    }
  });

  if (!deal) return <div>Deal not found</div>;

  // Flatten contact company for the editor
  const formattedDeal = {
    ...deal,
    contacts: deal.contacts.map((c: { name: any; email: any; company: { name: any; }; }) => ({
      name: c.name,
      email: c.email,
      company: c.company?.name || null
    }))
  };

  return (
    <div className="p-4 pb-24">
      <BackButton />
      <div className="h-8"></div>
      <InvoiceEditor deal={formattedDeal} />
    </div>
  );
}