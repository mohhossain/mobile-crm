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
           // FIX: Search legacy string field
           { companyName: { contains: q, mode: 'insensitive' } },
           // FIX: Search relation field safely
           { company: { name: { contains: q, mode: 'insensitive' } } }
         ]
       } : {})
     },
     include: { 
       tags: true,
       company: true // Include the company relation data
     },
     orderBy: { createdAt: 'desc' }
  });

  // FIX: Transform data to match the client component's expected interface.
  // The Client Component expects 'company' to be a string, not an object.
  const formattedContacts = contacts.map(contact => ({
    ...contact,
    // Flatten company info: Use the relation name if it exists, otherwise legacy string
    company: contact.company?.name || contact.companyName || null,
    // Ensure tags are mapped correctly if needed (though Prisma returns the right shape mostly)
    tags: contact.tags.map(t => ({ id: t.id, name: t.name }))
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
       {/* We pass the formatted contacts that have 'company' as a string */}
       <ContactList initialContacts={formattedContacts} />
    </div>
  );
}