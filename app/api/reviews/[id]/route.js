import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

// GET single review
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const review = await Review.findById(params.id);
    
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      review: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT update review
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { text, stars, isActive, displayOrder } = body;
    
    // Validation
    if (stars && (stars < 1 || stars > 5)) {
      return NextResponse.json({
        success: false,
        error: 'Stars must be between 1 and 5'
      }, { status: 400 });
    }
    
    const review = await Review.findByIdAndUpdate(
      params.id,
      { text, stars, isActive, displayOrder },
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      review: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE review
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const review = await Review.findByIdAndDelete(params.id);
    
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
