import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import AddDeals from '../components/AddDeals';
import DealsFilterBar from '../components/DealsFilterBar';
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

// Define expected Search Params
interface SearchParamsProps {
  q?: string;
  view?: string;
  status?: string;
  sort?: string;
  dir?: string;
  minAmount?: string;
  maxAmount?: string;
  closingWithin?: string;
}

export default async function DealsPage({ searchParams }: { searchParams: Promise<SearchParamsProps> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-10 text-center">Please sign in.</div>;

  const { 
    q, 
    view = 'board', 
    status = 'ALL', 
    sort = 'updatedAt', 
    dir = 'desc',
    minAmount,
    maxAmount,
    closingWithin
  } = await searchParams;
  
  // --- BUILD FILTERS ---
  const where: any = { userId: user.id };
  
  // 1. Text Search
  if (q) {
    where.title = { contains: q, mode: 'insensitive' };
  }

  // 2. Status Filter
  const VALID_STATUSES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  if (view !== 'board' && status !== 'ALL' && VALID_STATUSES.includes(status)) {
    where.status = status;
  }

  // 3. Amount Filters (> or <)
  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.gte = parseFloat(minAmount);
    if (maxAmount) where.amount.lte = parseFloat(maxAmount);
  }

  // 4. Closing Date Filter (Closing within X days)
  if (closingWithin) {
    const days = parseInt(closingWithin);
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);

    where.closeDate = {
      gte: today,      // Must be in the future
      lte: targetDate  // Less than Target Date
    };
  }

  // --- BUILD SORT ---
  const orderBy: any = {};
  if (sort === 'amount' || sort === 'closeDate' || sort === 'title' || sort === 'updatedAt' || sort === 'status') {
    orderBy[sort] = dir;
  } else {
    orderBy.updatedAt = 'desc'; // Fallback
  }

  const dealsRaw = await prisma.deal.findMany({
    where,
    orderBy,
    include: {
      tags: true,
      contacts: { select: { id: true, name: true, imageUrl: true } },
    },
  });

  const deals = dealsRaw.map((deal: { contacts: any[]; }) => ({
    ...deal,
    contacts: deal.contacts.map(contact => ({
      ...contact,
      imageUrl: contact.imageUrl ?? undefined
    }))
  }));

  // Stats Calculation (Contextual to ALL deals to keep totals visible regardless of filter)
  const allDeals = await prisma.deal.findMany({
    where: { userId: user.id },
    select: { amount: true, status: true }
  });

  const totalPipeline = allDeals.reduce((sum: any, d: { status: string; amount: any; }) => d.status !== 'LOST' ? sum + d.amount : sum, 0);
  const wonCount = allDeals.filter((d: { status: string; }) => d.status === 'WON').length;

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
                <Link href={`/deals?view=board`} className={`btn btn-xs join-item ${view === 'board' ? 'btn-active bg-base-100 shadow-sm' : 'btn-ghost'}`}>
                  <Squares2X2Icon className="w-4 h-4" />
                </Link>
                <Link href={`/deals?view=list`} className={`btn btn-xs join-item ${view === 'list' ? 'btn-active bg-base-100 shadow-sm' : 'btn-ghost'}`}>
                  <ListBulletIcon className="w-4 h-4" />
                </Link>
             </div>

             <label htmlFor="add-deal-modal" className="btn btn-sm btn-primary btn-circle shadow-lg shadow-primary/30">
               <PlusIcon className="w-5 h-5" />
             </label>
           </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="sticky top-0 z-20 space-y-4">
           
           {/* New Filter Bar Component - Manages its own visibility based on 'view' param */}
           <DealsFilterBar />

           {/* Status Tabs (Hidden in Board View) */}
           {view === 'list' && (
             <div className="tabs tabs-bordered w-full overflow-x-auto flex-nowrap no-scrollbar border-b border-base-content/5">
               <Link href={`/deals?view=list&status=ALL`} className={getTabClass('ALL')}>All</Link>
               <Link href={`/deals?view=list&status=NEW`} className={getTabClass('NEW')}>New</Link>
               <Link href={`/deals?view=list&status=QUALIFIED`} className={getTabClass('QUALIFIED')}>Qualified</Link>
               <Link href={`/deals?view=list&status=PROPOSAL`} className={getTabClass('PROPOSAL')}>Proposal</Link>
               <Link href={`/deals?view=list&status=NEGOTIATION`} className={getTabClass('NEGOTIATION')}>Negotiation</Link>
               <Link href={`/deals?view=list&status=WON`} className={getTabClass('WON')}>Won</Link>
               <Link href={`/deals?view=list&status=LOST`} className={getTabClass('LOST')}>Lost</Link>
             </div>
           )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 min-h-0 relative">
         {deals.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-base-content/40 space-y-4">
              <div className="p-4 bg-base-200 rounded-full">
                <ArchiveBoxIcon className="w-8 h-8" />
              </div>
              <p>No deals found matching filters.</p>
              <label htmlFor="add-deal-modal" className="btn btn-sm btn-outline">Create Deal</label>
            </div>
         ) : view === 'board' ? (
           <DealsKanban deals={deals} />
         ) : (
           <div className="h-full overflow-y-auto pb-20 pr-2 custom-scrollbar">
             <DealsList deals={deals} currentSort={sort} currentDir={dir} />
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