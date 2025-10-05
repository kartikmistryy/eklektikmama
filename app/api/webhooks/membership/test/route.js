import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }, { status: 200 });
}

export async function POST(req) {
  try {
    const body = await req.json();
    return NextResponse.json({ 
      message: 'Test webhook received',
      received: body,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Test webhook error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}

