"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const GuestBlogSection = ({ guestPosts }) => {
  const guestBlogRef = useRef(null);
  const guestBlogInView = useInView(guestBlogRef, { once: true, amount: 0.2 });

  // Debug logging
  console.log('GuestBlogSection - guestPosts:', guestPosts);
  console.log('GuestBlogSection - guestPosts length:', guestPosts?.length);

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

  const blogCard = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Get image URL helper function
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

  // If no guest posts, don't render the section
  if (!guestPosts || guestPosts.length === 0) {
    return null;
  }

  return (
    <section ref={guestBlogRef} className="w-full h-full flex flex-col lg:px-10 px-5 py-10 text-[#093166]">
      <motion.h2 
        className="md:text-[60px] font-thin text-4xl uppercase font-anton text-center leading-[100%] text-[#093166]"
        initial="hidden"
        animate={guestBlogInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        GUEST BLOG
      </motion.h2>

      <motion.div 
        className="w-full h-full flex flex-col lg:flex-row gap-5 py-10"
        initial="hidden"
        animate={guestBlogInView ? "visible" : "hidden"}
        variants={staggerContainer}
        transition={{ delay: 0.2 }}
      >
        {guestPosts.map((post, index) => {
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
                      Guest Blog
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
        })}
      </motion.div>
    </section>
  );
};

export default GuestBlogSection;
