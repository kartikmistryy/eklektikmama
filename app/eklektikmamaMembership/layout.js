export const metadata = {
  title: "Abu Dhabi Mum Membership | Eklektik AF",
  description:
    "Join Eklektik AF - an exclusive mums (moms) membership in Abu Dhabi. Gain access to events, private groups, and mum-to-mum support.",
  keywords: [
    "abu dhabi mum membership", "abu dhabi mom membership", "exclusive mum club abu dhabi",
    "motherhood membership uae", "mum community subscription uae", "mom network abu dhabi",
    "how to join a mums whatsapp group in abu dhabi", "exclusive moms membership abu dhabi"
  ],
  alternates: {
    canonical: "https://eklektikmama.com/eklektikmamaMembership"
  },
  openGraph: {
    title: "Abu Dhabi Mum Membership | Eklektik AF",
    description:
      "Join Eklektik AF - an exclusive mums (moms) membership in Abu Dhabi. Gain access to events, private groups, and mum-to-mum support.",
    url: "https://eklektikmama.com/eklektikmamaMembership",
    siteName: "Eklektik Mama",
    images: [
      {
        url: "/og/membership.jpg",
        width: 1200,
        height: 630,
        alt: "Eklektik Mama Membership",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abu Dhabi Mum Membership | Eklektik AF",
    description:
      "Join Eklektik AF - an exclusive mums (moms) membership in Abu Dhabi. Gain access to events, private groups, and mum-to-mum support.",
    images: ["/og/membership.jpg"],
  },
};

export default function MembershipLayout({ children }) {
  return children;
}
