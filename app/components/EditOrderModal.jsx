import { useState, useEffect } from "react";
import {
  collection,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAuth } from "../../firebase/auth"; // Import useAuth hook
import { IoMdClose } from "react-icons/io";
import Toast from "./Toast";

export default function EditOrderModal({
  orderId,
  orderDetails: initialOrderDetails,
  cash: initialCashAmount,
  credit: initialCreditAmount,
  onClose,
  onOrderUpdated,
  balance, // Make sure to receive the callback here
}) {
  const { authUser } = useAuth(); // Using the useAuth hook
  const [orderDetails, setOrderDetails] = useState(initialOrderDetails);
  const [cashAmount, setCashAmount] = useState(initialCashAmount.toString());
  const [creditAmount, setCreditAmount] = useState(
    initialCreditAmount.toString()
  );

  const handleOrderUpdate = async () => {
    if (!authUser) {
      alert("You must be logged in to update an order.");
      return;
    }

    const cash = parseFloat(cashAmount) || 0;
    const credit = parseFloat(creditAmount) || 0;

    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderDetails,
        cash,
        credit,
        updatedAt: serverTimestamp(),
      });
      <Toast type="success" message="Order Edited Successfully" />;
      onClose(); // Close modal after update

      if (onOrderUpdated) {
        onOrderUpdated(); // Call the callback to update the order list in the parent component
      }
    } catch (error) {
      console.error("Error updating order: ", error);
      <Toast type="error" message="Failed to Edit Order" />;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        id="my-modal"
      >
        <div className="relative top-20 mx-auto p-5 border w-2/3 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <div className="flex justify-between items-center pb-3">
              <p className="text-xl font-bold text-gray-900">Edit Order</p>
              <button
                className="modal-close cursor-pointer z-50"
                onClick={onClose}
              >
                <IoMdClose size="24" />
              </button>
            </div>
            <div className="flex gap-10 border-b border-gray-300 py-2 mb-6">
              <div>
                Current Balance:{" "}
                <span
                  className={`mb-2.5 font-semibold ${
                    balance < 0
                      ? "text-red-700" // red for negative balance
                      : balance > 0
                      ? "text-green-700" // green for positive balance
                      : "text-black" // black for zero balance
                  }`}
                >
                  {balance.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="personal-detail-box">
              <div>
                <label className="label-style">Order Detail</label>
                <input
                  type="text"
                  value={orderDetails}
                  onChange={(e) => setOrderDetails(e.target.value)}
                  className="input-style"
                />
              </div>
              <div>
                <label className="label-style">Cash</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="input-style !border-green-600"
                />
              </div>
              <div>
                <label className="label-style">Credit</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="input-style !border-red-700"
                />
              </div>
            </div>
            <div className="flex items-center py-3 gap-3">
              <button className="button-black" onClick={onClose}>
                Close
              </button>
              <button className="button-style" onClick={handleOrderUpdate}>
                Update Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
