import { connectDB } from '@/lib/db';
import Highlight from '@/models/Highlight';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    
    const { title, description, photos } = await request.json();
    
    // Validation
    if (!title || !description || !photos || photos.length < 6) {
      return NextResponse.json(
        { message: 'Title, description, and at least 6 photos are required' },
        { status: 400 }
      );
    }

    if (photos.length > 10) {
      return NextResponse.json(
        { message: 'Maximum 10 photos allowed' },
        { status: 400 }
      );
    }

    // Create new highlight
    const highlight = new Highlight({
      title,
      description,
      photos
    });

    await highlight.save();

    return NextResponse.json(
      { message: 'Highlight created successfully', highlight },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    // Get all highlights, sorted by creation date (newest first)
    const highlights = await Highlight.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(highlights);
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
