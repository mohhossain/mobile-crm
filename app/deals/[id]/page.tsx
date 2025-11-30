import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import BackButton from '@/app/components/BackButton';
import DealDashboard from '@/app/components/DealDashboard';

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) return <div className="p-4 text-center">Unauthorized.</div>;
  if (!id) return <div className="p-4 text-center">Invalid Deal ID</div>;

  const deal = await prisma.deal.findUnique({
    where: { id, userId: user.id },
    include: {
      tags: true,
      tasks: {
        orderBy: { dueDate: 'asc' },
        include: { deal: true }
      },
      notes: {
        orderBy: { createdAt: 'asc' } 
      },
      contacts: true,
      expenses: {
        orderBy: { date: 'desc' }
      }
    },
  });

  if (!deal) return <div className="text-center p-10">Deal not found.</div>;

  return (
    <div className="p-4">
      <BackButton />
      {/* Spacer for BackButton */}
      <div className="h-8"></div> 
      <DealDashboard deal={deal} />
    </div>
  );
}