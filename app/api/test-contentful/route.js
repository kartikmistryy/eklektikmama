import { NextResponse } from 'next/server';
import client from '../../../lib/contentful';

export async function GET() {
  try {
    // Test basic connection
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    console.log('Space info:', space.name);
    
    // Test fetching a blog post
    const response = await client.getEntries({
      content_type: 'blogs',
      limit: 1,
      include: 2,
    });
    
    console.log('Test response:', response);
    console.log('First item fields:', response.items[0]?.fields);
    
    return NextResponse.json({
      success: true,
      space: space.name,
      blogCount: response.total,
      samplePost: response.items[0] ? {
        title: response.items[0].fields.title,
        slug: response.items[0].fields.slug,
        hasContent: !!response.items[0].fields.content,
        hasBody: !!response.items[0].fields.body,
        contentStructure: response.items[0].fields.content ? 'content' : 'body',
        fields: Object.keys(response.items[0].fields)
      } : null
    });
  } catch (error) {
    console.error('Contentful test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

