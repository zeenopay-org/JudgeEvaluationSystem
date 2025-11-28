import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-3 py-6">
      {/* Prev button */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition
          ${page === 1
            ? "cursor-not-allowed opacity-40 bg-gray-100"
            : "bg-gray-100 hover:bg-gray-200"}
        `}
      >
        <FaArrowLeft className="text-gray-400" />
        <span className="hidden sm:inline text-gray-500">Prev</span>
      </button>

      {/* Page numbers */}
      <div className="flex gap-2">
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`px-4 py-2 rounded-md transition font-medium
              ${
                num === page
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-500"
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition
          ${page === pages
            ? "cursor-not-allowed opacity-40 bg-gray-100"
            : "bg-gray-100 hover:bg-gray-200"}
        `}
      >
        <span className="hidden sm:inline text-gray-500">Next</span>
        <FaArrowRight className="text-gray-400" />
      </button>
    </div>
  );
};

export default Pagination;