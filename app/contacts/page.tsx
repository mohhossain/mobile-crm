import React from 'react';
import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import ContactList from '../components/ContactList';

export default async function ContactsPage() {
  const user = await getCurrentUser();
  if(!user) return <div>Unauthorized</div>;

  const contacts = await prisma.contact.findMany({
      where: { userId: user.id },
      include: { 
        tags: true,
        company: true,
        deals: { // <--- ENSURE THIS IS HERE
           select: { id: true, title: true, amount: true, stage: true }
        }
      },
      orderBy: { createdAt: 'desc' }
  });

  const formattedContacts = contacts.map((contact: any) => ({
    ...contact,
    company: contact.company?.name || contact.companyName || null,
    tags: contact.tags.map((t: any) => ({ id: t.id, name: t.name }))
  }));

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto">
       <ContactList initialContacts={formattedContacts} />
    </div>
  );
}