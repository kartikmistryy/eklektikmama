import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const booking = await Booking.findById(id).populate('eventId', 'title date segment location');
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Return booking with proper field names for the frontend
    const bookingData = {
      _id: booking._id,
      transactionId: booking.transactionId,
      eventId: booking.eventId?._id || booking.eventId,
      eventTitle: booking.eventId?.title,
      eventDate: booking.eventId?.date,
      eventSegment: booking.eventId?.segment,
      eventLocation: booking.eventId?.location,
      guardianName: booking.guardianName || '',
      childName: booking.childName || '',
      userEmail: booking.userEmail || '',
      phone: booking.phone || '',
      numberOfTickets: booking.numberOfTickets || 1,
      paymentStatus: booking.paymentStatus || 'pending',
      totalAmount: booking.totalAmount || 0,
      currency: booking.currency || 'AED',
      isMember: booking.isMember || false,
      memberSavings: booking.memberSavings || 0,
      ticketNumbers: booking.ticketNumbers || [],
      ticketNumber: booking.ticketNumber,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      // For backward compatibility with popup
      memberName: booking.guardianName || '',
      // Additional fields
      photographyConsent: booking.photographyConsent,
      additionalData: booking.additionalData || {}
    };

    return NextResponse.json(bookingData);
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
