"use client";
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export default function HighlightsCarousel({ highlights }) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className="w-full mx-auto lg:px-10 px-5 space-y-16">
      {highlights.map((highlight, highlightIndex) => (
        <div key={highlight._id || highlightIndex} className="w-full">
          {/* Event Title */}
          <div className="text-left mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[#093166] mb-3">
              {highlight.title}
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {highlight.description}
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative w-full">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {highlight.photos.map((photo, photoIndex) => (
                  <CarouselItem 
                    key={photoIndex} 
                    className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="w-full h-[300px] md:h-[350px] lg:h-[400px] rounded-lg shadow-lg overflow-hidden border border-gray-200">
                      <Image
                        src={photo}
                        alt={`${highlight.title} - Photo ${photoIndex + 1}`}
                        width={800}
                        height={400}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation Arrows */}
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
            </Carousel>
          </div>
        </div>
      ))}
    </div>
  );
}
