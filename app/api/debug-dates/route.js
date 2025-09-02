import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';

export async function GET() {
  try {
    await connectDB();
    
    // Get the first event to analyze
    const event = await Event.findOne({}).select('title date endDate');
    
    if (!event) {
      return NextResponse.json({ error: 'No events found' });
    }
    
    // Analyze the date
    const rawDate = event.date;
    const parsedDate = new Date(rawDate);
    const now = new Date();
    
    const analysis = {
      title: event.title,
      rawDate: rawDate,
      rawDateType: typeof rawDate,
      parsedDate: parsedDate,
      parsedDateISO: parsedDate.toISOString(),
      parsedDateLocal: parsedDate.toString(),
      parsedDateLocalTime: parsedDate.toLocaleTimeString(),
      timezoneOffset: parsedDate.getTimezoneOffset(),
      // Check if this looks like a timezone issue
      hoursFromMidnight: parsedDate.getHours(),
      minutesFromHour: parsedDate.getMinutes(),
      // Compare with current time
      isInFuture: parsedDate > now,
      timeDifference: parsedDate - now
    };
    
    return NextResponse.json({
      success: true,
      analysis,
      recommendations: [
        'The raw date from database shows the exact time stored',
        'If the time is wrong, the issue is in event creation, not display',
        'Check your event creation form to ensure correct time input',
        'Consider using a time picker that preserves timezone information'
      ]
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
