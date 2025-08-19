import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function DateCellWrapper({ value, children }) {
  // Find if there's an event on this date
  const event = events.find(
    (ev) =>
      moment(ev.start).isSame(value, "day") ||
      (moment(value).isBetween(ev.start, ev.end, "day", "[]"))
  );

  return (
    <div
      className="relative w-full h-full"
      style={{
        backgroundImage: event?.coverImage ? `url(${event.coverImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Date Number */}
      <div className="absolute top-1 left-1 text-white font-bold bg-black/40 px-2 py-1 rounded text-sm">
        {moment(value).date()}
      </div>

      {/* Event Title at Bottom */}
      {event && (
        <div className="absolute bottom-1 left-0 w-full text-center text-white font-semibold bg-black/50 px-2 py-1 text-xs truncate">
          {event.title}
        </div>
      )}

      {children}
    </div>
  );
}
