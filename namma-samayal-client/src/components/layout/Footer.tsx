"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Twitter = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Youtube = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="w-full bg-white mt-auto px-4 lg:px-6 pb-4 lg:p-6">
      <div className="mx-auto w-full max-w-7xl rounded-2xl bg-white shadow-sm border border-slate-200 px-6 py-16 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 xl:gap-24">

          {/* Logo and About */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                Namma <span className="text-[#e74c3c]">Samayal</span>
              </span>
            </Link>
            <p className="text-[15px] leading-relaxed text-slate-500 font-medium">
              {t("footer.tagline")}
            </p>

            {/* Language switcher */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {t("footer.language")}
              </p>
              <LanguageSwitcher variant="light" />
            </div>

            <div className="flex items-center gap-4 mt-1">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-[#fcedeb] hover:text-[#e74c3c]">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-[#fcedeb] hover:text-[#e74c3c]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-[#fcedeb] hover:text-[#e74c3c]">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-[#fcedeb] hover:text-[#e74c3c]">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">{t("footer.homeExplore")}</h3>
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("nav.home")}</Link>
                <Link href="/recipes" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("footer.allRecipes")}</Link>
                <Link href="/ingredients" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("footer.ingredientLibrary")}</Link>
                <Link href="/explore" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("footer.exploreCuisines")}</Link>
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">{t("footer.community")}</h3>
              <nav className="flex flex-col gap-4">
                <Link href="/recipes/create" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("footer.submitRecipe")}</Link>
                <Link href="/profile" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("footer.myProfile")}</Link>
                <Link href="#" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("footer.topAuthors")}</Link>
                <Link href="#" className="text-slate-500 transition-colors hover:text-[#e74c3c] font-medium">{t("footer.communityRules")}</Link>
              </nav>
            </div>

            <div className="flex flex-col gap-6 sm:col-span-1 col-span-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">{t("footer.stayUpdated")}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {t("footer.newsletterDesc")}
              </p>
              <form className="relative mt-2">
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder={t("footer.emailPlaceholder")}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#e74c3c]/30 focus:bg-white"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 bottom-2 rounded-xl bg-[#e74c3c] px-4 text-xs font-bold text-white transition-all hover:bg-[#c0392b] hover:shadow-lg active:scale-95"
                  >
                    {t("footer.subscribe")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} Namma Samayal. {t("footer.allRights")}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors">{t("footer.privacy")}</Link>
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors">{t("footer.terms")}</Link>
            <Link href="#" className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors">{t("footer.cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
