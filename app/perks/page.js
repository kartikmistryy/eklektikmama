"use client";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import Marquee from "../components/Marquee";
import { useState } from "react";

const Page = () => {
  const [partnershipType, setPartnershipType] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  return (
    <div className="w-full h-full flex flex-col">
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/headerBg/loves.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <div className="w-full h-full grow min-h-full flex flex-col items-center justify-center">
          <h1 className="w-fit md:text-[90px] text-[40px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            Eklektik Mama <br />
            <b className="md:text-[130px] text-[60px]">Loves</b>
          </h1>
        </div>
        <Marquee />
      </section>

      <section className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white  lg:gap-0 gap-10">
        <div className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 md:pr-0 px-5 text-[#093166] py-10">
          <p className="font-quicksand font-semibold text-base">Our</p>
          <h2 className="md:text-[80px] font-thin text-5xl uppercase font-antonio leading-[100%]">
            Partner <br />
            <b className="font-anton font-normal tracking-tight">Dictionary.</b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            We don’t promote anything we wouldn’t use ourselves. These are the
            brands who’ve earned their place here, bold, brilliant, and vetted
            by mums who know what works (and what’s just marketing fluff). From
            the products that save your sanity to the services that make life
            easier, this is our go-to list when someone says, “Do you know
            anyone who…?
          </p>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
          >
            PARTNER WITH US <BsArrowRight className="ml-2 text-2xl" />
          </Link>
        </div>
        <div className="w-full self-stretch flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0 bg-[url('/perks/subheader.webp')] bg-cover bg-center min-h-full rounded-tl-xl rounded-bl-xl"></div>
      </section>

      <section className="w-full h-full flex flex-col items-start justify-start relative bg-white  lg:gap-0 gap-10">
        <h2 className="md:text-[80px] font-thin text-[#093166] text-5xl uppercase font-antonio leading-[100%] lg:px-10 px-5 flex items-center justify-center text-center w-full py-10">
          our
          <b className="font-anton font-normal tracking-tight md:text-[80px] text-5xl ml-5 mt-3">
            Partners
          </b>
        </h2>
        <div className="w-full h-full lg:gap-10 gap-5 bg-[#d756a1] lg:p-10 p-7 rounded-[50px]">
          <div className="w-full h-full grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 max-w-[1400px] mx-auto gap-10">
            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <span className="w-full h-[120px] flex justify-center items-center">
                <Image
                src="/perks/logos/1.webp"
                width={300}
                height={300}
                className="w-fit h-fit  max-w-[180px]"
              />
              </span>

              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">
                Toys and activities to keep kids happy while you unwind.
              </h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <span className="w-full h-[120px] flex justify-center items-center">
                <Image
                src="/perks/logos/2.webp"
                width={300}
                height={300}
                className="w-fit h-fit  max-w-[180px]"
              />
              </span>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">
                ECOMA nappies: biodegradable, vegan, planet-friendly.
              </h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <span className="w-full h-[120px] flex justify-center items-center">
                <Image
                src="/perks/logos/3.webp"
                width={300}
                height={300}
                className="w-fit h-fit  max-w-[180px]"
              />
              </span>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">
                Safety on Board: UAE’s first child car seat specialist.
              </h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <span className="w-full h-[120px] flex justify-center items-center">
                <Image
                src="/perks/logos/4.webp"
                width={300}
                height={300}
                className="w-fit h-fit  max-w-[140px]"
              />
              </span>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">
                Wolves Zone MMA: training for strength and confidence.
              </h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full lg:flex hidden flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5 "></div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <span className="w-full h-[120px] flex justify-center items-center">
                <Image
                src="/perks/logos/5.webp"
                width={300}
                height={300}
                className="w-fit h-fit  max-w-[140px]"
              />
              </span>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">
                Sitters: professional childcare so you can enjoy our events
                worry-free.
              </h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <span className="w-full h-[120px] flex justify-center items-center">
                <Image
                src="/perks/logos/6.webp"
                width={300}
                height={300}
                className="w-fit h-fit max-w-[140px]"
              />
              </span>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">
                Cozy kids’ book corner for storytime while you connect.
              </h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>
            <div className="w-full h-full lg:flex hidden flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5"></div>
          </div>
        </div>
      </section>

      <section className="w-full h-full flex flex-col gap-5 mt-10">
        <div className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5">
          <p className="font-quicksand font-semibold text-base">GROW</p>
          <h2 className="md:text-[80px] text-5xl uppercase tracking-tighter font-antonio font-thin leading-[100%]">
          <b className="tracking-tight font-bold">PARTNER </b>
            WITH US
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
              <div className="w-full h-full flex flex-col gap-5 max-w-[350px] mt-2">
                <h4 className="font-medium uppercase text-sm">QUICK INTRO</h4>
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
                <input
                  type="url"
                  required
                  placeholder="Website"
                  className="text-sm border-2 border-[#db4e9f] px-5 py-1 rounded-xl"
                />
              </div>
            </div>

            <div className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166]">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                2
              </span>
              <div className="w-full h-full flex flex-col gap-3 max-w-[350px] mt-2">
                <h4 className="font-medium uppercase text-sm">What kind of partnership are you looking for</h4>
                <div className="w-full h-full flex flex-col gap-3 mt-1">
                  {[
                    "Product Collab (Feature your product with us)",
                    "Service Collab (Bundle OR Cross-promote)",
                    "Brand Promo (Get listed in our partner dictionary)",
                    "Service Collab (Bundle OR Cross-promote)",
                    "Event/ Campaign (Co-host OR Sponsor)",
                    "Affiliate/Referral (Earn through referrals)",
                    "Other (Please specify)",
                  ].map((label) => (
                    <label key={label} className="flex items-center gap-3 uppercase text-sm">
                      <input
                        type="radio"
                        name="partnershipType"
                        value={label}
                        checked={partnershipType === label}
                        onChange={(e) => setPartnershipType(e.target.value)}
                        className="accent-[#db4e9f]"
                      />
                      <span className="uppercase">{label}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  placeholder="Please specify"
                  className="text-sm border-2 border-[#db4e9f] px-5 py-2 min-h-[100px] rounded-xl"
                  disabled={partnershipType !== "Other (Please specify)"}
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166] mt-4">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                3
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


          </form>
          <Link
            href="/"
            className="w-fit h-[45px] px-12 text-base flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
          >
            SUBMIT <BsArrowRight className="ml-2 text-2xl" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Page;
