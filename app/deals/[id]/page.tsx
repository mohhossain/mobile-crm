import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import BackButton from '@/app/components/BackButton';
import DeleteDealButton from '@/app/components/DeleteDealButton';
import TaskCard from '@/app/components/TaskCard';
import DealNotes from '@/app/components/DealNotes';
import Link from 'next/link';
import { 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  BriefcaseIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

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
        orderBy: { createdAt: 'asc' } // Oldest first (chat style)
      },
      contacts: true
    },
  });

  if (!deal) return <div className="text-center p-10">Deal not found.</div>;

  // Status Styling
  const statusColors: Record<string, string> = {
    WON: 'badge-success',
    LOST: 'badge-error',
    PENDING: 'badge-warning',
    NEGOTIATION: 'badge-info',
    OPEN: 'badge-primary'
  };

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24 space-y-6">
      <BackButton />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge badge-lg font-bold ${statusColors[deal.status] || 'badge-ghost'}`}>
              {deal.status}
            </span>
            {deal.tags.map(tag => (
              <span key={tag.id} className="badge badge-outline text-xs">{tag.name}</span>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold break-all">{deal.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
           <Link href={`/deals/${deal.id}/edit`} className="btn btn-outline btn-sm">
             <PencilSquareIcon className="w-4 h-4" /> Edit
           </Link>
           <DeleteDealButton dealId={deal.id} />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Contacts (1 col) */}
        <div className="space-y-6">
           {/* Key Metrics */}
           <div className="stats stats-vertical w-full shadow-sm bg-base-100 border border-base-200">
              <div className="stat">
                <div className="stat-figure text-success">
                  <CurrencyDollarIcon className="w-8 h-8" />
                </div>
                <div className="stat-title">Deal Value</div>
                <div className="stat-value text-success">${deal.amount.toLocaleString()}</div>
              </div>
              
              <div className="stat">
                <div className="stat-figure text-secondary">
                  <CalendarDaysIcon className="w-8 h-8" />
                </div>
                <div className="stat-title">Target Close</div>
                <div className="stat-value text-lg">
                  {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
           </div>

           {/* Contacts Card */}
           <div className="card bg-base-100 shadow-sm border border-base-200">
             <div className="card-body p-4">
               <h3 className="card-title text-sm uppercase text-gray-500 mb-2">Contacts Involved</h3>
               {deal.contacts.length === 0 ? (
                 <p className="text-gray-400 text-sm italic">No contacts assigned.</p>
               ) : (
                 <div className="space-y-3">
                   {deal.contacts.map(c => (
                     <Link href={`/contacts/${c.id}`} key={c.id} className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-sm">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.email}</div>
                        </div>
                     </Link>
                   ))}
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* Middle Column: Tasks (1 col) */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
             <h3 className="font-bold text-lg flex items-center gap-2">
               <BriefcaseIcon className="w-5 h-5" /> Tasks
             </h3>
             <Link href="/tasks" className="text-xs link link-primary">Manage All</Link>
           </div>
           
           <div className="space-y-3">
             {deal.tasks.length === 0 ? (
               <div className="text-center py-12 bg-base-100 rounded-xl border border-dashed border-base-300">
                 <p className="text-gray-400">No tasks for this deal.</p>
                 <Link href="/tasks" className="btn btn-sm btn-ghost mt-2">+ Add Task</Link>
               </div>
             ) : (
               deal.tasks.map(task => (
                 <TaskCard key={task.id} task={task} />
               ))
             )}
           </div>
        </div>

        {/* Right Column: Notes (1 col) */}
        <div className="h-[600px] lg:h-auto">
           <DealNotes dealId={deal.id} initialNotes={deal.notes} />
        </div>

      </div>
    </div>
  );
}