"use client";
import Image from "next/image";
import { FaShopLock } from "react-icons/fa6";
import { BsArrowRight, BsPlus } from "react-icons/bs";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MembershipOptions from "../components/MembershipOptions";
import Marquee from "../components/Marquee";

export default function MembershipPage() {
  // Refs for animations
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const plansRef = useRef(null);

  // InView hooks
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const introInView = useInView(introRef, { once: true, amount: 0.3 });
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.2 });
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.3 });
  const plansInView = useInView(plansRef, { once: true, amount: 0.3 });

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

  const listItem = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const rotateInfinite = {
    hidden: { opacity: 0, rotate: 0 },
    visible: { 
      opacity: 1, 
      rotate: 360,
      transition: { 
        duration: 15, 
        ease: "linear",
        repeat: Infinity 
      }
    }
  };

  const carouselItem = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <section ref={heroRef} className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/headerBg/wentdown.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <motion.div 
          className="w-full h-full grow min-h-full flex flex-col items-center justify-center"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            GET
            <br />
            <b className="md:text-[100px] text-[60px]">Eklektik AF</b> <br /> (Coming Soon)
          </h1>
        </motion.div>
        <Marquee />
      </section>

      <section ref={introRef} className="w-full h-full flex flex-col">
        <div className="flex lg:flex-row flex-col w-full h-full md:px-10 px-5">
          <motion.span 
            className="w-full h-full text-[#093166] py-10 md:basis-1/2 basis-full"
            initial="hidden"
            animate={introInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <p className="font-quicksand font-semibold text-base uppercase">Membership</p>
            <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-medium tracking-tighter leading-[100%]">
              <b className="font-anton tracking-normal font-semibold">AED 50</b>
              / Month.
              <br />
              EARLY. CHEAPER.<b className="font-bold"> LOUDER</b>
            </h2>
            <p className="md:max-w-[90%] w-full font-quicksand mt-5 text-left lg:text-lg md:text-base text-sm">
              Eklektik AF is your VIP pass to motherhood—minus the martyrdom.
              Members get:
            </p>
          </motion.span>
          <motion.span 
            className="w-full h-full flex flex-row items-end justify-center md:basis-1/2 basis-full lg:pt-14 md:flex-nowrap flex-wrap relative"
            initial="hidden"
            animate={introInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <Image
              src="/membership/ticket.webp"
              height={500}
              width={500}
              className="w-fit h-fit"
              alt="Membership ticket"
            />
              <Image
                src="/membership/brandStamp.webp"
                height={300}
                width={300}
                className="w-fit h-fit md:max-w-[180px] rotate-infinite md:max-h-[180px] max-w-[130px] max-h-[130px] absolute md:right-32 right-5 bottom-0"
                alt="Brand stamp"
              />
          </motion.span>
        </div>

        <motion.div 
          ref={benefitsRef}
          className="w-full h-full flex flex-col py-10"
          initial="hidden"
          animate={benefitsInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.span 
            className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]"
            variants={listItem}
          >
            <Image
              src="/membership/icons/1.webp"
              width={20}
              height={20}
              className="w-fit h-fit"
              alt="Early access icon"
            />
            <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">
              Early access to all event drops
            </h4>
          </motion.span>
          <motion.span 
            className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]"
            variants={listItem}
          >
            <Image
              src="/membership/icons/2.webp"
              width={20}
              height={20}
              className="w-fit h-fit"
              alt="Discounts icon"
            />
            <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">
              Discounts on every BYOBaby™ ticket
            </h4>
          </motion.span>
          <motion.span 
            className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]"
            variants={listItem}
          >
            <Image
              src="/membership/icons/3.webp"
              width={20}
              height={20}
              className="w-fit h-fit"
              alt="WhatsApp group icon"
            />
            <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">
              Exclusive access to our members-only WhatsApp group
            </h4>
          </motion.span>
          <motion.span 
            className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]"
            variants={listItem}
          >
            <Image
              src="/membership/icons/4.webp"
              width={20}
              height={20}
              className="w-fit h-fit"
              alt="Shop perks icon"
            />
            <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">
              Special perks on Shop Drops
            </h4>
          </motion.span>
          <motion.span 
            className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]"
            variants={listItem}
          >
            <Image
              src="/membership/icons/5.webp"
              width={20}
              height={20}
              className="w-fit h-fit"
              alt="Surprise invites icon"
            />
            <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">
              Surprise invites to Members-Only things we&apos;re not supposed to talk
              about
            </h4>
          </motion.span>
        </motion.div>
      </section>

      <section ref={howItWorksRef} className="w-full h-full flex flex-col bg-white md:px-10 px-5">
        <motion.div 
          className="w-full h-full flex flex-col text-[#093166]"
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">Briefly</p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-thin tracking-tighter leading-[100%]">
            HOW IT <b className="font-bold tracking-normal">WORKS</b>
          </h2>
        </motion.div>
        <motion.div 
          className="w-full h-full flex flex-col lg:px-0 py-10"
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          variants={staggerContainer}
          transition={{ delay: 0.2 }}
        >
          <Carousel>
            <CarouselContent className="w-full h-full grid md:grid-cols-3 grid-cols-1 gap-5">
              <CarouselItem>
                <motion.div 
                  className="w-full h-full min-h-[300px] flex flex-col col-span-1 p-3 rounded-sm border-2 border-[#093166]"
                  variants={carouselItem}
                >
                  <Image
                    src="/membership/1.webp"
                    width={500}
                    height={300}
                    alt="Pick a plan"
                    className="rounded-md w-full h-[220px] object-cover object-center"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      Pick a plan
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-semibold mt-3">
                      Choose what works for you — monthly flexibility or yearly
                      savings. No pressure, just perks.
                    </p>
                  </span>
                </motion.div>
              </CarouselItem>
              <CarouselItem>
                <motion.div 
                  className="w-full h-full min-h-[300px] flex flex-col col-span-1 p-3 rounded-sm border-2 border-[#093166]"
                  variants={carouselItem}
                >
                  <Image
                    src="/membership/2.webp"
                    width={500}
                    height={300}
                    alt="Pay via Stripe"
                    className="rounded-md w-full h-[220px] object-cover object-center"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      Pay via Stripe
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-semibold mt-3">
                      Safe, secure checkout with Stripe. No sketchy stuff, just
                      a smooth transaction.
                    </p>
                  </span>
                </motion.div>
              </CarouselItem>
              <CarouselItem>
                <motion.div 
                  className="w-full h-full min-h-[300px] bg-[#dc5ca6] flex flex-col col-span-1 p-3 rounded-sm"
                  variants={carouselItem}
                >
                  <Image
                    src="/membership/3.webp"
                    width={500}
                    height={300}
                    alt="Get instant access"
                    className="rounded-md w-full h-[220px] object-cover object-center"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#fff]">
                      Get instant access
                    </h4>
                    <p className="text-base font-quicksand text-[#fff] font-semibold mt-3">
                      Login unlocks it all. Events, resources, chaos — welcome
                      to the good side of motherhood.
                    </p>
                  </span>
                </motion.div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <motion.span 
            className="md:w-fit w-full h-[45px] px-12 flex items-center text-sm mt-10 md:text-base justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] text-center transition-colors duration-500 ease-in-out md:scale-100 scale-75"
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
          >
            Auto-discounts apply once you&apos;re logged in. Welcome to the chaos.
          </motion.span>
        </motion.div>
      </section>

      <section ref={plansRef} className="w-full h-full flex flex-col">
        <motion.p 
          className="font-quicksand font-semibold text-base w-full lg:px-10 px-5 uppercase"
          initial="hidden"
          animate={plansInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          Plans
        </motion.p>
        <MembershipOptions />
      </section>
    </div>
  );
}