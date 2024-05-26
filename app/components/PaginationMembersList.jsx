import React from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

const PaginationMembersList = ({
  currentPage,
  totalPages,
  previousPage,
  nextPage,
  canPreviousPage,
  canNextPage,
  pageIndex,
  pageSize,
  dataLength,
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-3  border-t border-b bg-gray-50 border-gray-200 sm:px-6 mt-4">
      <div className="flex sm:items-center sm:justify-start ml-2">
        {/* <p className="text-sm text-gray-700">
          Showing {pageIndex * pageSize + 1}-{pageIndex * pageSize + dataLength}{" "}
          of {totalPages * pageSize} members
        </p> */}
      </div>

      <div className="relative z-0 inline-flex shadow-sm gap-1 flex-col justify-end items-end">
        <div className="flex items-center gap-1">
          <button
            onClick={previousPage}
            disabled={!canPreviousPage}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FaArrowLeftLong className="h-5 w-5" />
          </button>

          <button
            onClick={nextPage}
            disabled={!canNextPage}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FaArrowRightLong className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationMembersList;
