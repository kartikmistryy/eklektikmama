import { NextResponse } from "next/server";
import { google } from "googleapis";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { getEventBookingsCount } from "@/lib/googleSheets";

// Legacy segment capacity limits (fallback for events without seat limits)
const LEGACY_SEGMENT_CAPACITY = {
  cinemaMorning: 10,
  mamaBreakfast: 9, // Currently has 5 records, so 4 more can be added (5 + 4 = 9)
  mamaFit: 10,
  eklektikEdit: 10,
  helloChef: 10
};

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    // Connect to database and get the event directly
    await connectDB();
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const eventSegment = event.segment;
    
    // Determine the seat limit for this event
    let totalCapacity;
    let isUsingLegacyLimit = false;
    
    if (event.seats && event.seats > 0) {
      // Use the actual seat limit from the event
      totalCapacity = event.seats;
      console.log(`Using event seat limit: ${totalCapacity} for event: ${event.title}`);
    } else {
      // Fall back to legacy segment capacity for events without seat limits
      totalCapacity = LEGACY_SEGMENT_CAPACITY[eventSegment] || 10;
      isUsingLegacyLimit = true;
      console.log(`Using legacy segment limit: ${totalCapacity} for event: ${event.title} (segment: ${eventSegment})`);
    }
    
    if (!eventSegment) {
      return NextResponse.json({ 
        available: true, 
        remaining: totalCapacity,
        total: totalCapacity,
        actualTotal: totalCapacity,
        message: 'Event segment not specified'
      });
    }
    
    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      return NextResponse.json({ 
        available: true, 
        remaining: totalCapacity,
        total: totalCapacity,
        actualTotal: totalCapacity,
        message: 'Google Sheets not configured, assuming available'
      });
    }
    
    // Use the new getEventBookingsCount function to get accurate booking count
    let existingBookings = 0;
    
    try {
      existingBookings = await getEventBookingsCount(event);
      console.log(`Found ${existingBookings} existing bookings for event: ${event.title}`);
    } catch (bookingError) {
      console.error('Error getting booking count:', bookingError);
      // If we can't get booking count, assume no bookings for safety
      existingBookings = 0;
    }
    
    // Calculate remaining capacity
    const remaining = Math.max(0, totalCapacity - existingBookings);
    const available = remaining > 0;
    
    return NextResponse.json({
      available,
      remaining,
      total: totalCapacity,
      actualTotal: totalCapacity,
      existing: existingBookings,
      segment: eventSegment,
      isUsingLegacyLimit,
      message: available 
        ? `${remaining} tickets remaining` 
        : 'Event is fully booked'
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ 
      available: true, 
      remaining: 10,
      total: 10,
      actualTotal: 10,
      message: 'Error checking availability, assuming available',
      error: error.message
    }, { status: 500 });
  }
}
