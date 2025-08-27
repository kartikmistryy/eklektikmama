"use client";
import React from "react";
import Image from "next/image";
import marqueeLogo from "@/public/homepage/marqueeLogo.webp";

const Marquee = () => {
  const marqueeItems = [
    "Eklektik Mama Love",
    "UNFILTERED AF",
    "WHAT'S ON",
    "GET EKLEKTIK AF",
    "SHOP DROP",
    "Eklektik Mama Love",
    "UNFILTERED AF",
    "WHAT'S ON",
    "GET EKLEKTIK AF",
    "SHOP DROP",
    "Eklektik Mama Love",
    "UNFILTERED AF",
    "WHAT'S ON",
    "GET EKLEKTIK AF",
    "SHOP DROP",
    "Eklektik Mama Love",
    "UNFILTERED AF",
    "WHAT'S ON",
    "GET EKLEKTIK AF",
    "SHOP DROP",
  ];

  return (
    <div className="bg-[#102A43] font-antonio py-0 overflow-hidden whitespace-nowrap relative">
      <div className="marquee flex w-max">
        {[...Array(2)].map((_, repeatIndex) => (
          <div
            key={repeatIndex}
            className="flex flex-row gap-7 items-center flex-shrink-0"
          >
            {marqueeItems.map((text, i) => (
              <span
                key={`${repeatIndex}-${i}`}
                className="flex flex-row gap-2 items-center flex-shrink-0"
              >
                <Image
                  src={marqueeLogo}
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

      <style jsx>{`
        .marquee {
          display: flex;
          animation: marquee 70s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
