"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function EventsPage() {
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

  // Custom Event Cell (shows image + title)
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
    <div className="p-6">
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

            <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
            <p className="text-gray-600 mb-2">
              📅 {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm A")}{" "}
              {selectedEvent.end &&
                ` - ${moment(selectedEvent.end).format("MMMM Do YYYY, h:mm A")}`}
            </p>
            {selectedEvent.location && (
              <p className="text-gray-600 mb-2">📍 {selectedEvent.location}</p>
            )}
            {selectedEvent.price > 0 && (
              <p className="text-gray-600 mb-2">
                🎟️ Ticket Price: ₹{selectedEvent.price}
              </p>
            )}
            {selectedEvent.description && (
              <p className="text-gray-800 mb-4">{selectedEvent.description}</p>
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
  );
}
