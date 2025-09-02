"use client";

import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiMenu } from "react-icons/fi";
import { usePathname } from "next/navigation";

export default function Navbar({ pageType = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);
  
  // Determine if we should use dark color for nav links
  const useDarkNav = pageType === 'booking' || pageType === 'success' || pageType === 'legal' || 
                     pathname.includes('/events/') && pathname.includes('/book') ||
                     pathname.includes('/events/') && pathname.includes('/success') ||
                     pathname.includes('/privacy-policy') || pathname.includes('/terms-and-condition') ||
                     pathname.includes('/admin') || pathname.includes('/shop');

  // Debug logging
  console.log('Current pathname:', pathname);
  console.log('useDarkNav:', useDarkNav);
  console.log('Logo src:', useDarkNav ? "/mobileLogoBlue.png" : "/mobileLogo.png");

  // Function to close mobile menu
  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  // Function to handle navigation with menu close
  const handleNavigation = (href) => {
    console.log('Closing menu and navigating to:', href);
    setIsOpen(false);
    console.log('Menu state after setting to false:', false);
    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      window.location.href = href;
    }, 100);
  };

  // Force close menu function
  const forceCloseMenu = () => {
    console.log('Force closing menu');
    setIsOpen(false);
    console.log('Menu state after force close:', false);
  };

  // Close menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('nav')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="w-full flex items-start px-6 pt-4 absolute top-0 left-0 z-[10]">
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
      <div className={`hidden [@media(min-width:1060px)]:flex items-start justify-center gap-12 font-medium text-sm py-6 ${useDarkNav ? '' : 'text-white'}`} style={useDarkNav ? { color: '#2e2e2e' } : {}}>
        <Link href="/events" className={useDarkNav ? '' : 'text-white'} style={useDarkNav ? { color: '#2e2e2e' } : {}}>EVENTS</Link>
        <Link href="/blogs" className={useDarkNav ? '' : 'text-white'} style={useDarkNav ? { color: '#2e2e2e' } : {}}>UNFILTERED AF BLOG</Link>

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

        <Link href="/partner" className={useDarkNav ? '' : 'text-white'} style={useDarkNav ? { color: '#2e2e2e' } : {}}>WORK WITH US</Link>
        <Link href="/whatwedo" className={useDarkNav ? '' : 'text-white'} style={useDarkNav ? { color: '#2e2e2e' } : {}}>HIGHLIGHTS</Link>
      </div>

      {/* Mobile Logo (<1060px only) */}
      <Link
        href="/"
        className="flex-1 flex justify-center [@media(min-width:1060px)]:hidden"
      >
        <Image
          src={useDarkNav ? "/mobileLogoBlue.png" : "/mobileLogo.png"}
          alt="Eklektik Mama"
          width={60}
          height={60}
          className="h-16 w-auto"
        />
        {/* Debug info */}
        <div className="absolute top-0 right-0 text-xs bg-black text-white p-1 rounded">
          {useDarkNav ? "Blue" : "White"} Logo
        </div>
      </Link>

      {/* Right container */}
      <div className="flex-1 flex justify-end items-center gap-4 py-4">
        {/* Shopping Cart (≥1060px only) */}
        <Link href="/shop" className="hidden [@media(min-width:1060px)]:flex items-center justify-center relative">
          <ShoppingCart className={`w-6 h-6 ${useDarkNav ? '' : 'text-white'}`} style={useDarkNav ? { color: '#2e2e2e' } : {}} />
          {/* Badge */}
          <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            0
          </span>
        </Link>

        {/* Mobile Menu Trigger (<1060px only) */}
        <button
          className="[@media(min-width:1060px)]:hidden text-white"
          onClick={() => {
            console.log('Opening menu, current state:', isOpen);
            setIsOpen(true);
            console.log('Menu state after setting to true:', true);
          }}
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Fullscreen Overlay Menu */}
      {console.log('Current isOpen state:', isOpen)}
      <div 
        ref={menuRef}
        className="fixed inset-0 bg-[#231f20] flex flex-col items-end text-white font-medium text-lg z-[999] transform transition-transform duration-300 ease-in-out"
        style={{ 
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          left: isOpen ? '0' : '-100%'
        }}
      >
        {/* Close button */}
        <button className="p-5" onClick={forceCloseMenu}>
          <X className="w-8 h-8" />
        </button>

        {/* Links */}
        <div className="flex flex-col items-end gap-6 px-5 py-10 w-full">
          <button onClick={() => handleNavigation('/shop')} className="flex items-center justify-center relative bg-transparent border-none text-white">
            <ShoppingCart className="w-6 h-6 text-white" />
            {/* Badge */}
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </button>
          <button onClick={() => handleNavigation('/events')} className="bg-transparent border-none text-white">EVENTS</button>
          <button onClick={() => handleNavigation('/blogs')} className="bg-transparent border-none text-white">UNFILTERED AF BLOG</button>
          <button onClick={() => handleNavigation('/partner')} className="bg-transparent border-none text-white">WORK WITH US</button>
          <button onClick={() => handleNavigation('/whatwedo')} className="bg-transparent border-none text-white">HIGHLIGHTS</button>
        </div>
      </div>
    </nav>
  );
}
