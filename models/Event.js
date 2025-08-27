import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  description: String,
  coverImage: String, // URL to uploaded image
  date: { type: Date, required: true },
  endDate: Date,
  price: Number,
  location: String,
  createdAt: { type: Date, default: Date.now },
});

// Generate a URL-friendly slug from the title
function generateSlug(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

EventSchema.pre('save', async function (next) {
  if (!this.isModified('title') && this.slug) return next();
  const base = generateSlug(this.title || 'event');
  let candidate = base;
  let counter = 1;
  while (await mongoose.models.Event.findOne({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${base}-${counter++}`;
  }
  this.slug = candidate;
  next();
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
