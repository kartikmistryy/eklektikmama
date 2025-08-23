"use client";

import { ShoppingCart, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full flex items-center px-6 py-4 absolute top-0 left-0 z-50">
      {/* Left container */}
      <div className="flex-1 flex items-center gap-2">
        {/* JOIN button */}
        <button className="px-4 py-2 md:text-sm text-[8px] gradient-animate text-white font-semibold rounded-full border-2 border-pink-500">
          JOIN EKLEKTIK AF
        </button>
      </div>

      {/* Center container (desktop links) */}
<div className="hidden md:flex items-center justify-center gap-12 text-white font-medium text-sm">
  <a href="#">EVENTS</a>
  <a href="#">UNFILTERED AF BLOG</a>

  {/* Logo in center */}
  <div className="flex-shrink-0">
    <Image
      src="/desktopLogo.png"
      alt="Eklektik Mama"
      width={80}
      height={80}
      className="h-16 w-auto"
    />
  </div>

  <a href="#">WORK WITH US</a>
  <a href="#">ABOUT</a>
</div>

      {/* Mobile Logo */}
      <div className="md:hidden flex-1 flex justify-center">
        <Image
          src="/desktopLogo.png"
          alt="Eklektik Mama"
          width={60}
          height={60}
          className="h-12 w-auto"
        />
      </div>

      {/* Right container */}
      <div className="flex-1 flex justify-end items-center gap-4">
        {/* Desktop Shopping Cart */}
        <button className="hidden md:flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-white" />
        </button>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#231F20] flex flex-col items-center gap-6 py-6 text-white font-medium text-base md:hidden z-50">
          <a href="#">EVENTS</a>
          <a href="#">UNFILTERED AF BLOG</a>
          <a href="#">WORK WITH US</a>
          <a href="#">ABOUT</a>
        </div>
      )}
    </nav>
  );
}
