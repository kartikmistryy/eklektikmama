"use client";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FeaturedSection = ({ featuredPosts }) => {
  const featuredRef = useRef(null);
  const featuredInView = useInView(featuredRef, { once: true, amount: 0.3 });

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const featuredPost = featuredPosts[0];

  // Debug logging
  console.log('FeaturedSection featuredPosts:', featuredPosts);
  console.log('FeaturedSection featuredPost:', featuredPost);

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

  const imageUrl = getImageUrl(featuredPost);
  const imageAlt = getImageAlt(featuredPost);

  return (
    <section ref={featuredRef} className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white lg:gap-0 gap-10">
      <motion.div 
        className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 md:pr-0 px-5 text-[#093166] py-10"
        initial="hidden"
        animate={featuredInView ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <p className="font-quicksand font-semibold text-base uppercase">
          Unfiltered Blogs
        </p>
        <h2 className="md:text-[80px] font-thin text-5xl uppercase font-anton leading-[100%]">
          FEATURED
          <b className="font-antonio font-normal tracking-tight ml-3">POST</b>
        </h2>

        {featuredPost ? (
          <>
            <p className="font-antonio font-normal tracking-tight lg:text-5xl md:text-3xl text-xl uppercase w-[75%] mt-5">
              {featuredPost.fields.title}
            </p>
            {featuredPost.fields.excerpt && (
              <p className="text-gray-600 mt-4 max-w-md">
                {featuredPost.fields.excerpt}
              </p>
            )}
            <Link
              href={`/blogs/${featuredPost.fields.slug}`}
              className="w-fit md:h-[45px] h-[40px] px-6 md:text-base text-sm flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100"
            >
              READ MORE <BsArrowRight className="ml-2 text-2xl" />
            </Link>
          </>
        ) : (
          <p className="font-antonio font-normal tracking-tight lg:text-5xl md:text-3xl text-xl uppercase w-[75%] mt-5">
            No Featured Posts Available
          </p>
        )}
      </motion.div>
      <motion.div 
        className="w-full self-stretch flex flex-col justify-center items-center md:basis-1/2 basis-full pr-0 min-h-full lg:rounded-tl-xl lg:rounded-bl-xl overflow-hidden"
        initial="hidden"
        animate={featuredInView ? "visible" : "hidden"}
        variants={fadeIn}
        transition={{ delay: 0.3 }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[url('/blogs/featured.webp')] bg-cover bg-center"></div>
        )}
      </motion.div>
    </section>
  );
};

export default FeaturedSection;
