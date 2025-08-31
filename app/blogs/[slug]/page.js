import { getBlogPostBySlug, getEklektikBlogPosts } from '../../../lib/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Link from 'next/link';
import Image from 'next/image';
import { BsArrowLeft } from 'react-icons/bs';
import { notFound } from 'next/navigation';

// Helper function to render embedded assets
const renderEmbeddedAsset = (node) => {
  console.log('renderEmbeddedAsset called with:', node);
  
  if (!node.data || !node.data.target) {
    console.error('No target data found in node:', node);
    return null;
  }

  const target = node.data.target;
  console.log('Asset target:', target);
  
  // Extract image data from the correct structure
  let imageUrl = null;
  let imageAlt = null;
  let imageWidth = 800;
  let imageHeight = 600;
  
  // Check if it has the file structure (embedded-asset-block format)
  if (target.fields && target.fields.file) {
    const { url, details } = target.fields.file;
    const { title, description } = target.fields;
    
    console.log('File URL found:', url);
    console.log('File details:', details);
    console.log('Title:', title);
    console.log('Description:', description);
    
    if (url) {
      imageUrl = `https:${url}`;
      imageAlt = description || title || 'Blog content image';
      
      // Extract dimensions if available
      if (details?.image) {
        imageWidth = details.image.width;
        imageHeight = details.image.height;
      }
    }
  }
  // Fallback: check for direct URL field
  else if (target.fields && target.fields.url) {
    const { url, width, height, description, title } = target.fields;
    
    if (url) {
      imageUrl = `https:${url}`;
      imageAlt = description || title || 'Blog content image';
      imageWidth = width || 800;
      imageHeight = height || 600;
    }
  }
  
  if (!imageUrl) {
    console.error('No URL found for embedded asset:', target);
    return null;
  }
  
  console.log('Rendering image with URL:', imageUrl);
  
  return (
    <div className="my-8">
      <img
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-auto rounded-lg shadow-lg"
        style={{ maxWidth: '100%' }}
      />
      {imageAlt && imageAlt !== 'Blog content image' && (
        <p className="text-sm text-gray-500 mt-2 text-center italic">
          {imageAlt}
        </p>
      )}
    </div>
  );
};

// Function to log all node types in content
const logContentStructure = (content) => {
  console.log('=== CONTENT STRUCTURE ANALYSIS ===');
  if (!content || !content.content) {
    console.log('No content or content.content found');
    return;
  }
  
  console.log('Content has', content.content.length, 'top-level nodes');
  content.content.forEach((node, index) => {
    console.log(`Node ${index}:`, {
      nodeType: node.nodeType,
      hasData: !!node.data,
      hasContent: !!node.content,
      marks: node.marks,
      value: node.value
    });
    
    // Log nested content if it exists
    if (node.content && node.content.length > 0) {
      node.content.forEach((nestedNode, nestedIndex) => {
        console.log(`  Nested node ${nestedIndex}:`, {
          nodeType: nestedNode.nodeType,
          hasData: !!nestedNode.data,
          hasContent: !!nestedNode.content,
          marks: nestedNode.marks,
          value: nestedNode.value
        });
      });
    }
  });
};

