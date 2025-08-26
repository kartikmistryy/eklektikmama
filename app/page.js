"use client";
import { useState } from "react";
import { BsArrowRight, BsPlus } from "react-icons/bs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { delay, motion } from "framer-motion";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const [glitchTrigger, setGlitchTrigger] = useState(0);

   const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto glitch effect for cards
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchTrigger(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Glitch effect variants for cards
  const glitchVariants = {
    rest: {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    glitch: {
      x: [0, -4, 4, -2, 2, 0],
      y: [0, 2, -2, 1, -1, 0],
      opacity: [1, 0.8, 0.9, 0.7, 0.9, 1],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Individual glitch variants for each card with different timing
  const card1Variants = {
    rest: {
      x: 0,
      y: 0,
      rotate: -9,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    glitch: {
      x: [0, -5, 5, -3, 3, 0],
      y: [0, 3, -3, 2, -2, 0],
      opacity: [1, 0.8, 0.9, 0.7, 0.9, 1],
      rotate: [-9, -11, -7, -11, -7, -9],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const card2Variants = {
    rest: {
      x: 0,
      y: 24,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    glitch: {
      x: [0, -6, 6, -4, 4, 0],
      y: [24, 28, 20, 28, 20, 24],
      opacity: [1, 0.7, 0.8, 0.6, 0.8, 1],
      transition: {
        duration: 0.35,
        ease: "easeInOut"
      }
    }
  };

  const card3Variants = {
    rest: {
      x: 0,
      y: 56,
      rotate: -6,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    glitch: {
      x: [0, -7, 7, -5, 5, 0],
      y: [56, 60, 52, 60, 52, 56],
      opacity: [1, 0.6, 0.7, 0.5, 0.7, 1],
      rotate: [-6, -8, -4, -8, -4, -6],
      transition: {
        duration: 0.45,
        ease: "easeInOut"
      }
    }
  };

  const card4Variants = {
    rest: {
      x: 0,
      y: 0,
      rotate: 9,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    glitch: {
      x: [0, -5, 5, -3, 3, 0],
      y: [0, 4, -4, 2, -2, 0],
      opacity: [1, 0.8, 0.9, 0.7, 0.9, 1],
      rotate: [9, 11, 7, 11, 7, 9],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  // 

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const floatVariants = {
    initial: { y: 0 },
    float: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rotateVariants = {
    initial: { rotate: 0 },
    rotate: {
      rotate: [0, -5, 0, 5, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#231f20] lg:pt-[120px] pt-[120px] relative overflow-hidden">
      <section className="w-full h-full flex flex-col items-center justify-start relative overflow-visible">
        {/* this one  */}
        <div className="w-full h-full flex flex-col relative lg:pb-[240px] md:pb-[160px] pb-[80px] overflow-visible">
          {/* <main className="w-full h-full flex items-center justify-start lg:pt-[30px] md:pt-[120px] pt-[80px] relative px-5 overflow-visible">
            <div className="w-full h-full lg:max-w-[1000px] md:max-w-[600px] max-w-[380px] mx-auto relative overflow-visible z-[30]">

              <div className="absolute flex justify-center items-center md:-top-14 -top-12 -left-5 md:-left-14 w-[150px] lg:w-[120px] h-fit z-[60]">
                <Image
                  src="/homepage/statue.webp"
                  alt="Statue"
                  width={100}
                  height={150}
                  className="object-contain rotate-[-5deg] md:w-fit md:h-fit md:max-h-[160px] w-[70px] h-[80px] z-[90]"
                />
              </div>


              <h1 className="lg:text-[6.5rem] md:text-[4rem] text-4xl tracking-tight leading-[130%] font-anton font-bold uppercase text-white relative z-0 px-[0px]">
                Shaking Up Mamahood, <br />
                <b className="lg:text-[10rem] md:text-[5rem] text-4xl">
                  your way
                </b>
              </h1>

              <div className="md:absolute relative  lg:top-[110px] md:top-[70px] lg:left-[57%] md:left-[45%] lg:scale-100 md:scale-90 scale-70 flex space-x-[-40px] z-10 overflow-visible">
                <Image
                  src="/homepage/card1.webp"
                  alt="Image 1"
                  width={120}
                  height={190}
                  className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md rotate-[-9deg] shadow-lg z-[1]"
                />
                <Image
                  src="/homepage/card2.webp"
                  alt="Image 2"
                  width={130}
                  height={190}
                  className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] translate-y-6 rounded-md rotate-[0] shadow-lg overflow-visible z-[2]"
                />
                <Image
                  src="/homepage/card3.webp"
                  alt="Image 3"
                  width={130}
                  height={190}
                  className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md rotate-[-6deg] translate-y-14 shadow-lg overflow-visible z-[1]"
                />
                <Image
                  src="/homepage/card4.webp"
                  alt="Image 4"
                  width={130}
                  height={190}
                  className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md rotate-[9deg] shadow-lg overflow-visible"
                />
              </div>
            </div>
          </main> */}

<main className="w-full h-full flex items-center justify-start lg:pt-[30px] md:pt-[120px] pt-[80px] relative px-5 overflow-visible">
      <div className="w-full h-full lg:max-w-[1000px] md:max-w-[600px] max-w-[380px] mx-auto relative overflow-visible z-[30]">
        {/* Statue Image */}
        <div className="absolute flex justify-center items-center md:-top-14 -top-14 -left-16 md:-left-14 w-[150px] lg:w-[120px] h-fit z-[60]">
          <Image
            src="/homepage/statue.webp"
            alt="Statue"
            width={100}
            height={150}
            className="object-contain md:w-fit md:h-fit md:max-h-[160px] w-[70px] h-[80px] z-[90]"
          />
        </div>

        {/* Heading */}
        <h1 className="lg:text-[6.5rem] md:text-[4rem] text-4xl tracking-tight leading-[130%] font-anton font-bold uppercase text-white relative z-0 px-[0px]">
          Shaking Up Mamahood, <br />
          <b className="lg:text-[10rem] md:text-[5rem] text-4xl">
            your way
          </b>
        </h1>

        {/* Overlapping Images after text */}
        <div   className="md:absolute relative lg:top-[110px] md:top-[70px] lg:left-[57%] md:left-[45%] lg:scale-100 md:scale-90 scale-70 flex space-x-[-40px] z-10 overflow-visible">
          {/* Card 1 */}
          <motion.div
            key={`card1-${glitchTrigger % 3 === 0 ? glitchTrigger : 0}`}
            variants={card1Variants}
            initial="rest"
            animate={glitchTrigger % 3 === 0 ? "glitch" : "rest"}
            className="relative"
          >
            <Image
              src="/homepage/card1.webp"
              alt="Image 1"
              width={120}
              height={190}
              className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md shadow-lg z-[1]"
            />
          </motion.div>
          
          {/* Card 2 */}
          <motion.div
            key={`card2-${glitchTrigger % 4 === 0 ? glitchTrigger : 0}`}
            variants={card2Variants}
            initial="rest"
            animate={glitchTrigger % 4 === 0 ? "glitch" : "rest"}
            className="relative"
          >
            <Image
              src="/homepage/card2.webp"
              alt="Image 2"
              width={130}
              height={190}
              className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md shadow-lg overflow-visible z-[2]"
            />
          </motion.div>
          
          {/* Card 3 */}
          <motion.div
            key={`card3-${glitchTrigger % 5 === 0 ? glitchTrigger : 0}`}
            variants={card3Variants}
            initial="rest"
            animate={glitchTrigger % 5 === 0 ? "glitch" : "rest"}
            className="relative"
          >
            <Image
              src="/homepage/card3.webp"
              alt="Image 3"
              width={130}
              height={190}
              className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md shadow-lg overflow-visible z-[1]"
            />
          </motion.div>
          
          {/* Card 4 */}
          <motion.div
            key={`card4-${glitchTrigger % 6 === 0 ? glitchTrigger : 0}`}
            variants={card4Variants}
            initial="rest"
            animate={glitchTrigger % 6 === 0 ? "glitch" : "rest"}
            className="relative"
          >
            <Image
              src="/homepage/card4.webp"
              alt="Image 4"
              width={130}
              height={190}
              className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md shadow-lg overflow-visible"
            />
          </motion.div>
        </div>
      </div>
    </main>

          <motion.p initial={{opacity: 0, y: "40px"}} whileInView={{opacity: 1, y: 0}} transition={{type: 'keyframes', duration: 0.6, }} className="max-w-[600px] mx-auto font-quicksand lg:mt-10 md:mt-24 mt-5 px-4 text-center text-white lg:text-lg md:text-base text-sm">
            Welcome to Eklektik Mama™, where motherhood meets rebellion. A home
            for bold mums, BYOBaby™ events, unapologetic blogs, and gear you
            didn’t know you needed.
          </motion.p>

          <motion.Link
          initial={{opacity: 0, y: "40px"}} whileInView={{opacity: 1, y: 0}} transition={{type: 'keyframes', duration: 0.4, delay: 0.5 }}
            href="/"
            className="w-[190px] h-[45px] text-base flex items-center justify-center uppercase mx-auto text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
            
          >
            VIEW EVENTS
          </motion.Link>
        </div>

        {/* Need to hide their overdlow */}
        <Image
          src="/homepage/pinkpaper.webp"
          height={400}
          width={600}
          className="w-fit absolute md:bottom-[-2vw] md:left-[-100px] bottom-[-100px] left-[-60px] rotate-0 z-[1] overflow-hidden"
        />
        <Image
          src="/homepage/whitepaper.webp"
          height={1500}
          width={1500}
          className="w-full absolute bottom-0 left-0 rotate-0 z-[2] overflow-hidden"
        />
        <Image
          src="/homepage/bluepaper.webp"
          height={400}
          width={600}
          className="w-fit absolute bottom-[-180px] right-[-100px] rotate-0 z-[1] overflow-hidden"
        />
      </section>

      <section className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white py-10 lg:gap-0 gap-10 z-30">
        <div className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 md:pr-0 px-5 text-[#093166]">
          <p className="font-quicksand font-semibold uppercase text-base">
            About Us
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-anton leading-[100%]">
            why{" "}
            <b className="font-antonio font-normal tracking-tight">
              we’re here
            </b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            Because being a mum doesn’t mean disappearing into soft pastels,
            sugar-coated advice, or a WhatsApp group that only talks about nap
            schedules. Eklektik Mama™ was born from the chaos — the 3AM feeds,
            the unfiltered rants, the fierce need for community that actually
            gets it.
            <br />
            We’re here for bold mums who crave more than just “mommy & me” — who
            want real conversations, real connection, and a little rebellion
            with their baby wipes. Through BYOBaby™ events, unapologetic blog
            posts, and gear you didn’t know you needed, we’re building something
            that feels like solidarity (not sanitised sisterhood).
            <br />
            This isn’t a parenting platform. It’s a movement. And if that sounds
            like your kind of mess — welcome home.
          </p>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
          >
            LEARN MORE ABOUT US{" "}
            <BsArrowRight className="ml-2 md:text-2xl text-lg" />
          </Link>
        </div>
        <div className="w-full h-full flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0">
          <motion.span 
      className="md:w-[350px] md:h-[450px] w-[250px] h-[300px] relative lg:scale-100 scale-90"
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {/* First Image - Floating animation */}
      <motion.div
        variants={imageVariants}
        animate="visible"
        initial="hidden"
        className="absolute top-0 md:left-[-150px] left-[-50px] md:w-full md:h-full w-[250px] h-[300px] md:max-w-[350px] md:max-h-[450px]"
      >
        <motion.div
          variants={floatVariants}
          initial="initial"
          animate="float"
        >
          <Image
            src="/homepage/img3.webp"
            height={500}
            width={400}
            alt="image"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>

      {/* Second Image - Subtle pulse animation */}
      <motion.div
        variants={imageVariants}
        animate="visible"
        initial="hidden"
        className="absolute top-0 md:left-0 left-10 md:w-full md:h-full w-[250px] h-[300px] md:max-w-[350px] md:max-h-[450px]"
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="pulse"
        >
          <Image
            src="/homepage/img2.webp"
            height={500}
            width={400}
            alt="image"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>

      {/* Evil Eye - Rotating animation */}
      <motion.div
        className="absolute md:bottom-[-50px] bottom-[-20px] md:left-[-100px] left-[0px] md:w-[200px] md:h-[200px] w-[120px] h-[120px] rotate-infinite"
      >
        <motion.div
          variants={rotateVariants}
          initial="initial"
          animate="rotate"
        >
          <Image
            src="/homepage/evileye.webp"
            height={500}
            width={400}
            alt="image"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>

      {/* Branding - Floating with slight rotation */}
      <motion.div
        variants={imageVariants}
        animate="visible"
        initial="hidden"
        className="absolute md:top-[30%] top-[30%] md:right-[-30%] right-[-35%] md:w-[200px] md:h-[200px] w-[120px] h-[120px]"
      >
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, -2, 0, 2, 0],
          }}
          transition={{
            y: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <Image
            src="/homepage/branding.png"
            height={500}
            width={400}
            alt="image"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>
    </motion.span>
        </div>
      </section>

      <section className="w-full h-full flex flex-col bg-white md:px-10 px-5">
        <motion.div 
          initial={{opacity: 0, y: "40px"}} whileInView={{opacity: 1, y: 0}} transition={{type: 'keyframes', duration: 0.4, }}
         className="w-full h-full flex flex-col text-[#093166] lg:px-10 px-5 pt-10">
          <p className="font-quicksand font-semibold uppercase text-base">
            Step right into
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio tracking-tighter leading-[100%]">
            The Good <b className="font-anton tracking-normal">Stuff</b>
          </h2>
        </motion.div>
        <div className="w-full h-full lg:px-10 py-10 hidden [@media(min-width:1060px)]:block">
          <Carousel
            opts={{
              align: "start",
              slidesToScroll: 1, // scrolls 1 page at a time
              loop: true,
            }}
            
          >
            <CarouselContent >
              <CarouselItem
                id="1"
                className="w-full h-full grid grid-cols-3 gap-5 basis-[75%]"
              >
                <div className="bg-pink-400 w-full h-full min-h-[400px] col-span-2 p-3 rounded-sm flex flex-row gap-5 overflow-hidden">
                  <Image
                    src="/homepage/party.webp"
                    width={500}
                    height={500}
                    alt="img"
                    className="basis-1/2 rounded-md w-full h-full object-cover object-center max-h-[400px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative basis-1/2">
                    <Image
                      src="/homepage/pen.webp"
                      width={150}
                      height={150}
                      alt="img"
                      className="absolute bottom-14 right-[-20] w-fit h-fit"
                    />
                    <h4 className="uppercase font-poppins font-bold text-4xl text-white">
                      Get Eklektik <br /> AF
                    </h4>
                    <p className="text-base font-quicksand text-white font-medium">
                      Ready for early access, cheeky discounts, and WhatsApp
                      group chaos you’ll actually enjoy? Membership starts at
                      AED 50/month.
                    </p>
                    <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm bg-white rounded-full font-medium font-poppins flex flex-row items-center justify-start gap-5 px-3 py-1.5 ">
                        JOIN THE MEMBERSHIP{" "}
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className="bg-white rounded-full p-1 text-2xl font-bold">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>
                <div className="w-full h-full min-h-[400px] flex flex-col col-span-1 p-3 rounded-sm border-2 border-[#093166]">
                  <Image
                    src="/homepage/mum.webp"
                    width={500}
                    height={300}
                    alt="img"
                    className="rounded-md w-full h-[170px] object-cover object-center max-h-[200px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      What’s On
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-semibold">
                      BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                      convos. View this month’s line-up or miss out.
                    </p>
                    <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 ">
                        SEE THE LINEUP{" "}
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className="bg-white rounded-full p-1 text-2xl font-bold border-[1px] border-[#093166]">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>

                <div className="w-full h-full flex flex-row col-span-3 min-h-[300px] p-3 rounded-sm gap-5 border-2 border-[#093166]">
                  <Image
                    src="/homepage/vibes.webp"
                    width={500}
                    height={500}
                    alt="img"
                    className="basis-1/2 rounded-md w-full h-full object-cover object-center max-h-[400px] max-w-[200px]"
                  />
                  <Image
                    src="/homepage/board.webp"
                    width={500}
                    height={500}
                    alt="img"
                    className="basis-1/2 rounded-md w-full h-full object-cover object-center max-h-[400px] max-w-[400px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative basis-1/2">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      Unfiltered blogs
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-medium">
                      Our blog. Therapy-adjacent. Censorship-free.
                    </p>
                    <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm bg-[#093166] text-white rounded-full font-medium font-poppins flex flex-row items-center justify-start gap-5 px-3 py-1.5 ">
                        READ THE BLOG
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className=" rounded-full p-1 text-2xl font-bold border-[1px] border-[#093166] text-[#093166]">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>
              </CarouselItem>
              <CarouselItem
                id="2"
                className="w-full grid grid-cols-1 gap-5 basis-[25%] self-stretch"
              >
                <div className="bg-[#093166] w-full min-h-[400px] p-3 rounded-sm flex flex-col">
                  {/* Image Section */}
                  <Image
                    src="/homepage/bag.webp"
                    width={500}
                    height={300}
                    alt="img"
                    className="rounded-md w-full h-auto max-h-[400px] object-cover object-center"
                  />

                  {/* Text Section */}
                  <span className="py-4 w-full flex flex-col justify-start items-start relative flex-grow">
                    <Image
                      src="/homepage/flower.webp"
                      width={130}
                      height={130}
                      alt="img"
                      className="absolute bottom-14 right-10"
                    />
                    <h4 className="uppercase font-poppins font-bold text-4xl text-white">
                      Shop drops
                    </h4>
                    <p className="text-base font-quicksand text-white font-semibold">
                      Downloads for surviving the mess and thriving anyway. No
                      pastels. No pandering.
                    </p>

                    {/* Buttons */}
                    <span className="w-full mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 border border-white">
                        SHOP THE DROP{" "}
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className="rounded-full p-1 text-2xl font-bold border-[1px] border-white text-white">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>
              </CarouselItem>
              <CarouselItem
                id="3"
                className="w-full self-stretch gap-5 basis-[75%]"
              >
                <div className="bg-pink-400 w-full h-full flex flex-col self-stretch col-span-2 p-3 rounded-sm gap-5 overflow-hidden">
                  <Image
                    src="/homepage/package.webp"
                    width={500}
                    height={500}
                    alt="img"
                    className="basis-1/2 rounded-md w-full h-auto object-cover object-center max-h-[400px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-white">
                      EKLEKTIK MAMA LOVES
                    </h4>
                    <p className="text-base font-quicksand text-white font-medium">
                      The ones that get the chaos, the coffee cravings, the
                      identity crises, and the joy that comes with it all. These
                      are the brands that show up, stand out, and actually give
                      a damn. Think everyday magic, minus the pastel pandering.
                      If they&apos;re on this list, it means they passed the
                      vibe check - hard.
                    </p>
                    <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm bg-white rounded-full font-medium font-poppins flex flex-row items-center justify-start gap-5 px-3 py-1.5 ">
                        explore our partners
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className="bg-white rounded-full p-1 text-2xl font-bold">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="text-[#093166] border-2 border-[#093166]" />
            <CarouselNext className="text-[#093166] border-2 border-[#093166]" />
          </Carousel>
        </div>

        <div className="block [@media(min-width:1060px)]:hidden px-5 py-10">
          <Carousel
            opts={{
              align: "start",
              slidesToScroll: 1,
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {/* Page 1: Get Eklektik AF */}
              <CarouselItem className="basis-full">
                <div className="bg-pink-400 w-full min-h-[420px] p-4 rounded-sm flex flex-col gap-3">
                  <div className="w-full h-[220px] sm:h-[250px]">
                    <Image
                      src="/homepage/party.webp"
                      width={500}
                      height={300}
                      alt="img"
                      className="rounded-md w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="uppercase font-poppins font-bold text-2xl text-white">
                    Get Eklektik AF
                  </h4>
                  <p className="text-base font-quicksand text-white font-medium">
                    Ready for early access, cheeky discounts, and WhatsApp group
                    chaos you’ll actually enjoy? Membership starts at AED
                    50/month.
                  </p>
                  <div className="mt-auto flex flex-row items-center justify-between">
                    <button className="text-sm bg-white rounded-full font-medium font-poppins flex flex-row items-center justify-start gap-3 px-3 py-1.5">
                      JOIN THE MEMBERSHIP{" "}
                      <BsArrowRight className="text-lg font-bold" />
                    </button>
                    <button className="bg-white rounded-full p-1 text-2xl font-bold">
                      <BsPlus />
                    </button>
                  </div>
                </div>
              </CarouselItem>

              {/* Page 2: What’s On */}
              <CarouselItem className="basis-full">
                <div className="bg-white w-full min-h-[420px] p-4 rounded-sm flex flex-col gap-3 border-2 border-[#093166]">
                  <div className="w-full h-[220px] sm:h-[250px]">
                    <Image
                      src="/homepage/mum.webp"
                      width={500}
                      height={300}
                      alt="img"
                      className="rounded-md w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="uppercase font-poppins font-bold text-2xl text-[#093166]">
                    What’s On
                  </h4>
                  <p className="text-base font-quicksand text-[#093166] font-semibold">
                    BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                    convos. View this month’s line-up or miss out.
                  </p>
                  <div className="mt-auto flex flex-row items-center justify-between">
                    <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] gap-3 px-3 py-1.5">
                      SEE THE LINEUP{" "}
                      <BsArrowRight className="text-lg font-bold" />
                    </button>
                    <button className="bg-white rounded-full p-1 text-2xl font-bold border border-[#093166] text-[#093166]">
                      <BsPlus />
                    </button>
                  </div>
                </div>
              </CarouselItem>

              {/* Page 3: Unfiltered Blogs */}
              <CarouselItem className="basis-full">
                <div className="bg-white w-full min-h-[420px] p-4 rounded-sm flex flex-col gap-3 border-2 border-[#093166]">
                  <div className="w-full h-[220px] sm:h-[250px] flex gap-2">
                    <Image
                      src="/homepage/vibes.webp"
                      width={500}
                      height={300}
                      alt="img"
                      className="rounded-md w-1/2 h-full object-cover"
                    />
                    <Image
                      src="/homepage/board.webp"
                      width={500}
                      height={300}
                      alt="img"
                      className="rounded-md w-1/2 h-full object-cover"
                    />
                  </div>
                  <h4 className="uppercase font-poppins font-bold text-2xl text-[#093166]">
                    Unfiltered Blogs
                  </h4>
                  <p className="text-base font-quicksand text-[#093166] font-medium">
                    Our blog. Therapy-adjacent. Censorship-free.
                  </p>
                  <div className="mt-auto flex flex-row items-center justify-between">
                    <button className="text-sm bg-[#093166] text-white rounded-full font-medium font-poppins flex flex-row items-center gap-3 px-3 py-1.5">
                      READ THE BLOG{" "}
                      <BsArrowRight className="text-lg font-bold" />
                    </button>
                    <button className="rounded-full p-1 text-2xl font-bold border border-[#093166] text-[#093166]">
                      <BsPlus />
                    </button>
                  </div>
                </div>
              </CarouselItem>

              {/* Page 4: Shop Drops */}
              <CarouselItem className="basis-full">
                <div className="bg-[#093166] w-full min-h-[420px] p-4 rounded-sm flex flex-col gap-3">
                  <div className="w-full h-[220px] sm:h-[250px]">
                    <Image
                      src="/homepage/bag.webp"
                      width={500}
                      height={300}
                      alt="img"
                      className="rounded-md w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="uppercase font-poppins font-bold text-2xl text-white">
                    Shop Drops
                  </h4>
                  <p className="text-base font-quicksand text-white font-semibold">
                    Downloads for surviving the mess and thriving anyway. No
                    pastels. No pandering.
                  </p>
                  <div className="mt-auto flex flex-row items-center justify-between">
                    <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] gap-3 px-3 py-1.5 border border-white">
                      SHOP THE DROP{" "}
                      <BsArrowRight className="text-lg font-bold" />
                    </button>
                    <button className="rounded-full p-1 text-2xl font-bold border border-white text-white">
                      <BsPlus />
                    </button>
                  </div>
                </div>
              </CarouselItem>

              {/* Page 5: Eklektik Mama Loves */}
              <CarouselItem className="basis-full">
                <div className="bg-pink-400 w-full min-h-[420px] p-4 rounded-sm flex flex-col gap-3">
                  <div className="w-full h-[220px] sm:h-[250px]">
                    <Image
                      src="/homepage/package.webp"
                      width={500}
                      height={300}
                      alt="img"
                      className="rounded-md w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="uppercase font-poppins font-bold text-2xl text-white">
                    EKLEKTIK MAMA LOVES
                  </h4>
                  <p className="text-base font-quicksand text-white font-medium">
                    The ones that get the chaos, coffee cravings, identity
                    crises, and joy that comes with it all. If they’re here,
                    they passed the vibe check.
                  </p>
                  <div className="mt-auto flex flex-row items-center justify-between">
                    <button className="text-sm bg-white rounded-full font-medium font-poppins flex flex-row items-center gap-3 px-3 py-1.5">
                      explore our partners{" "}
                      <BsArrowRight className="text-lg font-bold" />
                    </button>
                    <button className="bg-white rounded-full p-1 text-2xl font-bold">
                      <BsPlus />
                    </button>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>

            <CarouselPrevious className="text-[#093166] border-2 border-[#093166] ml-3" />
            <CarouselNext className="text-[#093166] border-2 border-[#093166] mr-3" />
          </Carousel>
        </div>
      </section>
    </div>
  );
}
