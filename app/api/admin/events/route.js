import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    
    // Get all events, sorted by creation date (newest first)
    const events = await Event.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
