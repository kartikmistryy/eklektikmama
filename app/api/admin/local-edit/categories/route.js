import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import { slugify } from "@/lib/slugify";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const categories = await LocalEditCategory.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description = "", image, imageAlt = "", slug, order = 0, isActive = true } = body;

    if (!title || !image) {
      return NextResponse.json(
        { message: "Title and image are required" },
        { status: 400 }
      );
    }

    let finalSlug = slugify(slug || title);
    if (!finalSlug) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    let suffix = 1;
    let candidate = finalSlug;
    while (await LocalEditCategory.findOne({ slug: candidate })) {
      candidate = `${finalSlug}-${suffix++}`;
    }

    const category = await LocalEditCategory.create({
      title,
      description,
      image,
      imageAlt,
      slug: candidate,
      order,
      isActive,
    });

    return NextResponse.json(
      { message: "Category created successfully", category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
