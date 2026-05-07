import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import LocalEditCategory from "@/models/LocalEditCategory";
import LocalEditListing from "@/models/LocalEditListing";
import LocalEditCategoryClient from "./LocalEditCategoryClient";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  await connectDB();
  const categories = await LocalEditCategory.find({ isActive: true })
    .select("slug")
    .lean();
  return categories.map((c) => ({ slug: c.slug }));
}

async function getCategoryWithListings(slug) {
  await connectDB();

  const category = await LocalEditCategory.findOne({ slug, isActive: true }).lean();
  if (!category) return null;

  const listings = await LocalEditListing.find({
    category: category._id,
    isActive: true,
  })
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return {
    category: {
      _id: category._id.toString(),
      title: category.title,
      slug: category.slug,
      description: category.description || "",
      image: category.image,
      imageAlt: category.imageAlt || "",
    },
    listings: listings.map((l) => ({
      _id: l._id.toString(),
      title: l.title,
      description: l.description || "",
      image: l.image,
      imageAlt: l.imageAlt || "",
      link: l.link,
    })),
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getCategoryWithListings(slug);

  if (!data) {
    return {
      title: "Category Not Found | The Local Edit",
    };
  }

  const { category } = data;
  const description =
    category.description ||
    `Mum-approved local picks in ${category.title} — curated by Eklektik Mama for families in Abu Dhabi & the UAE.`;

  return {
    title: `${category.title} | The Local Edit | Eklektik Mama`,
    description,
    alternates: {
      canonical: `https://eklektikmama.com/the-local-edit/${category.slug}`,
    },
    openGraph: {
      title: `${category.title} | The Local Edit`,
      description,
      url: `https://eklektikmama.com/the-local-edit/${category.slug}`,
      siteName: "Eklektik Mama",
      images: category.image
        ? [
            {
              url: category.image,
              width: 1200,
              height: 630,
              alt: category.imageAlt || category.title,
            },
          ]
        : [],
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function LocalEditCategoryPage({ params }) {
  const { slug } = await params;
  const data = await getCategoryWithListings(slug);

  if (!data) {
    notFound();
  }

  return (
    <LocalEditCategoryClient
      category={data.category}
      listings={data.listings}
    />
  );
}
