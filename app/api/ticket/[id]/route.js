import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const bookingId = params.id;
    
    // Find the booking by ID
    const booking = await Booking.findById(bookingId).populate('eventId');
    
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
      qrCodeDataUrl: booking.qrCodeDataUrl,
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
