"use client";
import * as React from "react"
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel({
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y",
  }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollNext()
    }
  }, [scrollPrev, scrollNext])

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    };
  }, [api, onSelect])

  return (
    (<CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>)
  );
}

function CarouselContent({
  className,
  ...props
}) {
  const { carouselRef, orientation } = useCarousel()

  return (
    (<div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content">
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props} />
    </div>)
  );
}

function CarouselItem({
  className,
  ...props
}) {
  const { orientation } = useCarousel()

  return (
    (<div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props} />)
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    (<Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn("absolute size-8 rounded-full", orientation === "horizontal"
        ? "top-1/2 -left-12 -translate-y-1/2"
        : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}>
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>)
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    (<Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn("absolute size-8 rounded-full", orientation === "horizontal"
        ? "top-1/2 -right-12 -translate-y-1/2"
        : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}>
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>)
  );
}

function CarouselDots({
  className,
  ...props
}) {
  const { api } = useCarousel()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [totalSlides, setTotalSlides] = React.useState(0)
  const [windowStart, setWindowStart] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const updateSelectedIndex = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    const updateTotalSlides = () => {
      setTotalSlides(api.scrollSnapList().length)
    }

    // Initial setup
    updateSelectedIndex()
    updateTotalSlides()

    // Listen for changes
    api.on("select", updateSelectedIndex)
    api.on("reInit", updateTotalSlides)
    api.on("resize", updateTotalSlides)

    // Cleanup
    return () => {
      api.off("select", updateSelectedIndex)
      api.off("reInit", updateTotalSlides)
      api.off("resize", updateTotalSlides)
    }
  }, [api])

  // Update window position based on current slide
  React.useEffect(() => {
    if (totalSlides <= 5) {
      setWindowStart(0)
      return
    }

    // Calculate window start position
    // When we're at slide 0-2, window starts at 0
    // When we're at slide 3+, window slides to keep current slide in middle
    let newWindowStart = 0
    
    if (selectedIndex >= 3) {
      // Start sliding window when we're past the first 3 slides
      newWindowStart = Math.min(selectedIndex - 2, totalSlides - 5)
    }
    
    setWindowStart(newWindowStart)
  }, [selectedIndex, totalSlides])

  const scrollTo = React.useCallback((dotIndex) => {
    if (!api || totalSlides <= 1) return
    
    // Calculate the actual slide index based on the dot clicked and current window
    const slideIndex = windowStart + dotIndex
    api.scrollTo(slideIndex)
  }, [api, windowStart])

  // Don't render if there are no slides or only one slide
  if (totalSlides <= 1) {
    return null
  }

  // Calculate which dot should be active based on current position within the window
  const getActiveDotIndex = () => {
    if (totalSlides <= 5) {
      return selectedIndex
    }
    return selectedIndex - windowStart
  }

  const activeDotIndex = getActiveDotIndex()

  return (
    <div className={cn("flex justify-center gap-2 mt-4", className)} {...props}>
      {Array.from({ length: 5 }, (_, index) => {
        const slideIndex = windowStart + index
        const isActive = activeDotIndex === index
        const isClickable = slideIndex < totalSlides
        
        return (
          <button
            key={`dot-${index}-${windowStart}`}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              isActive
                ? "bg-[#093166] scale-125 shadow-md"
                : isClickable
                ? "bg-gray-300 hover:bg-gray-400 hover:scale-110 cursor-pointer"
                : "bg-gray-200 cursor-not-allowed opacity-50"
            )}
            onClick={() => isClickable && scrollTo(index)}
            aria-label={`Go to slide ${slideIndex + 1}`}
            role="button"
            tabIndex={isClickable ? 0 : -1}
            disabled={!isClickable}
          />
        )
      })}
    </div>
  )
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots };
