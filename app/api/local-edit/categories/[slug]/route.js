import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import LocalEditListing from "@/models/LocalEditListing";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  try {
    const { slug } = params;
    await connectDB();

    const category = await LocalEditCategory.findOne({ slug, isActive: true });
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const listings = await LocalEditListing.find({
      category: category._id,
      isActive: true,
    }).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ category, listings });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
