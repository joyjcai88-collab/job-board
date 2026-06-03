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
  title: "Job Board — VC, CoS, GTM, Product, Healthtech",
  description:
    "Curated job listings in venture capital, chief of staff, GTM/growth, product, biz ops, and healthtech across Silicon Valley, NYC, and LA.",
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
        <nav className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
          <div className="max-w-[1128px] mx-auto px-4 h-[52px] flex items-center gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-[34px] h-[34px] bg-linkedin-blue rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6H16V4C16 2.9 15.1 2 14 2H10C8.9 2 8 2.9 8 4V6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM10 4H14V6H10V4Z" />
                </svg>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-1 min-w-0 max-w-[680px]">
              <div className="flex-1 flex items-center bg-[#eef3f8] rounded px-3 h-[34px] min-w-0" id="nav-search">
                <svg className="w-4 h-4 text-text-secondary shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm text-text-secondary truncate">Search jobs</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 ml-4">
              <a href="#" className="flex flex-col items-center text-text-secondary hover:text-text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6H16V4C16 2.9 15.1 2 14 2H10C8.9 2 8 2.9 8 4V6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM10 4H14V6H10V4Z" />
                </svg>
                <span className="text-[11px] font-medium">Jobs</span>
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
