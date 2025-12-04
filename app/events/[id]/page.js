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
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) return notFound();
  console.log(event)
  const availability = await fetchAvailability(id);
  
  // Check if event date has passed
  const isEventPast = event.date ? moment(event.date).isBefore(moment(), 'day') : false;
  
  // Check if booking deadline has passed
  const isBookingDeadlinePassed = event.bookingDeadline ? moment(event.bookingDeadline).isBefore(moment()) : false;

  // Build event URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eklektikmama.com';
  const eventUrl = `${baseUrl}/events/${event._id}`;

  // Format dates for schema
  const eventStartDate = event.date ? moment(event.date).toISOString() : null;
  const eventEndDate = event.endDate ? moment(event.endDate).toISOString() : eventStartDate;
  
  // Build start datetime with time if available
  let startDate = eventStartDate;
  if (event.startTime && eventStartDate) {
    const timeParts = event.startTime.split(':');
    if (timeParts.length === 2) {
      startDate = moment(event.date).set({ hour: parseInt(timeParts[0]), minute: parseInt(timeParts[1]) }).toISOString();
    }
  }
  
  // Build end datetime with time if available
  let endDate = eventEndDate;
  if (event.endTime && eventEndDate) {
    const timeParts = event.endTime.split(':');
    if (timeParts.length === 2) {
      endDate = moment(event.endDate || event.date).set({ hour: parseInt(timeParts[0]), minute: parseInt(timeParts[1]) }).toISOString();
    }
  }

  // Determine event status
  let eventStatus = "https://schema.org/EventScheduled";
  if (isEventPast) {
    eventStatus = "https://schema.org/EventPostponed";
  } else if (!availability.available) {
    eventStatus = "https://schema.org/EventCancelled";
  }

  return (
    <div className="w-full h-full">
      {/* Event Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": event.title,
            "description": event.description || `${event.title} by Eklektik Mama`,
            "image": event.coverImage ? `${baseUrl}${event.coverImage}` : `${baseUrl}/desktopLogo.png`,
            "startDate": startDate,
            "endDate": endDate || startDate,
            "eventStatus": eventStatus,
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": event.location ? {
              "@type": "Place",
              "name": event.location,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Abu Dhabi",
                "addressRegion": "Abu Dhabi",
                "addressCountry": "AE",
                "streetAddress": event.location
              }
            } : {
              "@type": "Place",
              "name": "Abu Dhabi, UAE",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Abu Dhabi",
                "addressRegion": "Abu Dhabi",
                "addressCountry": "AE"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": "Eklektik Mama",
              "url": "https://eklektikmama.com",
              "email": "hello@eklektikmama.com",
              "sameAs": [
                "https://www.instagram.com/eklektikmama",
                "https://www.facebook.com/eklektikmama"
              ]
            },
            ...(event.segment === 'coffeeMeetup' || event.price >= 0 ? {
              "offers": {
                "@type": "Offer",
                "price": event.segment === 'coffeeMeetup' ? "0" : (event.price || 0).toString(),
                "priceCurrency": "AED",
                "availability": availability.available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
                "url": eventUrl,
                "validFrom": event.bookingDeadline ? moment(event.bookingDeadline).toISOString() : moment().toISOString()
              }
            } : {}),
            "url": eventUrl,
            "isAccessibleForFree": event.segment === 'coffeeMeetup' || event.price === 0
          })
        }}
      />
      {event.coverImage && (
        <div className="w-full h-[600px] relative">
          <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-5 py-6">
        <div className="flex items-start justify-between gap-4 lg:px-0 px-5">
          <div>
            <h1 className="text-3xl md:text-5xl font-poppins text-[#093166] uppercase">
              {event.title}
            </h1>
            {event.isMembersOnly && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <span className="mr-1">👑</span>
                Members Only Event
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Availability Status */}
            <div className="text-right">
              {isEventPast ? (
                <div className="text-sm text-gray-500 font-medium">
                  Event has passed
                </div>
              ) : isBookingDeadlinePassed ? (
                <div className="text-sm text-orange-600 font-medium">
                  Booking deadline passed
                </div>
              ) : availability.available ? (
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
            {isEventPast ? (
              <button 
                disabled 
                className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed whitespace-nowrap"
              >
                Event Passed
              </button>
            ) : isBookingDeadlinePassed ? (
              <button 
                disabled 
                className="px-4 py-2 bg-orange-400 text-white rounded-md cursor-not-allowed whitespace-nowrap"
              >
                Booking Closed
              </button>
            ) : availability.available ? (
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
            {event.segment === 'coffeeMeetup' ? (
              <p className="text-sm text-green-600 font-semibold">🎟️ FREE (Members Only)</p>
            ) : event.price > 0 && (
              <p className="text-sm text-gray-700">🎟️ AED {event.price}</p>
            )}
            {event.bookingDeadline && (
              <p className="text-sm text-gray-700">
                ⏰ Booking closes: {moment(event.bookingDeadline).format("MMMM Do YYYY, h:mm A")}
              </p>
            )}
            <div className="text-sm text-gray-700">
              <span className="font-medium">Availability:</span> {
                isEventPast 
                  ? "Event has passed" 
                  : `${availability.remaining} of ${availability.total} tickets remaining`
              }
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


