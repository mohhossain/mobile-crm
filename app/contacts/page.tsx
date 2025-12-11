import React from 'react';
import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import AddLeads from '../components/AddLeads';
import ContactList from '../components/ContactList';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  if(!user) return <div>Unauthorized</div>;

  const { q } = await searchParams;

  const contacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
        ...(q ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { companyName: { contains: q, mode: 'insensitive' } },
            { company: { name: { contains: q, mode: 'insensitive' } } }
          ]
        } : {})
      },
      include: { 
        tags: true,
        company: true 
      },
      orderBy: { createdAt: 'desc' }
  });

  // FIX: Use 'any' here to prevent TypeScript from complaining about the structure mismatch
  // between the Prisma return type and the expected shape in the map function.
  const formattedContacts = contacts.map((contact: any) => ({
    ...contact,
    // Flatten: Use the relation name if available, fallback to legacy string
    company: contact.company?.name || contact.companyName || null,
    tags: contact.tags.map((t: any) => ({ id: t.id, name: t.name }))
  }));

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h1 className="text-2xl font-bold">Contacts ({contacts.length})</h1>
         
         {/* Search Form */}
         <form className="join w-full md:w-auto shadow-sm">
            <input name="q" defaultValue={q} className="input input-bordered input-sm join-item w-full md:w-64" placeholder="Search name, email, company..." />
            <button className="btn btn-sm btn-neutral join-item">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
         </form>
       </div>

       {/* Add Contact Collapsible */}
       <div className="collapse collapse-arrow bg-base-100 border border-base-200 shadow-sm rounded-xl">
         <input type="checkbox" /> 
         <div className="collapse-title font-medium text-sm text-primary">
           + Add New Contact
         </div>
         <div className="collapse-content"> 
           <AddLeads />
         </div>
       </div>

       {/* Interactive List Manager */}
       <ContactList initialContacts={formattedContacts} />
    </div>
  );
}