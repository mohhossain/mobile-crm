import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');

  const start = startStr ? new Date(startStr) : new Date();
  const end = endStr ? new Date(endStr) : new Date(new Date().setMonth(start.getMonth() + 1));

  try {
    // 1. Fetch Local DB Meetings
    const localMeetings = await prisma.meeting.findMany({
      where: {
        userId: user.id,
        startTime: { gte: start, lte: end }
      },
      include: { contact: true, deal: true }
    });

    // 2. Fetch Local DB Tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        dueDate: { gte: start, lte: end },
        status: { not: 'DONE' }
      },
      include: { deal: true }
    });

    // 3. Fetch Google Calendar Events (If connected)
    let googleEvents: any[] = [];
    
    // We need to fetch the tokens specifically to check if they exist
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { googleAccessToken: true }
    });

    if (dbUser?.googleAccessToken) {
      try {
        const googleRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`,
          {
            headers: { Authorization: `Bearer ${dbUser.googleAccessToken}` }
          }
        );

        if (googleRes.ok) {
          const data = await googleRes.json();
          googleEvents = data.items || [];
        } else {
          // Token might be expired. In a real app, you would use the Refresh Token here to get a new Access Token.
          console.warn("Google Calendar fetch failed - Token might be expired");
        }
      } catch (err) {
        console.error("Failed to fetch Google Events", err);
      }
    }

    // 4. Normalize and Merge All Events
    const events = [
      // Map Local Meetings
      ...localMeetings.map(m => ({
        id: m.id,
        title: m.title,
        start: m.startTime,
        end: m.endTime,
        type: 'MEETING',
        description: m.description,
        contactName: m.contact?.name,
        dealTitle: m.deal?.title
      })),
      // Map Local Tasks
      ...tasks.map(t => ({
        id: t.id,
        title: `Task: ${t.title}`,
        start: t.dueDate,
        end: t.dueDate,
        type: 'TASK',
        description: t.description,
        dealTitle: t.deal?.title,
        priority: t.priority
      })),
      // Map Google Events
      ...googleEvents.map(g => ({
        id: g.id,
        title: `(G) ${g.summary}`, // (G) indicator for Google events
        start: g.start.dateTime || g.start.date, // Handle all-day events
        end: g.end.dateTime || g.end.date,
        type: 'GOOGLE',
        description: g.description
      }))
    ];

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // ... (Keep the POST method exactly as it was in the previous version for creating local meetings)
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, startTime, endTime, description, contactId, dealId } = body;

  try {
    const meeting = await prisma.meeting.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
        userId: user.id,
        contactId: contactId || null,
        dealId: dealId || null
      }
    });
    return NextResponse.json(meeting);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}