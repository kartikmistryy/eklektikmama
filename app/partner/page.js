import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight, BsDownload } from "react-icons/bs";
import Marquee from "../components/Marquee";

const Parnterwithus = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/partner/header.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <div className="w-full h-full grow min-h-full flex flex-col items-center justify-center">
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            PITCH US
            <br />
            <b className="md:text-[100px] text-[60px]">SOMETHING WILD</b>
          </h1>
        </div>
        <Marquee />
      </section>
      <section className="flex lg:flex-row flex-col-reverse w-full h-full items-stretch">
        <div className="lg:w-1/2 w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 lg:basis-1/2">
          <p className="font-quicksand font-semibold text-base">Unleashed</p>
          <h2 className="md:text-[80px] text-5xl uppercase font-anton leading-[100%]">
            Brand collabs. <br />
            <b className="font-antonio font-normal tracking-tight">
              Franchises. <br />
              Strategic chaos.
            </b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            If your brand gets modern mums — their humour, their hustle, their
            need for spaces that just get it — we’re all ears.
            <br />
            From cinema mornings to unapologetic nights out, we create moments
            they remember (and talk about). Let’s make your brand part of the
            story.
          </p>
          <Link
            href="/"
            className="w-fit lg:h-[45px] h-[35px] lg:text-sm lg:px-12 px-8 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100"
          >
            PARTNER WITH US <BsArrowRight className="ml-2 lg:text-2xl text-sm" />
          </Link>
        </div>
        <div className="lg:w-1/2 w-full lg:basis-1/2 basis-full">
          <Image
            src="/partner/about.webp"
            alt="aboutImg"
            width={1000}
            height={1000}
            className="w-full h-full flex object-cover object-center lg:rounded-tl-xl lg:rounded-bl-xl"
          />
        </div>
      </section>
      <section className="w-full h-full flex flex-col gap-5 mt-10">
        <div className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5">
          <p className="font-quicksand font-semibold text-base">
            Team Up With Us
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-thin leading-[100%]">
            we <b className="tracking-tight font-bold">work with</b>
          </h2>
        </div>

        <div className="w-full h-full bg-[#db4e9f] my-5">
          <div className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 flex flex-row justify-between items-center">
            <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
              Bold brands that want real reach
            </p>

            <BsArrowRight className="lg:text-3xl text-xl text-white" />
          </div>
          <hr />
          <div className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 flex flex-row justify-between items-center">
            <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
              Thoughtful start-ups who value word of mouth
            </p>

            <BsArrowRight className="lg:text-3xl text-xl text-white" />
          </div>
          <hr />
          <div className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 flex flex-row justify-between items-center">
            <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
              TWomen looking to run Eklektik Mama in their own cities
            </p>

            <BsArrowRight className="lg:text-3xl text-xl text-white" />
          </div>
          <hr />
        </div>
      </section>
      <section className="w-full h-full flex flex-col gap-5 mt-10">
        <div className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5">
          <p className="font-quicksand font-semibold text-base">PITCH</p>
          <h2 className="md:text-[80px] text-5xl uppercase tracking-tighter font-antonio font-thin leading-[100%]">
            This Is Where {""}
            <b className="tracking-tight font-bold">It Starts</b>
          </h2>
        </div>
        <div className="w-full h-full flex flex-col justify-center items-center py-10 px-5">
          <form className="w-full h-full lg:px-14 px-5 lg:py-5 py-6 border-2 border-[#db4e9f] max-w-[600px] rounded-lg flex flex-col gap-5 font-poppins relative">
            <Image
                  src="/partner/star.webp"
                  height={100}
                  width={100}
                  alt="Logo"
                  className="absolute lg:bottom-[10px] lg:right-[-70px] right-[-10px] bottom-[-20px]"
                />
            <div className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166]">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                1
              </span>
              <div className="w-full h-full flex flex-col gap-5 max-w-[350px]">
                <h4 className="font-semibold">QUICK INTRO</h4>
                <input
                  type="text"
                  required
                  placeholder="NAME*"
                  className="text-sm border-2 border-[#db4e9f] px-5 py-1 rounded-xl"
                />
                <input
                  type="email"
                  required
                  placeholder="EMAIL*"
                  className="text-sm border-2 border-[#db4e9f] px-5 py-1 rounded-xl"
                />
              </div>
            </div>

            <div className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166] mt-4">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                2
              </span>
              <div className="w-full h-full flex flex-col gap-2">
                <h4 className="font-semibold">What Brings You Here?</h4>
                <span className="w-full h-full flex lg:flex-row flex-col gap-5 mt-3">
                  <label htmlFor="brand" className="uppercase w-full">
                    Are you a brand?{" "}
                  </label>
                  <div className="w-full max-w-[150px] h-fit flex flex-row gap-5">
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input type="radio" name="yes" />
                      <label htmlFor="yes">Yes</label>
                    </span>
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input type="radio" name="no" id="" />
                      <label htmlFor="no">No</label>
                    </span>
                  </div>
                </span>

                <span className="w-full h-full flex lg:flex-row flex-col gap-3 mt-3">
                  <label htmlFor="brand" className="uppercase w-full text-base">
                    Are you interested in running Eklektik Mama in your city?
                  </label>
                  <div className="w-full max-w-[150px] h-fit flex flex-row gap-5">
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input type="radio" name="yes" id="" />
                      <label htmlFor="yes">Yes</label>
                    </span>
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input type="radio" name="no" id="" />
                      <label htmlFor="no">No</label>
                    </span>
                  </div>
                </span>
              </div>
            </div>

            <div className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166]">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                3
              </span>
              <div className="w-full h-full flex flex-col gap-5 max-w-[350px]">
                <h4 className="font-semibold">Drop Us a Line</h4>
                <textarea
                  type="text"
                  required
                  placeholder="NOTE"
                  className="text-sm border-2 border-[#db4e9f] px-5 py-2 min-h-[150px] rounded-xl"
                />
              </div>
            </div>
          </form>
          <Link
            href="/"
            className="w-fit h-[45px] px-12 text-base flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
          >
            SUBMIT <BsArrowRight className="ml-2 text-2xl" />
          </Link>
        </div>
      </section>

            <section className="flex lg:flex-row flex-col-reverse w-full h-full items-stretch">
        <div className="lg:w-1/2 w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 lg:basis-1/2">
          <p className="font-quicksand font-semibold text-base">Franchise</p>
          <h2 className="md:text-[80px] text-5xl tracking-tight uppercase font-antonio leading-[100%]">
            <b>Start</b>  Eklektik  Mama
            <b className="font-antonio font-normal tracking-tight">
              in your city
            </b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            We’re opening up to a few bold women ready to lead. You bring the fire, we’ll bring the framework — plus our Franchisee Onboarding Pack to set you up from day one.
          </p>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out "
          >
            DOWNLOAD THE ONBOARDING PACK <BsDownload className="ml-6 text-2xl" />
          </Link>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px]  border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
            >
            CONTACT US <BsArrowRight className="ml-6 text-2xl" />
          </Link>
        </div>
        <div className="lg:w-1/2 w-full lg:basis-1/2 basis-full">
          <Image
            src="/partner/onboarding.webp"
            alt="aboutImg"
            width={1000}
            height={1000}
            className="w-full h-full flex object-cover object-center lg:rounded-tl-xl lg:rounded-bl-xl"
          />
        </div>
      </section>
    </div>
  );
};

export default Parnterwithus;
