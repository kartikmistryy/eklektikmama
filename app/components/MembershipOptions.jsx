"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BsArrowDown, BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";

export default function MembershipOptions() {
  const [openIndex, setOpenIndex] = useState(null);
  const router = useRouter();

  const handleJoinNow = (membershipType) => {
    // Navigate to membership signup page with the selected plan
    router.push(`/eklektikmamaMembership?plan=${membershipType}`);
  };

  const memberships = [
    {
      title: "JOIN MONTHLY",
      price: "AED 49",
      membershipType: "monthly",
      perks: [
        {
          icon: "/membership/whiteIcons/1.webp",
          text: "Exclusive WhatsApp group – your go-to hub for updates, banter, and mama solidarity",
        },
        {
          icon: "/membership/whiteIcons/2.webp",
          text: "10% off every BYOBaby™ ticket – from breakfasts to cinema ",
        },
        {
          icon: "/membership/whiteIcons/3.webp",
          text: "10% off Shop Drops – because motherhood deserves better than boring merch",
        },
        {
          icon: "/membership/whiteIcons/4.webp",
          text: "Access to members-only Coffee Catch Ups",
        },
        {
          icon: "/membership/whiteIcons/5.webp",
          text: "Mama Milestones Cards digital download to mark every messy, hilarious stage of mum life",
        },
      ],
    },
    {
      title: "JOIN YEARLY",
      price: "AED 490",
      membershipType: "annual",
      perks: [
        {
          icon: "/membership/whiteIcons/1.webp",
          text: "Early access to all event drops",
        },
        {
          icon: "/membership/whiteIcons/2.webp",
          text: "Discounts on every BYOBaby™ ticket",
        },
        {
          icon: "/membership/whiteIcons/3.webp",
          text: "Exclusive access to our members-only WhatsApp group",
        },
        {
          icon: "/membership/whiteIcons/4.webp",
          text: "Special perks on Shop Drops",
        },
        {
          icon: "/membership/whiteIcons/5.webp",
          text: "Surprise invites to Members-Only things we’re not supposed to talk about",
        },
        {
          icon: "/membership/whiteIcons/6.webp",
          text: "Save more with our yearly membership",
        },
      ],
    },
  ];

  const faqs = [
    {
      question: "What’s included in the membership?",
      answer:
        "Early event access, exclusive member discounts, and entry to our members-only WhatsApp group for tips, deals, and connections.",
    },
    {
      question: "How much does it cost?",
      answer:
        "AED 50/month or AED 450/year. Yearly memberships save you AED 150.",
    },
    {
      question: "How do I get my discounts?",
      answer:
        "Log in before you shop or book events — your member discounts are applied automatically at checkout.",
    },
    {
      question: "Can I switch from monthly to yearly?",
      answer:
        "Yes! You can upgrade anytime in your account settings to start saving more.",
    },
    {
      question: "Is there a contract or can I cancel anytime?",
      answer:
        "No contracts. You can cancel your membership anytime via your account dashboard. ",
    },
    {
      question: "How do I join the WhatsApp group?",
      answer:
        "Once you become a member, you’ll get a link in your welcome email to join the group instantly.",
    },
    {
      question: "What’s the difference between monthly and yearly plans?",
      answer:
        "Same perks — yearly just saves you more (and the hassle of monthly renewals).",
    },
  ];

  return (
    <div className="w-full h-full mx-auto my-10">
      {/* Memberships */}
      {memberships.map((plan, index) => (
        <div key={index} className="border-b border-white font-antonio">
          {/* Header */}
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between bg-[#db4e9f] lg:px-10 px-5 py-6 text-white font-bold text-lg"
          >
            <span className="text-2xl font-medium">{plan.title}</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">{plan.price}</span>
              {openIndex === index ? (
                <BsArrowDown className="text-2xl ml-7"/>
              ) : (
                <BsArrowRight className="text-2xl ml-7" />
              )}
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
                className="overflow-hidden bg-[#db4e9f] px-6 pb-6 md:pl-10"
              >
                <ul className="flex flex-col gap-4 mt-4">
                  {plan.perks.map((perk, i) => (
                    <li
                      key={i}
                      className="flex font-quicksand items-center gap-4 text-white text-base"
                    >
                      <Image
                        src={perk.icon}
                        alt={`perk-${i + 1}`}
                        width={28}
                        height={28}
                        className="w-[28px] h-[28px] object-contain"
                      />
                      {perk.text}
                    </li>
                  ))}
                </ul>
                <a 
                  href={`eklektikmamaMembership?plan=${plan.membershipType}`}
                  className="mt-6 flex w-fit items-center border border-white rounded-full px-6 py-2 text-white uppercase  ml-auto"
                >
                  JOIN NOW
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* FAQ Toggle */}
      <div className="border-b border-white font-antonio">
        <button
          onClick={() => setOpenIndex(openIndex === "faq" ? null : "faq")}
          className="w-full flex items-center justify-between bg-[#db4e9f] lg:px-10 px-5 py-6 text-white font-bold text-lg"
        >
          <span className="text-2xl">QUESTIONS?</span>
          {openIndex === "faq" ? (
            <span className="w-fit ml-auto flex flex-row items-center uppercase text-xl font-bold">
              See Membership FAQs
              <BsArrowDown className="text-2xl ml-7" />
            </span>
          ) : (
            <span className="w-fit ml-auto flex flex-row items-center uppercase text-xl font-bold">
              See Membership FAQs
              <BsArrowRight className="text-2xl ml-7" />
            </span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {openIndex === "faq" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-[#db4e9f] px-6 pb-6 md:pl-10"
            >
              <ul className="flex flex-col gap-6 mt-4">
                {faqs.map((faq, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-2 text-white font-quicksand"
                  >
                    <p className="font-semibold">{faq.question}</p>
                    <p className="text-sm opacity-90">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
