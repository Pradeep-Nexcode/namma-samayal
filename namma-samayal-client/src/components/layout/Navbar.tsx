"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Search,
  Menu,
  X,
  Home,
  BookOpen,
  Compass,
  Leaf,
  LogOut,
  User,
  ChefHat,
} from "lucide-react";
import { getUserProfile, logoutUser } from "@/features/auth/services/authApi";
import { getAuthToken } from "@/utils/authToken";
import { useLang } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import type { User as UserType } from "@/types/user";

const NAV_LINK_KEYS = [
  { key: "nav.home", href: "/", icon: Home },
  { key: "nav.recipes", href: "/recipes", icon: BookOpen },
  { key: "nav.explore", href: "/explore", icon: Compass },
  { key: "nav.ingredients", href: "/ingredients", icon: Leaf },
];

/* Small hand-drawn red pencil underline shown beneath the ACTIVE nav link.
   Uses currentColor so it themes via the parent's text color (red brand). */
function PencilUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 8"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M2,5 Q 18,1 36,4 T 70,4 T 98,4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authUser, setAuthUser] = useState<UserType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getAuthToken()) return;
    setIsLoggedIn(true);
    getUserProfile()
      .then((user) => setAuthUser(user))
      .catch(() => {
        logoutUser();
        setIsLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logoutUser();
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const initials = authUser
    ? `${authUser.firstName?.[0] ?? ""}${authUser.lastName?.[0] ?? ""}`.toUpperCase()
    : "...";

  return (
    <>
      <header className="fixed top-0 z-50 w-full pt-4 pb-2 px-4 lg:px-6 pointer-events-none">
        <div className="relative mx-auto w-full max-w-7xl pointer-events-auto">
          {/* Yellow washi tape — top-left corner accent (hidden on mobile) */}
          <div
            className="hidden md:block absolute -top-1.5 left-10 z-20 h-3.5 w-20 opacity-90"
            style={{
              backgroundColor: "rgba(249, 220, 130, 0.9)",
              transform: "rotate(-4deg)",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 2px, transparent 2px 6px)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            }}
            aria-hidden
          />

          {/* "Cook with Love" sticky note — pinned top-right (desktop only) */}
          <div
            className="hidden xl:block absolute -top-3 right-6 z-20 pointer-events-none"
            style={{ transform: "rotate(4deg)" }}
            aria-hidden
          >
            <div
              className="relative px-3 pt-3 pb-2 shadow-[0_4px_10px_-4px_rgba(120,80,0,0.35)]"
              style={{
                backgroundColor: "#fff7c2",
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
              }}
            >
              {/* Red pushpin */}
              <span
                className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm"
                style={{ border: "1.5px solid rgba(255,255,255,0.7)" }}
              />
              <p className="font-note-hw text-[12px] leading-tight text-amber-900 text-center font-bold whitespace-nowrap">
                Cook with Love <span className="text-rose-500">❤</span>
              </p>
            </div>
          </div>

          {/* Main navbar paper card */}
          <div
            className="relative flex items-center justify-between rounded-2xl px-5 md:pl-10 md:pr-6 py-3 shadow-[0_4px_18px_-8px_rgba(120,90,40,0.18)] dark:shadow-[0_4px_18px_-8px_rgba(0,0,0,0.5)] border border-stone-200/80"
            style={{
              backgroundColor: "var(--ns-nav-bg, #fffdf6)",
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 28px, rgba(120,90,40,0.06) 28px, rgba(120,90,40,0.06) 29px)",
            }}
          >
            {/* Spiral binding punch-holes on left edge */}
            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-2 flex-col gap-1.5 pointer-events-none" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-stone-300 ring-1 ring-stone-400/60 dark:ring-stone-500/60 shadow-inner"
                />
              ))}
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-500/20 dark:to-rose-500/20 text-stone-700 dark:text-stone-200 shadow-sm border border-amber-200/80 dark:border-amber-400/30"
                aria-hidden
              >
                <ChefHat className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="leading-tight">
                <span className="block font-title-hw text-[22px] md:text-[24px] font-bold tracking-tight text-stone-900 dark:text-white">
                  Namma <span className="text-[#e74c3c]">Samayal</span>
                </span>
                <span className="hidden md:block font-note-hw text-[12px] text-stone-500 dark:text-stone-400 -mt-0.5">
                  Namma veetu samayal, ungal veetukku{" "}
                  <span className="text-rose-500">❤</span>
                </span>
              </div>
            </Link>

            {/* Center Links */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-9">
              {NAV_LINK_KEYS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative font-title-hw text-[17px] font-bold transition-colors py-1 ${
                      isActive
                        ? "text-stone-900 dark:text-white"
                        : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    {t(link.key)}
                    {/* Hand-drawn red pencil underline — only on active */}
                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-1 h-2 text-[#e74c3c] pointer-events-none">
                        <PencilUnderline className="h-full w-full" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side group */}
            <div className="flex items-center gap-4 md:gap-5">
              <div className="hidden sm:flex items-center gap-4">
                <button
                  type="button"
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-[18px] w-[18px]" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  className="relative text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
                  <span className="absolute top-[1px] right-[1px] block h-2 w-2 rounded-full bg-[#e74c3c] ring-2 ring-[var(--ns-nav-bg,#fffdf6)] dark:ring-[#1f1d17] transform translate-x-1/2 -translate-y-1/2" />
                </button>

                <ThemeToggle variant="auto" className="-mr-1 -ml-1" />

                <LanguageSwitcher variant="light" />
              </div>

              <div className="hidden sm:block h-6 w-px bg-stone-300/70 dark:bg-white/10"></div>

              <div className="hidden sm:flex items-center gap-3">
                {isLoggedIn ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2.5 group cursor-pointer"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-xs font-bold text-white ring-2 ring-transparent group-hover:ring-amber-200 dark:group-hover:ring-amber-400/40 transition-all shadow-sm">
                        {initials}
                      </div>
                      <span className="hidden lg:block font-title-hw text-[15px] text-stone-700 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                        {authUser?.firstName ?? ""}
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--ns-nav-bg,#fffdf6)] dark:bg-[#1f1d17] border border-stone-200 dark:border-white/[0.06] shadow-xl py-2 z-50">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-body text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-white transition-colors"
                        >
                          <User className="h-4 w-4" />
                          {t("nav.viewProfile")}
                        </Link>
                        <hr className="my-1 border-dashed border-stone-200 dark:border-white/[0.06]" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 font-body text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("nav.logout")}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 dark:bg-white/5 border border-amber-200 dark:border-white/[0.06] text-stone-500 dark:text-stone-400 transition-all group-hover:border-[#e74c3c] group-hover:text-[#e74c3c]">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden lg:block font-title-hw text-[15px] text-stone-700 dark:text-stone-200 group-hover:text-[#e74c3c] transition-colors">
                      {t("nav.login")}
                    </span>
                  </Link>
                )}

                <Link
                  href="/recipes/create"
                  className="inline-flex items-center justify-center rounded-lg bg-[#e74c3c] px-4 py-2 font-title-hw text-[15px] font-bold text-white border-2 border-[#c0392b]/40 hover:bg-[#c0392b] transition-colors shadow-[1px_2px_0_rgba(120,40,40,0.25)] active:translate-y-px active:shadow-none"
                >
                  + {t("nav.newRecipe")}
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex md:hidden items-center justify-center rounded-lg p-2 text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-white/5 transition-colors"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed top-[88px] left-4 right-4 z-40 rounded-2xl shadow-xl md:hidden overflow-hidden border border-stone-200 dark:border-white/[0.06] animate-in slide-in-from-top-4 duration-300"
          style={{
            backgroundColor: "var(--ns-nav-bg, #fffdf6)",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 28px, rgba(120,90,40,0.06) 28px, rgba(120,90,40,0.06) 29px)",
          }}
        >
          <div className="p-4 border-b border-dashed border-stone-200 dark:border-white/[0.06]">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-stone-400 dark:text-stone-500 pointer-events-none" />
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder") || "Search recipes…"}
                className="w-full rounded-xl bg-amber-50/60 dark:bg-white/5 border border-stone-200 dark:border-white/[0.06] py-2.5 pl-10 pr-4 font-body text-sm font-medium text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-amber-200 dark:focus:ring-white/20 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="p-3 flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
            {NAV_LINK_KEYS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-title-hw text-[17px] font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-amber-50 dark:bg-white/5 text-stone-900 dark:text-white"
                      : "text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {t(link.key)}
                </Link>
              );
            })}

            {/* Mobile language + theme toggles */}
            <div className="px-4 py-2.5 mt-1 flex items-center justify-between">
              <LanguageSwitcher variant="light" />
              <ThemeToggle variant="auto" />
            </div>
          </div>

          <div className="p-4 pt-2 border-t border-dashed border-stone-200 dark:border-white/[0.06] flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-amber-50/60 dark:bg-white/5 px-4 py-3 font-body text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-amber-100/70 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-[10px] font-bold text-white shadow-sm">
                      {initials}
                    </div>
                    {authUser?.firstName ?? "Profile"}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-red-500/10 px-4 py-3 font-body text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-amber-50/60 dark:bg-white/5 px-4 py-3 font-body text-sm font-medium text-stone-700 dark:text-stone-200 hover:bg-amber-100/70 dark:hover:bg-white/10 transition-colors"
              >
                <User className="h-4 w-4" />
                {t("nav.login")}
              </Link>
            )}
            <Link
              href="/recipes/create"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-xl bg-[#e74c3c] px-4 py-3 font-title-hw text-base font-bold text-white border-2 border-[#c0392b]/40 hover:bg-[#c0392b] transition-colors shadow-[1px_2px_0_rgba(120,40,40,0.25)]"
            >
              + {t("nav.newRecipe")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
