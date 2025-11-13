import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../../../../lib/db';
import Event from '../../../../models/Event';

// GET single event by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    let event = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      event = await Event.findById(id);
    }

    // Fallback: treat id as slug when not a valid ObjectId or no event found
    if (!event) {
      event = await Event.findOne({ slug: id });
    }
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update event by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const updateData = await req.json();
    
    // Find the existing event
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Remove slug from update data to prevent it from being changed
    delete updateData.slug;
    
    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // If title changed, regenerate slug by calling save() to trigger pre('save') hook
    if (updateData.title && updateData.title !== existingEvent.title) {
      // The pre('save') hook will automatically regenerate the slug
      await updatedEvent.save();
    }
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE event by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}