"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const Pagination = ({ currentPage, totalPages, totalCount, limit }) => {
  const searchParams = useSearchParams();
  
  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 bg-white">
      <div className="flex items-center justify-between w-full max-w-md">
        {/* Previous Button */}
        <Link
          href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            currentPage > 1
              ? 'text-[#093166] hover:text-white hover:bg-[#bf378b] border border-[#bf378b]'
              : 'text-gray-400 cursor-not-allowed border border-gray-300'
          }`}
          onClick={(e) => currentPage <= 1 && e.preventDefault()}
        >
          <BsChevronLeft className="mr-1" />
          Previous
        </Link>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Link
                  href={createPageURL(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentPage === page
                      ? 'bg-[#bf378b] text-white'
                      : 'text-[#093166] hover:text-white hover:bg-[#bf378b] border border-[#bf378b]'
                  }`}
                >
                  {page}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <Link
          href={currentPage < totalPages ? createPageURL(currentPage + 1) : '#'}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            currentPage < totalPages
              ? 'text-[#093166] hover:text-white hover:bg-[#bf378b] border border-[#bf378b]'
              : 'text-gray-400 cursor-not-allowed border border-gray-300'
          }`}
          onClick={(e) => currentPage >= totalPages && e.preventDefault()}
        >
          Next
          <BsChevronRight className="ml-1" />
        </Link>
      </div>

      {/* Page Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} posts
      </div>
    </div>
  );
};

export default Pagination;
