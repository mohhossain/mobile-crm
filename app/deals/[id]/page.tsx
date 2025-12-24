import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import DealDashboard from "@/app/components/DealDashboard";

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-10">Please log in.</div>;

  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { 
      id,
      userId: user.id 
    },
    include: {
      tags: true,
      contacts: true,
      // FIX: THIS WAS MISSING
      lineItems: true, 
      notes: { 
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      },
      expenses: {
        orderBy: { date: 'desc' }
      },
      invoices: {
        orderBy: { createdAt: 'desc' }
      },
      tasks: {
        orderBy: { dueDate: 'asc' },
        include: { deal: true }
      }
    }
  });

  if (!deal) return notFound();

  return <DealDashboard deal={deal} user={user} />;
}