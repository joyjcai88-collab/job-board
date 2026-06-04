import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VC Job Board — Startup Jobs from Top VC Portfolios",
  description:
    "Curated startup jobs from Sequoia, a16z, Greylock, Bessemer, and 20+ top VC portfolios. Roles in VC, Chief of Staff, GTM, Product, BizOps, and Healthtech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg font-sans">
        {children}
      </body>
    </html>
  );
}
