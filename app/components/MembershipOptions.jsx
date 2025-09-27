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
          icon: "/membership/whiteIcons/6.webp",
          text: "Save AED 98 a year (it’s like getting two months free)",
        },
        {
          icon: "/membership/whiteIcons/2.webp",
          text: "The Eklektik Mama Guide to UAE Mum Life – our exclusive digital survival manual",
        },
        {
          icon: "/membership/whiteIcons/3.webp",
          text: "A free Eklektik Mama tote bag – your badge of honour (and the perfect catch-all for snacks, wipes, and chaos)",
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
        "AED 49/month or AED 490/year. Yearly memberships save you AED 98.",
    },
    {
      question: "How do I get my discounts?",
      answer:
        "Use the same email you purchased your membership with, and your 10% discount will be applied automatically at checkout.",
    },
    {
      question: "Can I switch from monthly to yearly?",
      answer:
        "You can choose to upgrade to annual anytime from your Manage Membership dashboard.",
    },
    {
      question: "Is there a contract or can I cancel anytime?",
      answer:
        "You can cancel anytime through your Manage Membership dashboard.",
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
                {plan.membershipType === "annual" && (
                  <p className="text-white font-quicksand md:text-lg text-base font-semibold">
                   All monthly membership perks — plus more below
                  </p>
                )}
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
                  className="mt-6 flex w-fit items-center border border-white rounded-full px-6 py-2 text-white hover:bg-white hover:text-[#db4e9f] uppercase transition-all duration-300  ml-auto"
                >
                  PAY VIA STRIPE <BsArrowRight className="ml-3" />
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
              <div className="text-white font-quicksand md:text-base text-sm space-y-6">
                
                {/* Core Benefits Section */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Every membership gives you:</h3>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Early access to event drops</li>
                    <li>10% off BYOBaby™ events and merch</li>
                    <li>Free members-only Coffee Catch Ups</li>
                    <li>Mama Milestones Cards — a printable set to mark every messy, hilarious stage of motherhood</li>
                    <li>Access to our private WhatsApp group for updates and connection</li>
                  </ul>
                </div>

                {/* Annual Benefits Section */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Annual members also get:</h3>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>The Eklektik Mama Guide to UAE Mum Life — your insider playbook for navigating mum life in the UAE</li>
                    <li>A free Eklektik Mama tote bag — your badge of membership and catch-all for life's chaos</li>
                    <li>Two months free compared to paying monthly</li>
                  </ul>
                </div>

                {/* Pricing Section */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Pricing</h3>
                  <ul className="list-disc ml-6 space-y-2">
                    <li><span className="font-semibold">Monthly:</span> AED 49</li>
                    <li><span className="font-semibold">Annual:</span> AED 490</li>
                  </ul>
                  <p className="mt-3 text-sm">Annual gives you two months free, plus exclusive extras you won't get with monthly.</p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-4">
                      <h4 className="font-semibold text-base mb-2 text-white">{faq.question}</h4>
                      <p className="text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>

                {/* Additional Info Section */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Monthly vs. Annual</h3>
                  <p className="text-sm mb-3">Both plans include the same core perks.</p>
                  <p className="text-sm">Annual gives you more value, extra rewards, and fewer payments to manage.</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Cancellations</h3>
                  <p className="text-sm mb-2">No contracts. Cancel anytime.</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li className="text-sm">Monthly stays active until the end of the month you've paid for.</li>
                    <li className="text-sm">Annual stays active until the end of your paid year.</li>
                  </ul>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Renewals</h3>
                  <p className="text-sm">Both plans renew automatically.</p>
                  <p className="text-sm">We'll email you ahead of time so there are no surprises.</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Refunds</h3>
                  <p className="text-sm">Cancel within 7 days of joining to request a refund.</p>
                  <p className="text-sm">Email <a href="mailto:hello@eklektikmama.com" className="underline hover:text-gray-200">hello@eklektikmama.com</a> and we'll help.</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Collecting your tote (annual only)</h3>
                  <p className="text-sm">Pick up your tote at any BYOBaby™ event — just show your membership confirmation at check-in.</p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
