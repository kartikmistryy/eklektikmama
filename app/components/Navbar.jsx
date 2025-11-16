"use client";

import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiMenu } from "react-icons/fi";
import { usePathname } from "next/navigation";
import CartCount from "./CartCount";

export default function Navbar({ pageType = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);
  
  // Determine if we should use dark color for nav links
  const useDarkNav = pageType === 'booking' || pageType === 'success' || pageType === 'legal' || 
                     pathname.includes('/events/') && pathname.includes('/book') ||
                     pathname.includes('/events/') && pathname.includes('/success') ||
                     pathname.includes('/privacy-policy') || pathname.includes('/terms-and-condition') ||
                      pathname.includes('/admin') || pathname.includes('/member-dashboard') ||
                     pathname.includes('/ticket/') || pathname.includes('/ticket-qr/') ||
                     pathname.includes('/membership-success');

  // Determine if we should hide mobile logo for legal pages
  const hideMobileLogo = pageType === 'legal' || 
                         pathname.includes('/privacy-policy') || 
                         pathname.includes('/terms-and-condition');


  // Function to close mobile menu
  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  // Function to handle navigation with menu close
  const handleNavigation = (href) => {
    setIsOpen(false);
    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      window.location.href = href;
    }, 100);
  };

  // Force close menu function
  const forceCloseMenu = () => {
    setIsOpen(false);
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
            src={useDarkNav ? "/mobileLogoBlue.png" : "/desktopLogo.png"}
            alt="Eklektik Mama"
            width={80}
            height={80}
            className="h-26 w-auto"
          />
        </Link>

        <Link href="/contactus" className={useDarkNav ? '' : 'text-white'} style={useDarkNav ? { color: '#2e2e2e' } : {}}>WORK WITH US</Link>
        <Link href="/whatwedo" className={useDarkNav ? '' : 'text-white'} style={useDarkNav ? { color: '#2e2e2e' } : {}}>HIGHLIGHTS</Link>
      </div>

      {/* Mobile Logo (<1060px only) - Hidden for legal pages */}
      {!hideMobileLogo && (
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
        </Link>
      )}

      {/* Right container */}
      <div className="flex-1 flex justify-end items-center gap-4 py-4">
        {/* Shopping Cart (≥1060px only) */}
        {/* <Link target="_blank" href="https://eklektikcollective.com/" className="hidden [@media(min-width:1060px)]:flex items-center justify-center relative">
          <ShoppingCart className={`w-6 h-6 ${useDarkNav ? '' : 'text-white'}`} style={useDarkNav ? { color: '#2e2e2e' } : {}} />
          <CartCount />
        </Link> */}
        <Link target="_blank" href="https://eklektikcollective.com" className="hidden [@media(min-width:1060px)]:flex items-center px-2 md:px-4 py-2 text-[8px] md:text-sm gradient-animate text-white font-semibold rounded-full border-2 border-pink-500">
          SHOP
        </Link>

        {/* Mobile Menu Trigger (<1060px only) */}
        <button
          className={`[@media(min-width:1060px)]:hidden ${useDarkNav ? '' : 'text-white'}`}
          style={useDarkNav ? { color: '#2e2e2e' } : {}}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Fullscreen Overlay Menu */}
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
          <Link target="_blank" href="https://eklektikcollective.com" className="flex items-center justify-center relative bg-transparent border-none text-white">
            SHOP
          </Link>
          <button onClick={() => handleNavigation('/events')} className="bg-transparent border-none text-white">EVENTS</button>
          <button onClick={() => handleNavigation('/blogs')} className="bg-transparent border-none text-white">UNFILTERED AF BLOG</button>
          <button onClick={() => handleNavigation('/contactus')} className="bg-transparent border-none text-white">WORK WITH US</button>
          <button onClick={() => handleNavigation('/whatwedo')}  className="bg-transparent border-none text-white">HIGHLIGHTS</button>
        </div>
      </div>
    </nav>
  );
}