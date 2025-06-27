import { prisma } from '@/lib/prisma'; // adjust path if needed
import Link from 'next/link';
import Image from 'next/image';
import {getCurrentUser} from '@/lib/currentUser'; // adjust path if needed
import DealCard from './DealCard';

export default async function DealsPage() {

    const user = await getCurrentUser(); // Fetch the current user using the helper function
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: true,
      contacts: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    where: {
      userId: user?.id, // Use the user's ID from Clerk
    },

  });

  if (!deals.length) {
    return (
      <div className="p-4 text-center text-gray-500">No deals found.</div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Deals</h1>

      {deals.map((deal) => (
        <DealCard key={deal.id} deal={{
          ...deal,
          contacts: deal.contacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            imageUrl: contact.imageUrl || '',
          })),
          tags: deal.tags.map(tag => ({
            id: tag.id,
            name: tag.name,
          })),
        }} />
      ))}
    </div>
  );
}
