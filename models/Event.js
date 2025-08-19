import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  coverImage: String, // URL to uploaded image
  date: { type: Date, required: true },
  endDate: Date,
  price: Number,
  location: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
