import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import LocalEditClient from "./LocalEditClient";

export const revalidate = 60;

export const metadata = {
  title: "The Local Edit | Mum-Tested Local Loves in Abu Dhabi & UAE",
  description:
    "The Local Edit is our curated little black book of mum-approved spots, services and small businesses across Abu Dhabi & the UAE — cafes, sitters, photographers, after-school activities and more.",
  keywords: [
    "local edit abu dhabi",
    "mum recommendations uae",
    "family friendly abu dhabi",
    "kids activities abu dhabi",
    "mum-approved local businesses",
    "abu dhabi family directory",
  ],
  alternates: {
    canonical: "https://eklektikmama.com/local-edit",
  },
  openGraph: {
    title: "The Local Edit | Mum-Tested Local Loves in Abu Dhabi & UAE",
    description:
      "Curated by mums, for mums. Discover the cafes, sitters, photographers and small businesses we actually rate.",
    url: "https://eklektikmama.com/local-edit",
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
  }));
}

export default async function LocalEditPage() {
  const categories = await getCategories();
  return <LocalEditClient categories={categories} />;
}
