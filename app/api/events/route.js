import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { createEventSheet } from "@/lib/googleSheets";
import mongoose from "mongoose";

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    console.log('📥 GET /api/events - Starting request');
    
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    console.log('📊 Fetching events from database...');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('📊 Database name:', mongoose.connection.db?.databaseName || 'NOT CONNECTED');
    console.log('📊 Connection URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NOT SET');
    console.log('📊 Collection name: events');
    
    // Check what database we're actually connected to
    if (mongoose.connection.db) {
      const dbName = mongoose.connection.db.databaseName;
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📊 Available collections:', collections.map(c => c.name));
      
      // Check events collection directly
      const eventsCollection = mongoose.connection.db.collection('events');
      const directCount = await eventsCollection.countDocuments();
      console.log(`📊 Direct collection count: ${directCount} events in 'events' collection`);
      
      // Try to get a sample of events directly
      const sampleEvents = await eventsCollection.find({}).limit(5).toArray();
      console.log(`📊 Sample events from direct query: ${sampleEvents.length}`);
      sampleEvents.forEach((e, idx) => {
        console.log(`  Direct ${idx + 1}. "${e.title || 'NO TITLE'}" - ID: ${e._id}`);
      });
    }
    
    // First, get the raw count using the model
    const totalCount = await Event.countDocuments();
    console.log(`📊 Model countDocuments: ${totalCount} events`);
    
    // Then fetch all events
    const events = await Event.find().sort({ date: 1 }).lean();
    console.log(`✅ Found ${events.length} events after query`);
    
    if (totalCount !== events.length) {
      console.warn(`⚠️ WARNING: Count mismatch! Total count: ${totalCount}, Query result: ${events.length}`);
    }
    
    if (events.length > 0) {
      console.log('📅 All events in database:');
      events.forEach((e, idx) => {
        console.log(`  ${idx + 1}. "${e.title}" - ${e.date ? new Date(e.date).toISOString() : 'NO DATE'} (ID: ${e._id})`);
      });
    } else {
      console.log('⚠️ No events found in database. The events collection is empty.');
    }
    
    // Check for any events that might fail serialization
    const validEvents = [];
    const invalidEvents = [];
    
    events.forEach((event, idx) => {
      try {
        // Try to serialize the event
        JSON.stringify(event);
        validEvents.push(event);
      } catch (err) {
        console.error(`❌ Event ${idx + 1} failed serialization:`, err.message);
        console.error('Event data:', event);
        invalidEvents.push({ event, error: err.message });
      }
    });
    
    if (invalidEvents.length > 0) {
      console.warn(`⚠️ ${invalidEvents.length} events failed serialization and will be excluded`);
    }
    
    console.log(`📤 Returning ${validEvents.length} valid events`);
    
    return NextResponse.json(validEvents, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
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
