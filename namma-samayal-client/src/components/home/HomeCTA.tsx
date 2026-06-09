"use client";

import Link from "next/link";
import { ChefHat, ArrowRight, Sparkles } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export function HomeCTA() {
  const { t } = useLang();

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-12 z-10">
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-6 py-16 sm:px-16 sm:py-24 text-center sm:text-left shadow-2xl">
        {/* Background Decorative Blur */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#e74c3c] opacity-20 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500 opacity-10 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center justify-between gap-12 sm:flex-row">
          <div className="max-w-2xl text-slate-900 dark:text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#e74c3c] backdrop-blur-md border border-white/10">
              <Sparkles className="h-4 w-4" />
              {t("home.joinCommunity")}
            </div>

            <h2 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {t("home.ctaHeading1")} <span className="text-[#e74c3c]">{t("home.ctaHeading2")}</span>
            </h2>

            <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
              {t("home.ctaDesc")}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/recipes/create"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#e74c3c] px-10 py-5 text-lg font-bold text-white shadow-[0_0_40px_rgba(231,76,60,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(231,76,60,0.6)] active:scale-95"
            >
              <div className="absolute inset-0 bg-white dark:bg-[var(--color-card)] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <ChefHat className="h-6 w-6" />
              <span>{t("home.shareRecipe")}</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <p className="mt-4 text-center text-sm font-semibold text-slate-400 dark:text-gray-500">
              {t("home.ctaNote")}
            </p>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V0h40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>
    </section>
  );
}
