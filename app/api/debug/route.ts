import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ask Postgres for the columns in the Contact table
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Contact';
    `;
    
    return NextResponse.json({ 
      db_url_mask: process.env.DATABASE_URL?.substring(0, 15) + "...",
      columns 
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) });
  }
}