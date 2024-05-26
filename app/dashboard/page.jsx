"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CiShop } from "react-icons/ci";
import { PiUserListBold, PiUsersDuotone } from "react-icons/pi";
import { ToastContainer, toast } from "react-toastify";
import { collection, getDocs, query, where } from "firebase/firestore";

import Loader from "../components/loader";
import { TbEye } from "react-icons/tb";
import { db } from "../../firebase/firebase";

export default function Dashboard() {
  const [totals, setTotals] = useState({
    customers: { count: 0, credit: 0, cash: 0, balance: 0 },
    shopkeepers: { count: 0, credit: 0, cash: 0, balance: 0 },
    allMembers: { count: 0, credit: 0, cash: 0, balance: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true); // Add loading state for member data

  // Define customers and shopkeepers outside useEffect
  const [customersData, setCustomersData] = useState({
    count: 0,
    credit: 0,
    cash: 0,
    balance: 0,
  });
  const [shopkeepersData, setShopkeepersData] = useState({
    count: 0,
    credit: 0,
    cash: 0,
    balance: 0,
  });
  const fetchData = async () => {
    try {
      // Simulating an asynchronous fetch operation
      const result = await new Promise((resolve) => {
        setTimeout(() => {
          const mockData = {
            /* Your data */
          };
          resolve(mockData);
        }, 2000); // Simulating a delay of 2 seconds
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMembers();
    fetchData();
  }, []);

  const fetchMembers = async () => {
    try {
      const membersQuery = collection(db, "members");
      const membersSnapshot = await getDocs(membersQuery);
      const members = membersSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Initialize variables to calculate totals
      let totalCustomers = { count: 0, credit: 0, cash: 0, balance: 0 };
      let totalShopkeepers = { count: 0, credit: 0, cash: 0, balance: 0 };

      for (const member of members) {
        const ordersQuery = query(
          collection(db, "orders"),
          where("customerId", "==", member.id)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        let totalCash = 0;
        let totalCredit = 0;

        ordersSnapshot.forEach((order) => {
          const orderData = order.data();
          totalCash += orderData.cash || 0;
          totalCredit += orderData.credit || 0;
        });

        if (member.type === "Customer") {
          totalCustomers.count += 1;
          totalCustomers.cash += totalCash;
          totalCustomers.credit += totalCredit;
        } else if (member.type === "Shopkeeper") {
          totalShopkeepers.count += 1;
          totalShopkeepers.cash += totalCash;
          totalShopkeepers.credit += totalCredit;
        }
      }

      totalCustomers.balance = totalCustomers.cash - totalCustomers.credit;
      totalShopkeepers.balance =
        totalShopkeepers.cash - totalShopkeepers.credit;

      const allMembers = {
        count: totalCustomers.count + totalShopkeepers.count,
        cash: totalCustomers.cash + totalShopkeepers.cash,
        credit: totalCustomers.credit + totalShopkeepers.credit,
        balance:
          totalCustomers.cash +
          totalShopkeepers.cash -
          (totalCustomers.credit + totalShopkeepers.credit),
      };

      // Update state with the calculated totals
      setTotals({
        customers: totalCustomers,
        shopkeepers: totalShopkeepers,
        allMembers,
      });
      setMembersLoading(false);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members data. Please check permissions.");
    }
  };

  // Extract totals from state
  const { customers, shopkeepers, allMembers } = totals;
  return (
    <div dir="rtl" className="font-gulzar">
      <ToastContainer />
      <h1 className="heading1 inline-flex items-center gap-1 font-gulzar">
        ڈیش بورڈ
      </h1>

      {(loading || membersLoading) && (
        <Loader /> // Display Loader while data is being fetched
      )}
      {!loading && !membersLoading && (
        <div className="flex items-center flex-wrap -mx-4">
          <div className="relative w-full md:w-1/2 px-4 mb-4">
            <div className="rounded-sm border border-stroke bg-yellow-50 p-4 shadow-sm shadow-yellow-500 md:p-6 xl:p-7.5">
              <PiUserListBold className="text-4xl text-yellow-500" />
              <h4 className="mb-2 mt-5 font-medium">کسٹمرز کے اعدادوشمار</h4>
              <div className="mb-2 text-title-md font-bold text-black dark:text-white flex gap-2">
                <div className=" text-red-500 border border-red-500 dashboard-stats-box">
                  <p className="text-sm font-light">ادھار</p>
                  <span className="">{customers.credit}</span>
                </div>
                <div className=" text-green-500 border border-green-500 dashboard-stats-box">
                  <p className="text-sm font-light">نقدی</p>
                  <span>{customers.cash}</span>
                </div>
                <div className=" text-sm  bg-blue-500 text-white dashboard-stats-box">
                  <p className="font-light">بیلنس</p>
                  <span>{customers.balance}</span>
                </div>
              </div>
              <p className="flex items-center gap-1 text-sm font-medium"></p>
              <Link
                href="/customers"
                className="absolute top-0 left-0 w-full h-full"
              />
              {/* here */}
              <div className="flex items-start justify-between gap-1 text-sm font-medium mt-8">
                <p>
                  <span className="font-bold">{customers.count}</span>
                  کل کسٹمرز
                </p>
                <Link
                  href="/customers"
                  className="button-style-icon !w-auto px-2"
                >
                  <TbEye /> دیکھیں
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 px-4 mb-4">
            <div className="relative rounded-sm border border-stroke bg-purple-50 shadow-purple-500 p-4 shadow-sm md:p-6 xl:p-7.5">
              <CiShop className="text-4xl text-purple-600" />
              <h4 className="mb-2 mt-5 font-medium">شاپ کیپرز کے اعدادوشمار</h4>
              <div className="mb-2 text-title-md font-bold text-black dark:text-white flex gap-2">
                <div className="text-red-500 border border-red-500 dashboard-stats-box">
                  <p className="text-sm font-light">ادھار</p>
                  <span>{shopkeepers.credit}</span>
                </div>
                <div className=" text-green-500 border border-green-500 dashboard-stats-box">
                  <p className="text-sm font-light">نقدی</p>
                  <span>{shopkeepers.cash}</span>
                </div>
                <div className=" bg-blue-500 text-white dashboard-stats-box">
                  <p className="font-light">بیلنس</p>
                  <span>{shopkeepers.balance}</span>
                </div>
              </div>
              <div className="flex items-start justify-between gap-1 text-sm font-medium mt-8">
                <p>
                  <span className="font-bold">{shopkeepers.count}</span> کل شاپ
                  کیپرز
                </p>
                <Link
                  href="/shopkeepers"
                  className="button-style-icon !w-auto px-2"
                >
                  <TbEye /> دیکھیں
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 px-4 mb-4">
            <div className="relative rounded-sm border border-stroke bg-blue-50 p-4 shadow-sm shadow-blue-500 md:p-6 xl:p-7.5">
              <PiUsersDuotone className="text-4xl text-blue-500" />
              <h4 className="mb-2 mt-3 font-medium">تمام اعدادوشمار</h4>
              <div className="mb-2 text-title-md font-bold text-black dark:text-white flex gap-2">
                <div className="text-red-500 border border-red-500 dashboard-stats-box">
                  <p className="text-sm font-light">ادھار</p>
                  <span>{allMembers.credit}</span>
                </div>
                <div className="text-green-500 border border-green-500 dashboard-stats-box">
                  <p className="text-sm font-light">نقدی</p>
                  <span>{allMembers.cash}</span>
                </div>
                <div className=" text-sm bg-blue-500 text-white dashboard-stats-box">
                  <p className="font-light">بیلنس</p>
                  <span>{allMembers.balance}</span>
                </div>
              </div>

              {/* here */}
              <div className="flex items-start justify-between gap-1 text-sm font-medium mt-8">
                <p>
                  <span className="font-bold">{allMembers.count}</span> کل
                  کسٹمرز اور شاپ کیپرز
                </p>
                <Link
                  href="/allMembers"
                  className="button-style-icon !w-auto px-2"
                >
                  <TbEye /> دیکھیں
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
