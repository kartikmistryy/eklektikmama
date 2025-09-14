import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const bookingId = params.id;
    
    // Try to find booking by MongoDB ObjectId first, then by transactionId
    let booking;
    
    // Check if it's a valid MongoDB ObjectId format
    if (bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(bookingId).populate('eventId');
    }
    
    // If not found by ObjectId, try by transactionId (Stripe payment intent ID)
    if (!booking) {
      booking = await Booking.findOne({ transactionId: bookingId }).populate('eventId');
    }
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Ticket not found"
      }, { status: 404 });
    }

    // Prepare ticket data
    const ticketData = {
      _id: booking._id,
      ticketNumber: booking.ticketNumber,
      transactionId: booking.transactionId,
      guardianName: booking.guardianName,
      childName: booking.childName,
      userEmail: booking.userEmail,
      phone: booking.phone,
      numberOfTickets: booking.numberOfTickets,
      paymentStatus: booking.paymentStatus,
      photographyConsent: booking.photographyConsent,
      eventTitle: booking.eventId?.title || "Event",
      eventDate: booking.eventId?.date || new Date(),
      createdAt: booking.createdAt
    };

    return NextResponse.json({
      success: true,
      ticket: ticketData
    });

  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch ticket information"
    }, { status: 500 });
  }
}
