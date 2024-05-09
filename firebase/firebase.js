// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOnhMG9mBKh6fRMO-pPrH2zuCPfWfUh_k",
  authDomain: "yusifbuildingmaterials.firebaseapp.com",
  projectId: "yusifbuildingmaterials",
  storageBucket: "yusifbuildingmaterials.appspot.com",
  messagingSenderId: "27235421809",
  appId: "1:27235421809:web:2e3bf4c35eba1373d315d0",
  measurementId: "G-JZ3MV74PYQ",
};

// export { storage };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
