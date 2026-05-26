"use client";

import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

export default function FreebieModal({ freebie, onClose }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (firstFieldRef.current) firstFieldRef.current.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const triggerDownload = (downloadUrl) => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadUrl.split("/").pop() || "freebie.pdf";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/freebie-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, freebieId: freebie.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Could not process your request. Please try again.");
        setSubmitting(false);
        return;
      }

      // Optional: push to dataLayer so GTM can track freebie downloads as conversions
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "freebie_download",
          freebie_id: freebie.id,
          freebie_name: data.freebieTitle,
          email,
        });
      }

      triggerDownload(data.downloadUrl);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 font-quicksand"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-2xl text-[#093166] hover:scale-110 transition"
        >
          <IoClose />
        </button>

        {!done ? (
          <>
            <p className="text-xs uppercase tracking-wider text-[#bf378b] font-semibold">
              Eklektik Freebie
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#093166] leading-tight">
              {freebie.title}
            </h2>
            <p className="mt-3 text-sm text-[#093166]/80">
              Drop your name and email and we&apos;ll send the guide your way — instant download,
              no spam.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="freebie-fullName"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#093166]"
                >
                  Full Name
                </label>
                <input
                  id="freebie-fullName"
                  ref={firstFieldRef}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                  className="mt-1 w-full rounded-full border-2 border-[#bf378b]/40 px-5 py-2 text-sm text-[#093166] outline-none focus:border-[#bf378b] disabled:opacity-50"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="freebie-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#093166]"
                >
                  Email
                </label>
                <input
                  id="freebie-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="mt-1 w-full rounded-full border-2 border-[#bf378b]/40 px-5 py-2 text-sm text-[#093166] outline-none focus:border-[#bf378b] disabled:opacity-50"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#bf378b] py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending your freebie…" : "Get my freebie"}
              </button>

              <p className="text-center text-[11px] text-[#093166]/60">
                By submitting, you agree to receive occasional emails from Eklektik Mama. You can
                unsubscribe at any time.
              </p>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="text-5xl">🎉</div>
            <h2 className="mt-3 text-2xl font-bold text-[#093166]">You&apos;re in!</h2>
            <p className="mt-2 text-sm text-[#093166]/80">
              Your download has started. Check your downloads folder for{" "}
              <b className="text-[#bf378b]">{freebie.title}</b>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-[#093166] px-6 py-2 text-sm font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
