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
  const previousEventsRef = useRef(null);
  const brandSectionRef = useRef(null);

  // InView hooks
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const introInView = useInView(introRef, { once: true, amount: 0.3 });
  const pastEventsInView = useInView(pastEventsRef, { once: true, amount: 0.2 });
  const previousEventsInView = useInView(previousEventsRef, { once: true, amount: 0.2 });
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

  const carouselItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden">
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
              className="absolute top-26 md:-left-[200px] left-32 md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px] overflow-hidden rounded-md"
            >
              <Image
                src="/highlights/s1.webp"
                height={500}
                width={400}
                className="w-full h-full object-cover rounded-md"
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
              className="absolute top-[70px] md:left-[0] left-[-50px] md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px] overflow-hidden rounded-md"
            >
              <Image
                src="/highlights/s2.webp"
                height={500}
                width={400}
                className="w-full h-full object-cover rounded-md"
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
              className="absolute top-[50px] md:left-[160px] left-0 md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px] overflow-hidden rounded-md"
            >
              <Image
                src="/highlights/s3.webp"
                height={500}
                width={400}
                className="w-full h-full object-cover rounded-md"
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
              className="absolute md:top-[0%] top-[30%] md:right-[-40%] right-[-35%] md:w-[100px] md:h-[100px] w-[80px] h-[80px] overflow-hidden rounded-full"
            >
              <Image
                src="/highlights/sun.webp"
                height={500}
                width={400}
                className="w-full h-full object-cover rounded-full"
                alt="image"
              />
            </motion.div>
          </span>
        </motion.div>
      </section>

      {/* <section ref={pastEventsRef} className="w-full h-full flex flex-col py-10 lg:gap-0 gap-10">
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
      </section> */}

      <section ref={previousEventsRef} className="w-full flex flex-col gap-5 mt-10 mb-10">
        <motion.div 
          className="px-5 lg:px-10 text-[#093166]"
          initial="hidden"
          animate={previousEventsInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold uppercase">Explore</p>
          <h2 className="text-5xl md:text-[80px] uppercase font-antonio font-thin leading-[100%] tracking-tighter">
            Check <b className="font-bold">Previous Events</b>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={previousEventsInView ? "visible" : "hidden"}
          variants={staggerContainer}
          transition={{ delay: 0.2 }}
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:px-10 px-5 py-5">
            {/* <motion.a
              href="https://photos.google.com/share/AF1QipMZROP7KoDG762HCpU592F7sDpR_o8Z5nOu1lBxFyOegXJPF4CFkjpdkOWj1JLQog?key=STdtbzZLeDdrVkJwanNaTXcwbDA3QWlfdjVtM1d3"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/bateen.jpg"
                  width={500}
                  height={300}
                  alt="BYOB - Al Bateen Ladies Club"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                  BYOB - Al Bateen Ladies Club
                </h4>
              </span>
            </motion.a> */}

            <motion.a
            href="https://photos.google.com/share/AF1QipOI-jSZEmq9DypBWyPbF6fnP3O2qv_KwM9PTgGIGPFsD-Qb14ylY0LrZbiyjBdLOA?key=YW1oZVFuNjNIZ3hMd2pBbXlYMGpkaC13ZjBGdDFn"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/cocktails.jpg"
                  width={500}
                  height={300}
                  alt="Eklektik Mama Cocktail Masterclass"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                  Eklektik Mama Cocktail Masterclass
                </h4>
              </span>
            </motion.a>

            <motion.a
            href="https://photos.google.com/share/AF1QipPI3suUDjtRdSgACKcMdHMNpuE824azy2CRm0WnTmDBZB7ZzUD1MgnF0HwKzdJRxQ?key=SXh3SHhkZUhzOUZLSE9lU2lyd0NyT0RpUUtiT2xR"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/entepreneur.jpg"
                  width={500}
                  height={300}
                  alt="Entrepreneur Morning"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                  Entrepreneur Morning
                </h4>
              </span>
            </motion.a>

            <motion.a
              href="https://photos.google.com/share/AF1QipP7oseJVSQIHnHBPWepqwwz6Jq9R7gVyCokqpc6nVfUGtluWldHJo5KjIPEK7adag?key=OTNxcW53bFQtVlRfTjc4TC1GYW5qV2ItSWdvclJn"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/mamafit.jpg"
                  width={500}
                  height={300}
                  alt="MaMA Fit"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                MaMA Fit
                </h4>
              </span>
            </motion.a>

            <motion.a
            href="https://photos.google.com/share/AF1QipOFW-svjbHC17kBd4JdeFHHpdHwHpCuzkB7Zwjj7sg5EV6-RWtH8QgvQ59DOuROtQ?key=Mmpsd1I4bmswU1JOc0VjMVlCNEJnX2F6WW1UT25B"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/byobmamabreakfast.jpg"
                  width={500}
                  height={300}
                  alt="BYOBaby Mama Breakfasts"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                BYOBaby Mama Breakfasts
                </h4>
              </span>
            </motion.a>

            <motion.a
            href="https://photos.google.com/share/AF1QipPiX6ewsLY5PI_lk4tmG0dFKiox5T77k0RSAddLS14A0fb_TRuHtOUEe9DAOyYIrw?key=TDFGRldRdFhEaUkyVTI2dnB0NmRLMnpuczctMlJB"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/eklektikmamaBreakfast.jpg"
                  width={500}
                  height={300}
                  alt="Eklektik mama breakfast 8"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                Eklektik mama breakfast 8
                </h4>
              </span>
            </motion.a>

            <motion.a
              href="https://photos.google.com/share/AF1QipMZROP7KoDG762HCpU592F7sDpR_o8Z5nOu1lBxFyOegXJPF4CFkjpdkOWj1JLQog?key=STdtbzZLeDdrVkJwanNaTXcwbDA3QWlfdjVtM1d3"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/bateen.jpg"
                  width={500}
                  height={300}
                  alt="BYOB - Al Bateen Ladies Club"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                  BYOB - Al Bateen Ladies Club
                </h4>
              </span>
            </motion.a>

            <motion.a
            href="https://photos.google.com/share/AF1QipOI-jSZEmq9DypBWyPbF6fnP3O2qv_KwM9PTgGIGPFsD-Qb14ylY0LrZbiyjBdLOA?key=YW1oZVFuNjNIZ3hMd2pBbXlYMGpkaC13ZjBGdDFn"
              variants={carouselItem}
              className="w-full h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-full h-[240px] flex-shrink-0">
                <Image
                  src="/eventsPic/cocktails.jpg"
                  width={500}
                  height={300}
                  alt="Eklektik Mama Cocktail Masterclass"
                  className="rounded-md w-full h-full object-cover"
                />
              </div>
              <span className="py-4 w-full flex-1 flex flex-col justify-start items-start">
                <h4 className="uppercase font-poppins font-bold lg:text-xl text-lg text-[#093166] leading-tight">
                  Eklektik Mama Cocktail Masterclass
                </h4>
              </span>
            </motion.a>
          </div>
          
          <div className="flex justify-center mt-6">
            <Link href="/whatwedo" className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-6 py-2 hover:bg-[#072a4d] transition-colors duration-300">
              VIEW ALL
              <BsArrowRight className="text-lg font-bold" />
            </Link>
          </div>
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
            href="/perks#form"
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
