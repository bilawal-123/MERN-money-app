"use client";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

const Pagination = ({
  currentPage,
  totalPages,
  paginate,
  handleInputPageChange,
  inputPage,
  pageError,
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-3  border-t border-b bg-gray-50 border-gray-200 sm:px-6 mt-4">
      <div className="flex sm:items-center sm:justify-start ml-2">
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
            {totalPages}
          </span>{" "}
          pages
        </p>
      </div>

      <div className="relative z-0 inline-flex shadow-sm gap-1 flex-col justify-end items-end">
        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FaArrowLeftLong className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={inputPage}
            onChange={handleInputPageChange}
            placeholder="#"
            className="relative w-12 justify-center text-center font-extrabold inline-flex items-center px-2 py-2 text-sm  text-gray-500 bg-white border border-gray-300  leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 "
          />

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FaArrowRightLong className="h-5 w-5" />
          </button>
        </div>

        {pageError && (
          <span className="error text-xs text-red-700 pr-1">{pageError}</span>
        )}
      </div>
    </div>
  );
};

export default Pagination;
