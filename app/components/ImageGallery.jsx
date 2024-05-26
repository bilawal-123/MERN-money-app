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
import Pagination from "./Pagination";

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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          paginate={paginate}
          handleInputPageChange={handleInputPageChange}
          inputPage={inputPage}
          pageError={pageError}
        />
      )}
    </div>
  );
};

export default ImageGallery;
