import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import AddDeals from '../components/AddDeals';
import DealsSearch from '../components/DealsSearch';
import DealsKanban from '../components/DealsKanban'; // New Import
import { PlusIcon } from '@heroicons/react/24/outline';

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-10 text-center">Please sign in.</div>;

  const { q } = await searchParams;
  
  // Fetch ALL deals for the Kanban board
  // If search is active, filter by title
  const where: any = { userId: user.id };
  if (q) {
    where.title = { contains: q, mode: 'insensitive' };
  }

  const dealsData = await prisma.deal.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      tags: true,
      contacts: { select: { id: true, name: true, imageUrl: true } },
    },
  });

  // Transform null to undefined for imageUrl
  const deals = dealsData.map(deal => ({
    ...deal,
    contacts: deal.contacts.map(contact => ({
      ...contact,
      imageUrl: contact.imageUrl ?? undefined,
    })),
  }));

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      
      {/* COMPACT HEADER */}
      <div className="flex-none space-y-4">
        <div className="flex justify-between items-center px-1">
           <h1 className="text-2xl font-black tracking-tight">Pipeline</h1>
           <label htmlFor="add-deal-modal" className="btn btn-sm btn-primary btn-circle shadow-lg shadow-primary/30">
             <PlusIcon className="w-5 h-5" />
           </label>
        </div>

        {/* SEARCH BAR (Sticky) */}
        <div className="sticky top-0 z-20">
           <DealsSearch />
        </div>
      </div>

      {/* KANBAN BOARD (Takes remaining height) */}
      <div className="flex-1 min-h-0">
         <DealsKanban deals={deals} />
      </div>

      {/* HIDDEN MODAL FOR ADD DEAL */}
      <input type="checkbox" id="add-deal-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
        <div className="modal-box p-0 bg-transparent shadow-none overflow-visible max-w-3xl">
          <div className="bg-base-100 rounded-2xl overflow-hidden">
             <div className="p-4 border-b border-base-200 flex justify-between items-center">
               <h3 className="font-bold text-lg">New Deal</h3>
               <label htmlFor="add-deal-modal" className="btn btn-sm btn-circle btn-ghost">✕</label>
             </div>
             <div className="max-h-[70vh] overflow-y-auto">
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