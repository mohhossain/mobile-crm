import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import DealCard from '../components/DealCard';
import AddDeals from '../components/AddDeals';
import Link from 'next/link';
import { 
  FunnelIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-10 text-center">Please sign in.</div>;

  const { status = 'ALL', q } = await searchParams;
  
  // 1. Fetch Data with Search & Filter
  const where: any = { userId: user.id };
  
  // FIX: Validate status against DB Enum before querying
  const VALID_STATUSES = ['PENDING', 'WON', 'LOST', 'CANCELLED', 'NEGOTIATION'];
  
  if (status !== 'ALL' && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  if (q) {
    where.title = { contains: q, mode: 'insensitive' };
  }

  const deals = await prisma.deal.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      tags: true,
      contacts: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  });

  // 2. Calculate Aggregate Stats (Always over ALL deals for context)
  const allDeals = await prisma.deal.findMany({
    where: { userId: user.id },
    select: { amount: true, status: true }
  });

  const totalPipeline = allDeals.reduce((sum, d) => d.status !== 'LOST' ? sum + d.amount : sum, 0);
  const weightedPipeline = allDeals.reduce((sum, d) => {
     if (d.status === 'LOST') return sum;
     const prob = d.status === 'WON' ? 100 : 50;
     return sum + (d.amount * (prob / 100));
  }, 0);

  // Calculate Distribution for Visual Bar
  // FIX: Removed 'OPEN' since it is not in the schema
  const dist = {
    NEGOTIATION: allDeals.filter(d => d.status === 'NEGOTIATION').reduce((s, d) => s + d.amount, 0),
    PENDING: allDeals.filter(d => d.status === 'PENDING').reduce((s, d) => s + d.amount, 0),
    WON: allDeals.filter(d => d.status === 'WON').reduce((s, d) => s + d.amount, 0),
  };
  const maxVal = totalPipeline || 1;

  // 3. Helper for Tab Styles
  const getTabClass = (tabStatus: string) => {
    const isActive = status === tabStatus;
    return `tab ${isActive ? 'tab-active font-bold border-b-2 border-primary' : 'text-base-content/60'}`;
  };

  return (
    <div className="space-y-8 pb-24">
      
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Deals Pipeline</h1>
          <p className="text-base-content/60 mt-1">Track and manage your revenue opportunities.</p>
        </div>
        
        <div className="stats bg-base-100 shadow-sm border border-base-200 w-full lg:w-auto">
          <div className="stat px-6 py-4">
            <div className="stat-figure text-primary/20">
              <ChartBarIcon className="w-8 h-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60">Total Pipeline</div>
            <div className="stat-value text-xl">${totalPipeline.toLocaleString()}</div>
            <div className="stat-desc">Weighted: ${Math.round(weightedPipeline).toLocaleString()}</div>
          </div>
          <div className="stat px-6 py-4 border-l border-base-200">
            <div className="stat-figure text-success/20">
              <CurrencyDollarIcon className="w-8 h-8" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60">Revenue Won</div>
            <div className="stat-value text-xl text-success">${dist.WON.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* PIPELINE VISUALIZER */}
      {/* FIX: Removed OPEN segment */}
      <div className="w-full bg-base-200 h-2 rounded-full overflow-hidden flex">
        <div className="bg-info h-full" style={{ width: `${(dist.NEGOTIATION / maxVal) * 100}%` }} title={`Negotiation: $${dist.NEGOTIATION}`}></div>
        <div className="bg-warning h-full" style={{ width: `${(dist.PENDING / maxVal) * 100}%` }} title={`Pending: $${dist.PENDING}`}></div>
        <div className="bg-success h-full" style={{ width: `${(dist.WON / maxVal) * 100}%` }} title={`Won: $${dist.WON}`}></div>
      </div>

      {/* TOOLBAR: Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100 p-2 rounded-2xl border border-base-200 shadow-sm">
        
        {/* Status Tabs */}
        {/* FIX: Removed OPEN tab */}
        <div className="tabs tabs-boxed bg-transparent">
          <Link href="/deals?status=ALL" className={getTabClass('ALL')}>All</Link>
          <Link href="/deals?status=NEGOTIATION" className={getTabClass('NEGOTIATION')}>Neg</Link>
          <Link href="/deals?status=PENDING" className={getTabClass('PENDING')}>Pending</Link>
          <Link href="/deals?status=WON" className={getTabClass('WON')}>Won</Link>
        </div>

        {/* Search & Add */}
        <div className="flex w-full md:w-auto gap-2">
           <form className="relative flex-1 md:w-64">
             <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
             <input 
                name="q" 
                defaultValue={q} 
                className="input input-bordered w-full pl-9 h-10 text-sm" 
                placeholder="Search deals..." 
             />
           </form>
        </div>
      </div>

      {/* CREATE DEAL SECTION */}
      <div className="collapse collapse-arrow bg-base-100 border border-dashed border-base-300 rounded-xl">
        <input type="checkbox" /> 
        <div className="collapse-title font-medium text-primary flex items-center gap-2">
           <PlusIcon className="w-5 h-5" /> Create New Deal
        </div>
        <div className="collapse-content"> 
           <div className="pt-4">
             <AddDeals />
           </div>
        </div>
      </div>

      {/* DEALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-base-100 rounded-2xl border border-base-200">
             <div className="bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <ArchiveBoxIcon className="w-8 h-8 opacity-40" />
             </div>
             <h3 className="font-bold text-lg">No deals found</h3>
             <p className="text-base-content/50">Try adjusting your filters or create a new deal.</p>
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard 
              key={deal.id} 
              deal={{
                ...deal,
                contacts: deal.contacts.map(c => ({
                  id: c.id, 
                  name: c.name, 
                  imageUrl: c.imageUrl || undefined
                }))
              }} 
            />
          ))
        )}
      </div>

    </div>
  );
}