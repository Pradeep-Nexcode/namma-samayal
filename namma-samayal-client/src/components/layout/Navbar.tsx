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
} from "lucide-react";
import { getUserProfile, logoutUser } from "@/features/auth/services/authApi";
import { getAuthToken } from "@/utils/authToken";
import { useLang } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import type { User as UserType } from "@/types/user";

const NAV_LINK_KEYS = [
  { key: "nav.home", href: "/", icon: Home },
  { key: "nav.recipes", href: "/recipes", icon: BookOpen },
  { key: "nav.explore", href: "/explore", icon: Compass },
  { key: "nav.ingredients", href: "/ingredients", icon: Leaf },
];

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
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl bg-white px-6 py-3.5 shadow-sm border border-gray-200 pointer-events-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Namma <span className="text-[#e74c3c]">Samayal</span>
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINK_KEYS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[15px] font-medium transition-colors ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right side group */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-5">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>

              <button
                type="button"
                className="relative text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" strokeWidth={2} />
                <span className="absolute top-[2px] right-[2px] block h-2 w-2 rounded-full bg-[#e74c3c] ring-2 ring-white transform translate-x-1/2 -translate-y-1/2" />
              </button>

              <LanguageSwitcher variant="light" />
            </div>

            <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

            <div className="hidden sm:flex items-center gap-4">
              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 group cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-xs font-bold text-white ring-2 ring-transparent group-hover:ring-gray-100 transition-all shadow-sm">
                      {initials}
                    </div>
                    <span className="hidden lg:block text-[14px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {authUser?.firstName ?? ""}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-gray-100 shadow-xl py-2 z-50">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        {t("nav.viewProfile")}
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
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
                  className="flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-500 transition-all group-hover:border-[#e74c3c] group-hover:text-[#e74c3c]">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden lg:block text-[14px] font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
                    {t("nav.login")}
                  </span>
                </Link>
              )}

              <Link
                href="/recipes/create"
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                {t("nav.newRecipe")}
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex md:hidden items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed top-[88px] left-4 right-4 z-40 rounded-2xl bg-white shadow-xl md:hidden overflow-hidden border border-gray-100 animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 border-b border-gray-100">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search maps, recipes..."
                className="w-full rounded-xl bg-gray-50 border border-transparent py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
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
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gray-50 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {t(link.key)}
                </Link>
              );
            })}

            {/* Mobile language toggle */}
            <div className="px-4 py-2.5 mt-1">
              <LanguageSwitcher variant="light" />
            </div>
          </div>

          <div className="p-4 pt-2 border-t border-gray-50 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
                  className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                {t("nav.login")}
              </Link>
            )}
            <Link
              href="/recipes/create"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              {t("nav.newRecipe")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

