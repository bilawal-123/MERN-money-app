"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../firebase/auth";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowRoundBack } from "react-icons/io";
import { TiPlus } from "react-icons/ti";

export default function AddMember() {
  const { authUser, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // User data values
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [referenceNo, setReferenceNo] = useState(""); // Replaces 'cast'
  const [type, setType] = useState("Customer"); // New field for customer type
  const [city, setCity] = useState(""); // New field for customer type
  const [address, setAddress] = useState(""); // New field for customer type
  const currentDate = new Date().toLocaleDateString("en-GB");

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/userLogin");
    }
  }, [authUser, isLoading]);

  const addMembers = async (e) => {
    e.preventDefault();
    if (!username || !phone || !referenceNo || !address || !city) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "members"), {
        owner: authUser.uid,
        username: username,
        phone: phone,
        date: currentDate,
        referenceNo: referenceNo,
        city: city,
        address: address,
      });
      toast.success("Member added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setUsername("");
      setPhone("");
      setReferenceNo("");
      setCity("");
      setAddress("");
      setType("Customer");
      setErrorMessage("");
    } catch (error) {
      console.error("Error adding member: ", error);
      toast.error("Error adding Member. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const Cancel = () => {
    router.back();
  };

  return !authUser ? (
    <Loader />
  ) : (
    <div className="">
      <div className="page-header-group">
        <h1 className="heading1">Add Customer</h1>

        <div className="flex gap-3">
          <button onClick={Cancel} className="button-default">
            <IoIosArrowRoundBack />
            Cancel
          </button>
          <button onClick={addMembers} className="button-style">
            <TiPlus /> Add Customer
          </button>
        </div>
      </div>
      <ToastContainer />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <form>
        <div className="box-style">
          <h2 className="heading2">Personal Detail</h2>

          <div className="personal-detail-box">
            <div>
              <label className="label-style">
                Customer Name <span className="asterisk">*</span>
              </label>
              <input
                className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                placeholder="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="label-style">
                Reference No <span className="asterisk">*</span>
              </label>
              <input
                className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                placeholder="Reference No"
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>
            <div>
              <label className="label-style">
                Customer Phone <span className="asterisk">*</span>
              </label>
              <input
                className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                placeholder="Phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="label-style">Customer Type</label>
              <select
                className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Customer">Customer</option>
                <option value="Shopkeeper">Shopkeeper</option>
              </select>
            </div>
            <div>
              <label className="label-style">
                City <span className="asterisk">*</span>
              </label>
              <input
                className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                placeholder="City"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="label-style">
                Address <span className="asterisk">*</span>
              </label>
              <input
                className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                placeholder="Address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="label-style">Date</label>
              <input
                className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-gray-100 px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                type="text"
                value={currentDate}
                readOnly
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
