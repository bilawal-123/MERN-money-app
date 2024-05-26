"use client";
import Loader from "../../components/loader";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "./../../../firebase/auth";
import { useRouter, useParams } from "next/navigation";
import { db } from "./../../../firebase/firebase";
import Link from "next/link";
import { TbPencil, TbTrash } from "react-icons/tb";
import OrdersList from "../../components/OrdersList";
import { TiPlus } from "react-icons/ti";
import DeleteButtonWithConfirmation from "../../components/DeleteButtonWithConfirmation";
import {
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  collection,
  doc,
} from "firebase/firestore";
import { getStorage, listAll, deleteObject, ref } from "firebase/storage";
// import { useRouter } from "next/router";
export default function ViewMember() {
  const { id } = useParams();
  const { authUser, isLoading } = useAuth();
  const [member, setMember] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const memberDoc = await getDoc(doc(db, "members", id));
        if (memberDoc.exists()) {
          setMember(memberDoc.data());
        } else {
          console.error("Member not found");
        }
      } catch (error) {
        console.error("Error fetching member: ", error);
      }
    };

    fetchMember();
  }, [id]);
  const deleteMember = async (docId) => {
    try {
      // Step 1: Delete all orders associated with the member
      const ordersQuerySnapshot = await getDocs(
        query(collection(db, "orders"), where("customerId", "==", docId))
      );
      const deleteOrderPromises = ordersQuerySnapshot.docs.map(
        async (orderDoc) => {
          // Step 2: Delete images associated with each order
          const orderId = orderDoc.id;
          const storage = getStorage();
          const folderRef = ref(storage, `images/${orderId}`);
          const folderContents = await listAll(folderRef);
          await Promise.all(
            folderContents.items.map(async (item) => {
              await deleteObject(item);
            })
          );
          // Step 3: Delete the order document itself
          await deleteDoc(doc(db, "orders", orderId));
        }
      );
      await Promise.all(deleteOrderPromises);

      // Step 4: Finally, delete the member document itself
      await deleteDoc(doc(db, "members", docId));
      router.push("/");
    } catch (error) {
      console.error("An error occurred", error);
    }
  };
  const deleteMemberOLD = async (docId) => {
    try {
      await deleteDoc(doc(db, "members", docId));
      router.push("/");
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  if (!authUser || member === null) {
    return <Loader />;
  }

  return (
    <>
      <div className="font-gulzar" dir="rtl">
        <div className="page-header-group">
          <h1 className="heading1">کسٹمر کی تفصیلات</h1>
          <div className="flex gap-3">
            <Link href={"/addMember"} className="button-style">
              <TiPlus /> کسٹمر شامل کریں
            </Link>
            <Link href={`/editMember/${id}`} className="button-edit">
              <TbPencil /> کسٹمر میں ترمیم کریں۔
            </Link>
            <DeleteButtonWithConfirmation
              onDelete={() => deleteMember(id)}
              className="button-delete" // Provide the class for styling
              text="Delete" // Provide text to display alongside the icon
            />
          </div>
        </div>

        <div className="box-style">
          <h2 className="heading2">ذاتی تفصیل</h2>
          <div className="personal-detail-box">
            <div>
              <span className="label-style">کسٹمر کا نام</span>
              <p>{member?.username}</p>
            </div>
            <div>
              <span className="label-style">کھا تا نمبر</span>
              <p>{member?.referenceNo}</p>
            </div>
            <div>
              <span className="label-style">کسٹمر کی قسم</span>
              <p>{member?.type}</p>
            </div>
            <div>
              <span className="label-style">فون نمبر</span>
              <p>{member?.phone}</p>
            </div>
            <div>
              <span className="label-style">شہر</span>
              <p>{member?.city}</p>
            </div>
            <div>
              <span className="label-style">پتہ</span>
              <p>{member?.address}</p>
            </div>
            <div>
              <span className="label-style">تاریخ</span>
              <p>{member?.date}</p>
            </div>
          </div>
        </div>
        <OrdersList customerId={id} />
      </div>
    </>
  );
}
