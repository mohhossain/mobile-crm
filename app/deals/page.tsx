import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import DealCard from '../components/DealCard';
import AddDeals from '../components/AddDeals';
import { FunnelIcon } from '@heroicons/react/24/outline';

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-4 text-center">Please sign in.</div>;

  const { status } = await searchParams;
  
  const where: any = { userId: user.id };
  if (status && status !== 'ALL') {
    where.status = status;
  }

  const dealsRaw = await prisma.deal.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      tags: true,
      contacts: true,
    },
  });

  const deals = dealsRaw.map(deal => ({
    ...deal,
    contacts: deal.contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      imageUrl: contact.imageUrl ?? undefined,
    })),
  }));

  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <div className="p-4 pb-24 max-w-4xl mx-auto space-y-6">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold">Pipeline</h1>
           <p className="text-sm text-gray-500">Total Value: <span className="text-success font-mono font-bold">${totalValue.toLocaleString()}</span></p>
        </div>
        
        {/* Simple Filter */}
        <div className="join">
          <a href="/deals?status=ALL" className={`btn btn-sm join-item ${!status || status === 'ALL' ? 'btn-active' : ''}`}>All</a>
          <a href="/deals?status=PENDING" className={`btn btn-sm join-item ${status === 'PENDING' ? 'btn-active' : ''}`}>Pending</a>
          <a href="/deals?status=WON" className={`btn btn-sm join-item ${status === 'WON' ? 'btn-active' : ''}`}>Won</a>
        </div>
      </div>

      {/* Add Deal Collapsible */}
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input type="checkbox" /> 
        <div className="collapse-title text-primary font-medium flex items-center gap-2">
           + Create New Deal
        </div>
        <div className="collapse-content"> 
           <AddDeals />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deals.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">No deals found matching this filter.</div>}
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}