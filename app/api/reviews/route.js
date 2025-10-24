import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

// GET all reviews
export async function GET() {
  try {
    await connectDB();
    
    const reviews = await Review.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      reviews: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST new review
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { text, stars, isActive = true, displayOrder = 0 } = body;
    
    // Validation
    if (!text || !stars) {
      return NextResponse.json({
        success: false,
        error: 'Text and stars are required'
      }, { status: 400 });
    }
    
    if (stars < 1 || stars > 5) {
      return NextResponse.json({
        success: false,
        error: 'Stars must be between 1 and 5'
      }, { status: 400 });
    }
    
    const review = new Review({
      text,
      stars,
      isActive,
      displayOrder
    });
    
    await review.save();
    
    return NextResponse.json({
      success: true,
      review: review
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
