"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const BlogCard = ({ post, index }) => {
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true, amount: 0.2 });

  const blogCard = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: index * 0.1 }
    }
  };

  const { title, slug, tag, file, header, featuredImage } = post.fields;
  
  // Debug logging
  console.log('BlogCard post fields:', post.fields);
  console.log('Image fields available:', { file, header, featuredImage });
  
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
  
  return (
    <motion.div 
      ref={cardRef}
      className="w-full h-full flex flex-col gap-5"
      initial="hidden"
      animate={cardInView ? "visible" : "hidden"}
      variants={blogCard}
    >
      <Link href={`/blogs/${slug}`} className="block">
        <div className="w-full h-full relative overflow-hidden rounded-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full min-h-full max-h-[300px] overflow-hidden object-cover object-top transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#bf378b] to-[#093166] flex items-center justify-center">
              <span className="text-white text-2xl font-bold">No Image</span>
            </div>
          )}
          <div className="absolute top-5 left-5">
            <span className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out uppercase">
              {tag || 'Blog'}
            </span>
          </div>
        </div>
      </Link>
      <Link href={`/blogs/${slug}`} className="block">
        <h4 className="md:text-lg text-sm font-poppins uppercase hover:text-[#bf378b] transition-colors duration-300">
          {title}
        </h4>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
