import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import EditContactForm from "@/app/components/EditContactForm";
import BackButton from "@/app/components/BackButton";
import DealCard from "@/app/components/DealCard";

export default async function ContactDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  // Await params in Next.js 15
  const { id } = await params;
  
  const contact = await prisma.contact.findUnique({
    where: { id, userId: user.id },
    include: { 
      tags: true,
      deals: {
         include: { tags: true, contacts: true }
      }
    },
  });

  if (!contact) return <div className="p-10 text-center">Contact not found</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8 pb-24">
      <BackButton />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Left Col: Edit Form */}
        <div>
           <EditContactForm contact={contact} />
        </div>

        {/* Right Col: Related Info */}
        <div className="space-y-6">
           <div>
             <h3 className="text-xl font-bold mb-4">Related Deals</h3>
             {contact.deals.length === 0 ? (
               <p className="text-gray-500">No deals associated with this contact.</p>
             ) : (
               <div className="space-y-3">
                 {contact.deals.map(deal => (
                   <DealCard key={deal.id} deal={deal} />
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}