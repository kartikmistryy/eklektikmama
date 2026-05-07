import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import LocalEditListing from "@/models/LocalEditListing";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const query = categoryId ? { category: categoryId } : {};
    const listings = await LocalEditListing.find(query)
      .populate("category", "title slug")
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      category,
      title,
      description = "",
      image,
      imageAlt = "",
      link,
      order = 0,
      isActive = true,
    } = body;

    if (!category || !title || !image || !link) {
      return NextResponse.json(
        { message: "Category, title, image and link are required" },
        { status: 400 }
      );
    }

    const categoryDoc = await LocalEditCategory.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { message: "Selected category does not exist" },
        { status: 400 }
      );
    }

    const listing = await LocalEditListing.create({
      category,
      title,
      description,
      image,
      imageAlt,
      link,
      order,
      isActive,
    });

    return NextResponse.json(
      { message: "Listing created successfully", listing },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
