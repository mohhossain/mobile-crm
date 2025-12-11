import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientPortalView from "@/app/components/ClientPortalView";

export const dynamic = 'force-dynamic';

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const deal = await prisma.deal.findUnique({
    where: { shareToken: token },
    include: {
      user: {
        select: { name: true, email: true, avatar: true, website: true }
      },
      contacts: true,
      lineItems: true,
      // FIX: Include Invoices for the client to see
      invoices: {
        where: { status: { not: 'DRAFT' } }, // Only show SENT/PAID/OVERDUE invoices
        orderBy: { issueDate: 'desc' }
      },
      tasks: {
        // Only show public tasks (if you implemented isPublic), or all for now
        orderBy: { dueDate: 'asc' }
      }
    }
  });

  if (!deal) return notFound();

  // Increment View Counter
  await prisma.deal.update({
    where: { id: deal.id },
    data: { portalViews: { increment: 1 } }
  });

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-12 px-4 sm:px-6">
      <ClientPortalView deal={deal} owner={deal.user} />
      
      <div className="mt-12 text-center opacity-30 text-xs font-bold tracking-widest">
        POWERED BY PULSE
      </div>
    </div>
  );
}