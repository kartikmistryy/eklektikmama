"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const leftLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "What We Do", href: "/what-we-do" },
    { name: "Events", href: "/events" },
    { name: "Community", href: "/community" },
  ];

  const rightLinks = [
    { name: "Perks", href: "/perks" },
    { name: "Blog", href: "/blog" },
    { name: "Resources", href: "/resources" },
    { name: "Partner With Us", href: "/partner" },
  ];

  return (
    <nav className="bg-transparent absolute w-full z-50">
      <div className="flex flex-row w-full h-full mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-start lg:h-[135px] h-[70px] w-full">
          {/* Mobile Menu Button */}
          <div className="flex h-full  items-center lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl p-2 text-white"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Left Links (Desktop) */}
          <div className="hidden lg:flex items-start py-10 h-full justify-start md:space-x-[3vw] w-full">
            {leftLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white hover:underline hover:underline-offset-1  uppercase font-poppins font-regular transition-transform ease-in-out"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex justify-start lg:pt-5">
            <Link href="/" className="text-2xl font-bold tracking-wide lg:w-[110px] lg:h-[150px] w-[60px] h-[60px]">
              <Image src="/desktopLogo.png" className="lg:block hidden w-fit h-fit" alt="Logo" width={100} height={100} />
              <Image src="/mobileLogo.webp" className="lg:hidden block" alt="Logo" width={100} height={100} />
            </Link>
          </div>

          {/* Right Links + Shop Icon (Desktop) */}
          <div className="hidden lg:flex items-start h-full  py-10 justify-end md:space-x-[3vw] w-full">
            {rightLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white hover:underline hover:underline-offset-1  uppercase font-poppins font-regular transition-transform ease-in-out"
              >
                {link.name}
              </a>
            ))}
            <a href="/shop" className="text-gray-700 hover:text-gray-900 text-2xl">
              <FiShoppingCart />
            </a>
          </div>

          {/* Shop Icon (Mobile) */}
          <div className="flex h-full items-center lg:hidden">
            <a href="/shop" className="text-white hover:text-gray-900 text-2xl">
              <FiShoppingCart />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white shadow-md">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {[...leftLinks, ...rightLinks].map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-gray-700 hover:text-gray-900 transition"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
