import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

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
      endDate: body.endDate || body.date,
      price: body.price,
      location: body.location,
    });

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
