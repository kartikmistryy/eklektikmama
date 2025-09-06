import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import moment from "moment";

export const dynamic = "force-dynamic";

async function fetchEvent(id) {
  const hdrs = headers();
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/events/${id}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchAvailability(id) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/events/${id}/availability`, {
    cache: 'no-store'
  });
  if (!res.ok) return { available: true, remaining: 10, total: 10 };
  return res.json();
}

export default async function EventDetailPage({ params }) {
  const { id } = params;
  const event = await fetchEvent(id);
  if (!event) return notFound();
  
  const availability = await fetchAvailability(id);


  return (
    <div className="w-full h-full">
      {event.coverImage && (
        <div className="w-full h-[600px] relative">
          <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-5 py-6">
        <div className="flex items-start justify-between gap-4 lg:px-0 px-5">
          <h1 className="text-3xl md:text-5xl font-poppins text-[#093166] uppercase">
            {event.title}
          </h1>
          <div className="flex flex-col items-end gap-2">
            {/* Availability Status */}
            <div className="text-right">
              {availability.available ? (
                <div className="text-sm text-green-600 font-medium">
                  {availability.remaining} tickets left
                </div>
              ) : (
                <div className="text-sm text-red-600 font-medium">
                  Fully booked
                </div>
              )}
            </div>
            
            {/* Book Now Button */}
            {availability.available ? (
              <a href={`/events/${event._id}/book`}>
                <button className="px-4 py-2 bg-[#093166] text-white rounded-md hover:bg-[#093166]/90 whitespace-nowrap">
                  Book Now
                </button>
              </a>
            ) : (
              <button 
                disabled 
                className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed whitespace-nowrap"
              >
                Fully Booked
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 ">
            {event.description && (
              <div className="space-y-4">
                {event.description
                  .split(/\s{2,}/) // Split on 2 or more spaces
                  .filter(paragraph => paragraph.trim()) // Remove empty paragraphs
                  .map((paragraph, index) => (
                    <p key={index} className="text-base font-quicksand text-gray-800 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
            )}
          </div>
          <div className="md:col-span-1 space-y-3">
            {event.date && (
              <p className="text-sm text-gray-700">
                📅 {moment(event.date).format("MMMM Do YYYY")}
                {event.startTime && (
                  event.endTime && event.endTime !== event.startTime
                    ? `, ${moment(`2000-01-01T${event.startTime}`).format("h:mm A")} - ${moment(`2000-01-01T${event.endTime}`).format("h:mm A")}`
                    : `, ${moment(`2000-01-01T${event.startTime}`).format("h:mm A")}`
                )}
              </p>
            )}
            {event.location && (
              <p className="text-sm text-gray-700">📍 {event.location}</p>
            )}
            {event.price > 0 && (
              <p className="text-sm text-gray-700">🎟️ AED {event.price}</p>
            )}
            <div className="text-sm text-gray-700">
              <span className="font-medium">Availability:</span> {availability.remaining} of {availability.total} tickets remaining
            </div>
            {event.location && (
              <iframe
                className="w-full h-64 rounded-md border"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


