import mongoose from "mongoose";

const HighlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photos: [{ type: String, required: true }], // Array of photo URLs (up to 10)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Highlight || mongoose.model("Highlight", HighlightSchema);
