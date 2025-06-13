import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() { 
    const { userId } = await auth();

    console.log("User ID from auth:", userId);

    if (!userId) {
        console.log(userId, "User ID is not available");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 

    // find the user in the database where userId is the clerkId
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try{
        // Fetch contacts for the user
        const contacts = await prisma.contact.findMany({
            where: { userId: user.id }, // Use the user's ID from the database
            include: {
                tags: true, // Include tags related to the contact
            },
        });

        return NextResponse.json(contacts);     
    } 
    catch (err) {
        console.error("Error fetching contacts:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

}

// make a post request to create a new contact for the user
// this route can be used to create a contact related to a gig or deal or a task and can be assigned a tag, if the tag doesnt exist create the tag first and then relate to the contact 
// default status is enum NEW but can be passed in the request body 

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // find the user in the database where userId is the clerkId
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        const body = await request.json();
        const { name, email, phone, tags, imageUrl, status = "NEW" } = body;

        // Create or find tags
        const tagIds = await Promise.all(
            tags.map(async (tag: string) => {
                let existingTag = await prisma.tag.findUnique({
                    where: { name: tag },
                });

                if (!existingTag) {
                    existingTag = await prisma.tag.create({
                        data: { name: tag },
                    });
                }

                return existingTag.id;
            })
        );

        // Create the contact
       

        const contact = await prisma.contact.create({
            data: {
                name,
                email,
                phone,
                status,
                imageUrl,
                userId: user.id, // Use the user's ID from the database
                tags: {
                    connect: tagIds.map((id) => ({ id })),
                },
            },
        });
        return NextResponse.json({ contact });

    } catch (err) {
        console.error("Error creating contact:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}



