import React, { useMemo, useEffect, useState } from "react";
import { useTable, useSortBy, useFilters, usePagination } from "react-table";
import { db } from "../../firebase/firebase";
import { TiArrowSortedUp, TiArrowSortedDown, TiPlus } from "react-icons/ti";
import { TbHourglass, TbPencil, TbSearch, TbTrash } from "react-icons/tb";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import AddOrderModal from "..//components/AddOrderModal";
import { useAuth } from "../../firebase/auth";
import Loader from "../components/loader";
// Import Firestore methods correctly
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";
import { useBalance } from "./BalanceContext";
import EditOrderModal from "./EditOrderModal";
import Toast from "./Toast";
import DeleteButtonWithConfirmation from "./DeleteButtonWithConfirmation";

import ImageUploadModal from "./ImageUploadModal";
const OrdersList = ({ customerId }) => {
  const { authUser, isLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderIdToDelete, setOrderIdToDelete] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const { balance, updateBalance } = useBalance();
  // new chagnes
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [noRecordsFound, setNoRecordsFound] = useState(false);

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/userLogin");
    }
  }, [authUser, isLoading]);

  // const fetchOrders = async () => {
  //   setIsDataFetched(false);
  //   const q = query(
  //     collection(db, "orders"),
  //     where("customerId", "==", customerId)
  //   );
  //   try {
  //     const querySnapshot = await getDocs(q);
  //     if (querySnapshot.empty) {
  //       setNoRecordsFound(true);
  //       return;
  //     }
  //     let totalCash = 0;
  //     let totalCredit = 0;
  //     querySnapshot.forEach((doc) => {
  //       totalCash += doc.data().cash || 0;
  //       totalCredit += doc.data().credit || 0;
  //     });
  //     updateBalance(totalCash - totalCredit); // Update the balance context
  //     const fetchedOrders = querySnapshot.docs
  //       .map((doc) => ({
  //         ...doc.data(),
  //         id: doc.id,
  //         createdAt: doc.data().createdAt
  //           ? new Date(doc.data().createdAt.seconds * 1000)
  //           : new Date(),
  //       }))
  //       .sort((a, b) => b.createdAt - a.createdAt);
  //     fetchedOrders.forEach((order, index) => {
  //       order.orderNumber = index + 1;
  //       order.date = order.createdAt.toLocaleDateString("en-GB");
  //     });
  //     setOrders(fetchedOrders);

  //     setIsDataFetched(true);
  //   } catch (error) {
  //     console.error("Error fetching order:", error);
  //     setIsDataFetched(true);
  //     // toast.error(
  //     //   "Failed to fetch members or calculate balances. Please check permissions."
  //     // );
  //   }
  // };

  const fetchOrders = async () => {
    setIsDataFetched(false);
    const q = query(
      collection(db, "orders"),
      where("customerId", "==", customerId)
    );
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setNoRecordsFound(true);
        return;
      }
      let entitiesBalance = 0;
      const fetchedOrders = querySnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt
            ? new Date(doc.data().createdAt.seconds * 1000)
            : new Date(),
        }))
        .sort((a, b) => a.createdAt - b.createdAt) // Sort in ascending order by date
        .map((order, index) => {
          const cash = order.cash || 0;
          const credit = order.credit || 0;
          entitiesBalance += cash - credit;
          return {
            ...order,
            orderNumber: index + 1,
            date: order.createdAt.toLocaleDateString("en-GB"),
            entitiesBalance,
          };
        });

      // If needed, sort orders back to descending order for display
      const sortedOrders = fetchedOrders.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      setOrders(sortedOrders);
      setIsDataFetched(true);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setIsDataFetched(true);
      // toast.error(
      //   "Failed to fetch members or calculate balances. Please check permissions."
      // );
    }
  };

  // Calculate total cash and credit
  const totalCash = useMemo(() => {
    return orders.reduce((acc, order) => acc + (order.cash || 0), 0);
  }, [orders]);

  const totalCredit = useMemo(() => {
    return orders.reduce((acc, order) => acc + (order.credit || 0), 0);
  }, [orders]);
  useEffect(() => {
    fetchOrders();
  }, [customerId]);

  useEffect(() => {
    const newBalance = totalCash - totalCredit;
    updateBalance(newBalance);
  }, [totalCash, totalCredit, updateBalance]);

  const onOrderAdded = () => {
    fetchOrders(); // Re-fetch orders to update the list
  };

  const handleAddOrder = () => {
    try {
      setCurrentOrder(null); // Reset current order
      setShowModal(true); // Open the modal
      console.log("Modal opened");
      setNoRecordsFound(false);
    } catch (error) {
      console.error("Error fetching customer details: ", error);
    }
  };
  const handleEdit = (order) => {
    setCurrentOrder(order);
    // setOrderId(order.id);
    setShowModal(true);
  };
  const onOrderUpdated = () => {
    fetchOrders(); // Re-fetch orders to update the list
  };
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "orders", id));

      const storage = getStorage();
      const folderRef = ref(storage, `images/${id}`); // Assuming orderId is the folder name

      // List all items (files) in the orderId folder
      const folderContents = await listAll(folderRef);

      // Delete each file in the orderId folder
      await Promise.all(
        folderContents.items.map(async (item) => {
          // Delete the file
          await deleteObject(item);
        })
      );
      console.log("Image also deleted with order");
      <Toast type="success" message="Order Deleted Successfully" />;
      fetchOrders(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error removing document: ", error);
      <Toast type="error" message="Error Deleting the Order" />;
    } finally {
      setOrderIdToDelete(null); // Reset orderIdToDelete after deletion
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      Object.values(order).some((value) =>
        String(value).toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [orders, searchInput]);

  const data = useMemo(() => filteredOrders, [filteredOrders]);
  // const data = useMemo(() => orders, [orders]);
  // const columns = useMemo(
  //   () => [
  //     {
  //       Header: "#",
  //       accessor: "date",
  //       width: 100,
  //     },
  //     {
  //       Header: "آرڈر کی تفصیل",
  //       accessor: "orderDetails", // Make sure this matches the field name in your Firestore documents
  //       width: 300,
  //     },
  //     {
  //       Header: "نقدی",
  //       accessor: "cash",
  //       width: 80,
  //     },
  //     {
  //       Header: "ادھار",
  //       accessor: "credit",
  //       width: 80,
  //     },
  //     {
  //       Header: "اکشین",
  //       id: "actions",
  //       width: 50,
  //       accessor: () => "actions",
  //       Cell: ({ row }) => (
  //         <div className="flex items-center gap-1">
  //           <button
  //             onClick={() => handleEdit(row.original)}
  //             className="button-edit-icon"
  //           >
  //             <TbPencil className="text-white" />
  //           </button>
  //           <DeleteButtonWithConfirmation
  //             onDelete={() => handleDelete(row.original.id)}
  //             className="button-delete-icon" // Provide the class for styling
  //             text="" // Provide text to display alongside the icon
  //             showButton={authUser && authUser.username === "Admin"}
  //           />

  //           <ImageUploadModal
  //             orderId={row.original.id} // Pass the orderId from the currentOrder if it exists
  //           />
  //         </div>
  //       ),
  //     },
  //   ],
  //   []
  // );

  const columns = useMemo(
    () => [
      {
        Header: "آرڈر کی تفصیل",
        accessor: "combinedDetails", // Combined column for order details and date
        Cell: ({ row }) => (
          <div>
            <p className="font-bold">{row.original.orderDetails}</p>
            <p className="text-gray-500">{row.original.date}</p>
          </div>
        ),
        width: 400,
      },
      {
        Header: "نقدی",
        accessor: "cash",
        width: 80,
      },
      {
        Header: "ادھار",
        accessor: "credit",
        width: 80,
      },
      {
        Header: " بیلنس ریکارڈ   ",
        accessor: "entitiesBalance",
        width: 120,
        Cell: ({ row }) => (
          <span
            className={
              row.original.entitiesBalance < 0
                ? "text-red-600 font-bold"
                : "text-green-600 font-bold"
            }
          >
            {row.original.entitiesBalance}
          </span>
        ),
      },
      {
        Header: "اکشین",
        id: "actions",
        width: 50,
        accessor: () => "actions",
        Cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(row.original)}
              className="button-edit-icon"
            >
              <TbPencil className="text-white" />
            </button>
            <DeleteButtonWithConfirmation
              onDelete={() => handleDelete(row.original.id)}
              className="button-delete-icon" // Provide the class for styling
              text="" // Provide text to display alongside the icon
              showButton={authUser && authUser.username === "Admin"}
            />

            <ImageUploadModal
              orderId={row.original.id} // Pass the orderId from the currentOrder if it exists
            />
          </div>
        ),
      },
    ],
    [authUser] // Add authUser to the dependencies array
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex },
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useFilters,
    useSortBy,
    usePagination
  );
  // Determine the text color based on the balance value
  const balanceColor =
    balance > 0 ? "bg-green-700" : balance < 0 ? "bg-red-700 " : "bg-gray-700";
  if (isLoading && orders.length !== 0) {
    return <Loader />;
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center flex-wrap">
          <h3 className="text-[16px] font-semibold text-gray-800 flex items-center gap-2">
            موجودہ بیلنس
            <span
              className={`text-white px-2 py-[2px] rounded text-[14px] font-bold ${balanceColor}`}
            >
              {balance}
            </span>
          </h3>
          <div className="flex justify-end mt-3 lg:mt-2  gap-2 items-stretch mb-3">
            <div className="block relative sm:mt-0 w-full sm:w-auto">
              <span className="h-full absolute inset-y-0 right-0 flex items-center pr-2">
                <TbSearch />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="آرڈرز تلاش کریں..."
                className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pr-8 pl-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleAddOrder()}
              className="button-style min-w-[105px]"
            >
              <TiPlus />
              آرڈر شامل کریں
            </button>
          </div>
        </div>
        {orders.length > 0 && isDataFetched && (
          <>
            <div className="overflow-x-auto">
              <table
                {...getTableProps()}
                className="min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50">
                  {headerGroups.map((headerGroup, index) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                      {headerGroup.headers.map((column, index) => (
                        <th
                          key={index}
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className={`px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${
                            column.width ? `w-${column.width}` : "" // Apply width class if width is defined
                          }`}
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
                  {page.map((row, index) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="hover:bg-gray-100"
                        key={index}
                      >
                        {row.cells.map((cell, index) => {
                          let textColor = "text-gray-500"; // default text color
                          if (cell.column.id === "balance") {
                            const balanceValue = parseFloat(cell.value);
                            textColor =
                              balanceValue < 0
                                ? "text-red-600"
                                : balanceValue > 0
                                ? "text-green-600"
                                : "text-black";
                          }
                          if (cell.column.id === "credit") {
                            const balanceValue = parseFloat(cell.value);
                            textColor = "text-red-600";
                          }
                          if (cell.column.id === "cash") {
                            const balanceValue = parseFloat(cell.value);
                            textColor = "text-green-600";
                          }
                          return (
                            <td
                              key={index}
                              {...cell.getCellProps()}
                              style={{ width: cell.column.width }}
                              className={`px-2 py-4 whitespace-nowrap text-sm border-b border-gray-300 ${textColor} ${
                                ["balance", "cash", "credit"].includes(
                                  cell.column.id
                                )
                                  ? "font-semibold"
                                  : ""
                              } ${
                                cell.column.id === "date"
                                  ? "w-32" // Narrower width for the Date column
                                  : cell.column.id === "orderDetails"
                                  ? "w-96" // Wider width for the Order Details column
                                  : "w-auto" // Default width for all other columns
                              }`}
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    {/* <td></td> */}
                    <td className="px-2 py-4 font-bold text-left text-lg pr-3">
                      کل:
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-green-700 font-extrabold  w-auto  tracking-wide">
                      {totalCash}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-red-700 font-extrabold w-auto tracking-wider">
                      {totalCredit}
                    </td>
                    <td
                      colSpan={2}
                      className={`px-2 py-4 font-bold ${
                        totalCash - totalCredit < 0
                          ? "text-red-700"
                          : totalCash - totalCredit > 0
                          ? "text-green-700"
                          : "text-black"
                      }`}
                    >
                      <span className="text-lg font-bold">بیلنس</span>{" "}
                      <span className=" tracking-wide">
                        {totalCash - totalCredit}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="mb-3">
                  <p className="text-sm text-gray-700">
                    دکھا رہا ہے{" "}
                    <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                      {pageIndex * 20 + 1}
                    </span>{" "}
                    سے{" "}
                    <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                      {Math.min((pageIndex + 1) * 20, data.length)}
                    </span>{" "}
                    تک{" "}
                    <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                      {data.length}
                    </span>{" "}
                    نتائج میں سے
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex shadow-sm gap-1">
                    <button
                      onClick={() => nextPage()}
                      disabled={!canNextPage}
                      className="relative inline-flex items-center px-2 py-2 ml-0 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150"
                    >
                      <FaArrowRightLong className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => previousPage()}
                      disabled={!canPreviousPage}
                      className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150"
                    >
                      <FaArrowLeftLong className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
        {noRecordsFound && !isLoading && (
          <>
            <div className="border border-gray-200 flex justify-center items-center flex-col text-center h-[40vh] mt-10">
              <p className="text-5xl rotate-45 text-white mb-6 inline-flex bg-purple-700 rounded-full p-4 shadow-md shadow-gray-500 ">
                <TbHourglass />
              </p>
              <span className="w-full block text-xl font-bold text-red-400 mb-3">{`آپ کے پاس کوئی آرڈر نہیں ہے۔`}</span>
              <button onClick={() => handleAddOrder()} className="button-style">
                <TiPlus /> آرڈر شامل کریں
              </button>
            </div>
          </>
        )}
        {showModal && (
          <AddOrderModal
            onClose={handleCloseModal}
            onOrderAdded={onOrderAdded} // Passing the callback
            balance={balance}
            id={customerId}
          />
        )}
        {showModal && currentOrder && (
          <EditOrderModal
            id={customerId}
            orderId={currentOrder.id} // Assuming the order ID is accessible from currentOrder
            orderDetails={currentOrder.orderDetails}
            cash={currentOrder.cash}
            credit={currentOrder.credit}
            onClose={handleCloseModal}
            onOrderAdded={onOrderAdded}
            onOrderUpdated={onOrderUpdated} // Passing the callback
            balance={balance}
          />
        )}
      </div>
      {/* <DeleteButton onDelete={() => handleDelete(order.id)} /> */}
    </>
  );
};

export default OrdersList;
