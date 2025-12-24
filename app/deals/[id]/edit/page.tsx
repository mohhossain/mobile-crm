

import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import EditDealForm from "@/app/components/EditDealForm";



interface PageProps {
  params: Promise<{ id?: string }>;
}

export default async function EditDealPage({ params }: PageProps) {

  // Get the deal ID from the URL parameters using nexturl
 
  const { id: dealId } = await params;

  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;
  if (!dealId) return <div>Invalid deal ID</div>;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId, userId: user.id },
    include: { contacts: true },
  });

  if (!deal) return <div>Deal not found</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Deal</h1>
      <EditDealForm
        dealId={deal.id}
        initialTitle={deal.title}
        initialAmount={deal.amount}
        initialStatus={deal.status}
        initialCloseDate={
          deal.closeDate
            ? new Date(deal.closeDate).toISOString().slice(0, 10)
            : ""
        }
        initialContacts={deal.contacts ? deal.contacts.map((c: { id: any; name: any; email: any; phone: any; }) => ({ id: c.id, name: c.name || "", email: c.email || "", phone: c.phone || "" })) : []}
      />
    </div>
  );
}
