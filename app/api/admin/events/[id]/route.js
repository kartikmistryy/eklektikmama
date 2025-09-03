import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete the event
    await Event.findByIdAndDelete(id);
    
    console.log(`Event deleted: ${event.title} (ID: ${id})`);
    
    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
