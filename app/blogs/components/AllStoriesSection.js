"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import BlogCard from "./BlogCard";

const AllStoriesSection = ({ allPosts, featuredPosts, guestPosts = [] }) => {
  const allStoriesRef = useRef(null);
  const allStoriesInView = useInView(allStoriesRef, { once: true, amount: 0.2 });

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

  // Get all posts from all sections and sort by latest updated
  const getAllPostsSorted = () => {
    // Combine all posts from different sections
    const allPostsCombined = [
      ...(allPosts || []),
      ...(featuredPosts || []),
      ...(guestPosts || [])
    ];
    
    // Remove duplicates by post ID
    const uniquePosts = [];
    const seenIds = new Set();
    
    allPostsCombined.forEach(post => {
      if (!seenIds.has(post.sys.id)) {
        seenIds.add(post.sys.id);
        uniquePosts.push(post);
      }
    });
    
    // Sort by updatedAt (latest updated first), fallback to createdAt if updatedAt is not available
    const sortedPosts = uniquePosts.sort((a, b) => {
      const dateA = a.sys.updatedAt || a.sys.createdAt;
      const dateB = b.sys.updatedAt || b.sys.createdAt;
      return new Date(dateB) - new Date(dateA);
    });
    
    console.log('All posts combined:', sortedPosts.length);
    console.log('Sorted by latest updated to oldest');
    
    return sortedPosts;
  };

  const allPostsSorted = getAllPostsSorted();

  return (
    <section ref={allStoriesRef} className="w-full h-full flex flex-col lg:px-10 px-5 py-10 text-[#093166]">
      <motion.h2 
        className="md:text-[60px] font-thin text-4xl uppercase font-anton text-center leading-[100%] text-[#093166]"
        initial="hidden"
        animate={allStoriesInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        ALL STORIES
      </motion.h2>

      <motion.div 
        className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-10"
        initial="hidden"
        animate={allStoriesInView ? "visible" : "hidden"}
        variants={staggerContainer}
        transition={{ delay: 0.2 }}
      >
        {allPostsSorted.map((post, index) => (
          <BlogCard key={post.sys.id} post={post} index={index} />
        ))}
      </motion.div>

      {allPostsSorted.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No blog posts available.</p>
        </div>
      )}
    </section>
  );
};

export default AllStoriesSection;
