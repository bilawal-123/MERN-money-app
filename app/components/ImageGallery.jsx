"use client";
import { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  deleteObject,
  listAll,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import Image from "next/image";
import { TbEye, TbTrash } from "react-icons/tb";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import Loader from "./loader";

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(10);
  const [selectedImages, setSelectedImages] = useState([]);
  const [allCheckboxSelected, setAllCheckboxSelected] = useState(false);
  const [inputPage, setInputPage] = useState("");
  const [pageError, setPageError] = useState("");
  const [currentPageImages, setCurrentPageImages] = useState([]);
  const fetchImages = async () => {
    const storage = getStorage();
    const listRef = ref(storage, "images/");
    try {
      const result = await listAll(listRef);
      const imageList = [];
      await Promise.all(
        result.prefixes.map(async (orderRef) => {
          const orderImages = await listAll(orderRef);
          await Promise.all(
            orderImages.items.map(async (imageRef) => {
              const url = await getDownloadURL(imageRef);
              // console.log("Image URL:", url); // Log the image URL
              const metadata = await getMetadata(imageRef); // Retrieve metadata for the image
              // console.log("Image metadata:", metadata); // Log the metadata
              const uploadedAt = metadata?.customMetadata?.uploadedAt; // Retrieve upload date from metadata
              const image = {
                url,
                name: imageRef.name,
                orderId: orderRef.name,
                uploadedAt,
              };
              imageList.push(image);
            })
          );
        })
      );
      const sortedImages = imageList.sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      ); // Sort images by date
      setImages(sortedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };
  useEffect(() => {
    fetchImages();
  }, []);
  useEffect(() => {
    const start = (currentPage - 1) * imagesPerPage;
    const end = start + imagesPerPage;
    setCurrentPageImages(
      images.slice(start, end).map((image) => image.orderId)
    );
  }, [currentPage, images]);
  // Get current images to display based on pagination
  // Get current images to display based on pagination
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);
  // Total number of pages
  const totalPages = Math.ceil(images.length / imagesPerPage);
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle input page change
  const handleInputPageChange = (e) => {
    const value = e.target.value;
    setInputPage(value);
    setPageError(""); // Clear error message
    if (value === "") {
      setCurrentPage(1); // Reset current page to 1 when input is cleared
    } else {
      const pageNumber = parseInt(value);
      if (
        pageNumber >= 1 &&
        pageNumber <= Math.ceil(images.length / imagesPerPage)
      ) {
        setCurrentPage(pageNumber);
      } else {
        setPageError("Please enter a valid page number"); // Set error message for invalid input
      }
    }
  };
  const handleDeleteImage = async (orderId, imageName) => {
    const storage = getStorage();
    const imagePath = `images/${orderId}/${imageName}`;
    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef);
      setImages(
        images.filter(
          (image) => !(image.orderId === orderId && image.name === imageName)
        )
      );
      console.log("Image deleted successfully:", imagePath);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // const handleCheckboxChange = (event, orderId) => {
  //   const { checked } = event.target;
  //   if (checked) {
  //     setSelectedImages((prevSelectedImages) => {
  //       console.log("Selected Order IDs:", [...prevSelectedImages, orderId]);
  //       return [...prevSelectedImages, orderId];
  //     });
  //   } else {
  //     setSelectedImages((prevSelectedImages) => {
  //       console.log(
  //         "Selected Order IDs:",
  //         prevSelectedImages.filter((id) => id !== orderId)
  //       );
  //       return prevSelectedImages.filter((id) => id !== orderId);
  //     });
  //   }
  // };
  const handleCheckboxChange = (event, orderId) => {
    const { checked } = event.target;
    if (checked) {
      setSelectedImages((prevSelectedImages) => [
        ...prevSelectedImages,
        orderId,
      ]);
    } else {
      setSelectedImages((prevSelectedImages) =>
        prevSelectedImages.filter((id) => id !== orderId)
      );
    }
  };

  // const handleSelectAll = (event) => {
  //   const { checked } = event.target;
  //   const allOrderIds = images.map((image) => image.orderId);
  //   if (checked) {
  //     setSelectedImages(allOrderIds);
  //     console.log("Selected Order IDs:", allOrderIds);
  //   } else {
  //     setSelectedImages([]);
  //     console.log("Selected Order IDs: []");
  //   }
  //   setAllCheckboxSelected(checked);
  // };
  const handleSelectAll = () => {
    if (allCheckboxSelected) {
      setSelectedImages([]);
      setAllCheckboxSelected(false);
    } else {
      setSelectedImages(currentPageImages);
      setAllCheckboxSelected(true);
    }
  };

  const viewFullImage = (imageUrl) => {
    window.open(imageUrl, "_blank"); // Open the full-size image in a new tab/window
  };
  const deleteMultipleImages = async (orderIds) => {
    try {
      const storage = getStorage();
      const allDeletedOrderIds = [];
      await Promise.all(
        orderIds.map(async (orderId) => {
          const folderRef = ref(storage, `images/${orderId}`);
          const folderContents = await listAll(folderRef);
          await Promise.all(
            folderContents.items.map(async (item) => {
              await deleteObject(item);
            })
          );
          allDeletedOrderIds.push(orderId);
        })
      );
      await fetchImages(); // Refresh the list of images
      console.log("Deleted Order IDs:", allDeletedOrderIds);
    } catch (error) {
      console.error("Error deleting images:", error);
    }
  };
  const handleDeleteSelectedImages = () => {
    deleteMultipleImages(selectedImages);
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold mb-4">Image Gallery</h2>

        <button onClick={handleDeleteSelectedImages} className="button-delete">
          <TbTrash /> Delete Selected
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-100">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider w-100">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={allCheckboxSelected}
              />
            </th>

            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-100">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-100">
              Order ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-100">
              Uploaded Date
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-100">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentImages.map((image, index) => (
            <tr key={index} className="hover:bg-gray-100 even:bg-gray-50">
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={(event) =>
                    handleCheckboxChange(event, image.orderId)
                  }
                  checked={selectedImages.includes(image.orderId)}
                />
              </td>

              <td className="px-4 py-2">
                <div className="relative image-container w-[50px] h-[50px] bg-gray-200 inline-flex items-center justify-center border-gray-500 p-1 rounded-sm">
                  <Image
                    src={image.url}
                    alt="Image"
                    fill
                    sizes=""
                    className="object-contain"
                  />
                </div>
              </td>
              <td className="px-4 py-2">{image.orderId}</td>
              <td className="px-4 py-2">
                {image.uploadedAt
                  ? new Date(image.uploadedAt).toLocaleString()
                  : "Unknown"}
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleDeleteImage(image.orderId, image.name)}
                    className="button-delete-icon"
                  >
                    <TbTrash />
                  </button>
                  <button
                    onClick={() => viewFullImage(image.url)}
                    className="button-view-icon"
                  >
                    <TbEye />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}

      {totalPages == 0 && <Loader />}
      {totalPages > 0 && (
        <div className="flex justify-between items-center px-4 py-3  border-t border-b bg-gray-50 border-gray-200 sm:px-6 mt-4">
          <div className="flex sm:items-center sm:justify-start ml-2">
            {/* Count */}
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                {indexOfFirstImage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                {Math.min(indexOfLastImage, images.length)}
              </span>{" "}
              out of{" "}
              <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                {images.length}
              </span>{" "}
              results
            </p>
          </div>
          {totalPages > 0 && (
            <span className="text-sm pr-1">
              Total Pages:{" "}
              <span className="font-bold inline-flex items-center justify-center rounded min-w-7 bg-gray-400 text-white">
                {totalPages}
              </span>
            </span>
          )}
          <div className="relative z-0 inline-flex shadow-sm gap-1 flex-col justify-end items-end">
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaArrowLeftLong className="h-5 w-5" />
              </button>

              {/* Input field for specific page */}
              <input
                type="text"
                value={inputPage}
                onChange={handleInputPageChange}
                placeholder="#"
                className="relative w-12 justify-center text-center font-extrabold inline-flex items-center px-2 py-2 text-sm  text-gray-500 bg-white border border-gray-300  leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 "
              />

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastImage >= images.length}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md leading-5 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaArrowRightLong className="h-5 w-5" />
              </button>
            </div>

            {pageError && (
              <span className="error text-xs text-red-700 pr-1">
                {pageError}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
