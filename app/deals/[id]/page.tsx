import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import BackButton from '@/app/components/BackButton';
import DealDashboard from '@/app/components/DealDashboard';

export default async function DealPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  const { tab } = await searchParams; // Grab tab from URL

  if (!user) return <div className="p-4 text-center">Unauthorized.</div>;

  const deal = await prisma.deal.findUnique({
    where: { id, userId: user.id },
    include: {
      tags: true,
      tasks: {
        orderBy: { dueDate: 'asc' },
        include: { deal: true }
      },
      notes: {
        orderBy: { createdAt: 'desc' } 
      },
      contacts: true,
      expenses: {
        orderBy: { date: 'desc' }
      },
      // CRITICAL FIX: Ensure Invoices are fetched
      invoices: {
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!deal) return <div className="text-center p-10">Deal not found.</div>;

  return (
    <div className="p-4">
      <BackButton />
      <div className="h-8"></div> 
      {/* Pass the tab param to set active tab automatically */}
      <DealDashboard deal={deal} initialTab={tab} />
    </div>
  );
}