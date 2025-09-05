import "./globals.css";
import { Anton, Antonio, Poppins, Quicksand } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


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
        <link rel="icon" href="./favicon.png" />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="referrer" content="no-referrer" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </head>
      <body>
      <Navbar/>
        {children}
      <Footer/>
      
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