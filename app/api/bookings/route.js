import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find({})
      .populate('eventId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings: bookings.map(booking => ({
        id: booking._id,
        eventTitle: booking.eventId?.title || 'Event not found',
        guardianName: booking.guardianName,
        childName: booking.childName,
        userEmail: booking.userEmail,
        phone: booking.phone,
        numberOfTickets: booking.numberOfTickets,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
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
