import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { createEventSheet } from "@/lib/googleSheets";

// CREATE new event
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

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
      message: body.message,
      meetingLink: body.meetingLink,
      bookingDeadline: body.bookingDeadline,
      seats: body.seats,
    });

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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET all events
export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ date: 1 });
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
