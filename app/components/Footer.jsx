"use client"
import Image from "next/image";
import { BsArrowRight } from "react-icons/bs";
import {
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaThreads,
  FaXTwitter,
  FaLinkedin,
} from "react-icons/fa6";
import Marquee from "./Marquee";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType("success");
        setEmail(""); // Clear the form on success
      } else {
        setMessage(data.error || "Failed to subscribe. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full h-full flex flex-col">
      <div className="flex lg:flex-row flex-col w-full h-full gap-10 md:pl-10 px-5">
        <span className="w-full h-full text-[#093166] py-10 md:basis-[40%] basis-full">
          <p className="font-quicksand font-semibold uppercase text-base">
            #mamadrama
          </p>
          <h2 className="md:text-[80px] text-4xl uppercase font-antonio font-normal tracking-tighter leading-[100%]">
            Unfiltered.
            <b className="font-anton tracking-normal font-semibold">
              Unhinged.
            </b>{" "}
            <br />
            <b className="font-bold">In Your Inbox.</b>
          </h2>
          <p className="md:max-w-[60%] w-full font-quicksand mt-5 text-left lg:text-lg md:text-sm text-sm">
            Welcome to <b className="font-semibold">Eklektik Mama™</b>, where
            motherhood meets rebellion. A home for bold mums,{" "}
            <b className="font-semibold">BYOBaby™</b> events, unapologetic
            blogs, and gear you didn't know you needed. <br />Plus, get our free Places to Visit in Abu Dhabi, UAE guide straight to your email.
          </p>
          
          {/* Newsletter Form */}
          <form onSubmit={handleNewsletterSubmit} className="mt-10">
            <div className="flex flex-row w-full max-w-[500px] border-2 border-[#bf378b] rounded-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full flex text-sm md:px-6 px-4 outline-none border-0 py-2 text-[#093166] placeholder:text-[#093166]"
                placeholder="ENTER YOUR EMAIL ADDRESS"
                disabled={isSubmitting}
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="text-xl flex justify-center items-center px-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#093166]"></div>
                ) : (
                  <BsArrowRight />
                )}
              </button>
            </div>
            
            {/* Message Display */}
            {message && (
              <div className={`mt-3 text-sm font-medium ${
                messageType === "success" 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {message}
              </div>
            )}
          </form>
        </span>
        {/* Fix here */}
        {/* Mobile-only footer images */}
        <div className="md:hidden w-full flex flex-row items-center justify-center gap-0 py-4 overflow-x-hidden">
          <Image
            src="/footer/1.png"
            alt="footer icon 1"
            width={80}
            height={80}
            className="h-16 w-auto object-contain rounded"
          />
          <Image
            src="/footer/2.png"
            alt="footer icon 2"
            width={80}
            height={80}
            className="h-16 w-auto object-contain rounded"
          />
          <Image
            src="/footer/4.gif"
            alt="footer icon 4"
            width={80}
            height={80}
            className="h-22 w-auto object-contain rounded"
          />
          <Image
            src="/footer/3.png"
            alt="footer icon 3"
            width={80}
            height={80}
            className="h-16 w-auto object-contain rounded"
          />
        </div>

        {/* Desktop-only footer images */}
        <span className="hidden md:flex w-full h-full flex-row items-end justify-center md:basis-[60%] basis-full lg:pt-14 md:flex-nowrap flex-wrap overflow-hidden gap-2">
          <Image
            src="/footer/1.webp"
            alt="icons"
            width={300}
            height={130}
            className="h-[100px] w-auto object-contain rounded"
          />
          <Image
            src="/footer/2.webp"
            alt="icons"
            width={300}
            height={130}
            className="h-[100px] w-auto object-contain rounded"
          />
          <Image
            src="/footer/3.gif"
            alt="icons"
            width={250}
            height={200}
            className="h-[200px] w-auto object-contain rounded"
          />
          <Image
            src="/footer/4.webp"
            alt="icons"
            width={300}
            height={130}
            className="h-[100px] w-auto object-contain rounded"
          />
        </span>


      </div>
      <div className="w-full h-full flex flex-col mt-10">
        <Marquee />

        <footer className="bg-[#d94e9b] text-white pt-10 pb-5 px-6 font-poppins">
          <div className="mx-auto grid md:grid-cols-4 lg:gap-[4vw] justify-between gap-10">
            {/* Logo + Social */}
            <div className="flex flex-col items-start">
              <Image
                src="/footer/logo.webp" // replace with your actual logo path
                alt="Eklektik Mama"
                width={160}
                height={160}
                className="mb-6"
              />
              <div className="flex flex-wrap gap-3 justify-start">
                <Link
                  href="https://www.tiktok.com/@eklektikmama?_t=8pqLsaRIulk&_r=1"
                  className="bg-white text-[#102A43] flex flex-row items-center justify-center px-3 py-2  rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <label htmlFor="tiktok"></label>
                  <FaTiktok className="inline mr-1 text-xl" /> <b className="font-medium md:flex hidden">TikTok</b>
                </Link>
                <Link
                  href="https://www.facebook.com/people/Eklektik-Mama/61560699879306/"
                  className="bg-white text-[#102A43] flex flex-row items-center justify-center px-3 py-2 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaFacebook className="inline mr-1 text-xl" /><b className="font-medium md:flex hidden ">Facebook</b> 
                </Link>
                <Link
                  href="https://www.linkedin.com/company/eklektik-mama/"
                  className="bg-white text-[#102A43] flex flex-row items-center justify-center px-3 py-2 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaLinkedin className="inline mr-1 text-xl" /> 
                  <b className="font-medium md:flex hidden">Linkedin</b> 
                </Link>
                <Link
                  href="https://www.instagram.com/eklektikmama"
                  className="bg-white text-[#102A43] flex flex-row items-center justify-center px-3 py-2 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaInstagram className="inline mr-1 text-xl" /><b className="font-medium md:flex hidden">Instagram</b>  
                  
                </Link>
              </div>
            </div>

            {/* Explore */}
            <div className="w-full flex flex-col items-start justify-start text-white">
              <h3 className="font-bold mb-6">EXPLORE</h3>
              <ul className="space-y-2 uppercase text-left">
                <li>
                  <a href="/" className="hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://eklektikcollective.com/" className="hover:underline">
                    Shop
                  </a>
                </li>
                <li>
                  <a href="/events" className="hover:underline">
                    Events
                  </a>
                </li>
                <li>
                  <a href="/contactus#contact" className="hover:underline">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Work With Us */}
            <div className="flex flex-col items-start text-white">
              <h3 className="font-bold mb-6">WORK WITH US</h3>
              <ul className="space-y-2 uppercase text-left">
              <li>
                  <a href="/partnershipprogram" className="hover:underline">
                    Partnership Program
                  </a>
                </li>
                <li>
                  <a href="/contactus" className="hover:underline">
                    Pitch Us Something Wild
                  </a>
                </li>
                <li>
                  <a href="/contactus#franchise" className="hover:underline">
                    Start Eklektik Mama In Your City
                  </a>
                </li>
              </ul>
            </div>

            {/* Extras / Resources */}
            <div className="flex flex-col items-start text-white">
              <h3 className="font-bold mb-6">EKLEKTIK FREEBIES</h3>
              <ul className="space-y-2 uppercase text-left">
                <li>
                  <a 
                  href="https://linktr.ee/eklektikmama?lt_utm_source=lt_share_link#457077794"  
                  className="hover:underline">
                    RAMADAN GUIDE
                  </a>
                </li> 
                
                <li>
                  <a 
                  // href="/visitUae.pdf" 
                  target="_blank"
                  href="https://linktr.ee/eklektikmama" 
                  className="hover:underline">
                    PLACES TO VISIT IN ABU DHABI, UAE
                  </a>
                </li> 
                {/* <li>
                  <a href="/partnerGuide.pdf" download className="hover:underline">
                    PARTNER GUIDE 
                  </a>
                </li> 
                <li>
                  <a href="/partnerGuide.pdf" download className="hover:underline">
                    HOSPITAL GUIDE
                  </a>
                </li> */}
                {/* <li>
                  <a href="#" className="hover:underline">
                    Eklektik AF Welcome Pack
                  </a>
                </li> */}
                {/* <li>
                  <a href="#" className="hover:underline">
                    UAE Mum Survival Guide(coming soon)
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    The Useless Partner Guide(coming soon)
                  </a>
                </li> */}

              </ul>
            </div>
          </div>

          {/* Bottom Note */}
          
          <div className=" text-center text-xs opacity-80 font-quicksand pt-10 text-white">
          <p className="my-1"><a href="/termsAndCondition" className="hover:underline">Terms and Conditions</a> | <a href="/privacyPolicy" className="hover:underline">Privacy Policy</a></p>

            © {new Date().getFullYear()} Eklektik Mama™ and BYOBaby™ are
            trademarks of Eklektik Mama Event Management L.L.C. – S.P.C. <br />
            © 2025 All rights reserved under UAE law
            <br />
          </div>
        </footer>
      </div>
    </section>
  );
}