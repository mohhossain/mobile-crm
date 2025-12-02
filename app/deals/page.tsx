import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import DealCard from '../components/DealCard';
import AddDeals from '../components/AddDeals';
import DealsSearch from '../components/DealsSearch'; // New Component
import Link from 'next/link';
import { 
  PlusIcon, 
  ArchiveBoxIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-10 text-center">Please sign in.</div>;

  const { status = 'ALL', q } = await searchParams;
  
  // 1. Fetch Data
  const where: any = { userId: user.id };
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
      contacts: { select: { id: true, name: true, imageUrl: true } },
    },
  });

  // 2. Stats Calculation
  const allDeals = await prisma.deal.findMany({
    where: { userId: user.id },
    select: { amount: true, status: true, probability: true }
  });

  const totalPipeline = allDeals.reduce((sum, d) => d.status !== 'LOST' ? sum + d.amount : sum, 0);
  const weightedPipeline = allDeals.reduce((sum, d) => {
     if (d.status === 'LOST') return sum;
     const prob = d.probability ?? (d.status === 'WON' ? 100 : 50);
     return sum + (d.amount * (prob / 100));
  }, 0);

  const dist = {
    NEGOTIATION: allDeals.filter(d => d.status === 'NEGOTIATION').reduce((s, d) => s + d.amount, 0),
    PENDING: allDeals.filter(d => d.status === 'PENDING').reduce((s, d) => s + d.amount, 0),
    WON: allDeals.filter(d => d.status === 'WON').reduce((s, d) => s + d.amount, 0),
  };
  const maxVal = totalPipeline || 1;

  const getTabClass = (tabStatus: string) => {
    const isActive = status === tabStatus;
    // Added whitespace-nowrap to prevent text wrapping
    return `tab whitespace-nowrap flex-shrink-0 px-6 h-10 ${isActive ? 'tab-active font-bold border-b-2 border-primary' : 'text-base-content/60 hover:text-base-content'}`;
  };

  // Removed "pb-24" to fix extra space issues
  return (
    <div className="space-y-6">
      
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-black tracking-tight">Pipeline</h1>
             <p className="text-xs text-base-content/60">Manage your opportunities.</p>
           </div>
           {/* Add Deal Button (Top Right for easy access) */}
           <label htmlFor="add-deal-modal" className="btn btn-sm btn-primary btn-circle shadow-lg shadow-primary/30">
             <PlusIcon className="w-5 h-5" />
           </label>
        </div>
        
        <div className="stats bg-base-100 shadow-sm border border-base-200 w-full grid-cols-2">
          <div className="stat px-4 py-3">
            <div className="stat-figure text-primary/20">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="stat-title text-[10px] font-bold uppercase opacity-60">Pipeline</div>
            <div className="stat-value text-lg">${totalPipeline.toLocaleString()}</div>
          </div>
          <div className="stat px-4 py-3 border-l border-base-200">
            <div className="stat-figure text-success/20">
              <CurrencyDollarIcon className="w-6 h-6" />
            </div>
            <div className="stat-title text-[10px] font-bold uppercase opacity-60">Weighted</div>
            <div className="stat-value text-lg text-success">${Math.round(weightedPipeline).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* VISUALIZER BAR */}
      <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden flex shadow-inner">
        <div className="bg-info h-full transition-all duration-500" style={{ width: `${(dist.NEGOTIATION / maxVal) * 100}%` }}></div>
        <div className="bg-warning h-full transition-all duration-500" style={{ width: `${(dist.PENDING / maxVal) * 100}%` }}></div>
        <div className="bg-success h-full transition-all duration-500" style={{ width: `${(dist.WON / maxVal) * 100}%` }}></div>
      </div>

      {/* CONTROLS: Tabs & Search */}
      <div className="sticky top-16 z-30 bg-base-300/95 backdrop-blur pb-2 -mx-4 px-4 transition-all">
        
        {/* FIX: Horizontal Scrollable Tabs */}
        <div className="tabs tabs-bordered w-full overflow-x-auto flex-nowrap no-scrollbar border-b border-base-content/5 mb-4">
          <Link href="/deals?status=ALL" className={getTabClass('ALL')}>All</Link>
          <Link href="/deals?status=NEGOTIATION" className={getTabClass('NEGOTIATION')}>Negotiation</Link>
          <Link href="/deals?status=PENDING" className={getTabClass('PENDING')}>Pending</Link>
          <Link href="/deals?status=WON" className={getTabClass('WON')}>Won</Link>
        </div>

        {/* Smart Search Component */}
        <DealsSearch />
      </div>

      {/* DEALS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-20">
        {deals.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-base-100 rounded-2xl border border-base-200 border-dashed">
             <div className="bg-base-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
               <ArchiveBoxIcon className="w-6 h-6 opacity-40" />
             </div>
             <h3 className="font-bold text-sm">No deals found</h3>
             <p className="text-xs text-base-content/50 mb-4">Try adjusting filters.</p>
             <label htmlFor="add-deal-modal" className="btn btn-xs btn-outline">Create Deal</label>
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

      {/* HIDDEN MODAL FOR ADD DEAL (Cleaner UI than inline collapse) */}
      <input type="checkbox" id="add-deal-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
        <div className="modal-box p-0 bg-transparent shadow-none overflow-visible max-w-3xl">
          <div className="bg-base-100 rounded-2xl overflow-hidden">
             <div className="p-4 border-b border-base-200 flex justify-between items-center">
               <h3 className="font-bold text-lg">New Deal</h3>
               <label htmlFor="add-deal-modal" className="btn btn-sm btn-circle btn-ghost">✕</label>
             </div>
             <div className="max-h-[70vh] overflow-y-auto">
                {/* Add padding wrapper around the form */}
                <div className="p-2">
                   <AddDeals />
                </div>
             </div>
          </div>
        </div>
        <label htmlFor="add-deal-modal" className="modal-backdrop">Close</label>
      </div>

    </div>
  );
}