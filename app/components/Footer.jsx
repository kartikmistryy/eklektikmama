import Image from "next/image";
import { BsArrowRight } from "react-icons/bs";
import {
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaThreads,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <section className="w-full h-full flex flex-col">
      <div className="flex lg:flex-row flex-col w-full h-full md:px-10 px-5">
        <span className="w-full h-full text-[#093166] py-10 md:basis-1/2 basis-full">
          <p className="font-quicksand font-semibold uppercase text-base">
            #mamadrama
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-normal tracking-tighter leading-[100%]">
            Unfiltered.
            <b className="font-anton tracking-normal font-semibold">
              Unhinged.
            </b>{" "}
            <br />
            <b className="font-bold">In Your Inbox.</b>
          </h2>
          <p className="md:max-w-[60%] w-full font-quicksand mt-5 text-left lg:text-lg md:text-base text-sm">
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
        <span className="w-full h-full flex flex-row items-end justify-center md:basis-1/2 basis-full lg:pt-14 md:flex-nowrap flex-wrap">
          <Image
            width={100}
            height={100}
            src="/homepage/extra.png"
            alt="icons"
            className="w-[250px] h-[130px]"
          />
          <Image
            width={100}
            height={100}
            src="/homepage/extra.png"
            alt="icons"
            className="w-[250px] h-[130px]"
          />
          <Image
            width={100}
            height={100}
            alt="icons"
            src="/homepage/scribble.gif"
            className="w-[250px] h-[200px]"
          />
          <Image
            width={100}
            height={100}
            alt="icons"
            src="/homepage/extra.png"
            className="w-[350px] h-[130px]"
          />
        </span>
      </div>
      <div className="w-full h-full flex flex-col mt-10">
        <marquee
          behavior="scroll"
          direction="left"
          scrollamount="6" // controls speed
          className="bg-[#102A43] font-antonio py-2"
        >
          <div className="flex flex-row gap-5 items-center flex-shrink-0">
            {[
              "Eklektik Mama Love",
              "UNFILTERED AF",
              "WHAT'S ON",
              "GET EKLEKTIC AF",
              "SHOP DROP",
               "Eklektik Mama Love",
              "UNFILTERED AF",
              "WHAT'S ON",
              "GET EKLEKTIC AF",
              "SHOP DROP",
            ].map((text, i) => (
              <span
                key={i}
                className="flex flex-row gap-4 items-center flex-shrink-0"
              >
                <Image
                  src="/homepage/marqueeLogo.png"
                  height={70}
                  width={70}
                  alt="Logo"
                  className="flex-shrink-0"
                />
                <h4 className="text-white text-4xl uppercase whitespace-nowrap">
                  {text}
                </h4>
              </span>
            ))}
          </div>
        </marquee>
        <footer className="bg-[#d94e9b] text-white py-10 px-6 font-poppins">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-5 items-start">
            {/* Logo + Social */}
            <div className="flex flex-col items-center md:items-start">
              <Image
                src="/homepage/footerBranding.png" // replace with your actual logo path
                alt="Eklektik Mama"
                width={160}
                height={160}
                className="mb-6"
              />
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  href="#"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaTiktok className="inline mr-1" /> TikTok
                </a>
                <a
                  href="#"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaFacebook className="inline mr-1" /> Facebook
                </a>
                <a
                  href="#"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaThreads className="inline mr-1" /> Threads
                </a>
                <a
                  href="#"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaInstagram className="inline mr-1" /> Instagram
                </a>
                <a
                  href="#"
                  className="bg-white text-[#102A43] px-3 py-1 rounded-full text-sm font-semibold shadow hover:scale-105 transition"
                >
                  <FaXTwitter className="inline mr-1" /> X
                </a>
              </div>
            </div>

            {/* Explore */}
            <div>
              <h3 className="font-bold mb-6">EXPLORE</h3>
              <ul className="space-y-2 uppercase">
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
            <div>
              <h3 className="font-bold mb-6">WORK WITH US</h3>
              <ul className="space-y-2 uppercase">
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
            <div>
              <h3 className="font-bold mb-6">EXTRAS / RESOURCES</h3>
              <ul className="space-y-2 uppercase">
                <li>
                  <a href="#" className="hover:underline">
                    Eklektik Mama Loves (Partners)
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Eklektik AF Welcome Pack
                  </a>
                </li>
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
          <div className=" text-center text-sm opacity-80 font-quicksand">
            © {new Date().getFullYear()} Eklektik Mama™. All rights, rants, and
            rebellion reserved. <br />
            <span className="flex flex-row gap-2 justify-center">
              <a href="#">Privacy Policy</a>|<a href="#">Terms & Conditions</a>
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
