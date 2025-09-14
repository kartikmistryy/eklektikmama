import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';

export async function GET(req) {
  try {
    await connectDB();
    
    // Get all members with pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const status = searchParams.get('status'); // Filter by status if provided
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const members = await Membership.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-stripeCustomerId -stripeSubscriptionId -stripePriceId'); // Exclude sensitive data
    
    const total = await Membership.countDocuments(query);
    
    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
