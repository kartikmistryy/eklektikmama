import Image from "next/image";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";

const Page = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/homepage/bar.webp')] bg-cover bg-center pt-20">
        <div className="w-full h-full grow min-h-full flex flex-col items-center justify-center">
          <h1 className="w-fit md:text-[90px] text-[40px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            Eklektik Mama <br />
            <b className="md:text-[130px] text-[60px]">Loves</b>
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
            className="w-fit h-[45px] px-12 text-base flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
          >
            PARTNER WITH US <BsArrowRight className="ml-2 text-2xl" />
          </Link>
        </div>
        <div className="w-full self-stretch flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0 bg-[url('/homepage/bar.webp')] bg-cover bg-center min-h-full"></div>
      </section>

      <section className="w-full h-full flex flex-col items-start justify-start relative bg-white  lg:gap-0 gap-10">
        <h2 className="md:text-[80px] font-thin text-[#093166] text-5xl uppercase font-antonio leading-[100%] lg:px-10 px-5 flex items-center justify-center text-center w-full py-10">
          our
          <b className="font-anton font-normal tracking-tight md:text-[80px] text-5xl ml-5 mt-3">
            Partners
          </b>
        </h2>
        <div className="w-full h-full lg:gap-10 gap-5 bg-[#d756a1] lg:p-10 p-7">
          <div className="w-full h-full grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 max-w-[1400px] mx-auto gap-10">
            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <h1>TIDM</h1>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">Toys and activities to keep kids happy while you unwind.</h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <h1>TIDM</h1>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">ECOMA nappies: biodegradable, vegan, planet-friendly.</h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <h1>TIDM</h1>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">Safety on Board: UAE’s first child car seat specialist.</h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <h1>TIDM</h1>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">Wolves Zone MMA: training for strength and confidence.</h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full lg:flex hidden flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5 "></div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <h1>TIDM</h1>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">Sitters: professional childcare so you can enjoy our events worry-free.</h3>
              <Link
                href="/"
                className="w-fit h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] my-6 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75 col-[]"
              >
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center lg:basis-1/4 md:basis-1/3 basis-full gap-5">
              <h1>TIDM</h1>
              <h3 className="lg:text-lg text-base font-quicksand text-white text-center">Cozy kids’ book corner for storytime while you connect.</h3>
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
    </div>
  );
};

export default Page;
