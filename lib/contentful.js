import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export default client;

// Fetch all blog posts
export async function getAllBlogPosts(limit = 12, skip = 0) {
  try {
    const response = await client.getEntries({
      content_type: 'blogs',
      order: '-sys.createdAt',
      limit: limit,
      skip: skip,
    });
    console.log('All posts response:', response.items);
    console.log('First post fields:', response.items[0]?.fields);
    return response.items;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Fetch total count of blog posts
export async function getBlogPostsCount() {
  try {
    const response = await client.getEntries({
      content_type: 'blogs',
      limit: 0,
    });
    return response.total;
  } catch (error) {
    console.error('Error fetching blog posts count:', error);
    return 0;
  }
}

// Fetch a single blog post by slug
export async function getBlogPostBySlug(slug) {
  try {
    console.log('Fetching blog post with slug:', slug);
    console.log('Contentful client config:', {
      space: process.env.CONTENTFUL_SPACE_ID ? 'Set' : 'Not set',
      token: process.env.CONTENTFUL_ACCESS_TOKEN ? 'Set' : 'Not set'
    });
    
    const response = await client.getEntries({
      content_type: 'blogs',
      'fields.slug': slug,
      limit: 1,
      include: 10, // Include more nested entries and assets
    });
    
    console.log('Single post response received');
    console.log('Response total:', response.total);
    console.log('Response includes:', response.includes);
    
    if (response.items[0]) {
      console.log('Single post fields:', Object.keys(response.items[0].fields));
      console.log('Content field type:', typeof response.items[0].fields.content);
      console.log('Body field type:', typeof response.items[0].fields.body);
      
      // Log the full response structure for debugging
      console.log('Full post structure:', JSON.stringify(response.items[0], null, 2));
    } else {
      console.log('No post found with slug:', slug);
    }
    
    return response.items[0] || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    return null;
  }
}

// Fetch featured blog posts (segment = 'featured')
export async function getFeaturedBlogPosts() {
  try {
    const response = await client.getEntries({
      content_type: 'blogs',
      'fields.segment': 'featured',
      order: '-sys.createdAt',
      limit: 3,
    });
    console.log('Featured posts response:', response.items);
    console.log('Featured post fields:', response.items[0]?.fields);
    return response.items;
  } catch (error) {
    console.error('Error fetching featured blog posts:', error);
    return [];
  }
}

// Fetch eklektik blog posts (segment = 'eklektik')
export async function getEklektikBlogPosts(limit = 12, skip = 0) {
  try {
    const response = await client.getEntries({
      content_type: 'blogs',
      'fields.segment': 'eklektik',
      order: '-sys.createdAt',
      limit: limit,
      skip: skip,
    });
    console.log('Eklektik posts response:', response.items);
    console.log('Eklektik post fields:', response.items[0]?.fields);
    return response.items;
  } catch (error) {
    console.error('Error fetching eklektik blog posts:', error);
    return [];
  }
}

// Fetch guest blog posts (segment = 'guests' or 'guest')
export async function getGuestBlogPosts(limit = 12, skip = 0) {
  try {
    // Try both 'guests' and 'guest' to handle different naming conventions
    const response = await client.getEntries({
      content_type: 'blogs',
      'fields.segment[in]': 'guests,guest',
      order: '-sys.createdAt',
      limit: limit,
      skip: skip,
    });
    console.log('Guest posts response:', response.items);
    console.log('Guest post fields:', response.items[0]?.fields);
    return response.items;
  } catch (error) {
    console.error('Error fetching guest blog posts:', error);
    return [];
  }
}

// Fetch all posts without segment filtering (for debugging)
export async function getAllPostsWithoutSegment(limit = 12, skip = 0) {
  try {
    const response = await client.getEntries({
      content_type: 'blogs',
      order: '-sys.createdAt',
      limit: limit,
      skip: skip,
    });
    console.log('All posts without segment filter:', response.items);
    console.log('All posts segments:', response.items.map(post => post.fields.segment));
    return response.items;
  } catch (error) {
    console.error('Error fetching all posts without segment:', error);
    return [];
  }
}

// Fetch blog posts by category
export async function getBlogPostsByCategory(category) {
  try {
    const response = await client.getEntries({
      content_type: 'blogs',
      'fields.category': category,
      order: '-sys.createdAt',
    });
    return response.items;
  } catch (error) {
    console.error('Error fetching blog posts by category:', error);
    return [];
  }
}
