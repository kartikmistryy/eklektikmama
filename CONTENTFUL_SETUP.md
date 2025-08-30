# Contentful Setup for Eklektik Mama Blog

This document explains how to set up Contentful for the blog functionality.

## Environment Variables

Make sure you have the following environment variables in your `.env` file:

```env
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_ACCESS_TOKEN=your_access_token_here
```

## Content Model Setup

You need to create a content type called `blogs` in your Contentful space with the following fields:

### Required Fields:

1. **title** (Short text)
   - Field ID: `title`
   - Required: Yes
   - Description: The title of the blog post

2. **slug** (Short text)
   - Field ID: `slug`
   - Required: Yes
   - Description: URL-friendly version of the title (e.g., "my-blog-post")
   - Validation: Unique values only

3. **content** (Rich text)
   - Field ID: `content`
   - Required: Yes
   - Description: The main content of the blog post

4. **file** (Media - Single asset)
   - Field ID: `file`
   - Required: No
   - Description: Cover image for the blog post

5. **segment** (Short text)
   - Field ID: `segment`
   - Required: Yes
   - Description: Determines where the blog appears
   - Values: 
     - `featured` - Shows in featured section
     - `eklektik` - Shows in main blog grid
     - `guest` - Shows in guest posts section

### Optional Fields:

6. **excerpt** (Long text)
   - Field ID: `excerpt`
   - Required: No
   - Description: Short summary of the blog post

7. **category** (Short text)
   - Field ID: `category`
   - Required: No
   - Description: Category of the blog post (e.g., "Tips", "Health", "Community")

8. **author** (Short text)
   - Field ID: `author`
   - Required: No
   - Description: Author of the blog post

9. **publishedDate** (Date)
   - Field ID: `publishedDate`
   - Required: No
   - Description: Publication date of the blog post

## Content Type Settings

- **Content Type ID**: `blogs`
- **Name**: Blog Post
- **Description**: Blog posts for the Eklektik Mama website

## Segment-Based Display Logic

The blog system uses the `segment` field to determine where posts appear:

- **Featured Section**: Posts with `segment = 'featured'` appear in the hero featured section
- **Main Blog Grid**: Posts with `segment = 'eklektik'` appear in the main blog listing with pagination
- **Guest Posts**: Posts with `segment = 'guest'` can be used for guest author content

## API Usage

The blog functionality uses the following Contentful API endpoints:

- **Featured Posts**: Fetches posts with `segment = 'featured'`
- **Eklektik Posts**: Fetches posts with `segment = 'eklektik'` with pagination
- **Guest Posts**: Fetches posts with `segment = 'guest'`
- **Single Post**: Fetches a specific post by slug
- **Posts by Category**: Fetches posts filtered by category

## Features

1. **Dynamic Blog Pages**: Each blog post gets its own page at `/blogs/[slug]`
2. **Static Generation**: Blog pages are pre-rendered at build time for better performance
3. **SEO Optimization**: Each blog post includes proper meta tags and Open Graph data
4. **Rich Text Rendering**: Blog content is rendered using Contentful's Rich Text renderer
5. **Responsive Design**: Blog pages are fully responsive
6. **Image Optimization**: Cover images are optimized and responsive
7. **Pagination**: Main blog listing includes pagination (9 posts per page)
8. **Segment-Based Filtering**: Different content types appear in different sections

## Troubleshooting

If you encounter issues:

1. **Check Environment Variables**: Ensure your Contentful credentials are correct
2. **Content Model**: Verify that your content type matches the expected structure
3. **API Limits**: Check if you've hit Contentful's API rate limits
4. **Field Names**: Ensure field IDs match exactly (case-sensitive)
5. **Segment Values**: Make sure segment values are exactly: `featured`, `eklektik`, or `guest`

## Example Blog Post

Here's an example of how to structure a blog post in Contentful:

```json
{
  "title": "Buckle Up, Mama: Car Seat Safety Just Got Simpler",
  "slug": "car-seat-safety-simplified",
  "excerpt": "Everything you need to know about keeping your little ones safe on the road.",
  "content": "Your rich text content here...",
  "category": "Tips",
  "segment": "featured",
  "author": "Eklektik Mama Team",
  "publishedDate": "2024-01-15",
  "file": {
    "url": "https://images.ctfassets.net/...",
    "title": "Car seat safety",
    "description": "A child safely secured in a car seat"
  }
}
```

## Pagination

The main blog page includes pagination with the following features:

- 9 posts per page
- Previous/Next navigation
- Page numbers with ellipsis for large page counts
- Current page indicator
- Post count display
- URL-based pagination (e.g., `/blogs?page=2`)
