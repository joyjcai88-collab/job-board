import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
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
      className={`${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg font-serif text-text-primary">
        {children}
      </body>
    </html>
  );
}
