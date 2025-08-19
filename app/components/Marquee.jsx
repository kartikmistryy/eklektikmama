import React from 'react'
import Image from 'next/image'

const Marquee = () => {
  return (
            <div className="bg-[#102A43] font-antonio py-0 overflow-hidden whitespace-nowrap">
              <div className="flex marquee">
                {[...Array(2)].map((_, repeatIndex) => (
                  <div
                    key={repeatIndex}
                    className="flex flex-row gap-5 items-center flex-shrink-0"
                  >
                    {[
                      "Eklektik Mama Love",
                      "UNFILTERED AF",
                      "WHAT'S ON",
                      "GET EKLEKTIC AF",
                      "SHOP DROP",
                    ].map((text, i) => (
                      <span
                        key={`${repeatIndex}-${i}`}
                        className="flex flex-row gap-4 items-center flex-shrink-0"
                      >
                        <Image
                          src="/homepage/marqueeLogo.png"
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
            </div>
  )
}

export default Marquee