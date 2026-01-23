import { NextResponse } from "next/server";
import { google } from "googleapis";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import { getEventBookingsCount } from "@/lib/googleSheets";

// Legacy segment capacity limits (fallback for events without seat limits)
const LEGACY_SEGMENT_CAPACITY = {
  cinemaMorning: 10,
  mamaBreakfast: 9, // Currently has 5 records, so 4 more can be added (5 + 4 = 9)
  mamaFit: 10,
  eklektikEdit: 10,
  helloChef: 10,
  familyDay: 10,
  coffeeMeetup: 15 // Coffee meetups can accommodate more people
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
    
    // Get booking count from MongoDB first (most reliable)
    let existingBookings = 0;
    let mongoBookingsCount = 0;
    let sheetsBookingsCount = 0;
    
    try {
      // Count bookings from MongoDB
      mongoBookingsCount = await Booking.countDocuments({ 
        eventId: event._id,
        paymentStatus: 'paid'
      });
      console.log(`📊 MongoDB bookings count for event "${event.title}": ${mongoBookingsCount}`);
    } catch (mongoError) {
      console.error('❌ Error counting bookings from MongoDB:', mongoError);
    }
    
    // Also get count from Google Sheets (for comparison)
    try {
      sheetsBookingsCount = await getEventBookingsCount(event);
      console.log(`📊 Google Sheets bookings count for event "${event.title}": ${sheetsBookingsCount}`);
    } catch (sheetsError) {
      console.error('❌ Error getting booking count from Google Sheets:', sheetsError);
    }
    
    // Use MongoDB count as primary source (most reliable)
    // Fall back to Google Sheets if MongoDB count is 0 but Sheets has data
    existingBookings = mongoBookingsCount > 0 ? mongoBookingsCount : sheetsBookingsCount;
    
    console.log(`📊 Final booking count for "${event.title}": ${existingBookings} (MongoDB: ${mongoBookingsCount}, Sheets: ${sheetsBookingsCount})`);
    
    // Calculate remaining capacity
    const remaining = Math.max(0, totalCapacity - existingBookings);
    const available = remaining > 0;
    
    return NextResponse.json({
      available,
      remaining,
      total: totalCapacity,
      actualTotal: totalCapacity,
      existing: existingBookings,
      mongoBookingsCount,
      sheetsBookingsCount,
      segment: eventSegment,
      isUsingLegacyLimit,
      message: available 
        ? `${remaining} tickets remaining` 
        : 'Event is fully booked',
      debug: {
        source: mongoBookingsCount > 0 ? 'MongoDB' : 'Google Sheets',
        mongoCount: mongoBookingsCount,
        sheetsCount: sheetsBookingsCount
      }
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
