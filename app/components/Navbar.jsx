"use client";

import Link from "next/link";
import { useAuth } from "../../firebase/auth";
import { useRouter } from "next/navigation";
import Loader from "./loader";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Image from "next/image";
import { Nova_Square, Roboto } from "next/font/google";
// React icons
import {
  TbNeedleThread,
  TbRulerMeasure,
  TbLogout,
  TbLogin,
  TbUserCircle,
} from "react-icons/tb";
import { RiHome6Line, RiUserAddLine } from "react-icons/ri";

// If loading a variable font, you don't need to specify the font weight
const nova = Nova_Square({
  subsets: ["latin"],
  weight: ["400"],
});
const lato = Roboto({
  subsets: ["latin"],
  weight: ["400"],
});
export default function Navbar() {
  const { authUser, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [shopOwner, setShopOwner] = useState("");
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/userLogin");
    }
    if (authUser) {
      console.log("auth user::", authUser);
      const fetchUserProfileData = async () => {
        try {
          const profilesCollection = collection(db, "profile");
          const querySnapshot = await getDocs(
            query(profilesCollection, where("owner", "==", authUser.uid))
          );

          if (!querySnapshot.empty) {
            const userProfileData = querySnapshot.docs[0].data();
            setShopName(userProfileData.shopName || "");
            setShopOwner(userProfileData.shopOwner || "");
            // Fix the typo here, change userProfileData.shopOwner to userProfileData.shopName
          }
        } catch (error) {
          console.error("Error fetching user profile data", error);
        }
      };

      fetchUserProfileData();
    }
  }, [authUser, isLoading]);

  return (
    <nav
      className="relative flex w-full flex-wrap items-center justify-center bg-gray-700 py-2 text-neutral-500 shadow-lg "
      data-te-navbar-ref
    >
      <div className="w-[1200px] max-w-full px-4 flex justify-center items-center flex-col sm:justify-between  sm:flex-row">
        <div className="mb-2.5 md:mb-0">
          <Link href={"/"} className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Example Image"
              width={200}
              height={38}
              priority
              style={{ height: "auto" }}
            />
            {/* <span className="bg-white w-6 h-6 inline-flex items-center justify-center rounded-sm">
              <Image
                src="/logo.png"
                alt="Example Image"
                width={20}
                height={20}
                priority
                style={{ height: "auto" }}
              />
            </span>
            {/* {authUser?.username} */}
          </Link>
        </div>
        <div
          className={`${lato.className} flex md:space-x-10 space-x-2 text-sm w-full sm:w-auto justify-between sm:justify-end gap-7 sm:gap-0`}
        >
          <Link href={"/"} className="nav-link-style">
            <RiHome6Line className="nav-link-icon-style" />{" "}
            <span className="hidden sm:block">Home</span>
          </Link>
          <Link href={"/addMember"} className="nav-link-style">
            <RiUserAddLine className="nav-link-icon-style !text-[19px]" />{" "}
            <span className="hidden sm:block">Add Customer</span>
          </Link>
          <Link href={"/allImages"} className="nav-link-style">
            <span className="hidden sm:block">Images</span>
          </Link>

          {!authUser ? (
            <>
              <Link href={"/userRegister"} className="nav-link-style">
                <TbLogin className="nav-link-icon-style" />
                <span className="hidden sm:block">Sign Up</span>
              </Link>
              <Link href={"/userLogin"} className="nav-link-style">
                <TbLogin className="nav-link-icon-style" />
                <span className="hidden sm:block">Sign In</span>
              </Link>
            </>
          ) : (
            <>
              <button onClick={signOut} className="nav-link-style">
                <TbLogout className="nav-link-icon-style" />
                <span className="hidden sm:block">Sign out</span>
              </button>
              <Link href="/profile" className="nav-link-style">
                <TbUserCircle className="nav-link-icon-style" />
                <span className="hidden sm:block">
                  {authUser.username || authUser.email} {authUser.role}
                </span>{" "}
                {/* Display user's email */}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
