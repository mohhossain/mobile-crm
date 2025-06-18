import React from 'react'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '@/lib/currentUser'
const Deals = async () => {
    const prisma = new PrismaClient()
    const user = await getCurrentUser(); // Fetch the current user using the helper function

    // Fetch deals for the user

    const deals = await prisma.deal.findMany({
        where: { userId: user?.id }, // Use the user's ID from Clerk
        include: {
            tags: true, // Include tags related to the deal
            contacts: true, // Include contacts related to the deal
            notes: true
        },
        orderBy: {
            createdAt: 'desc', // Order by creation date, most recent first
        },
    });

    console.log("Fetched deals:", deals); // Debugging log to check fetched deals
  return (
    <div className="flex flex-col m-3 p-2 gap-4 overflow-x-auto hide-scrollbar no-scrollbar">
        {deals.map((deal) => ( 
            

                <div className='flex flex-row p-4 gap-2 bg-base-100'>
                    <h3 className='text-lg font-semibold'>{deal.title}</h3>
                    <p className='text-sm text-gray-600'>Amount: ${deal.amount}</p>
                    <p className='text-sm text-gray-600'>Status: {deal.status}</p>
                    <div className='flex flex-wrap gap-2 mt-2'>
                        {deal.tags.map((tag) => (
                            <span key={tag.id} className='badge badge-primary'>{tag.name}</span>
                        ))}
                    </div>
                    <div className='mt-2'>
                        <h4 className='font-medium'>Contacts:</h4>
                        <ul className='list-disc pl-5'>
                            {deal.contacts.map((contact) => (
                                <li key={contact.id} className='text-sm text-gray-700'>{contact.name}</li>
                            ))}
                        </ul>
                    </div>
                    </div>


            )
        )}
    </div>
  )
}

export default Deals