import moment from "moment";

export default function DateCellWrapper({ value, children, events }) {
  const event = events.find(
    (ev) =>
      moment(ev.start).isSame(value, "day") ||
      moment(value).isBetween(ev.start, ev.end, "day", "[]")
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
      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
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
}
