"use client";

import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";

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
            className="h-26 w-auto"
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
        {/* Shopping Cart (always visible top right) */}
        <button className="flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-white" />
        </button>

        {/* Mobile Menu Trigger (open) */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Fullscreen Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#231F20] flex flex-col items-end text-white font-medium text-lg z-50 animate-slideIn">
          {/* Close button */}
          <button
            className="p-4"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Links */}
          <div className="flex flex-col items-end gap-6 px-8 py-10 w-full">
            <a href="#">EVENTS</a>
            <a href="#">UNFILTERED AF BLOG</a>
            <a href="#">WORK WITH US</a>
            <a href="#">ABOUT</a>
          </div>
        </div>
      )}
    </nav>
  );
}
