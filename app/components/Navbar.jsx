"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiMenu } from "react-icons/fi";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "MEMBERSHIP", href: "/eklektikmamaMembership" },
  { label: "EVENTS", href: "/events" },
  { label: "SHOP", href: "https://eklektikcollective.com", external: true },
  { label: "BLOG", href: "/blogs" },
  { label: "LOCAL EDIT", href: "/the-local-edit" },
  { label: "PARTNER", href: "/partnershipprogram" },
  { label: "HIGHLIGHTS", href: "/whatwedo" },
];

export default function Navbar({ pageType = "default" }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);

  const useDarkNav =
    pageType === "booking" ||
    pageType === "success" ||
    pageType === "legal" ||
    (pathname.includes("/events/") && pathname.includes("/book")) ||
    (pathname.includes("/events/") && pathname.includes("/success")) ||
    pathname.includes("/privacy-policy") ||
    pathname.includes("/terms-and-condition") ||
    pathname.includes("/admin") ||
    pathname.includes("/member-dashboard") ||
    pathname.includes("/ticket/") ||
    pathname.includes("/ticket-qr/") ||
    pathname.includes("/membership-success");

  const hideMobileLogo =
    pageType === "legal" ||
    pathname.includes("/privacy-policy") ||
    pathname.includes("/terms-and-condition");

  const forceCloseMenu = () => setIsOpen(false);

  const handleNavigation = (href, external) => {
    setIsOpen(false);
    setTimeout(() => {
      if (external) {
        window.open(href, "_blank", "noopener");
      } else {
        window.location.href = href;
      }
    }, 100);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest("nav")) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const linkColorStyle = useDarkNav ? { color: "#2e2e2e" } : {};
  const linkClass = `hover:opacity-80 transition-opacity ${useDarkNav ? "" : "text-white"}`;

  return (
    <nav className="w-full absolute top-0 left-0 z-[10] px-6 pt-4">
      {/* Top row: logo centered, hamburger on right (mobile only) */}
      <div className="relative flex items-center justify-center py-2">
        {/* Desktop logo */}
        <Link
          href="/"
          className="hidden [@media(min-width:1060px)]:block flex-shrink-0"
        >
          <Image
            src={useDarkNav ? "/mobileLogoBlue.png" : "/desktopLogo.png"}
            alt="Eklektik Mama"
            width={80}
            height={80}
            className="h-26 w-auto"
          />
        </Link>

        {/* Mobile logo */}
        {!hideMobileLogo && (
          <Link
            href="/"
            className="[@media(min-width:1060px)]:hidden flex-shrink-0"
          >
            <Image
              src={useDarkNav ? "/mobileLogoBlue.png" : "/mobileLogo.png"}
              alt="Eklektik Mama"
              width={60}
              height={60}
              className="h-16 w-auto"
            />
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          className="absolute right-0 [@media(min-width:1060px)]:hidden"
          style={useDarkNav ? { color: "#2e2e2e" } : { color: "#ffffff" }}
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop links row — below logo, centered with side margins */}
      <div
        className="hidden [@media(min-width:1060px)]:flex items-center justify-between font-medium text-sm py-4 uppercase tracking-wide max-w-5xl mx-auto w-full"
        style={linkColorStyle}
      >
        {NAV_LINKS.map((link) =>
          link.external ? (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              style={linkColorStyle}
            >
              {link.label}
            </Link>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass}
              style={linkColorStyle}
            >
              {link.label}
            </Link>
          )
        )}
      </div>

      {/* Mobile fullscreen overlay menu */}
      <div
        ref={menuRef}
        className="fixed inset-0 bg-[#231f20] flex flex-col items-end text-white font-medium text-lg z-[999] transform transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          left: isOpen ? "0" : "-100%",
        }}
      >
        <button className="p-5" onClick={forceCloseMenu} aria-label="Close menu">
          <X className="w-8 h-8" />
        </button>

        <div className="flex flex-col items-end gap-6 px-5 py-10 w-full">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavigation(link.href, link.external)}
              className="bg-transparent border-none text-white text-right"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
