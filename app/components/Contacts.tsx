import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/currentUser';
import Contact from './Contact';

const prisma = new PrismaClient();


export default async function Contacts() {
    const user = await getCurrentUser(); // Fetch the current user using the helper function
    
    const contacts = await prisma.contact.findMany({
        where: { userId: user?.id }, // Use the user's ID from Clerk
        include: {
            tags: true, // Include tags related to the contact
        },
        orderBy: {
            createdAt: 'desc', // Order by creation date, most recent first
        },
    });

    return (
        <div>
            <div className="flex m-3 p-2 gap-4 overflow-x-auto hide-scrollbar no-scrollbar">
                {contacts.map((contact) => (
                    <Contact
                        key={contact.id}
                        contact={{
                            ...contact,
                            tags: contact.tags.map((tag: { id: string; name: string }) => tag.name),
                        }}
                    />
                ))}
            </div>
        </div>
    );
}