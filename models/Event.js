import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  description: String,
  coverImage: String, // URL to uploaded image
  date: { type: Date, required: true },
  startTime: { type: String }, // Store time as string (HH:MM format)
  endDate: Date,
  endTime: { type: String }, // Store time as string (HH:MM format)
  price: Number,
  location: String,
  segment: { 
    type: String, 
    required: true,
    enum: ['cinemaMorning', 'mamaBreakfast', 'festiveMornings', 'mamaFit', 'eklektikEdit', 'familyDay', 'coffeeMeetup'],
    default: 'cinemaMorning'
  },
  isMembersOnly: { type: Boolean, default: false }, // Flag for member-only events
  message: String, // Custom message for eklektik edit events
  meetingLink: String, // Meeting link for eklektik edit events
  bookingDeadline: Date, // Deadline for booking (after this date, Book Now button is disabled)
  seats: { type: Number, required: true, min: 1 }, // Number of available seats for this event
  hasMenuSelection: { type: Boolean, default: false }, // For festiveMornings: determines if form should have menu selection
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
