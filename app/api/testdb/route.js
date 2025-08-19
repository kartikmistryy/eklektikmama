import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: "✅ Database connected successfully!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}   