import "./globals.css";
import { Urbanist } from "@next/font/google";

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
      <body className="font-urbanist font-light bg-gray-900 text-gray-100 selection:bg-beige selection:text-gray-900 overflow-x-hidden relative">
        {children}
      </body>
    </html>
  );
}
