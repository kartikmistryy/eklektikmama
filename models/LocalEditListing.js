import mongoose from "mongoose";

const LocalEditListingSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LocalEditCategory",
    required: true,
    index: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  image: { type: String, required: true },
  imageAlt: { type: String, default: "" },
  link: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

LocalEditListingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.LocalEditListing ||
  mongoose.model("LocalEditListing", LocalEditListingSchema);
