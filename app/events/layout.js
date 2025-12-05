export const metadata = {
  title: "Abu Dhabi Mum Events | BYOBabyⓇ Gatherings",
  description:
    "Find and book mum-friendly (mom-friendly) events in Abu Dhabi. BYOBabyⓇ gatherings, coffee mornings, and fun socials for mums.",
  keywords: [
    "abu dhabi mum events", "abu dhabi mom events", "baby friendly events abu dhabi",
    "mummy coffee mornings abu dhabi", "mom coffee mornings abu dhabi", "playdate events uae",
    "best mums events abu dhabi", "where to find moms events abu dhabi"
  ],
  alternates: {
    canonical: "https://eklektikmama.com/events"
  },
  openGraph: {
    title: "Abu Dhabi Mum Events | BYOBabyⓇ Gatherings",
    description:
      "Find and book mum-friendly (mom-friendly) events in Abu Dhabi. BYOBabyⓇ gatherings, coffee mornings, and fun socials for mums.",
    url: "https://eklektikmama.com/events",
    siteName: "Eklektik Mama",
    images: [
      {
        url: "/og/events.jpg",
        width: 1200,
        height: 630,
        alt: "Eklektik Mama Events Abu Dhabi",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abu Dhabi Mum Events | BYOBabyⓇ Gatherings",
    description:
      "Find and book mum-friendly (mom-friendly) events in Abu Dhabi. BYOBabyⓇ gatherings, coffee mornings, and fun socials for mums.",
    images: ["/og/events.jpg"],
  },
};

export default function EventsLayout({ children }) {
  return children;
}
