"use client";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import Marquee from "../components/Marquee";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Page = () => {
  // Refs for animations
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const categoriesRef = useRef(null);
  const featuredPostsRef = useRef(null);
  const allStoriesRef = useRef(null);

  // InView hooks
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuredInView = useInView(featuredRef, { once: true, amount: 0.3 });
  const categoriesInView = useInView(categoriesRef, { once: true, amount: 0.2 });
  const featuredPostsInView = useInView(featuredPostsRef, { once: true, amount: 0.2 });
  const allStoriesInView = useInView(allStoriesRef, { once: true, amount: 0.2 });

  // Animation variants
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

  const categoryButton = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <section ref={heroRef} className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/headerBg/unfiltered.webp')] bg-cover bg-center pt-20">
        <motion.div 
          className="w-full h-full grow min-h-full flex flex-col items-center justify-center"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            Unfiltered AF
          </h1>
        </motion.div>
        
        <Marquee/>
      </section>

      <section ref={featuredRef} className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white  lg:gap-0 gap-10">
        <motion.div 
          className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 md:pr-0 px-5 text-[#093166] py-10"
          initial="hidden"
          animate={featuredInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base">
            Unfiltered Blogs
          </p>
          <h2 className="md:text-[80px] font-thin text-5xl uppercase font-anton leading-[100%]">
            FEATURED
            <b className="font-antonio font-normal tracking-tight ml-3">POST</b>
          </h2>

          <p className="font-antonio font-normal tracking-tight lg:text-5xl md:text-3xl text-xl  uppercase w-[75%] mt-5">
            Buckle Up, Mama: Car Seat Safety Just Got Simpler
          </p>
          <Link
            href="/"
            className="w-fit h-[45px] px-6 text-base flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
          >
            READ MORE <BsArrowRight className="ml-2 text-2xl" />
          </Link>
        </motion.div>
        <motion.div 
          className="w-full self-stretch flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0 bg-[url('/blogs/featured.webp')] bg-cover bg-center min-h-full lg:rounded-tl-xl lg:rounded-bl-xl"
          initial="hidden"
          animate={featuredInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        ></motion.div>
      </section>

      <section ref={categoriesRef} className="w-full h-full flex flex-col lg:px-10 px-5">
        <motion.div 
          className="w-full h-fit flex flex-col items-start justify-start"
          initial="hidden"
          animate={categoriesInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base">Categories</p>
          <motion.span 
            className="w-full h-fit flex flex-row gap-3 flex-wrap"
            variants={staggerContainer}
          >
            {["Tips", "Health", "Community", "Insights", "Lifestyle"].map((category, index) => (
              <motion.a
                key={category}
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
                variants={categoryButton}
              >
                {category}
              </motion.a>
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
          <motion.div 
            className="w-full h-full lg:basis-1/2 flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[350px] bg-[url('/blogs/f1.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="text-xl font-poppins uppercase">
              Let&apos;s Talk About Sex in Motherhood (After Kids Ruined It)
            </h4>
          </motion.div>

          <motion.div 
            className="w-full h-full lg:basis-1/2 flex flex-col gap-5"
            variants={blogCard}
          >
            <span
              className="w-full min-h-[350px] bg-[url('/blogs/f2.webp')] bg-cover p-5
             bg-center rounded-lg"
            >
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="text-xl font-poppins uppercase">
              Let&apos;s Talk About Sex in Motherhood (After Kids Ruined It)
            </h4>
          </motion.div>
        </motion.div>
      </section>

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
          {/* Card 1 */}
          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/1.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              Postnatal Depression: The Truth, the Tears and the Support You
              Deserve
            </h4>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/2.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              Reclaiming Strength: Postpartum Fitness for Real Mamas
            </h4>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/3.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              The Parenting Styles Mamas Are Embracing: A Fresh Look at Gentle
              Parenting
            </h4>
          </motion.div>

          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/4.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              The Power Within: Wellness & Empowerment for Mamas
            </h4>
          </motion.div>

          {/* Card 5 */}
          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/5.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              The Love We Give: A Mother&apos;s Day Reflection
            </h4>
          </motion.div>

          {/* Card 6 */}
          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/6.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              Motherhood & Ramadan: Navigating the Holy Month with Little Ones
            </h4>
          </motion.div>

          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/7.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              Things We Swore We&apos;d Never Do as Mums... and Now We Do
            </h4>
          </motion.div>

          {/* Card 8 */}
          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/8.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              The Must-Have Survival Playbook for Abu Dhabi Mums
            </h4>
          </motion.div>

          {/* Card 9 */}
          <motion.div 
            className="w-full h-full flex flex-col gap-5"
            variants={blogCard}
          >
            <span className="w-full min-h-[300px] md:min-h-[350px] bg-[url('/blogs/9.webp')] bg-cover bg-center rounded-lg p-5">
              <a
                href="#"
                className="w-fit h-[40px] px-4 text-base flex items-center justify-center text-white hover:text-[#093166] rounded-[20px] border-2 border-white bg-transparent hover:bg-white transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              >
                Tips
              </a>
            </span>
            <h4 className="md:text-lg text-sm font-poppins uppercase">
              Motherhood & Ramadan: Navigating the Holy Month with Little Ones
            </h4>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Page;
