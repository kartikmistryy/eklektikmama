import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';

export async function GET() {
  try {
    console.log('Testing database connection for checkout...');
    
    // Test database connection
    await connectDB();
    console.log('Database connected successfully');
    
    // Test finding an event
    const events = await Event.find({}).limit(1);
    console.log('Events found:', events.length);
    
    if (events.length > 0) {
      const event = events[0];
      return NextResponse.json({
        success: true,
        message: 'Database connection and event lookup successful',
        event: {
          id: event._id,
          title: event.title,
          price: event.price,
          date: event.date
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Database connected but no events found',
        eventsCount: 0,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
