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

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [allCheckboxSelected, setAllCheckboxSelected] = useState(false);
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
      setSelectedImages((prevSelectedImages) => {
        console.log("Selected Order IDs:", [...prevSelectedImages, orderId]);
        return [...prevSelectedImages, orderId];
      });
    } else {
      setSelectedImages((prevSelectedImages) => {
        console.log(
          "Selected Order IDs:",
          prevSelectedImages.filter((id) => id !== orderId)
        );
        return prevSelectedImages.filter((id) => id !== orderId);
      });
    }
  };

  const handleSelectAll = (event) => {
    const { checked } = event.target;
    const allOrderIds = images.map((image) => image.orderId);
    if (checked) {
      setSelectedImages(allOrderIds);
      console.log("Selected Order IDs:", allOrderIds);
    } else {
      setSelectedImages([]);
      console.log("Selected Order IDs: []");
    }
    setAllCheckboxSelected(checked);
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
        {(selectedImages.length > 1 || allCheckboxSelected) && (
          <button
            onClick={handleDeleteSelectedImages}
            className="button-delete"
          >
            <TbTrash /> Delete Selected
          </button>
        )}
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="px-4 py-2 w-7">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={allCheckboxSelected}
              />
            </th>

            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Uploaded Date</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map((image, index) => (
            <tr key={index} className="hover:bg-gray-50">
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
                <div className="image-container">
                  <Image src={image.url} alt="Image" width={50} height={50} />
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
    </div>
  );
};

export default ImageGallery;
