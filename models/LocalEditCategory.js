import mongoose from "mongoose";

const LocalEditCategorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "" },
  image: { type: String, required: true },
  imageAlt: { type: String, default: "" },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

LocalEditCategorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.LocalEditCategory ||
  mongoose.model("LocalEditCategory", LocalEditCategorySchema);
