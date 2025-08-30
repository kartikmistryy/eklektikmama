import { getFeaturedBlogPosts, getEklektikBlogPosts, getBlogPostsCount, getAllPostsWithoutSegment } from "../../lib/contentful";
import Marquee from "../components/Marquee";
import BlogCard from "./components/BlogCard";
import FeaturedSection from "./components/FeaturedSection";
import CategoriesSection from "./components/CategoriesSection";
import AllStoriesSection from "./components/AllStoriesSection";
import Pagination from "./components/Pagination";

// Make this a server component to fetch data
async function getBlogData(searchParams) {
  try {
    const page = parseInt(searchParams?.page) || 1;
    const limit = 9; // Number of posts per page
    const skip = (page - 1) * limit;

    // Temporarily use all posts without segment filtering for debugging
    const [featuredPosts, allPosts, totalCount] = await Promise.all([
      getFeaturedBlogPosts(),
      getAllPostsWithoutSegment(limit, skip),
      getBlogPostsCount()
    ]);
    
    console.log('Main page - featuredPosts:', featuredPosts);
    console.log('Main page - allPosts:', allPosts);
    console.log('Main page - totalCount:', totalCount);
    
    return {
      featuredPosts: featuredPosts || [],
      eklektikPosts: allPosts || [], // Using all posts temporarily
      totalCount: totalCount || 0,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      featuredPosts: [],
      eklektikPosts: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 9
    };
  }
}

// Main page component
const Page = async ({ searchParams }) => {
  const { 
    featuredPosts, 
    eklektikPosts, 
    totalCount, 
    currentPage, 
    totalPages, 
    limit 
  } = await getBlogData(searchParams);

  console.log('Page component - featuredPosts length:', featuredPosts.length);
  console.log('Page component - eklektikPosts length:', eklektikPosts.length);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Hero Section */}
      <section className="w-full flex min-h-[90vh] h-full flex-col items-center justify-end bg-[url('/headerBg/unfiltered.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <div className="w-full h-full grow min-h-full flex flex-col items-center justify-center">
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            Unfiltered AF
          </h1>
        </div>
        <Marquee/>
      </section>

      {/* Featured Section */}
      <FeaturedSection featuredPosts={featuredPosts} />

      {/* Categories Section */}
      <CategoriesSection allPosts={eklektikPosts} />

      {/* All Stories Section */}
      <AllStoriesSection allPosts={eklektikPosts} featuredPosts={featuredPosts} />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          totalCount={totalCount}
          limit={limit}
        />
      )}
    </div>
  );
};

export default Page;
