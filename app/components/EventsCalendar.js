import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function EventsCalendar({ events = [] }) {
  const [localEvents, setLocalEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [isMobile, setIsMobile] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      if (isMobileDevice) {
        setViewMode('list');
      }
    };

    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Process events when they change
    console.log('📅 EventsCalendar: Processing events:', events?.length || 0);
    console.log('📅 EventsCalendar: Raw events data:', events);
    
    if (events && events.length > 0) {
      const processed = events.map((event) => {
        // Use the original dates if available, otherwise parse the dates
        const startDate = event.originalStart ? new Date(event.originalStart) : new Date(event.start);
        const endDate = event.originalEnd ? new Date(event.originalEnd) : new Date(event.end || event.start);
        
        // Validate dates
        if (isNaN(startDate.getTime())) {
          console.error('❌ Invalid start date for event:', event.title, event.originalStart || event.start);
        }
        if (isNaN(endDate.getTime())) {
          console.error('❌ Invalid end date for event:', event.title, event.originalEnd || event.end);
        }
        
        const processedEvent = {
          id: event.id || event._id || 'unknown',
          title: event.title,
          slug: event.slug,
          start: startDate,
          end: endDate,
          coverImage: event.coverImage,
          description: event.description,
          location: event.location,
          price: event.price,
          segment: event.segment,
          // Preserve original dates for timezone handling
          originalStart: event.originalStart,
          originalEnd: event.originalEnd
        };
        
        console.log('📅 Processed event:', {
          title: processedEvent.title,
          start: processedEvent.start.toISOString(),
          end: processedEvent.end.toISOString(),
          isValid: !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
        });
        
        return processedEvent;
      }).filter(event => {
        // Filter out events with invalid dates
        const isValid = !isNaN(event.start.getTime()) && !isNaN(event.end.getTime());
        if (!isValid) {
          console.warn('⚠️ Filtering out event with invalid dates:', event.title);
        }
        return isValid;
      });
      
      console.log('✅ EventsCalendar: Processed events:', processed.length);
      console.log('📅 EventsCalendar: Setting localEvents state');
      setLocalEvents(processed);
      
      // Set current date to today (current month) by default
      // Only navigate to event month if there are future events
      const now = moment().startOf('day');
      console.log('📅 Current time (now):', now.format('YYYY-MM-DD HH:mm:ss'), now.toISOString());
      
      if (processed.length > 0) {
        // Find the first future event using moment for accurate comparison
        const futureEvents = processed.filter(ev => {
          const evDate = moment(ev.start).startOf('day');
          const isFuture = evDate.isSameOrAfter(now, 'day');
          console.log(`📅 Event "${ev.title}": ${evDate.format('YYYY-MM-DD')} - ${isFuture ? 'FUTURE' : 'PAST'}`);
          return isFuture;
        });
        
        if (futureEvents.length > 0) {
          // If there are future events, navigate to the first one's month
          const firstFutureEvent = futureEvents[0];
          const firstFutureEventDate = moment(firstFutureEvent.start).startOf('day').toDate();
          console.log('📅 Setting currentDate to first future event:', firstFutureEvent.title, firstFutureEventDate.toISOString());
          setCurrentDate(firstFutureEventDate);
        } else {
          // If all events are in the past, stay on current month (don't navigate)
          console.log('📅 All events are in the past, staying on current month');
          setCurrentDate(new Date()); // Use today's date
        }
      } else {
        // No events, show current month
        setCurrentDate(new Date());
      }
    } else {
      console.log('ℹ️ EventsCalendar: No events to process');
      setLocalEvents([]);
    }
  }, [events]);

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
    // Convert the cell date to start of day in local timezone for comparison
    const cellDate = moment(value).startOf('day');
    
    const event = events?.find(
      (ev) => {
        if (!ev || !ev.start || !ev.end) return false;
        try {
          // Convert event dates to start of day in local timezone for comparison
          const eventStart = moment(ev.start).startOf('day');
          const eventEnd = moment(ev.end).startOf('day');
          
          // Check if cell date matches event start or end, or is between them
          const matches = 
            cellDate.isSame(eventStart, 'day') ||
            cellDate.isSame(eventEnd, 'day') ||
            cellDate.isBetween(eventStart, eventEnd, 'day', '[]');
          
          // Log when we find a match (occasionally to avoid spam)
          if (matches && Math.random() < 0.05) {
            console.log('✅ DateCellWrapper: Found matching event:', ev.title, 
              'for date:', cellDate.format('YYYY-MM-DD'),
              'event range:', eventStart.format('YYYY-MM-DD'), 'to', eventEnd.format('YYYY-MM-DD'));
          }
          return matches;
        } catch (err) {
          console.error('❌ Error in DateCellWrapper event matching:', err, ev);
          return false;
        }
      }
    ) || null;

    // Check if this is a day of the current month being viewed
    const isCurrentMonth = moment(value).isSame(currentDate, 'month');
    
    // Check if this is a past event
    const isPastEvent = event && moment(event.start).isBefore(moment(), 'day');

    return (
      <div
        className="relative w-full h-full bg-red-300"
        style={{
          backgroundImage: event?.coverImage ? `url(${event.coverImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: isCurrentMonth ? '#F6F6F6' : 'transparent',
          opacity: isPastEvent ? 0.5 : 1,
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
      const newDate = moment(currentDate).subtract(1, 'month').toDate();
      setCurrentDate(newDate);
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      const newDate = moment(currentDate).add(1, 'month').toDate();
      setCurrentDate(newDate);
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      const newDate = new Date();
      setCurrentDate(newDate);
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = moment(currentDate);
      return (
        <span className="text-xl font-bold">
          {isMobile ? date.format('MMM YYYY') : date.format('MMMM YYYY')}
        </span>
      );
    };

    return (
      <div className="custom-toolbar">
        <div className="flex items-center space-x-4">
          <button 
            onClick={goToBack} 
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            type="button"
          >
            &lt; Prev
          </button>
          <button 
            onClick={goToCurrent} 
            className="px-3 py-1 bg-[#DB4E9F] text-white rounded hover:bg-[#DB4E9F]/80 transition-colors"
            type="button"
          >
            Today
          </button>
          <button 
            onClick={goToNext} 
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            type="button"
          >
            Next &gt;
          </button>
        </div>
        <div className="uppercase font-antonio text-[#093166]">{label()}</div>
      </div>
    );
  };

  // List view component for mobile
  const ListView = () => {
    // Show all events (past and future) for now, sorted by date
    // Users can see what events exist, even if they're in the past
    const now = moment().startOf('day'); // Use start of day for comparison
    
    console.log('📋 ListView: Starting filter - Now:', now.format('YYYY-MM-DD HH:mm:ss'), now.toISOString());
    console.log('📋 ListView: localEvents count:', localEvents.length);
    
    // Show all events, but mark them as past/future
    const allEvents = localEvents.filter(event => {
      if (!event || !event.start) {
        console.warn('⚠️ ListView: Event missing start date:', event);
        return false;
      }
      return true;
    });
    
    // Separate future and past events
    const futureEvents = allEvents.filter(event => {
      const eventStart = moment(event.start).startOf('day');
      const isFuture = eventStart.isSameOrAfter(now, 'day');
      console.log(`📋 ListView: Event "${event.title}" - Start: ${eventStart.format('YYYY-MM-DD')}, Now: ${now.format('YYYY-MM-DD')}, IsFuture: ${isFuture}`);
      return isFuture;
    });
    
    // If no future events, show past events (most recent first)
    // Otherwise show future events (earliest first)
    const eventsToShow = futureEvents.length > 0 ? futureEvents : allEvents;
    
    // Sort events: if showing future, earliest first; if showing past, most recent first
    const sortedEvents = [...eventsToShow].sort((a, b) => {
      const dateA = moment(a.start).valueOf();
      const dateB = moment(b.start).valueOf();
      if (futureEvents.length > 0) {
        return dateA - dateB; // Future events: earliest first
      } else {
        return dateB - dateA; // Past events: most recent first
      }
    });
    
    console.log('📋 ListView: After filtering - futureEvents count:', futureEvents.length);
    console.log('📋 ListView: sortedEvents count:', sortedEvents.length);
    console.log('📋 ListView: isMobile:', isMobile);
    console.log('📋 ListView: viewMode:', viewMode);
    
    if (sortedEvents.length > 0) {
      console.log('📋 ListView: First event:', sortedEvents[0].title, sortedEvents[0].start);
      sortedEvents.forEach((ev, idx) => {
        console.log(`📋 ListView: Event ${idx + 1}:`, ev.title, moment(ev.start).format('YYYY-MM-DD'));
      });
    } else {
      console.log('📋 ListView: No future events found. All events:');
      localEvents.forEach((ev, idx) => {
        const evDate = moment(ev.start).startOf('day');
        const isPast = evDate.isBefore(now, 'day');
        console.log(`📋 ListView: Event ${idx + 1}:`, ev.title, evDate.format('YYYY-MM-DD'), isPast ? '(PAST)' : '(FUTURE)');
      });
    }
    
    // Debug: Show all events regardless of date for troubleshooting
    const showAllEvents = localEvents.length > 0 && sortedEvents.length === 0;
    
    return (
      <div className="space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No upcoming events scheduled</p>
            <p className="text-xs mt-2">Total events in database: {localEvents.length}</p>
            {showAllEvents && (
              <div className="mt-4 text-left">
                <p className="text-sm font-semibold mb-2">All events (for debugging):</p>
                {localEvents.map((event, idx) => {
                  const evDate = moment(event.start).startOf('day');
                  const isPast = evDate.isBefore(now, 'day');
                  return (
                    <div key={event.id || idx} className="text-xs mb-1 p-2 bg-gray-100 rounded">
                      <strong>{event.title}</strong> - {evDate.format('YYYY-MM-DD')} {isPast ? '(PAST)' : '(FUTURE)'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          sortedEvents.map((event) => {
            console.log('📋 Rendering event in list:', event.title);
            return (
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
                    href={`/events/${event.id}`}
                    className="text-[#DB4E9F] text-sm font-semibold hover:underline"
                    onClick={() => {}}
                  >
                    Know more 
                  </a>
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen h-full p-4 md:p-6 bg-white">
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
          <div className="flex flex-col lg:flex-row gap-4 w-full h-full">
            <div className="flex-1 min-w-0 h-full">
              {/* Custom days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-1 bg-gray-100 py-2 rounded-t-lg">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              <div className="w-full">
                <Calendar
                  localizer={localizer}
                  events={localEvents}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  view="month"
                  defaultView="month"
                  date={currentDate}
                  style={{ height: "auto", minHeight: "600px" }}
                  components={{
                    event: EventCard,
                    dateCellWrapper: (props) => (
                      <DateCellWrapper {...props} events={localEvents} />
                    ),
                    toolbar: CustomToolbar
                  }}
                  onSelectEvent={(event) => {
                    console.log('📅 Event selected:', event.title);
                    setSelectedEvent(event);
                  }}
                  onSelectSlot={(slotInfo) => {
                    const clickedDate = moment(slotInfo.start);
                    const found = localEvents.find(ev => {
                      const evStart = moment(ev.start).startOf('day');
                      const evEnd = moment(ev.end).startOf('day');
                      return clickedDate.isSame(evStart, 'day') ||
                             clickedDate.isSame(evEnd, 'day') ||
                             clickedDate.isBetween(evStart, evEnd, 'day', '[]');
                    });
                    if (found) {
                      console.log('📅 Slot selected, found event:', found.title);
                    }
                    setSelectedEvent(found || null);
                  }}
                  onNavigate={(newDate, view, action) => {
                    setCurrentDate(newDate);
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
                    <a href={`/events/${selectedEvent.id}`} className="flex-1 px-3 py-2 bg-[#DB4E9F] text-white rounded-md text-center hover:bg-[#DB4E9F]/90">Know more </a>
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
        
        /* Ensure our custom toolbar is visible */
        .custom-toolbar {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
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
