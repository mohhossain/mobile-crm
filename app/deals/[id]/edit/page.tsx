import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import EditDealForm from "@/app/components/EditDealForm";

interface EditPageProps {
  params: { id: string };
}

export default async function EditDealPage({ params }: EditPageProps) {
  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  const deal = await prisma.deal.findUnique({
    where: { id: params.id, userId: user.id },
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
        initialContacts={
          (deal.contacts ?? []).map(contact => ({
            ...contact,
            email: contact.email ?? ""
          }))
        }
      />
    </div>
  );
}
