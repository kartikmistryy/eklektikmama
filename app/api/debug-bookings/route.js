import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Event from '@/models/Event';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const transactionId = searchParams.get('transactionId');
    const email = searchParams.get('email');
    
    let query = {};
    if (eventId) {
      query.eventId = eventId;
    }
    if (transactionId) {
      query.transactionId = transactionId;
    }
    if (email) {
      // Search for email (case-insensitive)
      query.userEmail = { $regex: new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
    }
    
    // Get all bookings matching the query
    const bookings = await Booking.find(query)
      .populate('eventId', 'title date segment')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Count total bookings
    const totalCount = await Booking.countDocuments(query);
    
    // Count bookings for the event if eventId provided
    let eventBookingsCount = null;
    if (eventId) {
      eventBookingsCount = await Booking.countDocuments({ eventId });
    }
    
    return NextResponse.json({
      success: true,
      query,
      totalCount,
      eventBookingsCount,
      bookings: bookings.map(b => ({
        _id: b._id,
        transactionId: b.transactionId,
        eventId: b.eventId?._id || b.eventId,
        eventTitle: b.eventId?.title,
        eventDate: b.eventId?.date,
        guardianName: b.guardianName,
        userEmail: b.userEmail,
        numberOfTickets: b.numberOfTickets,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
