"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../../firebase/auth";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";
import { RiLoginCircleFill } from "react-icons/ri";
import { CiLock } from "react-icons/ci";
import Link from "next/link";

export default function UserLogin() {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const { authUser, isLoading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && authUser) {
      router.push("/");
    }
  }, [authUser, isLoading]);

  const signinHandler = async () => {
    if (!email || !password) return;
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error While Signing In", error);
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
          <h1 className="text-white mb-2 text-lg uppercase">User Login</h1>
        </div>
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
          <div className="flex gap-3 mt-6">
            <button onClick={signinHandler} className="button-style">
              <RiLoginCircleFill className="text-lg" /> Login
            </button>
          </div>
          <div className="mt-5 flex justify-between items-center">
            <p className="text-xs text-gray-300">
              Alread have account?{" "}
              <Link href={"./userRegister"} className="text-white">
                Register
              </Link>
            </p>
            <p className="text-xs text-gray-300">
              <Link href={"./userregister"} className="text-white">
                Forgot Password?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
