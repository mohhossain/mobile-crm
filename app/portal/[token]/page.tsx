import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientPortalView from "@/app/components/ClientPortalView";

// Force dynamic rendering to ensure up-to-date status
export const dynamic = 'force-dynamic';

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Find Deal by Share Token
  const deal = await prisma.deal.findUnique({
    where: { shareToken: token },
    include: {
      user: {
        select: { name: true, email: true, avatar: true, website: true }
      },
      contacts: true,
      lineItems: true,
      // Only fetch tasks that are relevant (e.g. not private notes disguised as tasks)
      // For v1.3, we show all tasks, or you can filter by isPublic if you implement that toggle later
      tasks: {
        orderBy: { dueDate: 'asc' }
      }
    }
  });

  if (!deal) return notFound();

  // 2. Increment View Counter (Simple Analytics)
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