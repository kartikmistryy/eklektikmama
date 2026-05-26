import { getAllBlogPosts } from '../../lib/contentful';
import { connectDB } from '../../lib/db';
import LocalEditCategory from '../../models/LocalEditCategory';

export async function GET() {
  const baseUrl = 'https://eklektikmama.com';
  
  // Static pages
  const staticPages = [
    {
      url: '',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: '/events',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: '/whatwedo',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/blogs',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: '/partnershipprogram',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: '/partnershipprogram',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: '/eklektikmamaMembership',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: '/shop',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: '/the-local-edit',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Get The Local Edit category pages
  let localEditPages = [];
  try {
    await connectDB();
    const categories = await LocalEditCategory.find({ isActive: true })
      .select('slug updatedAt')
      .lean();
    localEditPages = categories.map((cat) => ({
      url: `/the-local-edit/${cat.slug}`,
      lastModified: new Date(cat.updatedAt || Date.now()).toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching local edit categories for sitemap:', error);
  }

  // Get blog posts
  let blogPosts = [];
  try {
    const posts = await getAllBlogPosts(100); // Get up to 100 blog posts
    blogPosts = posts.map(post => ({
      url: `/blogs/${post.fields.slug}`,
      lastModified: new Date(post.sys.updatedAt).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Combine all pages
  const allPages = [...staticPages, ...localEditPages, ...blogPosts];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
