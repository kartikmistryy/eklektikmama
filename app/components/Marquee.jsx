"use client"
import React from "react";
import Image from "next/image";

const Marquee = () => {
  return (
    <div className="bg-[#102A43] font-antonio py-0 overflow-hidden whitespace-nowrap">
      <div className="marquee flex">
        {[...Array(2)].map((_, repeatIndex) => (
          <div
            key={repeatIndex}
            className="flex flex-row gap-7 items-center flex-shrink-0"
          >
            {[
              "Eklektik Mama Love",
              "UNFILTERED AF",
              "WHAT'S ON",
              "GET EKLEKTIK AF",
              "SHOP DROP",
            ].map((text, i) => (
              <span
                key={`${repeatIndex}-${i}`}
                className="flex flex-row gap-2 items-center flex-shrink-0"
              >
                <Image
                  src="/homepage/marqueeLogo.webp"
                  height={70}
                  width={70}
                  alt="Logo"
                  className="flex-shrink-0"
                />
                <h4 className="text-white text-2xl uppercase whitespace-nowrap">
                  {text}
                </h4>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* CSS styles */}
      <style jsx>{`
        .marquee {
          animation: marquee 55s linear infinite;
        }

        @keyframes marquee {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
