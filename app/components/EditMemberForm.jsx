"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import Loader from "./loader";
import { TbDeviceFloppy } from "react-icons/tb";
import { IoIosArrowRoundBack, IoIosSave } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditMemberForm() {
  const router = useRouter();
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // User data values
  const [newUsername, setNewUsername] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newReferenceNo, setNewReferenceNo] = useState("");
  const [newType, setNewType] = useState("Customer"); // New field for customer type
  const [newCity, setNewCity] = useState(""); // New field for customer type
  const [newAddress, setNewAddress] = useState(""); // New field for customer type
  const currentDate = new Date().toLocaleDateString("en-GB");

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const memberDoc = await getDoc(doc(db, "members", id));
        const memberData = memberDoc.data();

        if (memberDoc.exists()) {
          setMember(memberData);
          setNewUsername(memberData.username);
          setNewPhone(memberData.phone);
          setNewReferenceNo(memberData.cast); // Change this if your data model uses a different field
          setNewCity(memberData.city); // Change this if your data model uses a different field
          setNewAddress(memberData.address); // Change this if your data model uses a different field
          setNewType(memberData.type || "Customer"); // Defaulting to Customer if undefined
        } else {
          console.error("Member not found");
        }
      } catch (error) {
        console.error("Error fetching member: ", error);
      }
    };

    fetchMember();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPhone) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    try {
      setIsEditing(true);
      await updateDoc(doc(db, "members", id), {
        username: newUsername,
        phone: newPhone,
        referenceNo: newReferenceNo, // updated to referenceNo
        type: newType, // adding customerType
        city: newCity, // adding customerType
        address: newAddress, // adding customerType
        date: currentDate,
      });
      toast.success("Member Updated successfully!");
      setErrorMessage("");
      router.push(`/viewMember/${id}`);
    } catch (error) {
      console.error("Error updating member: ", error);
      toast.error("Error Updating member. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  if (member === null) {
    return <Loader />;
  }

  const Cancel = () => {
    router.back();
  };

  return (
    <div>
      <ToastContainer />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="">
        <form onSubmit={handleEditSubmit}>
          <div className="page-header-group">
            <h1 className="heading1">Update Member</h1>
            <div className="flex gap-3">
              <button onClick={Cancel} className="button-default">
                <IoIosArrowRoundBack />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEditing}
                className="button-style"
              >
                <IoIosSave /> {isEditing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
          <div className="box-style">
            <h2 className="heading2">Update Personal Detail</h2>
            <div className="personal-detail-box">
              <div>
                <label className="label-style">
                  Customer Name <span className="asterisk">*</span>
                </label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">Reference No</label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="text"
                  value={newReferenceNo}
                  onChange={(e) => setNewReferenceNo(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">Customer Type</label>
                <select
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <option value="Customer">Customer</option>
                  <option value="Shopkeeper">Shopkeeper</option>
                </select>
              </div>
              <div>
                <label className="label-style">
                  Phone <span className="asterisk">*</span>
                </label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">
                  City <span className="asterisk">*</span>
                </label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="tel"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">
                  Address <span className="asterisk">*</span>
                </label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="tel"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
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
    </div>
  );
}
