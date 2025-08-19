"use client";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function EventsCalendar({ events }) {
  const [value, setValue] = useState(new Date());

  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Calendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  style={{ height: 700 }}
  components={{
    event: () => null, // hide default event box
    dateCellWrapper: DateCellWrapper, // custom cell with bg image
  }}
  onSelectEvent={(event) => setSelectedEvent(event)}
/>
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Events on {value.toDateString()}
        </h2>
        {eventsByDate[value.toDateString()]?.length ? (
          eventsByDate[value.toDateString()].map((event) => (
            <div key={event._id} className="p-3 border rounded mb-2">
              <img src={event.coverImage} alt={event.title} className="w-full h-32 object-cover rounded" />
              <h3 className="font-bold">{event.title}</h3>
              <p>{event.location}</p>
              <p>₹{event.price}</p>
            </div>
          ))
        ) : (
          <p>No events</p>
        )}
      </div>
    </div>
  );
}
