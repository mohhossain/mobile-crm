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
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap">
                
                {contacts.map((contact) => (
                    <Contact key={contact.id} contact={contact} /> 
                ))}
            </div>
        </div>
    );
}