"use client";
import React from "react";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight, BsDownload } from "react-icons/bs";
import Marquee from "../components/Marquee";
import { motion, useInView } from "framer-motion";

const Parnterwithus = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    isBrand: "",
    interestedInFranchise: "",
    note: ""
  });
  const [errors, setErrors] = useState({});

  // Refs for animations
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const teamUpRef = useRef(null);
  const pitchRef = useRef(null);
  const franchiseRef = useRef(null);

  // InView hooks
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const introInView = useInView(introRef, { once: true, amount: 0.3 });
  const teamUpInView = useInView(teamUpRef, { once: true, amount: 0.2 });
  const pitchInView = useInView(pitchRef, { once: true, amount: 0.3 });
  const franchiseInView = useInView(franchiseRef, { once: true, amount: 0.3 });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const dropdownItem = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const formItem = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const toggleDropdown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.isBrand) {
      newErrors.isBrand = "Please select an option";
    }
    
    if (!formData.interestedInFranchise) {
      newErrors.interestedInFranchise = "Please select an option";
    }
    
    if (!formData.note.trim()) {
      newErrors.note = "Note is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Form Data:", formData);
      // Here you would typically send the data to your API
      alert("Form submitted successfully! Check console for data.");
    } else {
      console.log("Form validation failed:", errors);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <section ref={heroRef} className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end  bg-[url('/headerBg/partner.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <motion.div 
          className="w-full h-full grow min-h-full flex flex-col items-center justify-center"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            PITCH US
            <br />
            <b className="md:text-[100px] text-[60px]">SOMETHING WILD</b>
          </h1>
        </motion.div>
        <Marquee />
      </section>

      <section ref={introRef} className="flex lg:flex-row flex-col-reverse w-full h-full items-stretch">
        <motion.div 
          className="lg:w-1/2 w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 lg:basis-1/2"
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base">Unleashed</p>
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
            href="/"
            className="w-fit lg:h-[45px] h-[35px] lg:text-sm lg:px-12 px-8 text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out scale-100"
          >
            PARTNER WITH US <BsArrowRight className="ml-2 lg:text-2xl text-sm" />
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
            alt="aboutImg"
            width={1000}
            height={1000}
            className="w-full h-full flex object-cover object-center lg:rounded-tl-xl lg:rounded-bl-xl"
          />
        </motion.div>
      </section>

      <section ref={teamUpRef} className="w-full h-full flex flex-col gap-5 mt-10">
        <motion.div 
          className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5"
          initial="hidden"
          animate={teamUpInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base">
            Team Up With Us
          </p>
          <h2 className="md:text-[80px] text-5xl uppercase font-antonio font-thin leading-[100%]">
            we <b className="tracking-tight font-bold">work with</b>
          </h2>
        </motion.div>

        <motion.div 
          className="w-full h-full bg-[#db4e9f] my-5"
          initial="hidden"
          animate={teamUpInView ? "visible" : "hidden"}
          variants={staggerContainer}
          transition={{ delay: 0.2 }}
        >
          {/* Item 1 */}
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
                className={`lg:text-3xl text-xl text-white transform transition-transform duration-300 ${
                  openIndex === 1 ? "rotate-90" : ""
                }`}
              />
            </div>
            {openIndex === 1 && (
              <motion.div 
                className="text-white pb-6"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <p className="font-quicksand md:text-xl text-base leading-[150%]">
                  We work with unapologetic, stand-out brands that refuse to blend in. For us, &quot;real reach&quot; isn&apos;t just about numbers, it&apos; about sparking genuine conversations, building a loyal following, and turning bold ideas into movements. If your brand has the guts to be loud, proud, and wildly authentic, we&apos;ll make sure the world hears you.
                </p>
              </motion.div>
            )}
          </motion.div>
          <hr />

          {/* Item 2 */}
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
                className={`lg:text-3xl text-xl text-white transform transition-transform duration-300 ${
                  openIndex === 2 ? "rotate-90" : ""
                }`}
              />
            </div>
            {openIndex === 2 && (
              <motion.p 
                className="font-quicksand text-white md:text-xl pb-6 text-base leading-[150%]"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                We back start-ups that understand the magic of genuine connection. With Eklektik Mama&apos;s loyal tribe of mums, word travels fast — and it&apos;s real. We don&apos;t just market your brand; we turn it into a trusted name whispered in playgrounds, messaged in mum groups, and recommended over coffee.
              </motion.p>
            )}
          </motion.div>
          <hr />

          {/* Item 3 */}
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
                className={`lg:text-3xl text-xl text-white transform transition-transform duration-300 ${
                  openIndex === 3 ? "rotate-90" : ""
                }`}
              />
            </div>
            {openIndex === 3 && (
              <motion.div 
                className="text-white pb-6"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <p className="font-quicksand text-white md:text-xl text-base leading-[150%]">
                 Bring the Eklektik Mama energy to your own city. As a franchise owner, you&apos;ll tap into our loyal network of unapologetic mums, ready-made brand power, and proven systems that actually work. We hand you the playbook, the support, and the community — you bring your local flair and ambition. Together, we&apos;ll build something your city can&apos;t stop talking about.
                </p>
              </motion.div>
            )}
          </motion.div>
          <hr />
        </motion.div>
      </section>

      <section ref={pitchRef} className="w-full h-full flex flex-col gap-5 mt-10">
        <motion.div 
          className="w-full h-full text-[#093166] max-w-[1400px] mx-auto flex flex-col lg:px-10 px-5"
          initial="hidden"
          animate={pitchInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base">Pitch</p>
          <h2 className="md:text-[80px] text-5xl uppercase tracking-tighter font-antonio font-thin leading-[100%]">
            This Is Where {""}
            <b className="tracking-tight font-bold">It Starts</b>
          </h2>
        </motion.div>
        <motion.div 
          className="w-full h-full flex flex-col justify-center items-center py-10 px-5"
          initial="hidden"
          animate={pitchInView ? "visible" : "hidden"}
          variants={staggerContainer}
          transition={{ delay: 0.2 }}
        >
          <motion.form 
            onSubmit={handleSubmit} 
            className="w-full h-full lg:px-14 px-5 lg:py-5 py-6 border-2 border-[#db4e9f] max-w-[600px] rounded-lg flex flex-col gap-5 font-poppins relative"
            variants={fadeInUp}
          >
            <motion.div
              initial="hidden"
              animate={pitchInView ? "visible" : "hidden"}
              variants={fadeIn}
              transition={{ delay: 0.5 }}
            >
              <Image
                src="/partner/star.webp"
                height={100}
                width={100}
                alt="Logo"
                className="absolute lg:bottom-[10px] lg:right-[-70px] right-[-10px] bottom-[-20px]"
              />
            </motion.div>
            
            <motion.div 
              className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166]"
              variants={formItem}
            >
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                1
              </span>
              <div className="w-full h-full flex flex-col gap-5 max-w-[350px]">
                <h4 className="font-semibold">QUICK INTRO</h4>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="NAME*"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`text-sm border-2 px-5 py-1 rounded-xl ${errors.name ? 'border-red-500' : 'border-[#db4e9f]'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="EMAIL*"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`text-sm border-2 px-5 py-1 rounded-xl ${errors.email ? 'border-red-500' : 'border-[#db4e9f]'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166] mt-4"
              variants={formItem}
            >
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                2
              </span>
              <div className="w-full h-full flex flex-col gap-2">
                <h4 className="font-semibold">What Brings You Here?</h4>
                <div className="w-full h-full flex lg:flex-row flex-col gap-5 mt-3">
                  <label className="uppercase w-full">
                    Are you a brand?{" "}
                  </label>
                  <div className="w-full max-w-[150px] h-fit flex flex-row gap-5">
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input 
                        type="radio" 
                        name="isBrand" 
                        value="yes"
                        checked={formData.isBrand === "yes"}
                        onChange={(e) => handleInputChange('isBrand', e.target.value)}
                      />
                      <label>Yes</label>
                    </span>
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input 
                        type="radio" 
                        name="isBrand" 
                        value="no"
                        checked={formData.isBrand === "no"}
                        onChange={(e) => handleInputChange('isBrand', e.target.value)}
                      />
                      <label>No</label>
                    </span>
                  </div>
                </div>
                {errors.isBrand && <p className="text-red-500 text-xs mt-1">{errors.isBrand}</p>}

                <div className="w-full h-full flex lg:flex-row flex-col gap-3 mt-3">
                  <label className="uppercase w-full text-base">
                    Are you interested in running Eklektik Mama in your city?
                  </label>
                  <div className="w-full max-w-[150px] h-fit flex flex-row gap-5">
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input 
                        type="radio" 
                        name="interestedInFranchise" 
                        value="yes"
                        checked={formData.interestedInFranchise === "yes"}
                        onChange={(e) => handleInputChange('interestedInFranchise', e.target.value)}
                      />
                      <label>Yes</label>
                    </span>
                    <span className="w-fit h-full flex flex-row gap-2 uppercase">
                      <input 
                        type="radio" 
                        name="interestedInFranchise" 
                        value="no"
                        checked={formData.interestedInFranchise === "no"}
                        onChange={(e) => handleInputChange('interestedInFranchise', e.target.value)}
                      />
                      <label>No</label>
                    </span>
                  </div>
                </div>
                {errors.interestedInFranchise && <p className="text-red-500 text-xs mt-1">{errors.interestedInFranchise}</p>}
              </div>
            </motion.div>

            <motion.div 
              className="w-full h-full flex flex-row items-start justify-start gap-5 text-[#093166]"
              variants={formItem}
            >
              <span className="border-2 border-[#db4e9f] h-7 w-7 rounded-full flex justify-center items-center  text-xs">
                3
              </span>
              <div className="w-full h-full flex flex-col gap-5 max-w-[350px]">
                <h4 className="font-semibold">Drop Us a Line</h4>
                <div>
                  <textarea
                    required
                    placeholder="NOTE"
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    className={`text-sm border-2 px-5 py-2 min-h-[150px] rounded-xl ${errors.note ? 'border-red-500' : 'border-[#db4e9f]'}`}
                  />
                  {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
                </div>
              </div>
            </motion.div>
            
            <motion.button
              type="submit"
              className="w-fit h-[45px] px-12 text-base flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out md:scale-100 scale-75"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              SUBMIT <BsArrowRight className="ml-2 text-2xl" />
            </motion.button>
          </motion.form>
        </motion.div>
      </section>

      <section ref={franchiseRef} className="flex lg:flex-row flex-col-reverse w-full h-full items-stretch">
        <motion.div 
          className="lg:w-1/2 w-full h-full flex flex-col justify-start items-start basis-full lg:pl-14 px-5 text-[#093166] py-10 lg:basis-1/2"
          initial="hidden"
          animate={franchiseInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <p className="font-quicksand font-semibold text-base">Franchise</p>
          <h2 className="md:text-[80px] text-5xl tracking-tight uppercase font-antonio font-thin leading-[100%]">
            <b className="font-bold">Start</b>  Eklektik  Mama <br />
            <b className="font-anton font-normal tracking-tight">
              in your city
            </b>
          </h2>
          <p className="lg:text-base font-quicksand font-medium mt-6 md:w-[95%] w-full">
            We&apos;re opening up to a few bold women ready to lead. You bring the fire, we&apos;ll bring the framework — plus our Franchisee Onboarding Pack to set you up from day one.
          </p>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px] my-6 border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out "
          >
            DOWNLOAD THE ONBOARDING PACK <BsDownload className="ml-6 text-2xl" />
          </Link>
          <Link
            href="/"
            className="w-fit md:h-[45px] h-[40px] md:px-12 px-6 md:text-base text-xs flex items-center justify-center uppercase text-[#093166] hover:text-white rounded-[20px]  border-2 border-[#bf378b] bg-transparent hover:bg-[#bf378b] transition-colors duration-500 ease-in-out"
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
            alt="aboutImg"
            width={1000}
            height={1000}
            className="w-full h-full flex object-cover object-center lg:rounded-tl-xl lg:rounded-bl-xl"
          />
        </motion.div>
      </section>
    </div>
  );
};

export default Parnterwithus;