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

export default async function EventDetailPage({ params }) {
  const { id } = params;
  const event = await fetchEvent(id);
  if (!event) return notFound();

  return (
    <div className="w-full h-full">
      {event.coverImage && (
        <div className="w-full h-[600px] relative">
          <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 lg:px-0 py-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-antonio text-[#093166] uppercase">
            {event.title}
          </h1>
          <form action="/api/checkout" method="post">
            <input type="hidden" name="eventId" value={event._id} />
            <button className="px-4 py-2 bg-[#093166] text-white rounded-md hover:bg-[#093166]/90 whitespace-nowrap mt-2">
              Book now
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {event.description && (
              <p className="text-base text-gray-800 leading-relaxed">{event.description}</p>
            )}
          </div>
          <div className="md:col-span-1 space-y-3">
            {event.date && (
              <p className="text-sm text-gray-700">📅 {moment(event.date).format("MMMM Do YYYY, h:mm A")}</p>
            )}
            {event.location && (
              <p className="text-sm text-gray-700">📍 {event.location}</p>
            )}
            {event.price > 0 && (
              <p className="text-sm text-gray-700">🎟️ ₹{event.price}</p>
            )}
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


