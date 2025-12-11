import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import AddDeals from '../components/AddDeals';
import DealsSearch from '../components/DealsSearch';
import DealsKanban from '../components/DealsKanban';
import DealsList from '../components/DealsList';
import Link from 'next/link';
import { 
  PlusIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ q?: string, view?: string, status?: string, sort?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-10 text-center">Please sign in.</div>;

  const { q, view = 'board', status = 'ALL', sort = 'date' } = await searchParams;
  
  // 1. Fetch Deals
  const where: any = { userId: user.id };
  
  // Search Filter
  if (q) {
    where.title = { contains: q, mode: 'insensitive' };
  }

  // Status Filter
  // We accept the new statuses. 'ALL' returns everything (except maybe archived in future).
  const VALID_STATUSES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  
  if (status !== 'ALL' && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  // Sorting Logic (Primarily for List View, but affects fetch order)
  let orderBy: any = { updatedAt: 'desc' };
  if (sort === 'amount') orderBy = { amount: 'desc' };
  if (sort === 'name') orderBy = { title: 'asc' };
  if (sort === 'date') orderBy = { closeDate: 'asc' };

  const dealsRaw = await prisma.deal.findMany({
    where,
    orderBy,
    include: {
      tags: true,
      contacts: { select: { id: true, name: true, imageUrl: true } },
    },
  });

  // Transform deals to convert null to undefined for imageUrl
  const deals = dealsRaw.map(deal => ({
    ...deal,
    contacts: deal.contacts.map(contact => ({
      ...contact,
      imageUrl: contact.imageUrl ?? undefined
    }))
  }));

  // 2. Calculate Stats (Contextual to ALL deals for the user, regardless of current filter)
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
  const wonCount = allDeals.filter(d => d.status === 'WON').length;

  // 3. Helper for Tab Styles
  const getTabClass = (tabStatus: string) => {
    const isActive = status === tabStatus;
    return `tab whitespace-nowrap flex-shrink-0 px-6 h-10 transition-all duration-200 ${
      isActive 
        ? 'tab-active font-extrabold border-b-2 border-primary text-primary' 
        : 'text-base-content/60 hover:text-base-content'
    }`;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      
      {/* HEADER & CONTROLS */}
      <div className="flex-none space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h1 className="text-2xl font-black tracking-tight">Pipeline</h1>
             <p className="text-xs text-base-content/60">Manage your opportunities.</p>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
             {/* Stats Pill */}
             <div className="hidden md:flex gap-4 px-4 py-2 bg-base-100 rounded-full border border-base-200 shadow-sm text-xs">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4 text-primary" />
                  <span className="font-bold">${totalPipeline.toLocaleString()}</span>
                  <span className="opacity-50">Pipeline</span>
                </div>
                <div className="w-px h-full bg-base-300"></div>
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-success" />
                  <span className="font-bold">{wonCount}</span>
                  <span className="opacity-50">Won</span>
                </div>
             </div>

             {/* View Toggle */}
             <div className="join bg-base-200 p-1 rounded-lg ml-auto md:ml-0">
                <Link href={`/deals?view=board&q=${q || ''}&status=${status}`} className={`btn btn-xs join-item ${view === 'board' ? 'btn-active bg-base-100 shadow-sm' : 'btn-ghost'}`}>
                  <Squares2X2Icon className="w-4 h-4" />
                </Link>
                <Link href={`/deals?view=list&q=${q || ''}&status=${status}`} className={`btn btn-xs join-item ${view === 'list' ? 'btn-active bg-base-100 shadow-sm' : 'btn-ghost'}`}>
                  <ListBulletIcon className="w-4 h-4" />
                </Link>
             </div>

             <label htmlFor="add-deal-modal" className="btn btn-sm btn-primary btn-circle shadow-lg shadow-primary/30">
               <PlusIcon className="w-5 h-5" />
             </label>
           </div>
        </div>

        {/* SEARCH & FILTERS (Sticky) */}
        <div className="sticky top-0 z-20 space-y-4">
           <DealsSearch />
           
           {/* Status Tabs - Scrollable */}
           <div className="tabs tabs-bordered w-full overflow-x-auto flex-nowrap no-scrollbar border-b border-base-content/5">
             <Link href={`/deals?view=${view}&status=ALL`} className={getTabClass('ALL')}>All</Link>
             <Link href={`/deals?view=${view}&status=NEW`} className={getTabClass('NEW')}>New</Link>
             <Link href={`/deals?view=${view}&status=QUALIFIED`} className={getTabClass('QUALIFIED')}>Qualified</Link>
             <Link href={`/deals?view=${view}&status=PROPOSAL`} className={getTabClass('PROPOSAL')}>Proposal</Link>
             <Link href={`/deals?view=${view}&status=NEGOTIATION`} className={getTabClass('NEGOTIATION')}>Negotiation</Link>
             <Link href={`/deals?view=${view}&status=WON`} className={getTabClass('WON')}>Won</Link>
             <Link href={`/deals?view=${view}&status=LOST`} className={getTabClass('LOST')}>Lost</Link>
           </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 min-h-0 relative">
         {deals.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-base-content/40 space-y-4">
              <div className="p-4 bg-base-200 rounded-full">
                <ArchiveBoxIcon className="w-8 h-8" />
              </div>
              <p>No deals found in this view.</p>
              <label htmlFor="add-deal-modal" className="btn btn-sm btn-outline">Create Deal</label>
            </div>
         ) : view === 'board' ? (
           <DealsKanban deals={deals} />
         ) : (
           <div className="h-full overflow-y-auto pb-20 pr-2 custom-scrollbar">
             <DealsList deals={deals} />
           </div>
         )}
      </div>

      {/* HIDDEN MODAL FOR ADD DEAL */}
      <input type="checkbox" id="add-deal-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
        <div className="modal-box p-0 bg-transparent shadow-none overflow-visible max-w-3xl">
          <div className="bg-base-100 rounded-2xl overflow-hidden">
             <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100 z-10 relative">
               <h3 className="font-bold text-lg">New Deal</h3>
               <label htmlFor="add-deal-modal" className="btn btn-sm btn-circle btn-ghost">✕</label>
             </div>
             <div className="max-h-[70vh] overflow-y-auto bg-base-100">
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