import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const event = await Event.findOne({ slug });
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


