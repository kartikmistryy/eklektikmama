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
        slug: event.slug,
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
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Left date rail */}
                <div className="flex flex-col items-center justify-center px-2 border-l-4 border-[#DB4E9F] mr-1">
                  <div className="text-xs font-semibold text-gray-600 leading-none">
                    {moment(event.start).format('ddd').toUpperCase()}
                  </div>
                  <div className="text-xl font-bold text-[#093166]">
                    {moment(event.start).format('D')}
                  </div>
                </div>

                {/* Right content */}
                <div className="flex-1 min-w-0">
                  {event.coverImage && (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  )}
                  <div className="text-sm text-gray-600 mb-1">
                    {moment(event.start).format('MMM D, h:mm A')}
                    {event.end && (
                      <span> - {moment(event.end).format('h:mm A')}</span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-700 mb-2">
                      {event.description.length > 90
                        ? `${event.description.slice(0, 90)}...`
                        : event.description}
                    </p>
                  )}
                  <a
                    href={`/events/${event.slug || event.id}`}
                    className="text-[#DB4E9F] text-sm font-semibold hover:underline"
                  >
                    Know more
                  </a>
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
      <div className="mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6">
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

        {/* Desktop Calendar View with right-side detail panel */}
        {viewMode === 'calendar' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
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
                  selectable
                  style={{ height: "740px", minWidth: "800px" }}
                  components={{
                    event: EventCard,
                    dateCellWrapper: (props) => (
                      <DateCellWrapper {...props} events={events} />
                    ),
                    toolbar: CustomToolbar
                  }}
                  onSelectEvent={(event) => setSelectedEvent(event)}
                  onSelectSlot={(slotInfo) => {
                    const clickedDate = moment(slotInfo.start);
                    const found = events.find(ev =>
                      clickedDate.isSame(ev.start, 'day') ||
                      clickedDate.isBetween(ev.start, ev.end, 'day', '[]')
                    );
                    setSelectedEvent(found || null);
                  }}
                />
              </div>
            </div>

            {/* Right-side detail panel */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              {selectedEvent ? (
                <div className="sticky top-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                  {selectedEvent.coverImage && (
                    <img
                      src={selectedEvent.coverImage}
                      alt={selectedEvent.title}
                      className="w-full h-[180px] object-cover rounded-lg mb-3"
                    />
                  )}
                  <h2 className="text-lg font-bold mb-2 text-[#093166]">{selectedEvent.title}</h2>
                  <p className="text-sm text-gray-600 mb-1">
                    📅 {moment(selectedEvent.start).format('ddd, MMM D, h:mm A')}
                    {selectedEvent.end && (
                      <span> - {moment(selectedEvent.end).format('h:mm A')}</span>
                    )}
                  </p>
                  {selectedEvent.location && (
                    <p className="text-sm text-gray-600 mb-3">📍 {selectedEvent.location}</p>
                  )}
                  {selectedEvent.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{selectedEvent.description}</p>
                  )}
                  <div className="flex gap-2">
                    <a href={`/events/${selectedEvent.slug || selectedEvent.id}`} className="flex-1 px-3 py-2 bg-[#DB4E9F] text-white rounded-md text-center hover:bg-[#DB4E9F]/90">Know more</a>
                  </div>
                </div>
              ) : (
                <div className="sticky top-4 border border-dashed border-gray-300 rounded-xl p-4 text-sm text-gray-500">
                  Select a date or event to see details here
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal removed in favor of side panel */}
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