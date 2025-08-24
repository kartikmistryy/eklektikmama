"use client";

import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full flex items-start px-6 pt-4 absolute top-0 left-0 z-50">
      {/* Left container */}
      <div className="flex-1 flex items-center gap-2 py-4">
        <Link
          href="/eklektikmamaMembership"
          className="px-2 md:px-4 py-2 text-[8px] md:text-sm gradient-animate text-white font-semibold rounded-full border-2 border-pink-500"
        >
          JOIN EKLEKTIK AF
        </Link>
      </div>

      {/* Center container (desktop links, only ≥1060px) */}
      <div className="hidden [@media(min-width:1060px)]:flex items-start justify-center gap-12 text-white font-medium text-sm py-6">
        <Link href="/events">EVENTS</Link>
        <Link href="/blogs">UNFILTERED AF BLOG</Link>

        {/* Logo in center */}
        <Link href="/" className="flex-shrink-0 translate-y-[-20px]">
          <Image
            src="/desktopLogo.png"
            alt="Eklektik Mama"
            width={80}
            height={80}
            className="h-26 w-auto"
          />
        </Link>

        <Link href="/partner">WORK WITH US</Link>
        <Link href="/whatwedo">ABOUT</Link>
      </div>

      {/* Mobile Logo (<1060px only) */}
      <Link
        href="/"
        className="flex-1 flex justify-center [@media(min-width:1060px)]:hidden"
      >
        <Image
          src="/mobileLogo.png"
          alt="Eklektik Mama"
          width={60}
          height={60}
          className="h-18 w-auto"
        />
      </Link>

      {/* Right container */}
      <div className="flex-1 flex justify-end items-center gap-4 py-4">
        {/* Shopping Cart (≥1060px only) */}
        <button className="hidden [@media(min-width:1060px)]:flex items-center justify-center relative">
          <ShoppingCart className="w-6 h-6 text-white" />
          {/* Badge */}
          <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            0
          </span>
        </button>

        {/* Mobile Menu Trigger (<1060px only) */}
        <button
          className="[@media(min-width:1060px)]:hidden text-white"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Fullscreen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#231F20] flex flex-col items-end text-white font-medium text-lg z-50 animate-slideIn">
          {/* Close button */}
          <button className="p-5" onClick={() => setIsOpen(false)}>
            <X className="w-8 h-8" />
          </button>

          {/* Links */}
          <div className="flex flex-col items-end gap-6 px-5 py-10 w-full">
            <button className="flex items-center justify-center relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              {/* Badge */}
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
            <a href="/events">EVENTS</a>
            <a href="/blogs">UNFILTERED AF BLOG</a>
            <a href="/partner">WORK WITH US</a>
            <a href="/about">ABOUT</a>
          </div>
        </div>
      )}
    </nav>
  );
}
