import Image from "next/image";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import Marquee from "../components/Marquee";

const Page = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/homepage/bar.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <div className="w-full h-full grow min-h-full flex flex-col items-center justify-center">
          <h1 className="w-fit md:text-[90px] text-[40px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            WHAT REALLY
            <br />
            <b className="md:text-[130px] text-[60px]">WENT DOWN</b>
          </h1>
        </div>
        <Marquee />
      </section>

      <section className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white py-10 lg:gap-0 gap-10">
        <div className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full lg:pl-14 md:pr-0 px-5 text-[#093166]">
          <p className="font-quicksand font-semibold uppercase text-base">
            Unleashed
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio leading-[100%]">
            reLIVE <br />
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
        </div>
        <div className="w-full h-full flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0 ">
          <span className="md:w-[350px] md:h-[450px] w-[250px] h-[300px] relative">
            <Image
              src="/highlights/s1.webp"
              height={500}
              width={400}
              className="absolute top-26 md:-left-[200px] left-32 md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px]"
              alt="image"
            />
            <Image
              src="/highlights/s2.webp"
              height={500}
              width={400}
              className="absolute top-[70px] md:left-[0] left-[-50px] md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px]"
              alt="image"
            />
            <Image
              src="/highlights/s3.webp"
              height={500}
              width={400}
              className="absolute top-[50px] md:left-[160px] left-0 md:w-full md:h-full w-[200px] h-[250px] md:max-w-[260px] md:max-h-[340px]"
              alt="image"
            />
            <Image
              src="/highlights/sun.webp"
              height={500}
              width={400}
              className="absolute md:top-[0%] top-[30%] md:right-[-40%] right-[-35%] md:w-[100px] md:h-[100px] w-[80px] h-[80px]"
              alt="image"
            />
          </span>
        </div>
      </section>

      <section className="w-full h-full flex flex-col py-10 lg:gap-0 gap-10">
        <div className="w-full h-full flex flex-col text-[#093166] md:pr-0 lg:px-10 px-5">
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio leading-[100%]">
            see <b className="font-antonio font-bold">Past events.</b>
          </h2>
          <p className="font-quicksand font-semibold uppercase text-base mt-5">
            Tags / Filters
          </p>
        </div>
        <div className="flex flex-wrap gap-3 max-w-[1000px] lg:px-10 px-5 my-5">
          <span className="px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-300 text-[#093166]">
            <b className="mr-2">BYOBaby™</b> Mama Breakfast
          </span>
          <span className="px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-300 text-[#093166]">
            <b className="mr-2">BYOBaby™</b> Cinema Morning
          </span>
          <span className="px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-300 text-[#093166]">
            <b className="mr-2">Community Events</b>
          </span>
          <span className="px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-300 text-[#093166]">
            <b className="mr-2">BYOBaby™</b> MaMA Fit
          </span>
          <span className="px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-300 text-[#093166]">
            <b className="mr-2">Eklektik Edit</b>
          </span>
          <span className="px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-300 text-[#093166]">
            <b className="mr-2">Do Not BYOBaby™</b> Mama Nights
          </span>
          <span className="px-6 h-[45px] text-base flex items-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-[#bf378b] text-white transition-colors duration-300">
            View All
          </span>
        </div>

        <div className="w-full h-full flex md:flex-row flex-col flex-wrap gap-4 justify-start lg:px-10 px-5 py-5">
          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/2.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>

          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/3.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>
          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/4.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>
          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/5.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>
          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/6.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>
          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/7.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>
          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/8.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>

          <div className="w-full md:max-w-[330px] md:min-w-[330px] flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
            <Image
              src="/highlights/9.webp"
              width={500}
              height={300}
              alt="img"
              className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
            />
            <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                EVENT NAME
              </h4>
              {/* <p className="text-base font-quicksand text-[#093166] font-semibold">
                                BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                                convos. View this month’s line-up or miss out.
                              </p> */}
              <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 mt-auto ml-auto">
                VIEW ALL
                <BsArrowRight className="text-lg font-bold" />
              </button>
            </span>
          </div>

          
        </div>
      </section>

      <section className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white  lg:gap-0 gap-10">
        <div className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 md:pr-0 px-5 text-[#093166] py-10">
          <p className="font-quicksand font-semibold text-base">
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
            or activate something bold — we’ll make sure they remember you for
            all the right reasons.
          </p>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-6 px-3 md:text-base text-sm flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100"
          >
            WORK WITH US <BsArrowRight className="ml-2 md:text-2xl text-lg" />
          </Link>
        </div>
        <div className="w-full self-stretch flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0 bg-[url('/highlights/brand.webp')] bg-cover bg-center min-h-full"></div>
      </section>
    </div>
  );
};

export default Page;
