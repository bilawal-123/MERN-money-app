"use client";
import { useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth } from "../../firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Loader from "../components/loader";
import { CiLock } from "react-icons/ci";
import { RiUserAddFill } from "react-icons/ri";
import Link from "next/link";

export default function UserRegister() {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const { authUser, isLoading, setAuthUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!isLoading && authUser) {
      router.push("/");
    }
  }, [authUser, isLoading, pathname]);

  const signupHandler = async (e) => {
    if (!email || !password || !displayName) {
      setError("All fields are required");
      return;
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
      setAuthUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName, // Set the displayName
      });
    } catch (error) {
      console.error("An Error Occurred", error);
    }
  };

  return isLoading || (!isLoading && authUser) ? (
    <Loader></Loader>
  ) : (
    <div className="auth-wrapper w-full items-center flex bg-gray-500 h-[calc(100vh_-_100px)] bg-cover ">
      <div className="w-[500px] max-w-full mx-auto px-4 py-8 bg-gray-600">
        <div className="flex flex-col justify-center items-center mb-3">
          <div className="text-5xl text-gray-600 mb-2 inline-flex bg-white rounded-full p-4 shadow-md shadow-gray-500 ">
            <CiLock />
          </div>
          <h1 className="text-white mb-2 text-lg uppercase">
            User Registration
          </h1>
        </div>
        {error && <p className="text-red-500">{error}</p>} {/* Error message */}
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            className="block mb-3 min-h-[auto] border-2 text-white border-gray-300 w-full rounded bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-white"
            placeholder="Email"
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="block mb-3 min-h-[auto] border-2 text-white border-gray-300 w-full rounded bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-white"
            placeholder="Password"
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="block mb-3 min-h-[auto] border-2 text-white border-gray-300 w-full rounded bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none focus:border-white">
            <label className="label-style">
              Set Role: <span className="asterisk">*</span>
            </label>
            <select
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-style !text-black"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={signupHandler} className="button-style">
              <RiUserAddFill className="text-lg" />
              Register User
            </button>
          </div>
          <div className="mt-5 flex justify-between items-center">
            <p className="text-xs text-gray-300">
              Alread have account?{" "}
              <Link href={"./login"} className="text-white">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
