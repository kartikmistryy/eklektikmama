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
    const response = await client.getEntries({
      content_type: 'blogs',
      'fields.slug': slug,
      limit: 1,
    });
    console.log('Single post response:', response.items[0]);
    console.log('Single post fields:', response.items[0]?.fields);
    return response.items[0] || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
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

// Fetch guest blog posts (segment = 'guest')
export async function getGuestBlogPosts(limit = 12, skip = 0) {
  try {
    const response = await client.getEntries({
      content_type: 'blogs',
      'fields.segment': 'guest',
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
