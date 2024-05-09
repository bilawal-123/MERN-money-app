import React, { useState, useEffect } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import Toast from "./Toast";
import Image from "next/image";
import { IoCloudUploadOutline } from "react-icons/io5";
import { LiaTimesSolid } from "react-icons/lia";
import { TbTrash } from "react-icons/tb";
import { FaRegImage } from "react-icons/fa6";
import { RiBracketsLine } from "react-icons/ri";

const ImageUploadModal = ({ onClose, orderId }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [downloadURL, setDownloadURL] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [imageExist, setImageExist] = useState(false);
  const [thumbnailURL, setThumbnailURL] = useState(null);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const checkImageExists = async () => {
    const storage = getStorage();
    const directoryPath = `images/${orderId}`;
    const listRef = ref(storage, directoryPath);

    try {
      const result = await listAll(listRef);
      if (result.items.length > 0) {
        setImageExist(true);
        const downloadURL = await getDownloadURL(result.items[0]);

        setThumbnailURL(downloadURL);
        setImageUploaded(true);
      } else {
        setImageUploaded(false);
      }
      setInitialCheckComplete(true);
    } catch (error) {
      console.error("Error checking image existence:", error);
    }
  };

  useEffect(() => {
    if (orderId) {
      checkImageExists();
    }
  }, [orderId]);

  useEffect(() => {
    if (openModal && thumbnailURL === null) {
      checkImageExists();
    }
  }, [openModal]);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (orderId && file) {
      const metadata = {
        customMetadata: {
          uploadedAt: new Date().toISOString(), // Store the current date/time as ISO string
        },
      };
      const storage = getStorage();
      // Construct the file path with the order ID
      const storageRef = ref(storage, `images/${orderId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      // Include current date as metadata

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload Progress:", progress);
          setShowProgress(true);
          setUploadProgress(progress);
          <Toast message="Image uploaded successfully!" />;
        },
        (error) => {
          console.error("Error uploading file:", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((url) => {
              console.log("Download URL:", url);
              setDownloadURL(url);
              setThumbnailURL(url);
              setImageExist(true);
              setInitialCheckComplete(true);
              setImageUploaded(true);
              // Reset upload progress after upload is complete
              setUploadProgress(0);
              setShowProgress(false);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        }
      );
    } else {
      console.error("No file selected.");
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    // setImageUploaded(false); // Reset imageUploaded state
    setUploadProgress(0); // Reset upload progress
    setFile(null); // Reset file state
    setShowProgress(false);
  };

  const handleDeleteImage = async () => {
    if (orderId) {
      const storage = getStorage();
      const directoryPath = `images/${orderId}`;
      const listRef = ref(storage, directoryPath);

      try {
        const result = await listAll(listRef);

        // Delete each image one by one
        await Promise.all(
          result.items.map(async (item) => {
            await deleteObject(item);
          })
        );

        // Reset states after deletion

        setImageUploaded(false);
        setUploadProgress(0);
        setFile(null);
        setShowProgress(false);
        setThumbnailURL(null); // Reset thumbnailURL
        <Toast message="All images deleted successfully!" />;
      } catch (error) {
        console.error("Error deleting images:", error);
      }
    } else {
      console.error("Missing orderId information.");
    }
  };

  if (!initialCheckComplete) {
    return null; // Return null while initial check is in progress
  }
  return (
    <>
      {initialCheckComplete && (
        <div className="">
          {imageExist && thumbnailURL && (
            <div
              className="border-1 relative w-7 h-7 object-cover"
              onClick={() => setOpenModal(true)}
            >
              <Image
                src={thumbnailURL}
                alt="Thumbnail"
                fill
                style={{
                  marginLeft: "10px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {!imageUploaded && !thumbnailURL && (
            <button onClick={() => setOpenModal(true)}>
              <FaRegImage className="text-[28px] ml-[10px]" />
            </button>
          )}
        </div>
      )}
      {openModal && (
        <div className="z-10 fixed inset-0 left-[-12px] flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white px-8 pb-8 rounded-lg relative w-[40%]">
            <div className="flex justify-between mb-4 pb-2 border-b pt-4">
              <h3 className="font-bold text-[16px]">Upload Image</h3>
              <button
                onClick={closeModal}
                className="close-button absolute right-3 top-3 hover:text-red-700"
              >
                <LiaTimesSolid />
              </button>
            </div>

            {!imageUploaded ? (
              <>
                <div className="flex justify-between">
                  <input
                    type="file"
                    onChange={handleChange}
                    className="bg-gray-50 w-[80%]"
                  />
                  <button
                    onClick={handleUpload}
                    className="button-style disabled:cursor-not-allowed disabled:!bg-gray-400"
                    disabled={!file}
                  >
                    <IoCloudUploadOutline className="text-[16px]" /> Upload
                  </button>
                </div>

                {showProgress && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700 mt-3">
                    <div
                      className="bg-green-600 h-2.5 rounded-full dark:bg-green-500 transition-all ease-in-out duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-gray-100 w-full h-96 flex items-center justify-center mt-3 p-3 relative">
                  {thumbnailURL && (
                    <>
                      <Image
                        src={thumbnailURL}
                        alt="Thumbnail"
                        fill
                        style={{
                          objectFit: "contain",
                        }}
                        sizes="(max-width: 97%) 100vw"
                      />
                      <button
                        className="absolute right-4 bottom-3 p-2 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-[20px] w-9 h-9 rounded-sm"
                        onClick={() => window.open(thumbnailURL, "_blank")}
                      >
                        <RiBracketsLine />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button onClick={closeModal} className="button-default">
                    Close
                  </button>
                  <button onClick={handleDeleteImage} className="button-delete">
                    <TbTrash className="" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploadModal;
