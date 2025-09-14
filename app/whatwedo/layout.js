export const metadata = {
  title: "Abu Dhabi Mum Event Highlights | Eklektik Mama",
  description:
    "See past events, partners and community moments. Abu Dhabi mums' event highlights, family-friendly brand activations and memories.",
  keywords: [
    "abu dhabi mum events photos", "abu dhabi mom events highlights", "family event gallery abu dhabi",
    "brand activations for mums uae", "sponsor mummy events abu dhabi", "partner activations abu dhabi",
    "past mum events abu dhabi", "best family brands abu dhabi"
  ],
  openGraph: {
    title: "Abu Dhabi Mum Event Highlights | Eklektik Mama",
    description:
      "See past events, partners and community moments. Abu Dhabi mums' event highlights, family-friendly brand activations and memories.",
    url: "https://eklektikmama.com/whatwedo",
    siteName: "Eklektik Mama",
    images: [
      {
        url: "/og/highlights.jpg",
        width: 1200,
        height: 630,
        alt: "Eklektik Mama Event Highlights",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abu Dhabi Mum Event Highlights | Eklektik Mama",
    description:
      "See past events, partners and community moments. Abu Dhabi mums' event highlights, family-friendly brand activations and memories.",
    images: ["/og/highlights.jpg"],
  },
};

export default function WhatWeDoLayout({ children }) {
  return children;
}
