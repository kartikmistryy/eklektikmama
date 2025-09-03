import { connectDB } from '@/lib/db';
import Highlight from '@/models/Highlight';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Highlight ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if highlight exists
    const highlight = await Highlight.findById(id);
    if (!highlight) {
      return NextResponse.json(
        { message: 'Highlight not found' },
        { status: 404 }
      );
    }

    // Delete the highlight
    await Highlight.findByIdAndDelete(id);
    
    console.log(`Highlight deleted: ${highlight.title} (ID: ${id})`);
    
    return NextResponse.json(
      { message: 'Highlight deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
