import { BsArrowRight, BsPlus } from "react-icons/bs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col bg-[#231f20] lg:pt-[170px] pt-[70px] relative overflow-hidden">
      <section className="w-full h-full flex flex-col items-center justify-start relative">
        <main className="w-full h-full flex items-center justify-start lg:pt-[50px] md:pt-[120px] pt-[80px] relative px-5">
          <div className="w-full h-full lg:max-w-[1000px] md:max-w-[600px] max-w-[380px] mx-auto relative overflow-visible">
            {/* Statue Image */}
            <div className="absolute md:-top-10 -top-14 -left-5 md:-left-20 w-[120px] lg:w-[150px] z-10">
              <Image
                src="/homepage/statue.png"
                alt="Statue"
                width={90}
                height={150}
                className="object-contain rotate-[-5deg] md:w-fit md:h-fit w-[60px] h-[70px]"
              />
            </div>

            {/* Heading */}
            <h1 className="lg:text-[6.5rem] md:text-[4rem] text-4xl tracking-tight leading-[130%] font-anton font-bold uppercase text-white relative z-0">
              Shaking Up Mamahood, <br />
              <b className="lg:text-[10rem] md:text-[5rem] text-4xl">
                your way
              </b>
            </h1>

            {/* Overlapping Images after text */}
            <div className="md:absolute relative  lg:top-[110px] md:top-[70px] lg:left-[57%] md:left-[45%] lg:scale-100 md:scale-90 scale-70 flex space-x-[-40px] z-10 overflow-visible">
              <Image
                src="/homepage/img1.png"
                alt="Image 1"
                width={120}
                height={190}
                className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md rotate-[-9deg] shadow-lg"
              />
              <Image
                src="/homepage/img2.png"
                alt="Image 2"
                width={130}
                height={190}
                className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md rotate-[0] shadow-lg overflow-visible"
              />
              <Image
                src="/homepage/img3.png"
                alt="Image 3"
                width={130}
                height={190}
                className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md rotate-[-6deg] translate-y-8 shadow-lg overflow-visible"
              />
              <Image
                src="/homepage/img4.png"
                alt="Image 4"
                width={130}
                height={190}
                className="object-cover w-fit h-fit max-w-[130px] max-h-[190px] rounded-md rotate-[9deg] shadow-lg overflow-visible"
              />
            </div>
          </div>
        </main>

        <p className="max-w-[600px] mx-auto font-quicksand lg:mt-10 md:mt-24 mt-5 px-4 text-center text-white lg:text-lg md:text-base text-sm">
          Welcome to Eklektik Mama™, where motherhood meets rebellion. A home
          for bold mums, BYOBaby™ events, unapologetic blogs, and gear you
          didn’t know you needed.
        </p>

        <Link
          href="/"
          className="w-[190px] h-[45px] text-base flex items-center justify-center uppercase mx-auto text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
        >
          VIEW EVENTS
        </Link>
      </section>

      <section className="w-full h-full flex lg:flex-row flex-col-reverse items-center justify-start relative bg-white py-10 lg:gap-0 gap-10">
        <div className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 px-5 text-[#093166]">
          <p className="font-quicksand font-semibold uppercase text-base">
            About Us
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-anton leading-[100%]">
            why{" "}
            <b className="font-antonio font-normal tracking-tight">
              we’re here
            </b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            Because being a mum doesn’t mean disappearing into soft pastels,
            sugar-coated advice, or a WhatsApp group that only talks about nap
            schedules. Eklektik Mama™ was born from the chaos — the 3AM feeds,
            the unfiltered rants, the fierce need for community that actually
            gets it.
            <br />
            We’re here for bold mums who crave more than just “mommy & me” — who
            want real conversations, real connection, and a little rebellion
            with their baby wipes. Through BYOBaby™ events, unapologetic blog
            posts, and gear you didn’t know you needed, we’re building something
            that feels like solidarity (not sanitised sisterhood).
            <br />
            This isn’t a parenting platform. It’s a movement. And if that sounds
            like your kind of mess — welcome home.
          </p>
          <Link
            href="/"
            className="w-fit h-[45px] px-12 text-base flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
          >
            LEARN MORE ABOUT US <BsArrowRight className="ml-2 text-2xl" />
          </Link>
        </div>
        <div className="w-full h-full flex flex-col justify-center  items-center md:basis-1/2 basis-full pr-0">
          <span className="md:w-[350px] md:h-[450px] w-[250px] h-[300px] relative">
            <Image
              src="/homepage/img3.png"
              height={500}
              width={400}
              className="absolute top-0 md:left-[-150px] left-[-50px] md:w-full md:h-full w-[250px] h-[300px] md:max-w-[350px] md:max-h-[450px]"
              alt="image"
            />
            <Image
              src="/homepage/img2.png"
              height={500}
              width={400}
              className="absolute top-0 md:left-0 left-10 md:w-full md:h-full w-[250px] h-[300px] md:max-w-[350px] md:max-h-[450px]"
              alt="image"
            />
            <Image
              src="/homepage/evileye.png"
              height={500}
              width={400}
              className="absolute md:bottom-[-50px] bottom-[-20px] md:left-[-100px] left-[0px] md:w-[200px] md:h-[200px] w-[120px] h-[120px]"
              alt="image"
            />
            <Image
              src="/homepage/branding.png"
              height={500}
              width={400}
              className="absolute md:top-[30%] top-[30%] md:right-[-30%] right-[-35%] md:w-[200px] md:h-[200px] w-[120px] h-[120px]"
              alt="image"
            />
          </span>
        </div>
      </section>

      <section className="w-full h-full flex flex-col bg-white md:px-10 px-5">
        <div className="w-full h-full flex flex-col text-[#093166] px-10">
          <p className="font-quicksand font-semibold uppercase text-base">
            Step right into
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio tracking-tighter leading-[100%]">
            The Good <b className="font-anton tracking-normal">Stuff</b>
          </h2>
        </div>
        <div className="w-full h-full lg:px-10 py-10">
          <Carousel>
            <CarouselContent>
              <CarouselItem className="w-full h-full grid grid-cols-4 gap-5">
                <div className="bg-pink-400 w-full h-full min-h-[300px] col-span-2 p-3 rounded-sm flex flex-row gap-5 overflow-hidden">
                  <Image
                    src="/homepage/party.webp"
                    width={500}
                    height={500}
                    alt="img"
                    className="basis-1/2 rounded-md w-full h-full bg-cover max-h-[400px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative basis-1/2">
                    <Image
                      src="/homepage/pen.png"
                      width={150}
                      height={150}
                      alt="img"
                      className="absolute bottom-14 right-[-20] w-fit h-fit"
                    />
                    <h4 className="uppercase font-poppins font-bold text-4xl text-white">
                      Get Eklektik <br /> AF
                    </h4>
                    <p className="text-base font-quicksand text-white font-medium">
                      Ready for early access, cheeky discounts, and WhatsApp
                      group chaos you’ll actually enjoy? Membership starts at
                      AED 50/month.
                    </p>
                    <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm bg-white rounded-full font-medium font-poppins flex flex-row items-center justify-start gap-5 px-3 py-1.5 ">
                        JOIN THE MEMBERSHIP{" "}
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className="bg-white rounded-full p-1 text-2xl font-bold">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>
                <div className="w-full h-full min-h-[300px] flex flex-col col-span-1 p-3 rounded-sm border-2 border-[#093166]">
                  <Image
                    src="/homepage/mum.png"
                    width={500}
                    height={300}
                    alt="img"
                    className="rounded-md w-full h-[170px] bg-cover max-h-[200px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      What’s On
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-semibold">
                      BYOBaby™ Events: Breakfasts, cinema mornings, and IRL
                      convos. View this month’s line-up or miss out.
                    </p>
                    <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 ">
                        SEE THE LINEUP{" "}
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className="bg-white rounded-full p-1 text-2xl font-bold border-[1px] border-[#093166]">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>
                <div className="bg-[#093166] w-full min-h-[300px] col-span-1 p-3 rounded-sm row-span-2 flex flex-col">  
                  {/* Image Section */}
                  <Image
                    src="/homepage/bag.png"
                    width={500}
                    height={300}
                    alt="img"
                    className="rounded-md w-full h-auto max-h-[400px] object-cover"
                  />

                  {/* Text Section */}
                  <span className="py-4 w-full flex flex-col justify-start items-start relative flex-grow">
                    <Image
                      src="/homepage/statue.png"
                      width={100}
                      height={100}
                      alt="img"
                      className="absolute bottom-14 right-10"
                    />
                    <h4 className="uppercase font-poppins font-bold text-4xl text-white">
                      Shop drops
                    </h4>
                    <p className="text-base font-quicksand text-white font-semibold">
                      Downloads for surviving the mess and thriving anyway. No
                      pastels. No pandering.
                    </p>

                    {/* Buttons */}
                    <span className="w-full mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] justify-start gap-5 px-3 py-1.5 border border-white">
                        SHOP THE DROP{" "}
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className="rounded-full p-1 text-2xl font-bold border-[1px] border-white text-white">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>

                <div className="w-full h-full flex flex-row col-span-3 min-h-[300px] p-3 rounded-sm gap-5 border-2 border-[#093166]">
                   <Image
                    src="/homepage/vibes.png"
                    width={500}
                    height={500}
                    alt="img"
                    className="basis-1/2 rounded-md w-full h-full bg-cover max-h-[400px] max-w-[200px]"
                  />
                  <Image
                    src="/homepage/board.png"
                    width={500}
                    height={500}
                    alt="img"
                    className="basis-1/2 rounded-md w-full h-full bg-cover max-h-[400px] max-w-[400px]"
                  />
                  <span className="py-4 w-full h-full flex flex-col justify-start items-start relative basis-1/2">
                    <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                      Unfiltered blogs
                    </h4>
                    <p className="text-base font-quicksand text-[#093166] font-medium">
                      Our blog. Therapy-adjacent. Censorship-free.
                    </p>
                    <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                      <button className="text-sm bg-[#093166] text-white rounded-full font-medium font-poppins flex flex-row items-center justify-start gap-5 px-3 py-1.5 ">
                        READ THE BLOG
                        <BsArrowRight className="text-lg font-bold" />
                      </button>
                      <button className=" rounded-full p-1 text-2xl font-bold border-[1px] border-[#093166] text-[#093166]">
                        <BsPlus />
                      </button>
                    </span>
                  </span>
                </div>
              </CarouselItem>
              <CarouselItem>.2.</CarouselItem>
              <CarouselItem>.3.</CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="text-[#093166] border-2 border-[#093166]" />
            <CarouselNext className="text-[#093166] border-2 border-[#093166]" />
          </Carousel>
        </div>
      </section>
    </div>
  );
}