// Fallback function to manually render content if rich text renderer fails
const renderContentFallback = (content) => {
  console.log('Using fallback content renderer');
  
  if (!content || !content.content) {
    return <p>No content available</p>;
  }
  
  return content.content.map((node, index) => {
    console.log('Fallback processing node:', node);
    
    if (node.nodeType === 'paragraph') {
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {node.content?.map((textNode, textIndex) => 
            textNode.nodeType === 'text' ? textNode.value : null
          ).filter(Boolean)}
        </p>
      );
    }
    
    if (node.nodeType === 'embedded-asset-block') {
      return renderEmbeddedAsset(node);
    }
    
    // Default fallback
    return (
      <div key={index} className="mb-4 p-2 bg-gray-100 rounded text-sm">
        <p>Unsupported content type: {node.nodeType}</p>
        <pre className="text-xs">{JSON.stringify(node, null, 2)}</pre>
      </div>
    );
  });
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getEklektikBlogPosts(100, 0); // Get up to 100 posts for static generation
  
  return posts.map((post) => ({
    slug: post.fields.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  // Try different possible image field names
  const getImageUrl = (post) => {
    if (!post) return null;
    
    const { file, header, featuredImage } = post.fields;
    
    if (file && file.fields && file.fields.file) {
      return `https:${file.fields.file.url}`;
    }
    if (header && header.fields && header.fields.file) {
      return `https:${header.fields.file.url}`;
    }
    if (featuredImage && featuredImage.fields && featuredImage.fields.file) {
      return `https:${featuredImage.fields.file.url}`;
    }
    return null;
  };

  const imageUrl = getImageUrl(post);

  return {
    title: post.fields.title,
    description: post.fields.excerpt || post.fields.title,
    openGraph: {
      title: post.fields.title,
      description: post.fields.excerpt || post.fields.title,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        }
      ] : [],
    },
  };
}

// Custom rendering options for rich text
const renderOptions = {
  renderNode: {
    // Handle document and paragraph nodes
    'document': (node, children) => {
      return children;
    },
    'paragraph': (node, children) => {
      return <p className="text-gray-700 leading-relaxed mb-4">{children}</p>;
    },
    // Handle embedded assets (images, videos, etc.) - multiple possible node types
    'embedded-asset-block': (node) => {
      console.log('Rendering embedded-asset-block:', node.data.target);
      return renderEmbeddedAsset(node);
    },
    'embedded-asset-inline': (node) => {
      console.log('Rendering embedded-asset-inline:', node.data.target);
      return renderEmbeddedAsset(node);
    },
    'asset-hyperlink': (node) => {
      console.log('Rendering asset-hyperlink:', node.data.target);
      return renderEmbeddedAsset(node);
    },
    // Handle embedded entries
    'embedded-entry-block': (node) => {
      const { title, description } = node.data.target.fields;
      return (
        <div className="my-4 p-4 bg-gray-50 rounded-lg border-l-4 border-[#bf378b]">
          <h3 className="font-semibold text-[#093166]">{title}</h3>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
      );
    },
    // Handle hyperlinks
    'hyperlink': (node, children) => {
      const { uri } = node.data;
      return (
        <a
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#bf378b] hover:text-[#093166] underline transition-colors duration-200"
        >
          {children}
        </a>
      );
    },
    // Handle headings
    'heading-1': (node, children) => (
      <h1 className="text-3xl font-bold text-[#093166] mt-8 mb-4">{children}</h1>
    ),
    'heading-2': (node, children) => (
      <h2 className="text-2xl font-bold text-[#093166] mt-6 mb-3">{children}</h2>
    ),
    'heading-3': (node, children) => (
      <h3 className="text-xl font-semibold text-[#093166] mt-4 mb-2">{children}</h3>
    ),
    'heading-4': (node, children) => (
      <h4 className="text-lg font-semibold text-[#093166] mt-3 mb-2">{children}</h4>
    ),
    'heading-5': (node, children) => (
      <h5 className="text-base font-semibold text-[#093166] mt-2 mb-1">{children}</h5>
    ),
    'heading-6': (node, children) => (
      <h6 className="text-sm font-semibold text-[#093166] mt-2 mb-1">{children}</h6>
    ),
    // Handle paragraphs
    'paragraph': (node, children) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    // Handle lists
    'unordered-list': (node, children) => (
      <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
    ),
    'ordered-list': (node, children) => (
      <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
    ),
    'list-item': (node, children) => (
      <li className="text-gray-700">{children}</li>
    ),
    // Handle text formatting
    'text': (node, children) => {
      let text = children;
      if (node.marks && node.marks.length > 0) {
        node.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              text = <strong>{text}</strong>;
              break;
            case 'italic':
              text = <em>{text}</em>;
              break;
            case 'underline':
              text = <u>{text}</u>;
              break;
            case 'code':
              text = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{text}</code>;
              break;
            default:
              console.log('Unknown text mark:', mark.type);
          }
        });
      }
      return text;
    },
    // Handle blockquotes
    'blockquote': (node, children) => (
      <blockquote className="border-l-4 border-[#bf378b] pl-4 py-2 my-4 bg-gray-50 italic text-gray-700">
        {children}
      </blockquote>
    ),
    // Catch-all for unknown node types
    'embedded-asset': (node) => {
      console.log('Processing EMBEDDED_ASSET node:', node);
      return renderEmbeddedAsset(node);
    },
    'embedded-entry': (node) => {
      console.log('Processing EMBEDDED_ENTRY node:', node);
      return renderEmbeddedAsset(node);
    },
    // Catch-all for any unknown node types
    'default': (node, children) => {
      console.log('Processing unknown node type:', node.nodeType, node);
      return <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-700">Unknown content type: {node.nodeType}</p>
        <pre className="text-xs mt-1">{JSON.stringify(node, null, 2)}</pre>
      </div>;
    },
  },
};

