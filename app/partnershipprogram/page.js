"use client";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight, BsDownload } from "react-icons/bs";
import Marquee from "../components/Marquee";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const Page = () => {
  const [partnershipType, setPartnershipType] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [ideaDetails, setIdeaDetails] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const heroRef = useRef(null);
  const introRef = useRef(null);
  const dictRef = useRef(null);
  const workWithRef = useRef(null);
  const partnersRef = useRef(null);
  const formRef = useRef(null);
  const franchiseRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const introInView = useInView(introRef, { once: true, amount: 0.3 });
  const dictInView = useInView(dictRef, { once: true, amount: 0.3 });
  const workWithInView = useInView(workWithRef, { once: true, amount: 0.2 });
  const partnersInView = useInView(partnersRef, { once: true, amount: 0.2 });
  const formInView = useInView(formRef, { once: true, amount: 0.3 });
  const franchiseInView = useInView(franchiseRef, { once: true, amount: 0.3 });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!partnershipType) newErrors.partnershipType = "Please select a partnership type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setMessage("");
      setMessageType("");
      const submitData = {
        ...formData,
        brandDescription,
        partnershipType,
        ideaDetails,
      };
      try {
        const response = await fetch("/api/perks-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
        const data = await response.json();
        if (data.success) {
          setMessage(data.message);
          setMessageType("success");
          setFormData({ name: "", email: "", website: "" });
          setPartnershipType("");
          setBrandDescription("");
          setIdeaDetails("");
        } else {
          setMessage(data.error || "Failed to submit form. Please try again.");
          setMessageType("error");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        setMessage("Something went wrong. Please try again.");
        setMessageType("error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const partnerCard = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const dropdownItem = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end bg-[url('/headerBg/loves.webp')] bg-cover bg-center pt-20 overflow-x-hidden"
      >
        <motion.div
          className="w-full h-full grow min-h-full flex flex-col items-center justify-center"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="w-fit md:text-[90px] text-[40px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            WORK WITH <br />
            <b className="md:text-[130px] text-[60px]">US</b>
          </h1>
        </motion.div>
        <Marquee />
      </section>

      {/* ── BRAND COLLABS INTRO (from contactus) ── */}
      <section ref={introRef} className="flex lg:flex-row flex-col-reverse w-full h-full items-stretch">
        <motion.div
          className="lg:w-1/2 w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 lg:basis-1/2"
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">Unleashed</p>
          <h2 className="md:text-[80px] text-5xl uppercase font-anton leading-[100%]">
            Brand collabs. <br />
            <b className="font-antonio font-normal tracking-tight">
              Franchises. <br />
              Strategic chaos.
            </b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            If your brand gets modern mums — their humour, their hustle, their
            need for spaces that just get it — we&apos;re all ears.
            <br />
            From cinema mornings to unapologetic nights out, we create moments
            they remember (and talk about). Let&apos;s make your brand part of the
            story.
          </p>
          <Link
            href="https://drive.google.com/file/d/1nnBBRaD4-vWwIlNVxikzX0PTFroc3CgO/view?usp=sharing"
            target="_blank"
            className="w-fit lg:h-[45px] h-[35px] lg:text-sm lg:px-12 px-8 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
          >
            CURIOUS TO KNOW MORE? <BsDownload className="ml-2 lg:text-2xl text-sm" />
          </Link>
        </motion.div>
        <motion.div
          className="lg:w-1/2 w-full lg:basis-1/2 basis-full"
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        >
          <Image
            src="/partner/about.webp"
            alt="Brand collabs"
            width={1000}
            height={1000}
            className="w-full h-full flex object-cover object-center lg:rounded-tl-xl lg:rounded-bl-xl"
          />
        </motion.div>
      </section>

      {/* ── PARTNER DICTIONARY (from partnershipprogram, flipped layout) ── */}
      <section ref={dictRef} className="w-full h-full flex lg:flex-row flex-col items-center justify-start relative bg-white lg:gap-0 gap-10">
        <motion.div
          className="w-full self-stretch flex flex-col justify-center items-center md:basis-1/2 basis-full bg-[url('/perks/subheader.webp')] bg-cover bg-center min-h-[400px] lg:min-h-full lg:rounded-tr-xl lg:rounded-br-xl"
          initial="hidden"
          animate={dictInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        ></motion.div>
        <motion.div
          className="w-full h-full flex flex-col justify-start items-start md:basis-1/2 basis-full md:pl-14 md:pr-0 px-5 text-[#093166] py-10"
          initial="hidden"
          animate={dictInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">Our</p>
          <h2 className="md:text-[80px] font-thin text-5xl uppercase font-antonio leading-[100%]">
            Partner <br />
            <b className="font-anton font-normal tracking-tight">Dictionary.</b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            We don&apos;t promote anything we wouldn&apos;t use ourselves. These
            are the brands who&apos;ve earned their place here, bold, brilliant,
            and vetted by mums who know what works (and what&apos;s just
            marketing fluff). From the products that save your sanity to the
            services that make life easier, this is our go-to list when someone
            says, &quot;Do you know anyone who&hellip;?&quot;
          </p>
          <Link
            href="/partnershipprogram#form"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
          >
            PARTNER WITH US <BsArrowRight className="ml-2 text-2xl" />
          </Link>
        </motion.div>
      </section>

      {/* ── WE WORK WITH (accordion from contactus) ── */}
      <section ref={workWithRef} className="w-full h-full flex flex-col gap-5 mt-10">
        <motion.div
          className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5"
          initial="hidden"
          animate={workWithInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">Team Up With Us</p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-thin leading-[100%]">
            we <b className="tracking-tight font-bold">work with</b>
          </h2>
        </motion.div>

        <motion.div
          className="w-full h-full bg-[#db4e9f] my-5"
          initial="hidden"
          animate={workWithInView ? "visible" : "hidden"}
          variants={staggerContainer}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 cursor-pointer"
            onClick={() => toggleDropdown(1)}
            variants={dropdownItem}
          >
            <div className="flex flex-row justify-between items-center">
              <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
                Bold brands that want real reach
              </p>
              <BsArrowRight
                className={`lg:text-3xl text-xl text-white transform transition-transform duration-300 ${openIndex === 1 ? "rotate-90" : ""}`}
              />
            </div>
            {openIndex === 1 && (
              <motion.div className="text-white pb-6" initial="hidden" animate="visible" variants={fadeInUp}>
                <p className="font-quicksand md:text-xl text-base leading-[150%]">
                  We work with unapologetic, stand-out brands that refuse to blend in. For us, &quot;real reach&quot; isn&apos;t just about numbers, it&apos;s about sparking genuine conversations, building a loyal following, and turning bold ideas into movements. If your brand has the guts to be loud, proud, and wildly authentic, we&apos;ll make sure the world hears you.
                </p>
              </motion.div>
            )}
          </motion.div>
          <hr />

          <motion.div
            className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 cursor-pointer"
            onClick={() => toggleDropdown(2)}
            variants={dropdownItem}
          >
            <div className="flex flex-row justify-between items-center">
              <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
                Thoughtful start-ups who value word of mouth
              </p>
              <BsArrowRight
                className={`lg:text-3xl text-xl text-white transform transition-transform duration-300 ${openIndex === 2 ? "rotate-90" : ""}`}
              />
            </div>
            {openIndex === 2 && (
              <motion.p className="font-quicksand text-white md:text-xl pb-6 text-base leading-[150%]" initial="hidden" animate="visible" variants={fadeInUp}>
                We back start-ups that understand the magic of genuine connection. With Eklektik Mama&apos;s loyal tribe of mums, word travels fast — and it&apos;s real. We don&apos;t just market your brand; we turn it into a trusted name whispered in playgrounds, messaged in mum groups, and recommended over coffee.
              </motion.p>
            )}
          </motion.div>
          <hr />

          <motion.div
            className="w-full max-w-[1400px] mx-auto lg:px-10 px-5 cursor-pointer"
            onClick={() => toggleDropdown(3)}
            variants={dropdownItem}
          >
            <div className="flex flex-row justify-between items-center">
              <p className="lg:text-3xl text-lg uppercase font-antonio text-white pt-[30px] pb-[18px]">
                Women looking to run Eklektik Mama in their own cities
              </p>
              <BsArrowRight
                className={`lg:text-3xl text-xl text-white transform transition-transform duration-300 ${openIndex === 3 ? "rotate-90" : ""}`}
              />
            </div>
            {openIndex === 3 && (
              <motion.div className="text-white pb-6" initial="hidden" animate="visible" variants={fadeInUp}>
                <p className="font-quicksand text-white md:text-xl text-base leading-[150%]">
                  Bring the Eklektik Mama energy to your own city. As a franchise owner, you&apos;ll tap into our loyal network of unapologetic mums, ready-made brand power, and proven systems that actually work. We hand you the playbook, the support, and the community — you bring your local flair and ambition. Together, we&apos;ll build something your city can&apos;t stop talking about.
                </p>
              </motion.div>
            )}
          </motion.div>
          <hr />
        </motion.div>
      </section>

      {/* ── OUR PARTNERS ── */}
      <section
        ref={partnersRef}
        className="w-full h-full flex flex-col items-start justify-start relative bg-white lg:gap-0 gap-10"
      >
        <motion.h2
          className="md:text-[80px] font-thin text-[#093166] text-5xl uppercase font-antonio leading-[100%] lg:px-10 px-5 flex items-center justify-center text-center w-full py-10"
          initial="hidden"
          animate={partnersInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          our
          <b className="font-anton font-normal tracking-tight md:text-[80px] text-5xl ml-5 mt-3">Partners</b>
        </motion.h2>
        <motion.div
          className="w-full h-full lg:gap-10 gap-5 bg-[#d756a1] lg:p-10 p-7 rounded-[50px]"
          initial="hidden"
          animate={partnersInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.h2
            className="md:text-[80px] font-thin text-[#fff] text-5xl uppercase font-antonio leading-[100%] lg:px-10 px-5 flex items-center justify-center text-center w-full py-10"
            initial="hidden"
            animate={partnersInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            SIGNATURE
            <b className="font-anton font-normal tracking-tight md:text-[80px] text-5xl ml-5 mt-3">Partner</b>
          </motion.h2>
          <motion.div
            className="w-full h-full flex flex-col items-center justify-between lg:basis-1/4 md:basis-1/3 basis-full gap-4 p-5 max-w-[350px] mx-auto"
            variants={partnerCard}
          >
            <span className="w-full h-[120px] max-h-[120px] flex justify-center items-center">
              <Image
                src="/perks/logos/9.webp"
                width={300}
                height={300}
                className="w-fit h-fit max-w-[200px] scale-125 object-contain"
                alt="Hello Chef logo"
              />
            </span>
            <h3 className="lg:text-lg text-base h-full pt-2 font-quicksand text-white text-center">
              Discover a new way of cooking with Hello Chef. Enjoy pre-measured ingredients, easy recipes, and contactless delivery across UAE.
            </h3>
            <Link
              target="_blank"
              href="https://hellochef.me"
              className="w-fit h-[40px] min-h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] mt-6 mb-0 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
            >
              Visit <BsArrowRight className="ml-5 text-2xl" />
            </Link>
          </motion.div>

          <motion.h2
            className="md:text-[80px] font-thin text-[#fff] text-5xl uppercase font-antonio leading-[100%] lg:px-10 px-5 flex items-center justify-center text-center w-full py-10"
            initial="hidden"
            animate={partnersInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            SUPPORTING
            <b className="font-anton font-normal tracking-tight md:text-[80px] text-5xl ml-5 mt-3">Partner</b>
          </motion.h2>
          <div className="w-full h-full items-stretch justify-start grid lg:grid-cols-4 md:grid-cols-4 grid-cols-1 max-w-[1400px] mx-auto gap-10">
            <motion.div
              className="w-full h-full flex flex-col items-center justify-between lg:basis-1/4 md:basis-1/3 basis-full gap-4 p-5"
              variants={partnerCard}
            >
              <span className="w-full h-[120px] max-h-[120px] flex justify-center items-center">
                <Image src="/perks/logos/1.webp" width={300} height={300} className="w-fit h-fit max-w-[160px] object-contain" alt="Kiddos Toys Club logo" />
              </span>
              <h3 className="lg:text-lg text-base h-full pt-2 font-quicksand text-white text-center">
                Toys and activities to keep kids happy while you unwind.
              </h3>
              <Link target="_blank" href="https://kiddostoysclub.com/" className="w-fit h-[40px] min-h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] mt-6 mb-0 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75">
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </motion.div>

            <motion.div
              className="w-full h-full flex flex-col items-center justify-between lg:basis-1/4 md:basis-1/3 basis-full gap-4 p-5"
              variants={partnerCard}
            >
              <span className="w-full h-[120px] max-h-[120px] flex justify-center items-center">
                <Image src="/perks/logos/7.webp" width={300} height={300} className="w-fit h-fit max-w-[160px] object-contain" alt="Bayti Home Healthcare logo" />
              </span>
              <h3 className="lg:text-lg text-base h-full pt-2 font-quicksand text-white text-center">
                Bayti Home Healthcare: UAE&apos;s trusted in‑home care provider since 2013.
              </h3>
              <Link target="_blank" href="https://baytihealth.com/" className="w-fit h-[40px] min-h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] mt-6 mb-0 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75">
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </motion.div>

            <motion.div
              className="w-full h-full flex flex-col items-center justify-between lg:basis-1/4 md:basis-1/3 basis-full gap-4 p-5"
              variants={partnerCard}
            >
              <span className="w-full h-[120px] max-h-[120px] flex justify-center items-center">
                <Image src="/perks/logos/4.webp" width={300} height={300} className="w-fit h-fit max-w-[140px] object-contain" alt="Wolves Zone MMA logo" />
              </span>
              <h3 className="lg:text-lg text-base h-full pt-2 font-quicksand text-white text-center">
                Wolves Zone MMA: training for strength and confidence.
              </h3>
              <Link target="_blank" href="https://www.wolveszoneuae.com/?fbclid=PAZXh0bgNhZW0CMTEAAacVBslr4rjV5hfYp7urTrJo5ZRYHcSd9T5A7lmMJU4t5bDZlVoFgBiMU6u7Yw_aem_ThF2-qHjEx6v8A3Y8PB6dg" className="w-fit h-[40px] min-h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] mt-6 mb-0 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75">
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </motion.div>

            <motion.div
              className="w-full h-full flex flex-col items-center justify-between lg:basis-1/4 md:basis-1/3 basis-full gap-4 p-5"
              variants={partnerCard}
            >
              <span className="w-full h-[120px] max-h-[120px] flex justify-center items-center">
                <Image src="/perks/logos/8.webp" width={300} height={300} className="w-fit h-fit max-w-[140px] object-contain" alt="HOPE AMEL logo" />
              </span>
              <h3 className="lg:text-lg text-base h-full pt-2 font-quicksand text-white text-center">
                Mothers supporting mothers in need and facing hard times by spreading HOPE through kindness and empathy.
              </h3>
              <Link target="_blank" href="https://www.instagram.com/hope_amel_uae_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D" className="w-fit h-[40px] min-h-[40px] px-3 text-sm flex items-center justify-center uppercase text-white hover:text-[#093166] rounded-[20px] mt-6 mb-0 border-2 border-[#fff] bg-[#d756a1] hover:bg-[#fff] transition-colors duration-500 ease-in-out md:scale-100 scale-75">
                Visit <BsArrowRight className="ml-5 text-2xl" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── PARTNER WITH US FORM ── */}
      <section ref={formRef} className="w-full h-full flex flex-col gap-5 mt-10">
        <motion.div
          className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5"
          initial="hidden"
          animate={formInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h2 className="md:text-[80px] text-5xl uppercase tracking-tighter font-antonio font-thin leading-[100%]">
            <b className="tracking-tight font-bold">PARTNER </b>WITH US
          </h2>
        </motion.div>
        <motion.div
          className="w-full h-full flex flex-col justify-center items-center py-10 px-5"
          initial="hidden"
          animate={formInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <form
            id="form"
            onSubmit={handleSubmit}
            className="w-full h-full lg:px-14 px-3 sm:px-5 lg:py-5 py-6 border-2 border-[#db4e9f] max-w-[600px] rounded-lg flex flex-col gap-5 font-poppins relative"
          >
            <Image
              src="/partner/star.webp"
              height={100}
              width={100}
              alt="Star decoration"
              className="absolute lg:bottom-[10px] lg:right-[-70px] right-[-10px] bottom-[-20px]"
            />

            {/* Step 1: Quick Intro */}
            <div className="w-full h-full flex flex-row items-start justify-start gap-3 sm:gap-5 text-[#093166]">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center text-xs font-semibold flex-shrink-0">1</span>
              <div className="w-full h-full flex flex-col gap-5 min-w-0 flex-1 mt-2">
                <h4 className="font-medium uppercase text-sm">QUICK INTRO</h4>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="NAME*"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`text-sm border-2 px-3 sm:px-5 py-1 rounded-xl w-full ${errors.name ? "border-red-500" : "border-[#db4e9f]"}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="EMAIL*"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`text-sm border-2 px-3 sm:px-5 py-1 rounded-xl w-full ${errors.email ? "border-red-500" : "border-[#db4e9f]"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="WEBSITE"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className={`text-sm border-2 px-3 sm:px-5 py-1 rounded-xl w-full ${errors.website ? "border-red-500" : "border-[#db4e9f]"}`}
                  />
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Tell us more about your brand */}
            <div className="w-full h-full flex flex-row items-start justify-start gap-3 sm:gap-5 text-[#093166]">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center text-xs font-semibold flex-shrink-0">2</span>
              <div className="w-full h-full flex flex-col gap-3 min-w-0 flex-1 mt-2">
                <h4 className="font-medium uppercase text-sm">WHAT KIND OF PARTNERSHIP ARE YOU LOOKING FOR?</h4>
                <div>
                  <textarea
                    placeholder="TELL US MORE ABOUT YOUR BRAND"
                    value={brandDescription}
                    onChange={(e) => {
                      setBrandDescription(e.target.value);
                      if (errors.brandDescription) setErrors((prev) => ({ ...prev, brandDescription: "" }));
                    }}
                    className="text-sm border-2 px-3 sm:px-5 py-2 min-h-[100px] rounded-xl w-full resize-none border-[#db4e9f]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Partnership type radios */}
            <div className="w-full h-full flex flex-row items-start justify-start gap-3 sm:gap-5 text-[#093166]">
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center text-xs font-semibold flex-shrink-0">3</span>
              <div className="w-full h-full flex flex-col gap-3 min-w-0 flex-1 mt-2">
                <h4 className="font-medium uppercase text-sm">WHAT KIND OF PARTNERSHIP ARE YOU LOOKING FOR?</h4>
                <div className="w-full h-full flex flex-col gap-3 mt-1">
                  {[
                    "Product Collab (Feature your product with us)",
                    "Service Collab (Bundle OR Cross-promote)",
                    "Brand Promo (Get listed in our partner dictionary)",
                    "Event / Campaign (Co-host OR Sponsor)",
                    "Affiliate / Referral (Earn through referrals)",
                    "Other (Please specify)",
                  ].map((label) => (
                    <label key={label} className="flex items-center gap-2 sm:gap-3 uppercase text-xs sm:text-sm">
                      <input
                        type="radio"
                        name="partnershipType"
                        value={label}
                        checked={partnershipType === label}
                        onChange={(e) => {
                          setPartnershipType(e.target.value);
                          if (errors.partnershipType) setErrors((prev) => ({ ...prev, partnershipType: "" }));
                        }}
                        className="accent-[#db4e9f]"
                      />
                      <span className="uppercase">{label}</span>
                    </label>
                  ))}
                </div>
                {errors.partnershipType && <p className="text-red-500 text-xs mt-1">{errors.partnershipType}</p>}
                <div className="mt-2">
                  <textarea
                    placeholder="TELL US MORE ABOUT YOUR IDEA"
                    value={ideaDetails}
                    onChange={(e) => setIdeaDetails(e.target.value)}
                    className="text-sm border-2 px-3 sm:px-5 py-2 min-h-[100px] rounded-xl w-full resize-none border-[#db4e9f]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-fit h-[45px] px-12 text-base flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#093166]"></div>
              ) : (
                <>SUBMIT <BsArrowRight className="ml-2 text-2xl" /></>
              )}
            </button>

            {message && (
              <div className={`mt-3 text-sm font-medium text-center ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
                {message}
              </div>
            )}
          </form>
        </motion.div>
      </section>

      {/* ── FRANCHISE SECTION (from contactus) ── */}
      <section id="franchise" ref={franchiseRef} className="flex lg:flex-row flex-col-reverse w-full h-full items-stretch">
        <motion.div
          className="lg:w-1/2 w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 lg:basis-1/2"
          initial="hidden"
          animate={franchiseInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base uppercase">Franchise</p>
          <h2 className="md:text-[80px] text-5xl tracking-tight uppercase font-antonio font-thin leading-[100%]">
            <b className="font-bold">Start</b> Eklektik Mama <br />
            <b className="font-anton font-normal tracking-tight">in your city</b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            We&apos;re opening up to a few bold women ready to lead. You bring the fire, we&apos;ll bring the framework — plus our Franchisee Onboarding Pack to set you up from day one.
          </p>
          <Link
            href={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/onboardingPack.pdf`}
            download="onboardingPack.pdf"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-[10px] flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
          >
            DOWNLOAD THE ONBOARDING PACK <BsDownload className="ml-6 text-2xl" />
          </Link>
          <Link
            href="#form"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-[10px] flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
          >
            CONTACT US <BsArrowRight className="ml-6 text-2xl" />
          </Link>
        </motion.div>
        <motion.div
          className="lg:w-1/2 w-full lg:basis-1/2 basis-full"
          initial="hidden"
          animate={franchiseInView ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ delay: 0.3 }}
        >
          <Image
            src="/partner/onboarding.webp"
            alt="Franchise onboarding"
            width={1000}
            height={1000}
            className="w-full h-full flex object-cover object-center lg:rounded-tl-xl lg:rounded-bl-xl"
          />
        </motion.div>
      </section>
    </div>
  );
};

export default Page;
