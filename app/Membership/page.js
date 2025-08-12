import Image from "next/image";
import { FaShopLock } from "react-icons/fa6";
import { BsArrowRight, BsPlus } from "react-icons/bs";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MembershipOptions from "../components/MembershipOptions";

export default function MembershipPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/homepage/bar.webp')] bg-cover bg-center pt-20">
        <div className="w-full h-full grow min-h-full flex flex-col items-center justify-center">
          <h1 className="w-fit md:text-[70px] text-[40px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            GET <br />
            <b className="md:text-[100px] text-[60px]">Eklektik AF</b>
          </h1>
        </div>
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
      </section>
      <section className="w-full h-full flex flex-col">
        <div className="flex lg:flex-row flex-col w-full h-full md:px-10 px-5">
          <span className="w-full h-full text-[#093166] py-10 md:basis-1/2 basis-full">
            <p className="font-quicksand font-semibold text-base">Membership</p>
            <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-medium tracking-tighter leading-[100%]">
              <b className="font-anton tracking-normal font-semibold">AED 50</b>
              / Month.
              <br />
              EARLY. CHEAPER.<b className="font-bold"> LOUDER</b>
            </h2>
            <p className="md:max-w-[90%] w-full font-quicksand mt-5 text-left lg:text-lg md:text-base text-sm">
              Eklektik AF is your VIP pass to motherhood—minus the martyrdom. Members get:
            </p>
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
        <div className="w-full h-full flex flex-col py-10">
            <span className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]">
              <FaShopLock className="text-3xl"/>
              <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">Early access to all event drops</h4>
            </span>
            <span className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]">
              <FaShopLock className="text-3xl"/>
              <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">Discounts on every BYOBaby™ ticket</h4>
            </span>
            <span className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]">
              <FaShopLock className="text-3xl"/>
              <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">Exclusive access to our members-only WhatsApp group</h4>
            </span>
            <span className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]">
              <FaShopLock className="text-3xl"/>
              <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">Special perks on Shop Drops</h4>
            </span>
            <span className="w-full h-full flex flex-row md:gap-10 gap-5 items-start justify-start md:px-10 px-5 py-3 text-[#093166] border-b-[1px] border-[#093166]">
              <FaShopLock className="text-3xl"/>
              <h4 className="font-antonio md:text-2xl text-lg uppercase font-thin">Surprise invites to Members-Only things we’re not supposed to talk about</h4>
            </span>
        </div>
      </section>
      <section className="w-full h-full flex flex-col bg-white md:px-10 px-5">
        <div className="w-full h-full flex flex-col text-[#093166] px-10">
          <p className="font-quicksand font-semibold text-base">
            briefly
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-thin tracking-tighter leading-[100%]">
            HOW IT <b className="font-bold tracking-normal">WORKS</b>
          </h2>
        </div>
        <div className="w-full h-full flex  flex-col lg:px-10 py-10">
          <Carousel>
            <CarouselContent className="w-full h-full grid  md:grid-cols-3 grid-cols-1 gap-5">
              <CarouselItem>
                <div className="w-full h-full min-h-[300px] flex flex-col col-span-1 p-3 rounded-sm border-2 border-[#093166]">
                  <Image
                    src="/homepage/mum.png"
                    width={500}
                    height={300}
                    alt="img"
                    className="rounded-md w-full h-[220px] bg-cover max-h-[200px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      Pick a plan
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-semibold mt-3">
                      Choose what works for you — monthly flexibility or yearly savings. No pressure, just perks.
                    </p>
                  </span>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="w-full h-full min-h-[300px] flex flex-col col-span-1 p-3 rounded-sm border-2 border-[#093166]">
                  <Image
                    src="/homepage/mum.png"
                    width={500}
                    height={300}
                    alt="img"
                    className="rounded-md w-full h-[220px] bg-cover max-h-[200px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      Pay via Stripe
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-semibold mt-3">
                      Safe, secure checkout with Stripe. No sketchy stuff, just a smooth transaction.
                    </p>
                  </span>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="w-full h-full min-h-[300px] bg-[#dc5ca6] flex flex-col col-span-1 p-3 rounded-sm">
                  <Image
                    src="/homepage/mum.png"
                    width={500}
                    height={300}
                    alt="img"
                    className="rounded-md w-full h-[220px] bg-cover max-h-[200px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#fff]">
                      Get instant access
                    </h4>
                    <p className="text-base font-quicksand text-[#fff] font-semibold mt-3">
                      Login unlocks it all. Events, resources, chaos — welcome to the good side of motherhood.
                    </p>
                  </span>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="text-[#093166] border-2 border-[#093166]" />
            <CarouselNext className="text-[#093166] border-2 border-[#093166]" />
          </Carousel>
          <span
            className="md:w-fit w-full h-[45px] px-12 flex items-center text-sm mt-10 md:text-base justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] text-center transition-colors duration-500 ease-in-out md:scale-100 scale-75"
          >
            Auto-discounts apply once you’re logged in. Welcome to the chaos.
          </span>
        </div>
        
      </section>

      <section className="w-full h-full flex flex-col">
        <p className="font-quicksand font-semibold text-base max-w-[1400px] mx-auto w-full ">
            Plans
        </p>
        <MembershipOptions />
      </section>
    </div>
  );
}
