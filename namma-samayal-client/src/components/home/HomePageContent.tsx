"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Flame, ArrowRight } from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
// HeroNotebook is the LCP element on this page — keep it eager so it hydrates
// without waiting for a separate chunk (was hurting Lighthouse LCP).
import { HeroNotebook } from "@/components/home/HeroNotebook";
import { HomeLatestRecipes } from "@/components/home/HomeLatestRecipes";
import { HomeCTA } from "@/components/home/HomeCTA";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { getRecipes } from "@/features/recipe/services/recipeApi";
import type { Recipe } from "@/types/recipe";
import { useLang } from "@/contexts/LanguageContext";

/* ─── Inline decorative SVGs (consistent with other sections) ─── */
function LeafSprig({ className = "", flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 200"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <path d="M50 195 Q 47 100, 50 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
      {[[170,1.05,22],[140,1.0,28],[110,0.9,34],[80,0.78,42],[55,0.6,50]].map(([y,s,a],i)=>(
        <g key={i}>
          <g transform={`translate(50, ${y}) rotate(${-a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85-i*0.04} />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180+a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85-i*0.04} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function HeartBurst({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" className={className} aria-hidden>
      {/* Rays around the heart */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7">
        <line x1="48" y1="6"  x2="52" y2="14" />
        <line x1="58" y1="12" x2="62" y2="20" />
        <line x1="66" y1="22" x2="60" y2="28" />
        <line x1="64" y1="36" x2="56" y2="36" />
      </g>
      {/* Heart */}
      <path
        d="M48 50 C 28 38, 22 24, 30 14 C 36 6, 44 10, 48 18 C 52 10, 60 6, 66 14 C 74 24, 68 38, 48 50 Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function TitleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 14" className={className} preserveAspectRatio="none" aria-hidden>
      <path
        d="M2,8 Q 30,1 60,7 T 120,7 T 180,7 T 240,7 T 318,7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// HomeCategories uses framer-motion and lives below the fold, so splitting it
// out of the shared bundle is safe — initial paint isn't blocked on it.
const HomeCategories = dynamic(
  () => import("@/components/home/HomeCategories").then((m) => m.HomeCategories),
  { ssr: true },
);

export function HomePageContent() {
  const { t } = useLang();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const result = await getRecipes({ page: 1, limit: 10 });
        setRecipes(result.data);
      } catch {
        setError("Failed to load recipes.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  return (
    <div className="min-h-screen text-stone-800 dark:text-stone-100">
      <HeroNotebook />

      <HomeCategories />

      <section className="relative mx-auto w-full max-w-7xl px-6 py-16 md:py-20 lg:px-12 z-10">
        <HomeLatestRecipes recipes={recipes.slice(0, 4)} />

        {/* ─── Popular Recipes ─── */}
        <div className="relative mt-20 md:mt-24">
          {/* Decorative heart-burst — top right */}
          <div
            className="hidden md:block absolute -top-2 -right-2 h-12 w-14 text-rose-400 pointer-events-none"
            style={{ transform: "rotate(8deg)" }}
            aria-hidden
          >
            <HeartBurst className="h-full w-full" />
          </div>
          {/* Decorative leaf — bottom left */}
          <div
            className="hidden md:block absolute -bottom-4 left-0 h-32 w-12 text-emerald-700/60 pointer-events-none"
            style={{ transform: "rotate(-14deg)" }}
            aria-hidden
          >
            <LeafSprig className="h-full w-full" />
          </div>

          {/* Header */}
          <div className="mb-10 md:mb-14 flex flex-col items-start gap-3 max-w-2xl">
            {/* Trending Now washi tape pill */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
              style={{
                backgroundColor: "rgba(255, 243, 176, 0.92)",
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                transform: "rotate(-1.5deg)",
              }}
            >
              <Flame className="h-3.5 w-3.5 text-amber-700" />
              <span className="font-note-hw text-[12px] md:text-[13px] font-bold uppercase tracking-[0.18em] text-amber-900">
                {t("home.trendingNow")}
              </span>
            </div>
            {/* Title with red squiggle underline */}
            <div className="relative inline-block">
              <h2 className="font-title-hw text-[34px] md:text-[44px] lg:text-[52px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.05]">
                {t("home.popularRecipes")}
              </h2>
              <span
                className="absolute left-0 -bottom-1 h-2 w-[min(100%,300px)] text-[#e74c3c] opacity-80 pointer-events-none"
                aria-hidden
              >
                <TitleUnderline className="h-full w-full" />
              </span>
            </div>
            <p className="mt-2 font-note-hw text-[15px] md:text-[16px] text-stone-700 dark:text-stone-300 leading-relaxed">
              {t("home.popularDesc")}{" "}
              <span className="text-rose-500">❤</span>
            </p>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader />
            </div>
          ) : null}

          {error ? (
            <div className="py-10">
              <ErrorMessage message={error} />
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {recipes.slice(4, 10).map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : null}

          {/* View Full Archive CTA — handwritten pill style */}
          {!loading && !error && recipes.length > 6 ? (
            <div className="mt-14 md:mt-16 flex justify-center">
              <a
                href="/recipes"
                className="group inline-flex items-center justify-center gap-2 rounded-full paper-card border border-stone-300 dark:border-white/10 text-stone-800 dark:text-stone-100 px-7 py-3 font-title-hw text-[15px] md:text-[16px] font-bold shadow-[0_4px_12px_-4px_rgba(120,90,40,0.2)] hover:bg-[#c0392b] hover:text-white hover:border-[#c0392b] hover:shadow-[0_6px_18px_-6px_rgba(192,57,43,0.35)] transition-colors active:translate-y-px"
              >
                {t("home.viewArchive")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <HomeCTA />
    </div>
  );
}
