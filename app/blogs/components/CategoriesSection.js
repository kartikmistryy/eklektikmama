"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const CategoriesSection = ({ allPosts, guestPosts = [] }) => {
  const categoriesRef = useRef(null);
  const categoriesInView = useInView(categoriesRef, { once: true, amount: 0.2 });
  const [activeTag, setActiveTag] = useState('All');

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const categoryButton = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const blogCard = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Get unique tags from posts (excluding guest posts)
  const nonGuestPosts = allPosts.filter(post => !guestPosts.some(guestPost => guestPost.sys.id === post.sys.id));
  const tags = [...new Set(nonGuestPosts.map(post => post.fields.tag).filter(Boolean))];
  
  // Get the 2 latest posts filtered by active tag (excluding guest posts)
  const getLatestPosts = () => {
    let filteredPosts = nonGuestPosts;
    
    // Filter by active tag if not 'All'
    if (activeTag !== 'All') {
      filteredPosts = nonGuestPosts.filter(post => post.fields.tag === activeTag);
    }
    
    return [...filteredPosts]
      .sort((a, b) => new Date(b.sys.createdAt) - new Date(a.sys.createdAt))
      .slice(0, 2);
  };

  const latestPosts = getLatestPosts();


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

  const getImageAlt = (post) => {
    if (!post) return '';
    
    const { file, header, featuredImage, title } = post.fields;
    
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

  const handleTagClick = (tag) => {
    setActiveTag(tag);
  };

  return (
    <section ref={categoriesRef} className="w-full h-full flex flex-col lg:px-10 px-5">
      <motion.div 
        className="w-full h-fit flex flex-col items-start justify-start"
        initial="hidden"
        animate={categoriesInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <p className="font-quicksand font-semibold text-base">Categories</p>
        <motion.span 
          className="w-full h-fit flex flex-row gap-3 flex-wrap mt-6"
          variants={staggerContainer}
        >
          <motion.button
            onClick={() => handleTagClick('All')}
            className={`w-fit h-[40px] px-4 lg:text-base text-sm flex items-center justify-center rounded-[18px] my-0 border-2 transition-colors duration-500 ease-in-out scale-100 ${
              activeTag === 'All'
                ? 'text-white bg-[#bf378b] border-[#bf378b]'
                : 'text-[#093166] border-[#bf378b] bg-transparent hover:text-white hover:bg-[#bf378b]'
            }`}
            variants={categoryButton}
          >
            All
          </motion.button>
          {tags.map((tag, index) => (
            <motion.button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`w-fit h-[40px] px-4 lg:text-base text-sm flex items-center justify-center rounded-[18px] my-0 border-2 transition-colors duration-500 ease-in-out scale-100 ${
                activeTag === tag
                  ? 'text-white bg-[#bf378b] border-[#bf378b]'
                  : 'text-[#093166] border-[#bf378b] bg-transparent hover:text-white hover:bg-[#bf378b]'
              }`}
              variants={categoryButton}
            >
              {tag}
            </motion.button>
          ))}
        </motion.span>
      </motion.div>

      <motion.div 
        className="w-full h-full flex flex-col lg:flex-row gap-5 py-10 text-[#093166]"
        initial="hidden"
        animate={categoriesInView ? "visible" : "hidden"}
        variants={staggerContainer}
        transition={{ delay: 0.3 }}
      >
        {latestPosts.length > 0 ? (
          latestPosts.map((post, index) => {
            const imageUrl = getImageUrl(post);
            const imageAlt = getImageAlt(post);
            
            return (
              <motion.div 
                key={post.sys.id}
                className="w-full h-full lg:basis-1/2 flex flex-col gap-5"
                variants={blogCard}
              >
                <Link href={`/blogs/${post.fields.slug}`} className="block">
                  <div className="w-full relative overflow-hidden rounded-lg">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        className="w-full h-full max-h-[350px] object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#bf378b] to-[#093166] flex items-center justify-center">
                        <span className="text-white md:text-2xl text-sm font-bold">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-5 left-5">
                      <span className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75 uppercase">
                        {post.fields.tag || 'Blog'}
                      </span>
                    </div>
                  </div>
                </Link>
                <Link href={`/blogs/${post.fields.slug}`} className="block">
                  <h4 className="md:text-xl text-base font-poppins uppercase hover:text-[#bf378b] transition-colors duration-300">
                    {post.fields.title}
                  </h4>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="w-full text-center py-20">
            <p className="text-xl text-gray-500">No posts found for this tag.</p>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default CategoriesSection;
