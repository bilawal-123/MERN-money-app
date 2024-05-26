"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Loader from "./loader";
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
  const [newType, setNewType] = useState("Customer");
  const [newCity, setNewCity] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const memberDoc = await getDoc(doc(db, "members", id));
        if (memberDoc.exists()) {
          const memberData = memberDoc.data();
          setMember(memberData);
          setNewUsername(memberData.username);
          setNewPhone(memberData.phone);
          setNewReferenceNo(memberData.referenceNo); // Correct field
          setNewCity(memberData.city);
          setNewAddress(memberData.address);
          setNewType(memberData.type || "Customer");
          setCurrentDate(new Date(memberData.date).toLocaleDateString("en-GB"));
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
    if (!newUsername) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    try {
      setIsEditing(true);
      const currentDate = new Date().toISOString();
      await updateDoc(doc(db, "members", id), {
        username: newUsername,
        phone: newPhone,
        referenceNo: newReferenceNo,
        type: newType,
        city: newCity,
        address: newAddress,
        date: currentDate,
      });
      toast.success("Member updated successfully!");
      setErrorMessage("");
      router.push(`/viewMember/${id}`);
    } catch (error) {
      console.error("Error updating member: ", error);
      toast.error("Error updating member. Please try again.");
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
    <div className="font-gulzar" dir="rtl">
      <ToastContainer />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="">
        <form onSubmit={handleEditSubmit}>
          <div className="page-header-group">
            <h1 className="heading1">اپ ڈیٹ کسٹمر</h1>
            <div className="flex gap-3">
              <button onClick={Cancel} className="button-default">
                <IoIosArrowRoundBack />
                منسوخ
              </button>
              <button
                type="submit"
                disabled={isEditing}
                className="button-style"
              >
                <IoIosSave />{" "}
                {isEditing ? "تبدیلیاں محفوظ..." : "تبدیلیاں محفوظ کرو"}
              </button>
            </div>
          </div>
          <div className="box-style">
            <h2 className="heading2">ذاتی تفصیل</h2>
            <div className="personal-detail-box">
              <div>
                <label className="label-style">
                  کسٹمر کا نام
                  <span className="asterisk">*</span>
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
                <label className="label-style">کھا تا نمبر</label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="text"
                  value={newReferenceNo}
                  onChange={(e) => setNewReferenceNo(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">کسٹمر کی قسم</label>
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
                <label className="label-style">فون نمبر</label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">شہر</label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">پتہ</label>
                <input
                  className="block mb-1 min-h-[auto] border border-slate-600 w-full bg-white px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-teal-700"
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="label-style">تاریخ</label>
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
