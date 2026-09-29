"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onOpenSettings?: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [timeStr, setTimeStr] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showAppsMenu, setShowAppsMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const appsMenuRef = useRef<HTMLDivElement>(null);

  // Live Clock matching Google Meet
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
      setTimeStr(`${time} • ${date}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (appsMenuRef.current && !appsMenuRef.current.contains(e.target as Node)) {
        setShowAppsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="border-b border-[#3c4043] bg-[#202124] sticky top-0 z-40 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Google Meet Logo */}
        <a href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex-shrink-0 flex items-center justify-center">
            {/* Google Meet official camera logo */}
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
          <div className="flex items-center gap-1.5 text-xl font-normal text-[#e8eaed] tracking-tight">
            <span>Google</span>
            <span className="font-semibold text-white">Meet</span>
          </div>
        </a>

        {/* Right: Date, Time & Google Meet Control Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Date & Time */}
          {timeStr && (
            <span className="hidden md:inline-block text-[#9aa0a6] text-sm font-normal tracking-wide">
              {timeStr}
            </span>
          )}

          {/* Help / Support Icon */}
          <a
            href="https://support.google.com/meet"
            target="_blank"
            rel="noopener noreferrer"
            title="Support"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#303134] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </a>

          {/* Feedback Icon */}
          <button
            type="button"
            title="Report an issue"
            onClick={() => alert("Thanks for your feedback! Google Meet issue reporting is active.")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#303134] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.502 49.188 49.188 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.279Z" />
            </svg>
          </button>

          {/* Settings Icon */}
          {onOpenSettings && (
            <button
              type="button"
              title="Settings"
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#303134] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}

          {/* Google Apps 9-dots Grid */}
          <div className="relative" ref={appsMenuRef}>
            <button
              type="button"
              title="Google apps"
              onClick={() => setShowAppsMenu(!showAppsMenu)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#9aa0a6] hover:text-white hover:bg-[#303134] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6" cy="6" r="2" />
                <circle cx="12" cy="6" r="2" />
                <circle cx="18" cy="6" r="2" />
                <circle cx="6" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="18" cy="12" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="12" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
              </svg>
            </button>

            {/* Google Apps Dropdown */}
            {showAppsMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#2d2e30] border border-[#3c4043] rounded-2xl p-4 shadow-2xl z-50 animate-slide-up grid grid-cols-3 gap-3">
                {[
                  { name: "Meet", url: "/dashboard", color: "#00832D", icon: "M" },
                  { name: "Calendar", url: "https://calendar.google.com", color: "#4285F4", icon: "C" },
                  { name: "Gmail", url: "https://mail.google.com", color: "#EA4335", icon: "G" },
                  { name: "Drive", url: "https://drive.google.com", color: "#34A853", icon: "D" },
                  { name: "Docs", url: "https://docs.google.com", color: "#4285F4", icon: "📄" },
                  { name: "YouTube", url: "https://youtube.com", color: "#FF0000", icon: "▶" },
                ].map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    target={app.url.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-[#3c4043] transition-colors text-center"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-1.5 shadow-sm"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.icon}
                    </div>
                    <span className="text-xs text-[#e8eaed]">{app.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* User Account Avatar & Profile Menu */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="rounded-full ring-2 ring-transparent hover:ring-[#8ab4f8] transition-all focus:outline-none"
              >
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name}
                    width={34}
                    height={34}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              {/* Google Account Modal Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-80 bg-[#2d2e30] border border-[#3c4043] rounded-3xl p-5 shadow-2xl z-50 animate-slide-up text-center">
                  <div className="flex flex-col items-center mb-4">
                    {user.picture ? (
                      <Image
                        src={user.picture}
                        alt={user.name}
                        width={64}
                        height={64}
                        className="rounded-full mb-3 ring-4 ring-[#3c4043]"
                        unoptimized
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-2xl font-bold mb-3 ring-4 ring-[#3c4043]">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-semibold text-white text-base leading-snug">{user.name}</h3>
                    <p className="text-xs text-[#9aa0a6] mt-0.5">{user.email}</p>
                  </div>

                  <a
                    href="https://myaccount.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-2.5 px-4 rounded-full border border-[#5f6368] hover:bg-[#3c4043] text-sm text-[#8ab4f8] font-medium transition-colors mb-4"
                  >
                    Manage your Google Account
                  </a>

                  <div className="border-t border-[#3c4043] pt-4">
                    <button
                      id="sign-out-btn"
                      onClick={signOut}
                      className="w-full py-2.5 px-4 rounded-full bg-[#3c4043] hover:bg-[#4a4d52] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
