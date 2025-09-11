import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";

export async function POST(req) {
  try {
    await connectDB();
    
    const { qrData } = await req.json();
    
    if (!qrData) {
      return NextResponse.json({
        success: false,
        error: "QR code data is required"
      }, { status: 400 });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: "Invalid QR code format"
      }, { status: 400 });
    }

    const { eventId, transactionId, email, ticketNumber } = parsedData;

    // Find the booking by transaction ID or email
    let booking;
    if (transactionId) {
      booking = await Booking.findOne({ transactionId }).populate('eventId');
    } else if (email && eventId) {
      booking = await Booking.findOne({ 
        userEmail: email, 
        eventId 
      }).populate('eventId');
    } else {
      return NextResponse.json({
        success: false,
        error: "Insufficient data to find ticket"
      }, { status: 400 });
    }

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Ticket not found"
      }, { status: 404 });
    }

    // Verify ticket number if provided
    if (ticketNumber && booking.ticketNumber !== ticketNumber) {
      return NextResponse.json({
        success: false,
        error: "Ticket number mismatch"
      }, { status: 400 });
    }

    // Prepare ticket information
    const ticketInfo = {
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
      eventLocation: booking.eventId?.location || "",
      eventDescription: booking.eventId?.description || "",
      eventPrice: booking.eventId?.price || 0,
      createdAt: booking.createdAt,
      isValid: booking.paymentStatus === 'paid'
    };

    return NextResponse.json({
      success: true,
      ticket: ticketInfo,
      message: "Ticket found successfully"
    });

  } catch (error) {
    console.error("Error processing QR scan:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to process QR code"
    }, { status: 500 });
  }
}
