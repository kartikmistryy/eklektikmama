"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight, BsDownload, BsPlus, BsWhatsapp } from "react-icons/bs";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const Events = () => {
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
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/partner/header.webp')] bg-cover bg-center pt-20">
        <div className="w-full h-full grow min-h-full flex flex-col items-center justify-center">
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            Events that don’t
            <br />
            <b className="md:text-[115px] text-[70px]">suck</b>
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
      <section className="flex lg:flex-row flex-col-reverse w-full h-full items-stretch">
        <div className="lg:w-1/2 w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 lg:basis-1/2">
          <p className="font-quicksand font-semibold text-base">Stuff</p>
          <h2 className="md:text-[80px] text-5xl uppercase font-anton leading-[100%]">
            Worth{" "}
            <b className="font-antonio font-medium tracking-tight">
              Showing <br />
              Up For
            </b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            Every IRL event falls under BYOBaby™. Bring your baby (or
            don’t)—just bring your whole self. We keep things small so the
            connection’s big. Think fewer icebreakers, more belly laughs.
          </p>
          <p className="font-quicksand font-semibold text-base mt-10">
            Tags / Filters
          </p>

          <div className="w-full h-full flex flex-row flex-wrap gap-4 mt-4">
            <button className="w-fit lg:h-[45px] h-[35px] lg:text-sm px-3 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100 font-poppins">
              {" "}
              <b className="mr-2">BYOBaby™</b> Mama Breakfast
            </button>
            <button className="w-fit lg:h-[45px] h-[35px] lg:text-sm  px-3 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100 font-poppins">
              {" "}
              <b className="mr-2">BYOBaby™</b> Cinema Morning
            </button>
            <button className="w-fit lg:h-[45px] h-[35px] lg:text-sm  px-3 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100 font-poppins">
              {" "}
              <b className="mr-2">BYOBaby™</b> Mama Fit
            </button>
            <button className="w-fit lg:h-[45px] h-[35px] lg:text-sm  px-3 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100 font-poppins">
              {" "}
              Eklektik Edit
            </button>
            <button className="w-fit lg:h-[45px] h-[35px] lg:text-sm  px-3 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100 font-poppins">
              {" "}
              Do Not <b className="mx-2">BYOBaby™</b> Mama Nights
            </button>
            <br />
            <button className="w-fit lg:h-[40px] h-[35px] lg:text-sm  px-4 text-xs flex items-center justify-center uppercase text-white rounded-[20px] border-2 border-[#bf378b] bg-[#dc5ca6] transition-colors duration-500 ease-in-out scale-100 font-poppins">
              View All
            </button>
          </div>
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

      <section className="flex flex-col w-full h-full items-stretch">
        <div className="w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 ">
          <p className="font-quicksand font-semibold text-base">2025</p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-bold leading-[100%] tracking-tight">
            Calendar view
            <b className="font-antonio font-light">/List view</b>
          </h2>
        </div>
        {/* Calendar */}
        <div className="p-6 w-full h-full lg:px-14 px-8">
          <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>

          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            components={{
              event: EventCard, // custom render
            }}
            onSelectEvent={(event) => setSelectedEvent(event)}
          />

          {/* Event Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                >
                  ✖
                </button>

                {selectedEvent.coverImage && (
                  <img
                    src={selectedEvent.coverImage}
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}

                <h2 className="text-2xl font-bold mb-2">
                  {selectedEvent.title}
                </h2>
                <p className="text-gray-600 mb-2">
                  📅{" "}
                  {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm A")}{" "}
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

                <button
                  onClick={() => alert("Booking flow goes here")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Book Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="w-full h-full flex flex-col gap-5 mt-10">
        <div className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5">
          <p className="font-quicksand font-semibold text-base">what’s hot</p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-thin leading-[100%] tracking-tighter">
            View This Month’s <b className="tracking-tight font-bold">Events</b>
          </h2>
        </div>

        <div className="w-full h-full bg-[#db4e9f] my-5">
          <div className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 flex flex-row justify-between items-center">
            <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
              The Eklektik Edit — August Session: Good Mums
            </p>

            <BsArrowRight className="lg:text-3xl text-xl text-white" />
          </div>
          <hr />
          <div className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 flex flex-row justify-between items-center">
            <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
              Unsupervised: A Morning with Eklektik
            </p>

            <BsArrowRight className="lg:text-3xl text-xl text-white" />
          </div>
          <hr />
          <div className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 flex flex-row justify-between items-center">
            <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
              The Soft Launch of Losing It
            </p>

            <BsArrowRight className="lg:text-3xl text-xl text-white" />
          </div>
          <hr />
          <div className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 flex flex-row justify-between items-center">
            <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
              Leave the House, Keep the Baby
            </p>

            <BsArrowRight className="lg:text-3xl text-xl text-white" />
          </div>
          <hr />
        </div>
      </section>
      <section className="w-full h-full flex flex-col gap-5 mt-10">
        <div className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5">
          <p className="font-quicksand font-semibold text-base">
            #MumsThatGetIt
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase tracking-tighter font-antonio font-thin leading-[100%]">
            CONNECTED <b className="tracking-tight font-bold">AF</b>
          </h2>
        </div>
        <div className="w-full h-full lg:px-12 px-5">
          <div className="w-full h-full flex flex-row col-span-3 min-h-[300px] p-3 rounded-sm gap-5 border-2 border-[#093166]">
            <Image
              src="/homepage/vibes.webp"
              width={500}
              height={500}
              alt="img"
              className="basis-1/2 rounded-md w-full object-cover object-center self-stretch max-w-[200px]"
            />
            <Image
              src="/homepage/vibes.webp"
              width={500}
              height={500}
              alt="img"
              className="basis-1/2 rounded-md w-full object-cover object-center self-stretch max-w-[150px]"
            />
            <Image
              src="/homepage/vibes.webp"
              width={500}
              height={500}
              alt="img"
              className="basis-1/2 rounded-md w-full object-cover object-center self-stretch max-w-[250px]"
            />
            <span className="py-4 w-full self-stretch flex flex-col justify-start items-start relative basis-1/2">
              <h4 className="uppercase font-poppins font-bold text-4xl text-[#093166]">
                you’ve entered the chat
              </h4>
              <p className="text-base font-quicksand text-[#093166] font-medium">
                Think of it as your inner circle — but louder, realer, and way
                more fun. Join our WhatsApp group for early access to events,
                honest convos, and the kind of mum chat you actually want to be
                part of.
              </p>
              <span className="w-full h-fit mt-auto flex flex-row items-center justify-between pr-2">
                <button className="text-sm bg-[#093166] text-white rounded-full font-medium font-poppins flex flex-row items-center justify-start gap-5 px-3 py-1.5 ">
                  JOIN NOW
                  <BsArrowRight className="text-lg font-bold" />
                </button>
                <button className=" rounded-full p-1 text-2xl font-bold border-[1px] text-[#093166]">
                  <BsWhatsapp className="text-3xl font-bold" />
                </button>
              </span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
