import React from 'react';
import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import AddLeads from '../components/AddLeads';
import ContactCard from '../components/Contact';
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
           { email: { contains: q, mode: 'insensitive' } }
         ]
       } : {})
     },
     include: { tags: true },
     orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 pb-24 max-w-4xl mx-auto space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h1 className="text-2xl font-bold">Contacts ({contacts.length})</h1>
         
         {/* Search Form */}
         <form className="join w-full md:w-auto">
            <input name="q" defaultValue={q} className="input input-bordered input-sm join-item w-full" placeholder="Search name or email..." />
            <button className="btn btn-sm btn-neutral join-item">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
         </form>
       </div>

       {/* Add Contact Collapsible */}
       <div className="collapse collapse-arrow bg-base-200">
         <input type="checkbox" /> 
         <div className="collapse-title font-medium">
           + Add New Contact
         </div>
         <div className="collapse-content"> 
           <AddLeads />
         </div>
       </div>

       {/* Grid Layout */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(c => (
            <ContactCard 
              key={c.id} 
              contact={{...c, tags: c.tags.map(t => t.name)}} 
            />
          ))}
          {contacts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
               No contacts found.
            </div>
          )}
       </div>
    </div>
  );
}