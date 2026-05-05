import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const categories = await LocalEditCategory.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching public categories:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
