import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test connection with timeout
    const connectionPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      suggestions: [
        'Check your internet connection',
        'Verify MongoDB Atlas cluster is running',
        'Check IP whitelist in MongoDB Atlas dashboard',
        'Try restarting your development server',
        'Consider using a local MongoDB instance for development'
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
