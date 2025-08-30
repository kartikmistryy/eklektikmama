"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import BlogCard from "./BlogCard";

const AllStoriesSection = ({ allPosts, featuredPosts }) => {
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

  // Get all posts excluding featured and latest 2
  const getRemainingPosts = () => {
    // Get featured post IDs
    const featuredPostIds = featuredPosts.map(post => post.sys.id);
    
    // Get latest 2 post IDs
    const latestPostIds = [...allPosts]
      .sort((a, b) => new Date(b.sys.createdAt) - new Date(a.sys.createdAt))
      .slice(0, 2)
      .map(post => post.sys.id);
    
    // Filter out featured and latest posts
    const remainingPosts = allPosts.filter(post => 
      !featuredPostIds.includes(post.sys.id) && 
      !latestPostIds.includes(post.sys.id)
    );
    
    console.log('Featured post IDs:', featuredPostIds);
    console.log('Latest post IDs:', latestPostIds);
    console.log('Remaining posts:', remainingPosts);
    
    return remainingPosts;
  };

  const remainingPosts = getRemainingPosts();

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
        {remainingPosts.map((post, index) => (
          <BlogCard key={post.sys.id} post={post} index={index} />
        ))}
      </motion.div>

      {remainingPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No additional blog posts available.</p>
        </div>
      )}
    </section>
  );
};

export default AllStoriesSection;
