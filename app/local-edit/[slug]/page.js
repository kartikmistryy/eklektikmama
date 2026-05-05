"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BsArrowRight } from "react-icons/bs";
import { motion } from "framer-motion";
import Marquee from "../../components/Marquee";

export default function LocalEditCategoryPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [category, setCategory] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/local-edit/categories/${slug}`);
        if (res.status === 404) {
          if (isMounted) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch category");
        const data = await res.json();
        if (isMounted) {
          setCategory(data.category);
          setListings(Array.isArray(data.listings) ? data.listings : []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bf378b]"></div>
        <p className="mt-4 text-[#093166] font-quicksand">Loading category...</p>
      </div>
    );
  }

  if (notFound || !category) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-white text-[#093166] px-5 pt-32">
        <h1 className="font-anton uppercase text-5xl md:text-7xl text-center">
          Not found
        </h1>
        <p className="font-quicksand mt-4 text-center max-w-md">
          We couldn&apos;t find this category. It may have been removed or the link
          is wrong.
        </p>
        <Link
          href="/local-edit"
          className="mt-8 w-fit h-[45px] px-6 text-base flex items-center justify-center uppercase text-white rounded-[20px] border-2 border-[#bf378b] bg-[#bf378b] hover:bg-transparent hover:text-[#093166] transition-colors duration-500 ease-in-out"
        >
          Back to The Local Edit <BsArrowRight className="ml-2 text-lg" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section
        className="w-full flex min-h-[70vh] h-full flex-col items-center justify-end pt-20 overflow-x-hidden relative"
      >
        <Image
          src={category.image}
          alt={category.title}
          fill
          sizes="100vw"
          priority
          className="object-cover -z-10"
        />
        <div className="absolute inset-0 bg-black/45 -z-10" />

        <motion.div
          className="w-full h-full grow min-h-full flex flex-col items-center justify-center px-5 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold uppercase text-white text-sm md:text-base tracking-[0.25em]">
            The Local Edit
          </p>
          <h1 className="w-fit md:text-[80px] text-[42px] font-bold uppercase text-white leading-[110%] text-center font-anton mt-2">
            {category.title}
          </h1>
          {category.description && (
            <p className="mt-4 max-w-2xl text-white/90 font-quicksand text-sm md:text-base">
              {category.description}
            </p>
          )}
        </motion.div>
        <Marquee />
      </section>

      {/* Breadcrumb / back */}
      <div className="w-full lg:px-10 px-5 pt-8 text-[#093166]">
        <button
          onClick={() => router.push("/local-edit")}
          className="font-quicksand text-sm uppercase tracking-wide hover:text-[#bf378b] transition-colors"
        >
          ← Back to The Local Edit
        </button>
      </div>

      {/* Listings */}
      <section className="w-full h-full flex flex-col gap-5 lg:px-10 px-5 py-12">
        <motion.div
          className="text-[#093166]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold uppercase">Featured</p>
          <h2 className="text-5xl md:text-[72px] uppercase font-antonio font-thin leading-[100%] tracking-tighter">
            Mum-approved <b className="font-bold">picks.</b>
          </h2>
        </motion.div>

        {listings.length === 0 ? (
          <div className="w-full text-center py-20">
            <p className="text-lg text-[#093166] font-quicksand">
              No listings here yet. We&apos;re curating some good ones — check back soon!
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
            {listings.map((listing) => (
              <motion.article
                key={listing._id}
                variants={cardVariant}
                className="w-full flex flex-col p-3 rounded-md border-2 border-[#093166] bg-white"
              >
                <div className="relative w-full h-[220px] rounded-md overflow-hidden">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="py-4 flex flex-col flex-1 text-[#093166]">
                  <h3 className="font-poppins font-bold uppercase text-xl md:text-2xl leading-tight">
                    {listing.title}
                  </h3>
                  {listing.description && (
                    <p className="mt-2 font-quicksand text-sm md:text-base text-[#093166]/85">
                      {listing.description}
                    </p>
                  )}
                  <a
                    href={listing.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto ml-auto text-sm text-white rounded-full font-medium font-poppins flex flex-row items-center bg-[#093166] hover:bg-[#bf378b] justify-start gap-3 px-4 py-1.5 mt-4 transition-colors duration-500 ease-in-out"
                  >
                    VISIT <BsArrowRight className="text-lg font-bold" />
                  </a>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
