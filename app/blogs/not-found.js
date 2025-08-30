import Link from 'next/link';
import { BsArrowLeft } from 'react-icons/bs';

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#093166] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Blog Post Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/blogs"
          className="inline-flex items-center px-6 py-3 bg-[#093166] text-white rounded-full hover:bg-[#bf378b] transition-colors duration-300"
        >
          <BsArrowLeft className="mr-2" />
          Back to All Blogs
        </Link>
      </div>
    </div>
  );
}
