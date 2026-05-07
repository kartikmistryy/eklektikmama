import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import LocalEditClient from "./LocalEditClient";

export const revalidate = 60;

export const metadata = {
  title: "The Local Edit | Trusted Local Services | Eklektik Mama Abu Dhabi",
  description:
    "Discover trusted local services loved by Abu Dhabi mamas. The Local Edit is Eklektik Mama's curated guide to the best local businesses for families.",
  keywords: [
    "local edit abu dhabi",
    "trusted local services abu dhabi",
    "mum recommendations uae",
    "family friendly abu dhabi",
    "kids activities abu dhabi",
    "mum-approved local businesses",
    "abu dhabi family directory",
  ],
  alternates: {
    canonical: "https://eklektikmama.com/the-local-edit",
  },
  openGraph: {
    title: "The Local Edit | Trusted Local Services | Eklektik Mama Abu Dhabi",
    description:
      "Discover trusted local services loved by Abu Dhabi mamas. The Local Edit is Eklektik Mama's curated guide to the best local businesses for families.",
    url: "https://eklektikmama.com/the-local-edit",
    siteName: "Eklektik Mama",
    images: [
      {
        url: "/headerBg/loves.webp",
        width: 1200,
        height: 630,
        alt: "The Local Edit by Eklektik Mama",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

async function getCategories() {
  await connectDB();
  const categories = await LocalEditCategory.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return categories.map((c) => ({
    _id: c._id.toString(),
    title: c.title,
    slug: c.slug,
    description: c.description || "",
    image: c.image,
    imageAlt: c.imageAlt || "",
  }));
}

export default async function LocalEditPage() {
  const categories = await getCategories();
  return <LocalEditClient categories={categories} />;
}
