"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BsArrowRight, BsWhatsapp } from "react-icons/bs";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Marquee from "../components/Marquee";
import DateCellWrapper from "../components/DateCellWrapper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import EventsCalendar from "../components/EventsCalendar";

const localizer = momentLocalizer(moment);

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();

      const mapped = data.map((event) => ({
        id: event._id,
        title: event.title,
        start: new Date(event.date),
        end: new Date(event.endDate || event.date),
        coverImage: event.coverImage,
        description: event.description,
        location: event.location,
        price: event.price,
      }));
      setEvents(mapped);
    }
    fetchEvents();
  }, []);

  const EventCard = ({ event }) => (
    <div className="flex flex-col items-start">
      {event.coverImage && (
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-12 object-cover rounded mb-1"
        />
      )}
      <span className="text-sm font-medium">{event.title}</span>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Hero */}
      <section className="w-full flex min-h-[90vh] flex-col items-center justify-end bg-[url('/headerBg/events.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* <h1 className="text-center font-anton uppercase leading-[130%] text-[#f6f6f6]">
            <span className="block text-[45px] md:text-[85px] font-bold">
              Events that don’t
            </span>
            <b className="block text-[70px] md:text-[115px]">suck</b>
          </h1> */}
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            Events that don’t
            <br />
            <b className="md:text-[100px] text-[60px]">suck</b>
          </h1>
        </div>
        <Marquee />
      </section>

      {/* Intro Section */}
      <section className="flex flex-col-reverse lg:flex-row w-full items-stretch">
        <div className="lg:w-1/2 w-full px-5 lg:pl-14 py-10 text-[#093166]">
          <p className="font-quicksand font-semibold">Stuff</p>
          <h2 className="text-5xl md:text-[80px] uppercase font-anton leading-[100%]">
            Worth{" "}
            <b className="font-antonio font-medium tracking-tight">
              Showing <br /> Up For
            </b>
          </h2>
          <p className="mt-6 font-quicksand font-medium lg:text-base">
            Every IRL event falls under BYOBaby™. Bring your baby (or
            don’t)—just bring your whole self...
          </p>
          {/* Tag Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              "BYOBaby™ Mama Breakfast",
              "BYOBaby™ Cinema Morning",
              "BYOBaby™ Mama Fit",
              "Eklektik Edit",
              "Do Not BYOBaby™ Mama Nights",
            ].map((tag, i) => (
              <button
                key={i}
                className="px-3 py-2 text-xs lg:text-sm uppercase border-2 border-[#bf378b] rounded-[20px] bg-transparent hover:bg-[#bf378b] hover:text-white transition"
              >
                {tag}
              </button>
            ))}
            <button className="px-4 py-2 text-xs lg:text-sm uppercase text-white bg-[#dc5ca6] border-2 border-[#bf378b] rounded-[20px]">
              View All
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <Image
            src="/events/subheader.webp"
            alt="aboutImg"
            width={1000}
            height={1000}
            className="w-full h-full max-h-[700px] object-cover lg:rounded-tl-xl lg:rounded-bl-xl"
          />
        </div>
      </section>

      {/* Calendar Section */}
      <section className="flex flex-col w-full py-10">
        <div className="px-5 lg:px-14 text-[#093166] mb-10">
          <p className="font-quicksand font-semibold">2025</p>
          <h2 className="text-5xl md:text-[80px] uppercase font-antonio font-bold leading-[100%]">
            Calendar view <b className="font-light">/List view</b>
          </h2>
        </div>

        <EventsCalendar/>

        {/* Event Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              >
                ✖
              </button>
              {selectedEvent.coverImage && (
                <Image
                width={500}
                height={500}
                  src={selectedEvent.coverImage}
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
              <p className="text-gray-600 mb-2">
                📅 {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm A")}
                {selectedEvent.end &&
                  ` - ${moment(selectedEvent.end).format(
                    "MMMM Do YYYY, h:mm A"
                  )}`}
              </p>
              {selectedEvent.location && (
                <p className="text-gray-600 mb-2">
                  📍 {selectedEvent.location}
                </p>
              )}
              {selectedEvent.price > 0 && (
                <p className="text-gray-600 mb-2">
                  🎟️ Ticket Price: ₹{selectedEvent.price}
                </p>
              )}
              {selectedEvent.description && (
                <p className="text-gray-800 mb-4">
                  {selectedEvent.description}
                </p>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Book Ticket
              </button>
            </div>
          </div>
        )}
      </section>

      {/* What's Hot Section */}
      <section className="w-full flex flex-col gap-5 mt-10">
        <div className="px-5 lg:px-10 text-[#093166]">
          <p className="font-quicksand font-semibold">Explore</p>
          <h2 className="text-5xl md:text-[80px] uppercase font-antonio font-thin leading-[100%] tracking-tighter">
            Check <b className="font-bold">Previous Events</b>
          </h2>
        </div>

        <Carousel className="w-full h-full flex flex-row overflow-scroll gap-4 justify-start ">
          <CarouselContent className="w-full h-full flex flex-row justify-between items-center gap-4 lg:px-10 px-5 py-5">
            <CarouselItem className="w-full md:max-w-[330px] md:min-w-[330px] min-w-full flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166] ml-4">
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
            </CarouselItem>

            <CarouselItem className="w-full md:max-w-[330px] md:min-w-[330px] min-w-full flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
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
            </CarouselItem>

<CarouselItem className="w-full md:max-w-[330px] md:min-w-[330px] min-w-full flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
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
            </CarouselItem>

            <CarouselItem className="w-full md:max-w-[330px] md:min-w-[330px] min-w-full flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
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
            </CarouselItem>

            <CarouselItem className="w-full md:max-w-[330px] md:min-w-[330px] min-w-full flex-1 min-h-[400px] flex flex-col p-3 rounded-sm border-2 border-[#093166]">
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
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </section>

      {/* Connected AF Section */}
      <section className="w-full flex flex-col gap-5 mt-10 px-5 lg:px-12">
        <div className="text-[#093166]">
          <p className="font-quicksand font-semibold">#MumsThatGetIt</p>
          <h2 className="text-5xl md:text-[80px] uppercase font-antonio font-thin leading-[100%]">
            CONNECTED <b className="font-bold">AF</b>
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 border-2 border-[#093166] rounded-md p-3">
          <Image
            src="/events/c1.webp"
            alt="img1"
            width={400}
            height={400}
            className="w-full lg:w-1/4 object-cover rounded-md"
          />
          <Image
            src="/events/c2.webp"
            alt="img2"
            width={400}
            height={400}
            className="w-full lg:w-1/4 object-cover rounded-md"
          />
          <Image
            src="/events/c3.webp"
            alt="img3"
            width={400}
            height={400}
            className="w-full lg:w-1/4 object-cover rounded-md"
          />
          <div className="flex flex-col justify-between w-full lg:w-1/2">
            <h4 className="uppercase font-poppins font-bold text-2xl lg:text-4xl text-[#093166]">
              you’ve entered the chat
            </h4>
            <p className="text-base font-quicksand font-medium text-[#093166] mt-3">
              Think of it as your inner circle — but louder, realer, and way
              more fun...
            </p>
            <div className="flex items-center justify-between mt-5">
              <button className="text-sm bg-[#093166] text-white rounded-full font-medium flex items-center gap-2 px-3 py-1.5">
                JOIN NOW <BsArrowRight />
              </button>
              <button className="text-2xl text-[#093166] p-2 rounded-full">
                <BsWhatsapp />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
