import React, { useState } from "react";
import { TbTrash } from "react-icons/tb";
import Toast from "./Toast";
import { LiaTimesSolid } from "react-icons/lia";

const DeleteButtonWithConfirmation = ({ onDelete, className, text }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirm = () => {
    onDelete();
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="">
      <button onClick={() => setShowConfirmation(true)} className={className}>
        <TbTrash className="" />
        {text}
      </button>
      {showConfirmation && (
        <div className="z-10 absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white px-8 pb-8 rounded-lg relative">
            <div className="flex justify-between mb-4 pb-2 border-b pt-4">
              <h3 className="font-bold text-[16px]">Delete Image</h3>
              <button
                onClick={handleCancel}
                className="close-button absolute right-3 top-3 hover:text-red-700"
              >
                <LiaTimesSolid />
              </button>
            </div>
            <p className="mb-4">
              Are you sure you want to{" "}
              <span className="text-gray-600 font-semibold">Delete Order?</span>
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirm}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteButtonWithConfirmation;
