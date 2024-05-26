"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../firebase/auth";
import { useRouter } from "next/navigation";
import Loader from "./loader";
import {
  collection,
  getDocs,
  where,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import { TbPencil, TbEye, TbTrash } from "react-icons/tb";
import "react-toastify/dist/ReactToastify.css";
import { TiPlus } from "react-icons/ti";
import DeleteButtonWithConfirmation from "./DeleteButtonWithConfirmation";
import SearchInput from "./SearchInputMembersList";
import PaginationMembersList from "./PaginationMembersList";
import PriceCard from "./PriceCard";
import { FaFilter, FaRegDotCircle, FaRegUserCircle } from "react-icons/fa";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { MdOutlineDateRange, MdOutlineLocationOn } from "react-icons/md";
import { FaRegCircle } from "react-icons/fa6";
import { CiShop } from "react-icons/ci";
import { PiUserListBold } from "react-icons/pi";
export default function MemberList({ memberType }) {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();
  const [membersList, setMembersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCashBalance, setTotalCashBalance] = useState(0);
  const [totalCreditBalance, setTotalCreditBalance] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("mostRecent");
  const [filterOption, setFilterOption] = useState("all");
  const [hideZeroAmount, setHideZeroAmount] = useState(false);

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/userLogin");
    } else if (authUser) {
      fetchMembers(authUser.uid);
    }
  }, [authUser, isLoading]);

  const fetchMembers = async (uid) => {
    setIsDataFetched(false);
    if (!uid) {
      console.error("No UID found for the user.");
      return;
    }

    let memberQuery = collection(db, "members");

    if (memberType) {
      memberQuery = query(memberQuery, where("type", "==", memberType));
    }

    try {
      const querySnapshot = await getDocs(memberQuery);
      if (querySnapshot.empty) {
        setNoRecordsFound(true);
        setMembersList([]);
        return;
      }

      let members = [];
      let cashData = {};
      let creditData = {};
      let totalCashSum = 0;
      let totalCreditSum = 0;
      for (const doc of querySnapshot.docs) {
        const memberData = { ...doc.data(), id: doc.id };

        const orderQuery = query(
          collection(db, "orders"),
          where("customerId", "==", memberData.id)
        );
        const orderSnapshot = await getDocs(orderQuery);

        let totalCash = 0;
        let totalCredit = 0;
        orderSnapshot.forEach((orderDoc) => {
          const orderData = orderDoc.data();
          totalCash += orderData.cash || 0;
          totalCredit += orderData.credit || 0;
        });

        cashData[memberData.id] = totalCash;
        creditData[memberData.id] = totalCredit;

        memberData.totalCash = totalCash;
        memberData.totalCredit = totalCredit;
        members.push(memberData);

        totalCashSum += totalCash;
        totalCreditSum += totalCredit;
      }

      console.log("Members fetched:", members); // Debugging log
      console.log("Total cash sum:", totalCashSum); // Debugging log
      console.log("Total credit sum:", totalCreditSum); // Debugging log

      setTotalCashBalance(totalCashSum);
      setTotalCreditBalance(totalCreditSum);

      setMembersList(members);
      setNoRecordsFound(members.length === 0);
      setIsDataFetched(true);
    } catch (error) {
      console.error("Error fetching members or calculating balances:", error);
      setIsDataFetched(true);
      toast.error(
        "Failed to fetch members or calculate balances. Please check permissions."
      );
    }
  };

  const deleteMember = async (docId) => {
    try {
      await deleteDoc(doc(db, "members", docId));
      fetchMembers(authUser.uid);
      toast.success("Member deleted successfully!");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Error deleting member. Please try again.");
    }
  };

  // const handleFilterChange = (e) => {
  //   const selectedFilterOption = e.target.value;
  //   setFilterOption(selectedFilterOption);
  // };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setFilterOption("all");
    setHideZeroAmount(false);
    setSortBy("mostRecent");
    setIsDropdownOpen((prevIsDropdownOpen) => !prevIsDropdownOpen);
  };

  const filteredMembers = useMemo(() => {
    let filteredData = membersList;

    if (filterOption === "receivables") {
      filteredData = filteredData.filter((member) => member.totalCredit > 0);
    } else if (filterOption === "payables") {
      filteredData = filteredData.filter((member) => member.totalCash > 0);
    } else if (filterOption === "settled") {
      filteredData = filteredData.filter(
        (member) => member.totalCash === 0 && member.totalCredit === 0
      );
    }

    if (searchQuery.trim() !== "") {
      filteredData = filteredData.filter((member) =>
        Object.values(member).some((value) =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (hideZeroAmount) {
      filteredData = filteredData.filter(
        (member) => member.totalCash > 0 || member.totalCredit > 0
      );
    }

    // Additional filtering for hiding members with 0 credit and 0 cash
    if (hideZeroAmount) {
      filteredData = filteredData.filter(
        (member) => member.totalCash !== 0 || member.totalCredit !== 0
      );
    }

    return filteredData;
  }, [membersList, searchQuery, filterOption, hideZeroAmount]);

  const sortedMembers = useMemo(() => {
    let sortedData = [...filteredMembers];

    switch (sortBy) {
      case "mostRecent":
        sortedData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "oldest":
        sortedData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "highestAmount":
        sortedData.sort(
          (a, b) => b.totalCash + b.totalCredit - a.totalCash - a.totalCredit
        );
        break;
      case "lowestAmount":
        sortedData.sort(
          (a, b) => a.totalCash + a.totalCredit - b.totalCash - b.totalCredit
        );
        break;
      case "alphabeticalAZ":
        sortedData.sort((a, b) => a.username.localeCompare(b.username));
        break;
      case "alphabeticalZA":
        sortedData.sort((a, b) => b.username.localeCompare(a.username));
        break;
      default:
        break;
    }

    return sortedData;
  }, [filteredMembers, sortBy]);

  const paginatedMembers = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedMembers.slice(startIndex, endIndex);
  }, [sortedMembers, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedMembers.length / pageSize);

  if (!isDataFetched) {
    return <Loader />;
  }
  const handleSortByChange = (option) => {
    setSortBy(option);
  };

  const handleFilterChange = (option) => {
    setFilterOption(option);
  };

  const handleHideZeroAmountChange = () => {
    setHideZeroAmount((prevHideZeroAmount) => !prevHideZeroAmount);
  };
  const handleToggleDropdown = () => {
    setIsDropdownOpen((prevIsDropdownOpen) => !prevIsDropdownOpen);
  };
  return (
    <div className="">
      <ToastContainer />

      <PriceCard
        label="Total Cash Balance"
        cash={totalCashBalance}
        credit={totalCreditBalance}
      />

      <div className="flex justify-between flex-row-reverse items-center mb-4">
        <h1 className="text-sm lg:text-xl font-semibold font-gulzar">
          {memberType === "shopkeeper" ? "شاپ کیپر" : "کسٹمرز"}
        </h1>
        <Link href="/addMember" passHref>
          <button className="button-style">
            <span className="font-gulzar">
              نیا {memberType === "shopkeeper" ? "شاپ کیپر" : "کسٹمرز"}
            </span>
            <TiPlus />
          </button>
        </Link>
      </div>

      <div className="flex mb-4 items-center gap-1" dir="rtl">
        <SearchInput
          searchInput={searchQuery}
          handleInputChange={handleSearch}
          className="ml-1"
        />
        {/* <select
          value={filterOption}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="receivables">Receivables</option>
          <option value="payables">Payables</option>
          <option value="settled">Settled</option>
        </select> */}

        {/* <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="mostRecent">Most Recent</option>
          <option value="oldest">Oldest</option>
          <option value="highestAmount">Highest Amount</option>
          <option value="lowestAmount">Lowest Amount</option>
          <option value="alphabeticalAZ">By Name (A-Z)</option>
          <option value="alphabeticalZA">By Name (Z-A)</option>
        </select> */}
        {/* <div className="flex items-center">
          <input
            type="checkbox"
            id="hideZeroAmount"
            checked={hideZeroAmount}
            onChange={() => setHideZeroAmount(!hideZeroAmount)}
            className="mr-2"
          />
          <label htmlFor="hideZeroAmount">Hide 0 amount</label>
        </div> */}

        {/* custom dropdown start */}
        <div className="relative">
          <button
            className={` !w-[38px] !h-[38px]  *:
            ${
              filterOption !== "all" ||
              hideZeroAmount ||
              sortBy !== "mostRecent"
                ? "button-style-icon"
                : "button-outline-icon"
            }
            `}
            onClick={handleToggleDropdown}
          >
            <FaFilter />
          </button>
          {isDropdownOpen && (
            <div className="absolute left-0 z-10 overflow-hidden rounded-b-xl w-52 p-2 pb-10 bg-white border border-gray-200 shadow-lg">
              {/* Filter options */}
              <div className="mb-5">
                <h1 className="text-sm font-semibold pb-1 mb-3 border-b border-gray-200 font-gulzar">
                  فلٹر کرو
                </h1>
                <ul className="flex gap-2 flex-wrap text-sm">
                  <li
                    className={`border rounded-2xl px-2 min-w-12 text-center cursor-pointer font-gulzar ${
                      filterOption === "all"
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "border-gray-500"
                    }`}
                    onClick={() => handleFilterChange("all")}
                  >
                    سب
                  </li>
                  <li
                    className={`border rounded-2xl px-2 min-w-12 text-center cursor-pointer font-gulzar ${
                      filterOption === "receivables"
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "border-gray-500"
                    }`}
                    onClick={() => handleFilterChange("receivables")}
                  >
                    <span className="font-bold text-green-700">+</span> قابل
                    وصول
                  </li>
                  <li
                    className={`border rounded-2xl px-2 min-w-12 text-center cursor-pointer font-gulzar ${
                      filterOption === "payables"
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "border-gray-500"
                    }`}
                    onClick={() => handleFilterChange("payables")}
                  >
                    <span className="font-bold text-red-700">-</span> قابل
                    ادائیگی
                  </li>
                  <li
                    className={`border rounded-2xl px-2 min-w-12 text-center cursor-pointer ${
                      filterOption === "settled"
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "border-gray-500"
                    }`}
                    onClick={() => handleFilterChange("settled")}
                  >
                    برابر 0
                  </li>
                </ul>
              </div>
              {/* Sort options */}
              <div className="mb-2">
                <h1 className="text-sm font-semibold pb-1 mb-3 border-b border-gray-200 font-gulzar">
                  ترتیب دیں
                </h1>
                <ul className="flex gap-2 flex-col text-sm">
                  <li
                    className={`flex justify-between cursor-pointer ${
                      sortBy === "mostRecent" ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleSortByChange("mostRecent")}
                  >
                    <span className="font-gulzar">سب سے نیا</span>
                    {sortBy === "mostRecent" ? (
                      <FaRegDotCircle />
                    ) : (
                      <FaRegCircle />
                    )}
                  </li>
                  <li
                    className={`flex justify-between cursor-pointer ${
                      sortBy === "oldest" ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleSortByChange("oldest")}
                  >
                    <span className="font-gulzar">سب سے پرانا</span>{" "}
                    {sortBy === "oldest" ? <FaRegDotCircle /> : <FaRegCircle />}
                  </li>
                  <li
                    className={`flex justify-between cursor-pointer ${
                      sortBy === "highestAmount" ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleSortByChange("highestAmount")}
                  >
                    <span className="font-gulzar">سب سے زیادہ رقم</span>{" "}
                    {sortBy === "highestAmount" ? (
                      <FaRegDotCircle />
                    ) : (
                      <FaRegCircle />
                    )}
                  </li>
                  <li
                    className={`flex justify-between cursor-pointer ${
                      sortBy === "lowestAmount" ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleSortByChange("lowestAmount")}
                  >
                    <span className="font-gulzar">سب سے کم رقم</span>{" "}
                    {sortBy === "lowestAmount" ? (
                      <FaRegDotCircle />
                    ) : (
                      <FaRegCircle />
                    )}
                  </li>
                  <li
                    className={`flex justify-between cursor-pointer ${
                      sortBy === "alphabeticalAZ" ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleSortByChange("alphabeticalAZ")}
                  >
                    <span>(A-Z) نام سے ترتیب </span>{" "}
                    {sortBy === "alphabeticalAZ" ? (
                      <FaRegDotCircle />
                    ) : (
                      <FaRegCircle />
                    )}
                  </li>
                  <li
                    className={`flex justify-between cursor-pointer ${
                      sortBy === "alphabeticalZA" ? "text-teal-600" : ""
                    }`}
                    onClick={() => handleSortByChange("alphabeticalZA")}
                  >
                    <span>(Z-A) نام سے ترتیب </span>{" "}
                    {sortBy === "alphabeticalZA" ? (
                      <FaRegDotCircle />
                    ) : (
                      <FaRegCircle />
                    )}
                  </li>
                </ul>
              </div>
              {/* Hide zero amount checkbox */}
              <div className="pt-2 text-sm">
                <input
                  type="checkbox"
                  id="hideZeroAmount"
                  checked={hideZeroAmount}
                  onChange={handleHideZeroAmountChange}
                  className="ml-1 relative top-0.5"
                />
                <label
                  htmlFor="hideZeroAmount"
                  className={`${
                    hideZeroAmount === true ? "text-teal-600" : ""
                  }`}
                >
                  صفر کی رقم چھپائیں
                </label>
              </div>
              {/* footer */}
              <div className="font-gulzar absolute w-full flex gap-0.5 bottom-0 left-0 text-center font-semibold text-xs h-8">
                <button
                  onClick={handleToggleDropdown}
                  className={`bg-teal-600 text-white cursor-pointer hover:bg-teal-700 ${
                    filterOption !== "all" ||
                    hideZeroAmount ||
                    sortBy !== "mostRecent"
                      ? "w-1/2"
                      : "w-full"
                  }`}
                >
                  بند کریں
                </button>
                {(filterOption !== "all" ||
                  hideZeroAmount ||
                  sortBy !== "mostRecent") && (
                  <button
                    onClick={handleClearFilters}
                    className="w-1/2 bg-gray-600 text-white cursor-pointer hover:bg-gray-700"
                  >
                    صاف فلٹر
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {/* custom dropdown end */}
      </div>

      <table className="min-w-full bg-white border border-gray-300" dir="rtl">
        <thead className="text-xs lg:text-sm  font-medium font-gulzar">
          <tr>
            <th className="py-2 px-4 border-b text-right">تفصیلات</th>
            {/* <th className="py-2 px-4 border-b">Reference</th>
            <th className="py-2 px-4 border-b">City</th>
            <th className="py-2 px-4 border-b">Date</th> */}
            <th className="py-2 px-4 border-b">نقدی</th>
            <th className="py-2 px-4 border-b">ادھار</th>
            <th className="py-2 px-4 border-b">اکشین</th>
          </tr>
        </thead>
        <tbody className="text-xs lg:text-sm align-top">
          {paginatedMembers.map((member) => (
            <tr key={member.id}>
              <td className="py-2 px-4 border-b space-y-1">
                {member.username && (
                  <p className="font-semibold text-xs lg:text-sm flex items-center gap-1 text-blue-500">
                    <FaRegUserCircle className=" text-xs" />{" "}
                    <span className="truncate max-w-28">{member.username}</span>
                  </p>
                )}
                {member.date && (
                  <p className="text-xs lg:text-sm flex items-center gap-1">
                    <MdOutlineDateRange />{" "}
                    {new Date(member.date).toLocaleDateString()}
                  </p>
                )}
                {member.referenceNo && (
                  <p className="text-xs lg:text-sm flex items-center gap-1">
                    <AiOutlineExclamationCircle />{" "}
                    <span className="truncate max-w-28">
                      {member.referenceNo}
                    </span>
                  </p>
                )}
                {member.city && (
                  <p className="text-xs lg:text-sm flex items-center gap-1">
                    <MdOutlineLocationOn />{" "}
                    <span className="truncate max-w-28">{member.city}</span>
                  </p>
                )}
                <p className="text-xs lg:text-sm flex items-center gap-1">
                  {member.type === "Customer" ? (
                    <span className="flex items-center gap-1">
                      <PiUserListBold /> کسٹمر
                    </span>
                  ) : member.type === "Shopkeeper" ? (
                    <span className="flex items-center gap-1">
                      <CiShop /> شاپ کیپر
                    </span>
                  ) : (
                    ""
                  )}
                </p>
              </td>
              {/* <td className="py-2 px-4 border-b">{member.referenceNo}</td> */}
              {/* <td className="py-2 px-4 border-b">{member.city}</td> */}
              {/* <td className="py-2 px-4 border-b">
                {new Date(member.date).toLocaleDateString()}
              </td> */}
              <td className="py-2 px-2 border-b text-center text-teal-600 font-bold">
                {member.totalCash}
              </td>
              <td className="py-2 px-2 border-b text-center text-red-600 font-bold">
                {member.totalCredit}
              </td>
              <td className="py-2 px-2 border-b text-center">
                <div className="flex space-x-2 justify-center">
                  <Link href={`/editMember/${member.id}`} passHref>
                    <TbPencil className="text-gray-400 hover:text-blue-600" />
                  </Link>
                  <Link href={`/viewMember/${member.id}`} passHref>
                    <TbEye className="text-gray-400 hover:text-blue-600" />
                  </Link>
                  <DeleteButtonWithConfirmation
                    onDelete={() => deleteMember(member.id)}
                  >
                    <TbTrash className="text-gray-400 hover:text-red-600" />
                  </DeleteButtonWithConfirmation>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationMembersList
        canPreviousPage={currentPage > 0}
        canNextPage={currentPage < totalPages - 1}
        pageCount={totalPages}
        gotoPage={(page) => setCurrentPage(page)}
        nextPage={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
        }
        previousPage={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
        pageIndex={currentPage}
      />
      {noRecordsFound && (
        <div className="text-center mt-4">
          <p>No records found.</p>
        </div>
      )}
    </div>
  );
}