const BlogPost = async ({ params }) => {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const { title, excerpt, content, body, file, header, featuredImage, tag, publishedDate, author } = post.fields;



  // Try different possible image field names
  const getImageUrl = () => {
    if (file && file.fields && file.fields.file) {
      return `https:${file.fields.file.url}`;
    }
    if (header && header.fields && header.fields.file) {
      return `https:${header.fields.file.url}`;
    }
    if (featuredImage && featuredImage.fields && featuredImage.fields.file) {
      return `https:${featuredImage.fields.file.url}`;
    }
    return null;
  };

  const getImageAlt = () => {
    if (file && file.fields && file.fields.title) {
      return file.fields.title;
    }
    if (header && header.fields && header.fields.title) {
      return header.fields.title;
    }
    if (featuredImage && featuredImage.fields && featuredImage.fields.title) {
      return featuredImage.fields.title;
    }
    return title;
  };

  const imageUrl = getImageUrl();
  const imageAlt = getImageAlt();

  // Try to get the content from either 'content' or 'body' field
  const blogContent = content || body;

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      {/* <div className="w-full bg-[#093166] text-white py-4">
        <div className="container mx-auto px-5">
          <Link 
            href="/blogs" 
            className="inline-flex items-center text-white hover:text-[#bf378b] transition-colors duration-300"
          >
            <BsArrowLeft className="mr-2" />
            Back to Blogs
          </Link>
        </div>
      </div> */}

      {/* Hero Section */}
      <div className="w-full relative">
        {imageUrl && (
          <div className="w-full h-[80vh] relative overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] to-transparent bg-opacity-40"></div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-10 z-10">
          <div className="container mx-auto">
            <div className="text-white">
              {tag && (
                <span className="inline-block pl-2 border-l-2 border-[#bf378b] py-1 text-base font-medium mb-4 uppercase">
                  {tag}
                </span>
              )}
              <h1 className="text-4xl md:text-6xl font-bold font-anton mb-4 uppercase">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-5 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Article Body */}
          <article className="prose prose-lg max-w-none font-quicksand">
            {blogContent ? (
              documentToReactComponents(blogContent, renderOptions)
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">No content available for this blog post.</p>
                <p className="text-sm text-gray-400 mt-2">Please check the content field in Contentful.</p>
              </div>
            )}
          </article>

          {/* Back to Blogs Button */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <Link
              href="/blogs"
              className="inline-flex items-center px-6 py-3 bg-[#093166] text-white rounded-full hover:bg-[#bf378b] transition-colors duration-300"
            >
              <BsArrowLeft className="mr-2" />
              Back to All Blogs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
