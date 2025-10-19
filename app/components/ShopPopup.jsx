import { IoIosClose } from "react-icons/io";
import { useState, useEffect } from "react";
import { BsArrowRight } from "react-icons/bs";
import Image from "next/image";

export const ShopPopup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      if (hasShown) return; // Don't show again if already shown
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      
      if (scrollPercentage >= 40) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType("success");
        setEmail(""); // Clear the form on success
        setName(""); // Clear the name field on success
        // Close modal after successful submission
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } else {
        setMessage(data.error || "Failed to subscribe. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-screen h-screen bg-[#000]/50  px-10 pt-10 fixed top-0 z-[999] left-0 flex flex-col justify-center items-center">
      <div className="w-full h-fit max-w-[400px] py-5 px-10 bg-[#FBFBF5] relative">
        <span onClick={handleClose} className="w-fit h-fit ml-auto cursor-pointer flex justify-end">
          <IoIosClose 
            className="text-4xl  hover:text-gray-600 z-[999]" 
          />
        </span>
        <h3 className="md:text-4xl text-2xl font-bold uppercase text-[#093166] leading-[130%] text-left font-anton max-w-[90%]">
        Get 10% Off Your First Drop


        </h3>
        <p className="text-base text-[#093166] mt-2">
        Join the list for early access, exclusive offers and 10% off your first order — because raising hell deserves a discount.

        </p>

        <form onSubmit={handleNewsletterSubmit} className="mt-4">
          <div className="flex flex-col w-full  mt-2 relative pb-5">
          <span className="w-full h-full flex flex-col gap-2 mt-4">
              <label htmlFor="name" className="text-base text-[#093166]">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full flex text-sm md:px-6 px-4 border-2 border-[#bf378b] rounded-full outline-none py-2 text-[#093166] placeholder:text-[#093166]"
                placeholder="Enter your name"
                disabled={isSubmitting}
              />
            </span>
            <span className="w-full h-full flex flex-col gap-2 mt-4">
              <label htmlFor="email" className="text-base text-[#093166]">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full flex text-sm md:px-6 px-4 border-2 border-[#bf378b] rounded-full outline-none py-2 text-[#093166] placeholder:text-[#093166]"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </span>
            <button type="submit" className="w-[150px] rounded-full mt-4 bg-[#dc4fa6] text-white px-4 py-1.5">
              {isSubmitting ? "Submitting..." : "Count Me In"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-3 text-sm font-medium ${
                messageType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
      
      {/* Image positioned below the modal */}
      <div className="w-full h-fit max-w-[400px]">
        <Image 
          src="/homepage/modalWhitePaper.webp" 
          alt="Newsletter Popup Image" 
          width={400} 
          height={200} 
          className="w-full h-[70px] object-cover" 
        />
      </div>
    </div>
  );
};
