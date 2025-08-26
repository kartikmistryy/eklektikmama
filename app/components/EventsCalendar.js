import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function EventsCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setViewMode('list');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const DateCellWrapper = ({ value, children, events }) => {
    const event = events.find(
      (ev) =>
        moment(ev.start).isSame(value, "day") ||
        moment(value).isBetween(ev.start, ev.end, "day", "[]")
    );

    // Check if this is a day of the current month
    const isCurrentMonth = moment(value).isSame(moment(), 'month');

    return (
      <div
        className="relative w-full h-full"
        style={{
          backgroundImage: event?.coverImage ? `url(${event.coverImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: isCurrentMonth ? '#F6F6F6' : 'transparent',
        }}
      >
        <div className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded ${
          isCurrentMonth 
            ? 'bg-[#093166] text-white' 
            : 'bg-black/50 text-white'
        }`}>
          {moment(value).date()}
        </div>
        {event && (
          <div className="absolute bottom-1 left-0 w-full text-center text-white text-[10px] md:text-xs truncate bg-black/50 px-1">
            {event.title}
          </div>
        )}
        {children}
      </div>
    );
  };

  // Custom toolbar to show month navigation
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span className="text-xl font-bold">{date.format('MMMM YYYY')}</span>
      );
    };

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button onClick={goToBack} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            &lt; Prev
          </button>
          <button onClick={goToCurrent} className="px-3 py-1 bg-[#DB4E9F] text-white rounded hover:bg-[#DB4E9F]/80">
            Today
          </button>
          <button onClick={goToNext} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            Next &gt;
          </button>
        </div>
        <div className="uppercase font-antonio text-[#093166]">{label()}</div>
      </div>
    );
  };

  // List view component for mobile
  const ListView = () => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
    
    return (
      <div className="space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No events scheduled</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start space-x-4">
                {event.coverImage && (
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📅 {moment(event.start).format("dddd, MMMM Do YYYY")}
                    {event.start !== event.end && (
                      <span> - {moment(event.end).format("dddd, MMMM Do YYYY")}</span>
                    )}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {event.location}
                    </p>
                  )}
                  {event.price > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      🎟️ ₹{event.price}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-white">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left mb-4 md:mb-0 font-antonio uppercase text-[#093166]">
            Events Calendar
          </h1>
          
          {/* View Toggle - Only show on mobile or when user wants to switch */}
          <div className="flex justify-center md:justify-end">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#DB4E9F] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[#DB4E9F] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Mobile List View */}
        {viewMode === 'list' && (
          <ListView />
        )}

        {/* Desktop Calendar View */}
        {viewMode === 'calendar' && (
          <>
            {/* Custom days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-1 bg-gray-100 py-2 rounded-t-lg">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "740px", minWidth: "800px" }}
                components={{
                  event: EventCard,
                  dateCellWrapper: (props) => (
                    <DateCellWrapper {...props} events={events} />
                  ),
                  toolbar: CustomToolbar
                }}
                onSelectEvent={(event) => setSelectedEvent(event)}
              />
            </div>
          </>
        )}

        {selectedEvent && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 z-10"
              >
                ✖
              </button>
              {selectedEvent.coverImage && (
                <img
                  src={selectedEvent.coverImage}
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h2 className="text-xl md:text-2xl font-bold mb-2 pr-8">{selectedEvent.title}</h2>
              <p className="text-gray-600 mb-2">
                📅 {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm A")}
                {selectedEvent.end &&
                  ` - ${moment(selectedEvent.end).format("MMMM Do YYYY, h:mm A")}`}
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
      </div>

      <style jsx global>{`
        /* Fix for react-big-calendar to show days of week */
        .rbc-month-header {
          display: none !important;
        }
        
        .rbc-month-view {
          border: none;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        
        .rbc-day-bg {
          border: 1px solid #e5e7eb;
        }
        
        .rbc-date-cell {
          text-align: left;
          padding: 4px;
        }
        
        .rbc-row-content {
          z-index: 1;
        }
        
        .rbc-toolbar {
          display: none;
        }

        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}