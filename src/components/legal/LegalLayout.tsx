"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
  tocItems: { id: string; label: string }[];
}

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
  tocItems,
}: LegalLayoutProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>(tocItems[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(tocItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(tocItems[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] font-sans selection:bg-[#8ab4f8]/30 selection:text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#202124]/90 backdrop-blur-md border-b border-[#3c4043] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & App Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 flex-shrink-0">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
                <rect x="18" y="24" width="44" height="52" rx="10" fill="#00832D" />
                <path d="M42 24H52C57.5228 24 62 28.4772 62 34V46H42V24Z" fill="#EA4335" />
                <path d="M18 34C18 28.4772 22.4772 24 28 24H42V50H18V34Z" fill="#FBBC04" />
                <path d="M18 50H42V76H28C22.4772 76 18 71.5228 18 66V50Z" fill="#4285F4" />
                <path d="M42 54H62V66C62 71.5228 57.5228 76 52 76H42V54Z" fill="#00AC47" />
                <path d="M62 38L82 23V77L62 62V38Z" fill="#00832D" />
                <path d="M62 38L82 23V50H62V38Z" fill="#EA4335" />
                <path d="M62 50H82V77L62 62V50Z" fill="#00AC47" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 text-lg font-normal text-[#e8eaed]">
              <span>Google</span>
              <span className="font-semibold text-white">Meet</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#3c4043] text-[#9aa0a6] font-medium hidden sm:inline-block">
                Legal
              </span>
            </div>
          </Link>

          {/* Navigation Tabs (Privacy / Terms) */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/privacy"
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                pathname === "/privacy"
                  ? "bg-[#8ab4f8] text-[#202124] shadow-sm font-semibold"
                  : "text-[#9aa0a6] hover:text-white hover:bg-[#303134]"
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                pathname === "/terms"
                  ? "bg-[#8ab4f8] text-[#202124] shadow-sm font-semibold"
                  : "text-[#9aa0a6] hover:text-white hover:bg-[#303134]"
              }`}
            >
              Terms of Service
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title="Print document"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#3c4043] text-xs font-medium text-[#9aa0a6] hover:text-white hover:bg-[#303134] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.026-.441-2.155-.441-3.329 0-3.314 2.686-6 6-6s6 2.686 6 6c0 1.174-.201 2.303-.441 3.329m-11.118 0A12.04 12.04 0 0 0 4.5 18v2.25h15V18c0-1.53-.29-2.993-.782-4.171m-13.436 0C5.99 13.434 6.786 13 8.25 13h7.5c1.464 0 2.26.434 2.968.829" />
              </svg>
              <span>Print</span>
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <span>Go to Meet</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#2d2e30]/80 to-[#202124] border-b border-[#3c4043]/60 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8ab4f8]/10 border border-[#8ab4f8]/30 text-[#8ab4f8] text-xs font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-[#8ab4f8] animate-pulse" />
              <span>Google Cloud OAuth 2.0 Compliant</span>
              <span className="text-[#3c4043]">&bull;</span>
              <span>Effective: {lastUpdated}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-[#bdc1c6] leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Table of Contents & Quick Contact (Sticky on Desktop) */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Table of Contents Card */}
              <div className="bg-[#2d2e30] border border-[#3c4043] rounded-2xl p-5 shadow-lg">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#8ab4f8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span>Contents</span>
                </h2>
                <nav className="space-y-1 text-xs">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block px-3 py-2 rounded-xl transition-all ${
                        activeSection === item.id
                          ? "bg-[#3c4043] text-[#8ab4f8] font-medium pl-3 border-l-2 border-[#8ab4f8]"
                          : "text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#303134]"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Verified Contact Card (Required for Google OAuth Verification) */}
              <div className="bg-[#2d2e30] border border-[#3c4043] rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a73e8]/20 flex items-center justify-center text-[#8ab4f8]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-medium">Official Contact</h3>
                    <p className="text-[#9aa0a6] text-[11px]">Developer & Data Controller</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs border-t border-[#3c4043] pt-3">
                  <div>
                    <span className="text-[#9aa0a6] block text-[10px] uppercase font-semibold">Representative</span>
                    <span className="text-white font-medium">Abdurahiman</span>
                  </div>

                  <div>
                    <span className="text-[#9aa0a6] block text-[10px] uppercase font-semibold">Direct Email</span>
                    <a
                      href="mailto:abdurahimanoffc@gmail.com"
                      className="text-[#8ab4f8] hover:underline font-mono text-xs break-all"
                    >
                      abdurahimanoffc@gmail.com
                    </a>
                  </div>

                  <div>
                    <span className="text-[#9aa0a6] block text-[10px] uppercase font-semibold">Direct Phone</span>
                    <a
                      href="tel:+919544499352"
                      className="text-[#8ab4f8] hover:underline font-mono text-xs"
                    >
                      +91 9544499352
                    </a>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#3c4043] flex flex-col gap-2">
                  <a
                    href="mailto:abdurahimanoffc@gmail.com?subject=Privacy%20Inquiry%20-%20Meet"
                    className="w-full py-2 px-3 rounded-xl bg-[#3c4043] hover:bg-[#4a4d52] text-white text-xs font-medium transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Send Support Email</span>
                  </a>
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-3 rounded-xl text-center text-[11px] text-[#8ab4f8] hover:underline"
                  >
                    Manage Google Permissions &rarr;
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Detailed Document Body */}
          <main className="lg:col-span-8 order-1 lg:order-2 space-y-10 text-sm leading-relaxed text-[#bdc1c6]">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#3c4043] bg-[#1a1b1d] py-10 mt-16 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6">
                <svg viewBox="0 0 100 100" fill="none" className="w-6 h-6">
                  <rect x="18" y="24" width="44" height="52" rx="10" fill="#00832D" />
                  <path d="M42 24H52C57.5228 24 62 28.4772 62 34V46H42V24Z" fill="#EA4335" />
                  <path d="M18 34C18 28.4772 22.4772 24 28 24H42V50H18V34Z" fill="#FBBC04" />
                  <path d="M18 50H42V76H28C22.4772 76 18 71.5228 18 66V50Z" fill="#4285F4" />
                  <path d="M42 54H62V66C62 71.5228 57.5228 76 52 76H42V54Z" fill="#00AC47" />
                  <path d="M62 38L82 23V77L62 62V38Z" fill="#00832D" />
                  <path d="M62 38L82 23V50H62V38Z" fill="#EA4335" />
                  <path d="M62 50H82V77L62 62V50Z" fill="#00AC47" />
                </svg>
              </div>
              <span className="text-white font-medium text-sm">Meet Video Platform</span>
              <span className="text-[#5f6368]">&bull;</span>
              <span className="text-[#9aa0a6] text-xs">Verified Google Cloud OAuth Application</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9aa0a6]">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a
                href="mailto:abdurahimanoffc@gmail.com"
                className="hover:text-white transition-colors"
              >
                Contact: abdurahimanoffc@gmail.com
              </a>
              <a
                href="tel:+919544499352"
                className="hover:text-white transition-colors"
              >
                Tel: 9544499352
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#3c4043]/40 text-center text-xs text-[#5f6368]">
            <p>&copy; {new Date().getFullYear()} Meet. All rights reserved. Google and Google Meet are trademarks of Google LLC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
