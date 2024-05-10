"use client";
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
} from "react-table";
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
import { db } from "@/firebase/firebase";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import {
  TbX,
  TbSearch,
  TbPencil,
  TbEye,
  TbTrash,
  TbListSearch,
  TbHourglass,
} from "react-icons/tb";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { TiArrowSortedDown, TiArrowSortedUp, TiPlus } from "react-icons/ti";
import DeleteButtonWithConfirmation from "./DeleteButtonWithConfirmation";
export default function Shopkeepers() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();
  const [membersList, setMembersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [balances, setBalances] = useState({});
  const [isDataFetched, setIsDataFetched] = useState(false);
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
    const q = query(collection(db, "members"));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setNoRecordsFound(true);
        setMembersList([]);
        return;
      }

      let members = [];
      let balanceData = {}; // Object to store balances for each customer

      // Loop through each member to fetch their orders and calculate balances
      for (const doc of querySnapshot.docs) {
        const memberData = { ...doc.data(), id: doc.id };

        // Fetch orders for the current member
        const orderQuery = query(
          collection(db, "orders"),
          where("customerId", "==", memberData.id)
        );
        const orderSnapshot = await getDocs(orderQuery);

        // Calculate total cash and total credit orders for the current member
        let totalCash = 0;
        let totalCredit = 0;
        orderSnapshot.forEach((orderDoc) => {
          const orderData = orderDoc.data();
          totalCash += orderData.cash || 0;
          totalCredit += orderData.credit || 0;
        });

        // Calculate the balance for the current member
        const balance = totalCash - totalCredit;

        // Store balance for the current member in the balanceData object
        balanceData[memberData.id] = balance;

        // Add balance to member data
        memberData.balance = balance;
        members.push(memberData);
      }

      // Set the balances state with the balanceData object
      setBalances(balanceData);

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

      fetchMembers(authUser.uid); // Refresh the list
      toast.success("Member deleted successfully!");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Error deleting member. Please try again.");
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      fetchMembers(authUser.uid);
      return;
    }

    const filteredMembers = membersList.filter(
      (member) =>
        member.username.toLowerCase().includes(query) ||
        member.phone.includes(query)
    );

    setMembersList(filteredMembers);
    setNoRecordsFound(filteredMembers.length === 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchMembers(authUser.uid);
    setNoRecordsFound(false);
  };

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = membersList.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const lastPage = Math.ceil(membersList.length / recordsPerPage);

  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: (row, rowIndex) => rowIndex + 1,
        id: "rowIndex",
        disableSortBy: true, // disable sorting on the index
        width: 20,
      },
      {
        Header: "Customer",
        accessor: "username",
        width: 200,
      },
      {
        Header: "Phone",
        accessor: "phone",
        width: 150,
      },
      {
        Header: "Ref #",
        accessor: "referenceNo",
        width: 100,
      },
      {
        Header: "City",
        accessor: "city",
      },
      {
        Header: "Type",
        accessor: "type",
        width: 100,
      },
      {
        Header: "Date",
        accessor: "date",
        sortType: "basic",
        width: 100,
      },
      {
        Header: "Balance",
        accessor: (row) => balances[row.id], // Access balance using the customer's id
        width: 100,
        Cell: ({ value }) => {
          let balanceColorClass = "text-black font-normal";
          if (value < 0) {
            balanceColorClass = "text-red-500 font-bold";
          } else if (value > 0) {
            balanceColorClass = "text-green-500 font-bold";
          }
          return <span className={balanceColorClass}>{value}</span>;
        },
      },
      {
        Header: "Action",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }) => (
          <div className="flex gap-3">
            <Link className="button-view-icon" href={`/viewMember/${value}`}>
              <TbEye />
            </Link>
            <Link className="button-edit-icon" href={`/editMember/${value}`}>
              <TbPencil />
            </Link>

            <DeleteButtonWithConfirmation
              onDelete={() => deleteMember(value)}
              className="button-delete-icon" // Provide the class for styling
              text="" // Provide text to display alongside the icon
              showButton={authUser && authUser.username === "Admin"}
            />
          </div>
        ),
      },
    ],
    [balances]
  );

  const data = useMemo(() => membersList, [membersList]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    setGlobalFilter,
    state: { pageIndex },
    pageOptions, // Include this line to get the page options
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    setGlobalFilter(e.target.value); // This will filter the table globally
  };
  return (
    <>
      <ToastContainer />
      <div className="page-header-group">
        <h1 className="heading1 !mb-0 inline-flex items-center gap-1">
          Customers List
        </h1>
        <div className="flex justify-end gap-2 items-stretch mb-3">
          <div className="block relative mt-2 sm:mt-0 w-full sm:w-auto">
            <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
              <TbSearch />
            </span>
            <input
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search members..."
              className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
            />
          </div>
          <Link href={"./addMember"} className="button-style">
            <TiPlus /> Add Customer
          </Link>
        </div>
      </div>
      {!isLoading && membersList.length > 0 && isDataFetched && (
        <div className="overflow-x-auto">
          <table
            {...getTableProps()}
            className="min-w-full divide-y divide-gray-200"
          >
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      <span className="flex">
                        {column.render("Header")}
                        <span className="d-flex w-[18px]">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <TiArrowSortedDown className="text-lg text-green-700" />
                            ) : (
                              <TiArrowSortedUp className="text-lg text-red-700" />
                            )
                          ) : (
                            ""
                          )}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        style={{ width: cell.column.width }}
                        className="px-2 py-4"
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                    {pageIndex * 20 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                    {Math.min((pageIndex + 1) * 20, data.length)}
                  </span>{" "}
                  out of{" "}
                  <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                    {data.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex shadow-sm gap-1">
                  <button
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150"
                  >
                    <FaArrowLeftLong className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => nextPage()}
                    disabled={!canNextPage}
                    className="relative inline-flex items-center px-2 py-2 ml-0 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150"
                  >
                    <FaArrowRightLong className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoading ||
        (!isDataFetched && (
          <div>
            <Loader />
          </div>
        ))}
      {!isLoading && membersList.length === 0 && isDataFetched && (
        <div className="border border-gray-200 flex justify-center items-center flex-col text-center h-[40vh] mt-10">
          <p className="text-5xl rotate-45 text-white mb-6 inline-flex bg-purple-700 rounded-full p-4 shadow-md shadow-gray-500 ">
            <TbHourglass />
          </p>
          <span className="w-full block text-xl font-bold text-red-400">{`You don't have any Members`}</span>
          <Link className="button-style mt-3" href={"/addMember"}>
            <TiPlus /> Add Customer
          </Link>
        </div>
      )}{" "}
      {noRecordsFound && isDataFetched && (
        <div className="border border-gray-200 flex justify-center items-center flex-col text-center h-[40vh] mt-10">
          <p className="text-5xl text-white mb-6 inline-flex bg-purple-700 rounded-full p-4 shadow-md shadow-gray-500 ">
            <TbListSearch />
          </p>

          <span className="w-full block text-xl font-bold text-red-400">{`No record for this search.`}</span>
          <button className="button-style mt-3" onClick={clearSearch}>
            <TbSearch /> Clear Search
          </button>
        </div>
      )}
    </>
  );
}
