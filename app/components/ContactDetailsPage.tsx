import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import BackButton from "@/app/components/BackButton";
import DealCard from "@/app/components/DealCard";
import TaskCard from "@/app/components/TaskCard";
import ContactProfile from "@/app/components/ContactProfile";
import { BriefcaseIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

export default async function ContactDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  const { id } = await params;
  
  const contact = await prisma.contact.findUnique({
    where: { id, userId: user.id },
    include: { 
      tags: true,
      deals: {
         include: { tags: true, contacts: true },
         orderBy: { updatedAt: 'desc' }
      },
      tasks: {
        include: { deal: true },
        orderBy: { dueDate: 'asc' }
      }
    },
  });

  if (!contact) return <div className="p-10 text-center">Contact not found</div>;

  // Convert contact to simple object for client component
  const safeContact = {
    ...contact,
    tags: contact.tags.map(t => ({ id: t.id, name: t.name })),
    imageUrl: contact.imageUrl ?? null
  };

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24 space-y-6">
      <BackButton />
      
      {/* 1. Seamless Profile Header (View/Edit/Delete) */}
      <div className="mt-8">
        <ContactProfile initialContact={safeContact} />
      </div>

      {/* 2. Related Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Related Deals */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 pb-2 border-b">
             <BriefcaseIcon className="w-5 h-5 text-primary" />
             <h3 className="text-lg font-bold">Deals Pipeline</h3>
             <span className="badge badge-neutral badge-sm">{contact.deals.length}</span>
           </div>
           
           <div className="space-y-3">
             {contact.deals.length === 0 ? (
               <div className="bg-base-100 p-8 rounded-xl text-center border border-dashed border-base-300">
                 <p className="text-gray-400">No active deals.</p>
               </div>
             ) : (
               contact.deals.map(deal => (
                 <DealCard key={deal.id} deal={deal} />
               ))
             )}
           </div>
        </div>

        {/* Right Column: Related Tasks */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 pb-2 border-b">
             <ClipboardDocumentCheckIcon className="w-5 h-5 text-secondary" />
             <h3 className="text-lg font-bold">Tasks & Activities</h3>
             <span className="badge badge-neutral badge-sm">{contact.tasks.length}</span>
           </div>

           <div className="space-y-3">
             {contact.tasks.length === 0 ? (
               <div className="bg-base-100 p-8 rounded-xl text-center border border-dashed border-base-300">
                 <p className="text-gray-400">No tasks scheduled.</p>
               </div>
             ) : (
               contact.tasks.map(task => (
                 <TaskCard key={task.id} task={task} />
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}