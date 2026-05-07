import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import LocalEditListing from "@/models/LocalEditListing";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  try {
    const { id } = params;
    await connectDB();
    const listing = await LocalEditListing.findById(id).populate(
      "category",
      "title slug"
    );
    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }
    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    const body = await request.json();
    const { category, title, description, image, imageAlt, link, order, isActive } = body;

    const existing = await LocalEditListing.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    if (category !== undefined) {
      const categoryDoc = await LocalEditCategory.findById(category);
      if (!categoryDoc) {
        return NextResponse.json(
          { message: "Selected category does not exist" },
          { status: 400 }
        );
      }
      existing.category = category;
    }

    if (title !== undefined) existing.title = title;
    if (description !== undefined) existing.description = description;
    if (image !== undefined) existing.image = image;
    if (imageAlt !== undefined) existing.imageAlt = imageAlt;
    if (link !== undefined) existing.link = link;
    if (order !== undefined) existing.order = order;
    if (isActive !== undefined) existing.isActive = isActive;

    await existing.save();
    return NextResponse.json({ message: "Listing updated", listing: existing });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    const listing = await LocalEditListing.findById(id);
    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    await LocalEditListing.findByIdAndDelete(id);
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
