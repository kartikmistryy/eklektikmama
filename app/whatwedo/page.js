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
  const introRef = useRef(null);
  const pastEventsRef = useRef(null);
  const brandSectionRef = useRef(null);

  // InView hooks
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const introInView = useInView(introRef, { once: true, amount: 0.3 });
  const pastEventsInView = useInView(pastEventsRef, { once: true, amount: 0.2 });
  const brandSectionInView = useInView(brandSectionRef, { once: true, amount: 0.3 });

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

  const tagButton = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const eventCard = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const imageStack = {
    hidden: { opacity: 0, rotate: -5 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <section ref={heroRef} className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/headerBg/eklekticaf.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <motion.div 
          className="w-full h-full grow min-h-full flex flex-col items-center justify-center"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            WHAT REALLY
            <br />
            <b className="md:text-[100px] text-[60px]">WENT DOWN</b>
          </h1>
        </motion.div>
        <Marquee />
      </section>

      <section ref={introRef} className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white py-10 lg:gap-0 gap-10">
        <motion.div 
          className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full lg:pl-14 md:pr-0 px-5 text-[#093166]"
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">
            Unleashed
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio leading-[100%]">
            Relive <br />
            <b className="font-anton font-bold">The moments.</b>
          </h2>
          <p className="lg:text-base text-sm font-quicksand font-medium mt-6 md:w-[95%] w-full">
            The moments that make memories, the mums who make it magical, the
            madness that makes it all worth it
            <br /> <br />
            (in the best way).
            <br /> <br />
            Think of it as our brag wall—but for stuff that matters.
          </p>
        </motion.div>
        <motion.div id="target"
          className="w-full h-full flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0"
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={imageStack}
          transition={{ delay: 0.3 }}
        >
          <span className="md:w-[350px] md:h-[450px] w-[250px] h-[300px] relative">
            {/* Image 1 - Left movement */}
            <motion.div
              animate={{
                x: [0, -30, 0],
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0
              }}
              className="absolute top-26 md:-left-[200px] left-32 md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px]"
            >
              <Image
                src="/highlights/s1.webp"
                height={500}
                width={400}
                className="w-full h-full object-contain"
                alt="image"
              />
            </motion.div>

            {/* Image 2 - Up and down movement */}
            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
              className="absolute top-[70px] md:left-[0] left-[-50px] md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px]"
            >
              <Image
                src="/highlights/s2.webp"
                height={500}
                width={400}
                className="w-full h-full object-contain"
                alt="image"
              />
            </motion.div>

            {/* Image 3 - Center movement */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 7,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2
              }}
              className="absolute top-[50px] md:left-[160px] left-0 md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px]"
            >
              <Image
                src="/highlights/s3.webp"
                height={500}
                width={400}
                className="w-full h-full object-contain"
                alt="image"
              />
            </motion.div>

            {/* Image 4 - Sun with rotation and subtle movement */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: 3
              }}
              className="absolute md:top-[0%] top-[30%] md:right-[-40%] right-[-35%] md:w-[100px] md:h-[100px] w-[80px] h-[80px]"
            >
              <Image
                src="/highlights/sun.webp"
                height={500}
                width={400}
                className="w-full h-full object-contain"
                alt="image"
              />
            </motion.div>
          </span>
        </motion.div>
      </section>

      <section ref={pastEventsRef} className="w-full h-full flex flex-col py-10 lg:gap-0 gap-10">
        <motion.div 
          className="w-full h-full flex flex-col text-[#093166] md:pr-0 lg:px-10 px-5"
          initial="hidden"
          animate={pastEventsInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio leading-[100%]">
            see <b className="font-antonio font-bold">Past events.</b>
          </h2>
          <p className="font-quicksand font-semibold uppercase text-base mt-5">
            Tags / Filters
          </p>
        </motion.div>
        <motion.div 
          className="flex flex-wrap gap-3 max-w-[1000px] lg:px-10 px-5 my-5"
          initial="hidden"
          animate={pastEventsInView ? "visible" : "hidden"}
          variants={staggerContainer}
          transition={{ delay: 0.2 }}
        >
          {[
            { text: "BYOBaby™ Mama Breakfast", active: false },
            { text: "BYOBaby™ Cinema Morning", active: false },
            { text: "Community Events", active: false },
            { text: "BYOBaby™ MaMA Fit", active: false },
            { text: "Eklektik Edit", active: false },
            { text: "Do Not BYOBaby™ Mama Nights", active: false },
            { text: "View All", active: true }
          ].map((tag, index) => (
            <motion.span
              key={index}
              className={`px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] transition-colors duration-300 ${
                tag.active 
                  ? 'bg-[#bf378b] text-white' 
                  : 'bg-transparent hover:bg-[#bf378b] text-[#093166]'
              }`}
              variants={tagButton}
            >
              {!tag.active && <b className="mr-2">{tag.text.split(' ')[0]}</b>}
              {tag.active ? tag.text : tag.text.split(' ').slice(1).join(' ')}
            </motion.span>
          ))}
        </motion.div>

        <motion.div 
          className="w-full h-full flex md:flex-row flex-col flex-wrap gap-4 justify-start lg:px-10 px-5 py-5"
          initial="hidden"
          animate={pastEventsInView ? "visible" : "hidden"}
          variants={staggerContainer}
          transition={{ delay: 0.4 }}
        >
          {[2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
            <motion.div
              key={index}
              className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]"
              variants={eventCard}
            >
              <Image
                src={`/highlights/${num}.webp`}
                width={500}
                height={300}
                alt="img"
                className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
              />
              <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                  EVENT NAME
                </h4>
                <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                  VIEW ALL
                  <BsArrowRight className="text-lg font-bold" />
                </button>
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section ref={brandSectionRef} className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white  lg:gap-0 gap-10">
        <motion.div 
          className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 md:pr-0 px-5 text-[#093166] py-10"
          initial="hidden"
          animate={brandSectionInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">
            Powered by mums
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio leading-[100%]">
            <b className="font-anton font-light tracking-tight">want </b>
            <br />
            your <b className="font-bold">brand here?</b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            Our events put your brand right in the middle of a loyal, engaged
            community of mums who give a damn. Sponsor a morning, own a night,
            or activate something bold — we&apos;ll make sure they remember you for
            all the right reasons.
          </p>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-6 px-3 md:text-base text-sm flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100"
          >
            WORK WITH US <BsArrowRight className="ml-2 md:text-2xl text-lg" />
          </Link>
        </motion.div>
        <motion.div 
          className="w-full self-stretch flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0 bg-[url('/highlights/brand.webp')] bg-cover bg-center min-h-full"
          initial="hidden"
          animate={brandSectionInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        ></motion.div>
      </section>
    </div>
  );
};

export default Page;
