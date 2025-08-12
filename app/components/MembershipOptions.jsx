"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaWhatsapp, FaShoppingBag, FaEnvelope } from "react-icons/fa";
import { MdOutlineLocalOffer } from "react-icons/md";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";

export default function MembershipOptions() {
  const [openIndex, setOpenIndex] = useState(null);

  const memberships = [
    {
      title: "JOIN MONTHLY",
      price: "AED 50",
      perks: [
        { icon: <FaLock />, text: "Early access to all event drops" },
        { icon: <MdOutlineLocalOffer />, text: "Discounts on every BYOBaby™ ticket" },
        { icon: <FaWhatsapp />, text: "Exclusive access to our members-only WhatsApp group" },
        { icon: <FaShoppingBag />, text: "Special perks on Shop Drops" },
        { icon: <FaEnvelope />, text: "Surprise invites to Members-Only things we’re not supposed to talk about" },
      ],
    },
    {
      title: "JOIN YEARLY",
      price: "AED 450",
      perks: [
        { icon: <FaLock />, text: "Early access to all event drops" },
        { icon: <MdOutlineLocalOffer />, text: "Discounts on every BYOBaby™ ticket" },
        { icon: <FaWhatsapp />, text: "Exclusive access to our members-only WhatsApp group" },
        { icon: <FaShoppingBag />, text: "Special perks on Shop Drops" },
        { icon: <FaEnvelope />, text: "Surprise invites to Members-Only things we’re not supposed to talk about" },
      ],
    },
  ];

  return (
    <div className="w-full h-full mx-auto my-10">
      {memberships.map((plan, index) => (
        <div key={index} className="border-b border-white font-antonio">
          {/* Header */}
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between bg-[#db4e9f] px-6 py-6 text-white font-bold text-lg"
          >
            <span className="text-2xl font-medium">{plan.title}</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{plan.price}</span>
              {openIndex === index ? <FiChevronDown /> : <BsArrowRight className="text-2xl ml-7"/>}
            </div>
          </button>

          {/* Dropdown Content */}
          <AnimatePresence initial={false}>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden bg-[#db4e9f] px-6 pb-6"
              >
                <ul className="flex flex-col gap-4 mt-4">
                  {plan.perks.map((perk, i) => (
                    <li key={i} className="flex font-quicksand items-center gap-4 text-white text-base">
                      <span className="text-lg">{perk.icon}</span>
                      {perk.text}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 flex items-center gap-2 border border-white rounded-full px-6 py-2 text-white hover:bg-white hover:text-[#db4e9f] transition">
                  PAY VIA STRIPE →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* FAQ Row */}
      <div className="bg-[#db4e9f] px-6 py-6 flex items-center justify-between text-white font-bold text-lg">
        <span>QUESTIONS?</span>
        <span>SEE MEMBERSHIP FAQS +</span>
      </div>
    </div>
  );
}
