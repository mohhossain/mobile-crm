import { auth } from '@clerk/nextjs/server';
import { prisma } from './prisma';


export async function getCurrentUser() {
    const { userId } = await auth();

    if (!userId) {
        return null; // User is not authenticated
    }

    try {
        // Fetch the user from your Prisma database using the Clerk user ID
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        return user; // Return the user object or null if not found
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null; // Handle errors gracefully
    }
}