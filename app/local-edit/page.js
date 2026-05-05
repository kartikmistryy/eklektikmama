"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { motion } from "framer-motion";
import Marquee from "../components/Marquee";

export default function LocalEditPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const res = await fetch("/api/local-edit/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        if (isMounted) setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Could not load categories.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end bg-[url('/headerBg/loves.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <motion.div
          className="w-full h-full grow min-h-full flex flex-col items-center justify-center px-5"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            THE LOCAL
            <br />
            <b className="md:text-[100px] text-[60px]">EDIT</b>
          </h1>
        </motion.div>
        <Marquee />
      </section>

      {/* Intro */}
      <section className="w-full h-full flex lg:flex-row flex-col items-start justify-start relative bg-white py-14 lg:gap-0 gap-10 lg:px-14 px-5 text-[#093166]">
        <motion.div
          className="w-full lg:basis-1/2 basis-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">
            Curated by mums, for mums
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio leading-[100%] mt-2">
            Mum-tested
            <br />
            <b className="font-anton font-bold">local loves.</b>
          </h2>
        </motion.div>
        <motion.div
          className="w-full lg:basis-1/2 basis-full lg:pl-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <p className="lg:text-base text-sm font-quicksand font-medium md:w-[95%] w-full">
            The Local Edit is our little black book of the spots, services and small
            businesses we actually rate. Cafes worth the drive, sitters worth their
            weight, photographers who get it, and the after-school stuff your kids
            (and you) will actually look forward to.
            <br /> <br />
            Pick a category, save your favourites, and keep coming back — Simone
            and the team are forever adding more.
          </p>
        </motion.div>
      </section>

      {/* Categories Grid */}
      <section className="w-full h-full flex flex-col gap-5 lg:px-10 px-5 pb-20">
        <motion.div
          className="text-[#093166]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold uppercase">Browse</p>
          <h2 className="text-5xl md:text-[80px] uppercase font-antonio font-thin leading-[100%] tracking-tighter">
            Pick your <b className="font-bold">flavour.</b>
          </h2>
        </motion.div>

        {loading ? (
          <div className="w-full py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bf378b]"></div>
          </div>
        ) : error ? (
          <div className="w-full text-center py-16">
            <p className="text-lg text-[#093166] font-quicksand">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="w-full text-center py-16">
            <p className="text-lg text-[#093166] font-quicksand">
              No categories yet. Check back soon!
            </p>
          </div>
        ) : (
          <motion.div
            className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={staggerContainer}
          >
            {categories.map((category) => (
              <motion.div key={category._id} variants={cardVariant}>
                <Link
                  href={`/local-edit/${category.slug}`}
                  className="group block w-full h-full"
                >
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg border-2 border-[#093166]">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                      <h3 className="font-anton uppercase text-2xl md:text-3xl leading-[100%] tracking-tight">
                        {category.title}
                      </h3>
                      {category.description && (
                        <p className="font-quicksand text-sm mt-2 line-clamp-2 opacity-90">
                          {category.description}
                        </p>
                      )}
                      <span className="mt-4 w-fit h-[40px] px-4 text-sm md:text-base flex items-center justify-center uppercase rounded-[20px] border-2 border-[#bf378b] bg-[#bf378b] text-white group-hover:bg-transparent group-hover:text-white transition-colors duration-500 ease-in-out">
                        Explore <BsArrowRight className="ml-2 text-lg" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
