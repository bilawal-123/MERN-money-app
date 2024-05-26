"use client";
import { Montserrat, Gulzar } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthUserProvider } from "../firebase/auth";
import Footer from "./components/footer";
import { BalanceProvider } from "./components/BalanceContext";
const inter = Montserrat({ subsets: ["latin"] });
const gulzar = Gulzar({
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthUserProvider>
          <BalanceProvider>
            <Navbar />
            <main className="min-h-[calc(100vh_-_100px)] bg-[url('/main-bg.jpg')] bg-opacity-40 flex items-stretch">
              {children}
            </main>
            <Footer />
          </BalanceProvider>
        </AuthUserProvider>
      </body>
    </html>
  );
}
