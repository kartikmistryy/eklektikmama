import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../../../../lib/db';
import Event from '../../../../models/Event';

// GET single event by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    console.log('🔍 Fetching event with ID:', id);
    let event = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log('✅ Valid ObjectId format, searching by _id');
      event = await Event.findById(id);
      console.log('📋 Event found by _id:', event ? 'Yes' : 'No');
    } else {
      console.log('⚠️ Not a valid ObjectId format');
    }

    // Fallback: treat id as slug when not a valid ObjectId or no event found
    if (!event) {
      console.log('🔄 Trying to find event by slug:', id);
      event = await Event.findOne({ slug: id });
      console.log('📋 Event found by slug:', event ? 'Yes' : 'No');
    }
    
    if (!event) {
      console.log('❌ Event not found for ID:', id);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Convert Mongoose document to plain object for JSON serialization
    const eventData = event.toObject ? event.toObject() : event;
    console.log('✅ Event found, returning data');
    return NextResponse.json(eventData);
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    console.error('Error stack:', error.stack);
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