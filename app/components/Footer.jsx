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

export default function Footer() {
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
            blogs, and gear you didn’t know you needed.
          </p>
          <span className="flex flex-row w-full max-w-[500px] border-2 border-[#bf378b] rounded-full mt-10">
            <input
              type="email"
              className="w-full flex text-sm md:px-6 px-4 outline-none border-0 py-2 text-[#093166] placeholder:text-[#093166]"
              placeholder="ENTER YOUR EMAIL ADDRESS"
            />
            <button className="text-xl flex justify-center items-center px-3 cursor-pointer">
              <BsArrowRight />
            </button>
          </span>
        </span>
        <span className="w-full h-full flex flex-row items-end justify-center md:basis-[60%] basis-full lg:pt-14 md:flex-nowrap flex-wrap overflow-hidden gap-2">
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
          <div className="mx-auto grid md:grid-cols-4 lg:gap-[4vw] justify-between">
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
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaTiktok className="inline mr-1" /> TikTok
                </Link>
                <Link
                  href="https://www.facebook.com/people/Eklektik-Mama/61560699879306/"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaFacebook className="inline mr-1" /> Facebook
                </Link>
                <Link
                  href="https://www.linkedin.com/company/eklektik-mama/"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaLinkedin className="inline mr-1" /> Linkedin
                </Link>
                <Link
                  href="https://www.instagram.com/eklektikmama"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaInstagram className="inline mr-1" /> Instagram
                </Link>
              </div>
            </div>

            {/* Explore */}
            <div className="w-full flex flex-col items-start justify-start text-white">
              <h3 className="font-bold mb-6">EXPLORE</h3>
              <ul className="space-y-2 uppercase text-left">
                <li>
                  <a href="#" className="hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Shop
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
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
                  <a href="#" className="hover:underline">
                    Pitch Us Something Wild
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Start Eklektik Mama In Your City
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Extras / Resources */}
            <div className="flex flex-col items-start text-white">
              <h3 className="font-bold mb-6">EXTRAS / RESOURCES</h3>
              <ul className="space-y-2 uppercase text-left">
                <li>
                  <a href="/perks" className="hover:underline">
                    Eklektik Mama Loves (Partners)
                  </a>
                </li>
                {/* <li>
                  <a href="#" className="hover:underline">
                    Eklektik AF Welcome Pack
                  </a>
                </li> */}
                <li>
                  <a href="#" className="hover:underline">
                    UAE Mum Survival Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    The Useless Partner Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Note */}
          <div className=" text-center text-xs opacity-80 font-quicksand pt-10 text-white">
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