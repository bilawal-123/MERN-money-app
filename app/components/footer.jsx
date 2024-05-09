import { RiCopyrightFill } from "react-icons/ri";
import { FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="text-center bg-gray-700 py-3 text-neutral-500">
      <div className="w-[1000px] max-w-full mx-auto flex justify-center sm:justify-between items-center  flex-col sm:flex-row px-4">
        <p className="text-xs text-[#a3a3a3] font-light flex items-center  gap-2 mb-2 sm:mb-0">
          All rights reserved <RiCopyrightFill />
          <span className="font-medium"> Niaz Traders </span>
        </p>
        <p className="text-xs text-[#a3a3a3] font-light flex items-center gap-2">
          Developed with <FaHeart /> by{" "}
          <span className="font-medium"> Muhammad Bilawal</span>
        </p>
      </div>
    </footer>
  );
}
