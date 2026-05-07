import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import LocalEditListing from "@/models/LocalEditListing";
import { slugify } from "@/lib/slugify";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  try {
    const { id } = params;
    await connectDB();
    const category = await LocalEditCategory.findById(id);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    const body = await request.json();
    const { title, description, image, imageAlt, slug, order, isActive } = body;

    const existing = await LocalEditCategory.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    if (title !== undefined) existing.title = title;
    if (description !== undefined) existing.description = description;
    if (image !== undefined) existing.image = image;
    if (imageAlt !== undefined) existing.imageAlt = imageAlt;
    if (order !== undefined) existing.order = order;
    if (isActive !== undefined) existing.isActive = isActive;

    if (slug !== undefined) {
      const newSlug = slugify(slug);
      if (newSlug && newSlug !== existing.slug) {
        let candidate = newSlug;
        let suffix = 1;
        while (
          await LocalEditCategory.findOne({ slug: candidate, _id: { $ne: id } })
        ) {
          candidate = `${newSlug}-${suffix++}`;
        }
        existing.slug = candidate;
      }
    }

    await existing.save();
    return NextResponse.json({ message: "Category updated", category: existing });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    const category = await LocalEditCategory.findById(id);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    await LocalEditListing.deleteMany({ category: id });
    await LocalEditCategory.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
