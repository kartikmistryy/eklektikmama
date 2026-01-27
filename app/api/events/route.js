import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { createEventSheet } from "@/lib/googleSheets";
import mongoose from "mongoose";

// Allow caching with 30 second revalidation for better performance
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

// CREATE new event
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    console.log('Creating event with data:', {
      title: body.title,
      segment: body.segment,
      seats: body.seats,
      date: body.date
    });

    const newEvent = await Event.create({
      title: body.title,
      description: body.description,
      coverImage: body.coverImage,
      date: body.date,
      startTime: body.startTime,
      endDate: body.endDate || body.date,
      endTime: body.endTime,
      price: body.price,
      location: body.location,
      segment: body.segment,
      isMembersOnly: body.isMembersOnly || false,
      message: body.message,
      meetingLink: body.meetingLink,
      bookingDeadline: body.bookingDeadline,
      seats: body.seats,
      hasMenuSelection: body.hasMenuSelection || false,
      menuSelections: body.menuSelections || [],
    });

    console.log('Event created successfully:', newEvent._id);

    // Create event-specific Google Sheet
    try {
      const sheetInfo = await createEventSheet(newEvent);
      console.log('Event sheet created:', sheetInfo);
    } catch (sheetError) {
      console.error('Error creating event sheet:', sheetError);
      // Don't fail the event creation if sheet creation fails
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error('Error creating event:', err);
    console.error('Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET all events
export async function GET() {
  try {
    await connectDB();
    
    // Fetch all events sorted by date
    const events = await Event.find().sort({ date: 1 }).lean();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Found ${events.length} events`);
    }
    
    return NextResponse.json(events, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    });
  } catch (err) {
    console.error('❌ Error in GET /api/events:', err);
    console.error('Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    return NextResponse.json(
      { 
        error: err.message || 'Failed to fetch events',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}
