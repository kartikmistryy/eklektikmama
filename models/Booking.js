import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  guardianName: String,
  childName: String,
  userEmail: String,
  phone: String,
  numberOfTickets: { type: Number, default: 1 },
  transactionId: String,
  qrCodeDataUrl: String,
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
