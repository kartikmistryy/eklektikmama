import "./globals.css";
import { Anton, Antonio, Poppins, Quicksand } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { CartProvider } from "../lib/hooks/useCart";


const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const antonio = Antonio({ subsets: ["latin"], weight: ["100","200","300","400","500","600","700"], variable: "--font-antonio" });
const poppins = Poppins({ subsets: ["latin"], weight: ["100","200","300","400","500","600","700","800","900"], style: ["normal","italic"], variable: "--font-poppins" });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-quicksand" });

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${antonio.variable} ${poppins.variable} ${quicksand.variable}`}
    >
      <head>
        {/* Comprehensive Favicon Setup for All Devices and Browsers */}
        
        {/* Standard favicon - works in all browsers */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* PNG favicons for modern browsers */}
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-48x48.png" type="image/png" sizes="48x48" />
        
        {/* SVG favicon for modern browsers with high DPI support */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
        {/* Apple Touch Icons for iOS devices */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-152x152.png" sizes="152x152" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-120x120.png" sizes="120x120" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-76x76.png" sizes="76x76" />
        
        {/* Android Chrome Icons */}
        <link rel="icon" href="/android-chrome-192x192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/android-chrome-512x512.png" sizes="512x512" type="image/png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#093166" />
        <meta name="msapplication-TileImage" content="/mstile-150x150.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#093166" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Eklektik Mama" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="referrer" content="no-referrer" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        
        {/* Organization Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Eklektik Mama",
              "legalName": "Eklektik Mama Event Management – L.L.C. – S.P.C.",
              "url": "https://eklektikmama.com",
              "logo": "https://eklektikmama.com/desktopLogo.png",
              "image": "https://eklektikmama.com/desktopLogo.png",
              "description": "Eklektik Mama is Abu Dhabi's boldest mum community, offering events, merchandise, and support for modern mothers in the UAE.",
              "email": "hello@eklektikmama.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Office 1530, Darussalam Tower, Al Danah E5",
                "addressLocality": "Abu Dhabi",
                "addressRegion": "Abu Dhabi",
                "addressCountry": "AE"
              },
              "sameAs": [
                "https://www.instagram.com/eklektikmama",
                "https://www.facebook.com/eklektikmama"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "email": "hello@eklektikmama.com"
              }
            })
          }}
        />
        
        {/* LocalBusiness Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Eklektik Mama",
              "image": "https://eklektikmama.com/desktopLogo.png",
              "description": "Abu Dhabi's boldest mum community offering events, merchandise, and support for modern mothers in the UAE.",
              "url": "https://eklektikmama.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Office 1530, Darussalam Tower, Al Danah E5",
                "addressLocality": "Abu Dhabi",
                "addressRegion": "Abu Dhabi",
                "postalCode": "",
                "addressCountry": "AE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "24.4539",
                "longitude": "54.3773"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "09:00",
                "closes": "18:00"
              },
              "priceRange": "$$",
              "sameAs": [
                "https://www.instagram.com/eklektikmama",
                "https://www.facebook.com/eklektikmama"
              ]
            })
          }}
        />
      </head>
      <body>
      <GoogleAnalytics />
      <CartProvider>
        <Navbar/>
        {children}
        <Footer/>
      </CartProvider>
      
      {/* Image Protection Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Disable right-click context menu
            document.addEventListener('contextmenu', function(e) {
              e.preventDefault();
              return false;
            });

            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            document.addEventListener('keydown', function(e) {
              // F12
              if (e.keyCode === 123) {
                e.preventDefault();
                return false;
              }
              // Ctrl+Shift+I (DevTools)
              if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
              }
              // Ctrl+Shift+J (Console)
              if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
              }
              // Ctrl+U (View Source)
              if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
              }
              // Ctrl+S (Save Page)
              if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                return false;
              }
              // Ctrl+A (Select All)
              if (e.ctrlKey && e.keyCode === 65) {
                e.preventDefault();
                return false;
              }
              // Ctrl+P (Print)
              if (e.ctrlKey && e.keyCode === 80) {
                e.preventDefault();
                return false;
              }
            });

            // Disable drag and drop
            document.addEventListener('dragstart', function(e) {
              e.preventDefault();
              return false;
            });

            document.addEventListener('drop', function(e) {
              e.preventDefault();
              return false;
            });

            document.addEventListener('dragover', function(e) {
              e.preventDefault();
              return false;
            });

            // Disable text selection on images
            document.addEventListener('selectstart', function(e) {
              if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.tagName === 'CANVAS') {
                e.preventDefault();
                return false;
              }
            });

            // Disable image saving via drag
            document.addEventListener('dragstart', function(e) {
              if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
              }
            });

            // Add overlay to images to prevent interaction
            function addImageProtection() {
              const images = document.querySelectorAll('img');
              images.forEach(function(img) {
                // Add protection class
                img.style.pointerEvents = 'none';
                img.style.userSelect = 'none';
                img.style.webkitUserSelect = 'none';
                img.style.mozUserSelect = 'none';
                img.style.msUserSelect = 'none';
                img.style.webkitUserDrag = 'none';
                img.style.userDrag = 'none';
                
                // Add event listeners to prevent context menu
                img.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  return false;
                });
                
                // Prevent image saving
                img.addEventListener('dragstart', function(e) {
                  e.preventDefault();
                  return false;
                });
              });
            }

            // Run protection on page load
            document.addEventListener('DOMContentLoaded', addImageProtection);
            
            // Re-run protection when new images are added (for dynamic content)
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                  addImageProtection();
                }
              });
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          `
        }}
      />
      </body>
    </html>
  );
}