import { Urbanist } from "next/font/google";
import Footer from "./Footer";
import "./globals.css";
import Header from "./Header";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={urbanist.variable}>
      <head />
      <body className="overscroll-none font-urbanist font-light bg-gray-900 text-gray-100 selection:bg-beige selection:text-gray-900 overflow-x-hidden relative">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
