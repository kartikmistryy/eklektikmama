export const metadata = {
  title: "Abu Dhabi Mum Community | Eklektik Mama",
  description:
    "Join the boldest mum (mom) community in Abu Dhabi. Connect, share, and grow with modern motherhood support groups and unfiltered events.",
  keywords: [
    "abu dhabi mum community", "abu dhabi mom community", "abu dhabi mothers group",
    "modern motherhood community", "mum support group abu dhabi", "parenting community uae",
    "best mum group abu dhabi", "how to meet other moms in abu dhabi"
  ],
  openGraph: {
    title: "Abu Dhabi Mum Community | Eklektik Mama",
    description:
      "Join the boldest mum (mom) community in Abu Dhabi. Connect, share, and grow with modern motherhood support groups and unfiltered events.",
    url: "https://eklektikmama.com",
    siteName: "Eklektik Mama",
    images: [
      {
        url: "/og/home.jpg",
        width: 1200,
        height: 630,
        alt: "Eklektik Mama Community Abu Dhabi",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abu Dhabi Mum Community | Eklektik Mama",
    description:
      "Join the boldest mum (mom) community in Abu Dhabi. Connect, share, and grow with modern motherhood support groups and unfiltered events.",
    images: ["/og/home.jpg"],
  },
};

export default function HomeLayout({ children }) {
  return children;
}
