import React from "react";

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
        className={`px-4 py-2 rounded-md border 
          ${page === 1 ? "cursor-not-allowed opacity-40" : "hover:bg-gray-200"}
        `}
      >
        Prev
      </button>

      {/* Page numbers */}
      <div className="flex gap-2">
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`px-4 py-2 rounded-md border transition 
              ${
                num === page
                  ? "bg-green-600 text-white border-green-600"
                  : "hover:bg-gray-200"
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
        className={`px-4 py-2 rounded-md border 
          ${
            page === pages
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-gray-200"
          }
        `}
      >
        Next
      </button>

    </div>
  );
};

export default Pagination;
