"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  ChefHat,
  Sparkles,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { useLang } from "@/contexts/LanguageContext";

interface HomeLatestRecipesProps {
  recipes: Recipe[];
}

/* ──────────────── Decorative inline SVGs (kept local) ──────────────── */
function HeartDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      <path
        d="M32 55 C 10 40, 4 25, 12 14 C 19 5, 28 10, 32 18 C 36 10, 45 5, 52 14 C 60 25, 54 40, 32 55 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafSprig({ className = "", flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 200"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <path
        d="M50 195 Q 47 100, 50 14"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      {[
        [170, 1.05, 22],
        [140, 1.0, 28],
        [110, 0.9, 34],
        [80, 0.78, 42],
        [55, 0.6, 50],
      ].map(([y, scale, angle], i) => (
        <g key={i}>
          <g transform={`translate(50, ${y}) rotate(${-angle}) scale(${scale})`}>
            <path
              d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z"
              fill="currentColor"
              opacity={0.85 - i * 0.04}
            />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180 + angle}) scale(${scale})`}>
            <path
              d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z"
              fill="currentColor"
              opacity={0.85 - i * 0.04}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}

function PinkScribble({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden>
      <path
        d="M5 30 Q 30 5, 50 30 T 100 30"
        fill="none"
        stroke="#f8b4c5"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M15 45 Q 40 25, 65 45 T 115 45"
        fill="none"
        stroke="#fbc2cf"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
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

/* Tape strip — washi tape look */
function TapeStrip({
  color = "yellow",
  className = "",
  rotate = -4,
  width = "w-20",
}: {
  color?: "yellow" | "pink" | "green";
  className?: string;
  rotate?: number;
  width?: string;
}) {
  const bg =
    color === "pink"
      ? "rgba(251, 213, 221, 0.85)"
      : color === "green"
      ? "rgba(214, 239, 206, 0.85)"
      : "rgba(255, 243, 176, 0.9)";
  return (
    <div
      className={`${width} h-4 ${className}`}
      style={{
        backgroundColor: bg,
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      }}
      aria-hidden
    />
  );
}

/* ──────────────── Section ──────────────── */
export function HomeLatestRecipes({ recipes }: HomeLatestRecipesProps) {
  const { t, lf } = useLang();

  if (!recipes || recipes.length === 0) return null;

  const featured = recipes[0];
  const others = recipes.slice(1, 4);

  const featuredTitle =
    lf(featured.seo?.title) || featured.title || lf(featured.dishName);
  const featuredDesc =
    lf(featured.seo?.description) ||
    lf(featured.description) ||
    t("home.featuredFallback");
  const featuredTime = featured.totalTime || featured.cookingTime;

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-16 md:py-20 lg:px-12 z-10">
      {/* Left leaf sprig — desktop only */}
      <div
        className="hidden lg:block absolute left-0 top-1/3 -translate-y-1/2 h-44 w-14 text-emerald-700/70 pointer-events-none"
        style={{ transform: "rotate(-12deg)" }}
        aria-hidden
      >
        <LeafSprig className="h-full w-full" />
      </div>
      {/* Right leaf sprig */}
      <div
        className="hidden lg:block absolute right-0 bottom-12 h-44 w-14 text-emerald-700/70 pointer-events-none"
        style={{ transform: "rotate(8deg)" }}
        aria-hidden
      >
        <LeafSprig className="h-full w-full" flip />
      </div>
      {/* Pink scribble accent — bottom-right */}
      <div
        className="hidden md:block absolute -right-2 -bottom-2 h-14 w-32 pointer-events-none opacity-80"
        aria-hidden
      >
        <PinkScribble className="h-full w-full" />
      </div>

      {/* ─── Header ─── */}
      <div className="mb-10 md:mb-12 flex items-end justify-between gap-4">
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
            style={{
              backgroundColor: "rgba(255, 243, 176, 0.92)",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
              transform: "rotate(-1.5deg)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span className="font-note-hw text-[12px] md:text-[13px] font-bold uppercase tracking-[0.18em] text-amber-900">
              {t("home.freshArrivals")}
            </span>
          </div>
          <div className="relative inline-block">
            <h2 className="font-title-hw text-[34px] md:text-[44px] lg:text-[52px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.05]">
              {t("home.latestAdditions")}
            </h2>
          </div>
          <p className="mt-3 font-note-hw text-[15px] md:text-[16px] text-stone-600 dark:text-stone-300">
            Discover our newest recipes, made with love for your kitchen{" "}
            <span className="text-rose-500">❤</span>
          </p>
        </div>
        {/* Prev/next carousel arrows (decorative — link to recipes archive) */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/recipes"
            aria-label="Previous"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 dark:border-white/10 text-stone-500 dark:text-stone-300 hover:text-[#c0392b] hover:border-[#c0392b] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/recipes"
            aria-label="See all recipes"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 dark:border-white/10 text-stone-500 dark:text-stone-300 hover:text-[#c0392b] hover:border-[#c0392b] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ─── Cards Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ─── Featured big card (left) ─── */}
        {featured && (
          <div className="lg:col-span-7 relative">
            {/* Washi tape on top-left corner */}
            <TapeStrip
              color="yellow"
              className="absolute -top-2 left-6 z-20"
              rotate={-8}
              width="w-16"
            />
            <Link
              href={`/recipe/${featured.slug ?? featured._id}`}
              className="group relative block overflow-hidden rounded-[2rem] paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_10px_30px_-12px_rgba(120,90,40,0.25)] hover:shadow-[0_18px_40px_-12px_rgba(120,90,40,0.35)] transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-[5/3] sm:aspect-[16/9] overflow-hidden bg-stone-100 dark:bg-white/5">
                {featured.imageUrl ? (
                  <Image
                    src={featured.imageUrl}
                    alt={featuredTitle}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-500/20 dark:to-rose-500/20">
                    <ChefHat className="h-20 w-20 text-stone-400" />
                  </div>
                )}
                {/* NEW RECIPE pill */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-[#c0392b] text-white px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest shadow-sm">
                  New Recipe
                </div>
              </div>

              {/* Content */}
              <div className="px-6 md:px-8 py-6 md:py-7">
                <div className="relative inline-block">
                  <h3 className="font-title-hw text-[28px] md:text-[34px] lg:text-[38px] font-bold leading-tight text-stone-900 dark:text-stone-50 pr-6">
                    {featuredTitle}
                  </h3>
                  <span
                    className="absolute left-0 -bottom-1 h-2.5 w-full text-[#e74c3c] opacity-70 pointer-events-none"
                    aria-hidden
                  >
                    <TitleUnderline className="h-full w-full" />
                  </span>
                </div>

                <p className="mt-4 font-note-hw text-[15px] md:text-[16px] leading-relaxed text-stone-700 dark:text-stone-200 line-clamp-3 max-w-2xl">
                  {featuredDesc}
                </p>

                {/* Bottom row: meta + CTA */}
                <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-4 font-body text-[13px] font-semibold text-stone-600 dark:text-stone-300">
                    {featuredTime ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                        {featuredTime} min
                      </span>
                    ) : null}
                    {featured.difficulty && (
                      <>
                        <span className="text-stone-300 dark:text-stone-600" aria-hidden>
                          |
                        </span>
                        <span className="inline-flex items-center gap-1.5 capitalize">
                          <ChefHat className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                          {featured.difficulty}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100 group-hover:bg-[#c0392b] group-hover:text-white group-hover:border-[#c0392b] transition-colors px-5 py-2 font-title-hw text-[14px] font-bold shadow-sm">
                    View Recipe
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* "Made with love" sticky note — bottom-left corner */}
            <div
              className="hidden md:block absolute -bottom-4 -left-2 z-20 pointer-events-none"
              style={{ transform: "rotate(-6deg)" }}
              aria-hidden
            >
              <TapeStrip
                color="yellow"
                className="absolute -top-1 left-1/2 -translate-x-1/2"
                rotate={3}
                width="w-10"
              />
              <div
                className="relative px-3 py-2 max-w-[130px] shadow-[0_4px_10px_-4px_rgba(120,80,0,0.35)]"
                style={{
                  backgroundColor: "#fff3b0",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                }}
              >
                <p className="font-note-hw text-[12px] leading-tight text-amber-900 text-center font-bold">
                  made with love,
                  <br />
                  just for your family{" "}
                  <span className="text-rose-500">❤</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Right column: 3 small cards ─── */}
        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-5">
          {others.map((recipe) => {
            const rTitle =
              lf(recipe.seo?.title) || recipe.title || lf(recipe.dishName);
            const rDesc =
              lf(recipe.seo?.description) ||
              lf(recipe.description) ||
              "";
            const rTime = recipe.totalTime || recipe.cookingTime;
            return (
              <Link
                key={recipe._id}
                href={`/recipe/${recipe.slug ?? recipe._id}`}
                className="group relative flex items-stretch gap-4 paper-card rounded-2xl border border-stone-200 dark:border-white/[0.06] p-3 shadow-[0_4px_14px_-6px_rgba(120,90,40,0.18)] hover:shadow-[0_10px_24px_-8px_rgba(120,90,40,0.3)] hover:border-stone-300 dark:hover:border-white/10 transition-all"
              >
                {/* Thumb */}
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-white/5">
                  {recipe.imageUrl ? (
                    <Image
                      src={recipe.imageUrl}
                      alt={rTitle}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-500/20 dark:to-rose-500/20">
                      <ChefHat className="h-8 w-8 text-stone-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 min-w-0 flex-col justify-center py-1 pr-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-title-hw text-[16px] md:text-[17px] font-bold leading-snug text-stone-900 dark:text-stone-50 line-clamp-2 group-hover:text-[#c0392b] transition-colors">
                      {rTitle}
                    </h3>
                    {/* NEW + bookmark row (no nested button to keep <a> semantic clean) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="rounded-full bg-[#fcedeb] dark:bg-[#c0392b]/20 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-widest text-[#c0392b] dark:text-rose-300">
                        New
                      </span>
                      <Bookmark className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500 group-hover:text-[#c0392b] transition-colors" />
                    </div>
                  </div>

                  {rDesc ? (
                    <p className="mt-1 font-body text-[12.5px] text-stone-600 dark:text-stone-300 line-clamp-2 leading-snug">
                      {rDesc}
                    </p>
                  ) : null}

                  <div className="mt-2 flex items-center gap-3 font-body text-[11.5px] font-semibold text-stone-600 dark:text-stone-300">
                    {rTime ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-stone-500 dark:text-stone-400" />
                        {rTime} min
                      </span>
                    ) : null}
                    {rTime && recipe.difficulty ? (
                      <span className="text-stone-300 dark:text-stone-600" aria-hidden>
                        |
                      </span>
                    ) : null}
                    {recipe.difficulty ? (
                      <span className="inline-flex items-center gap-1 capitalize">
                        <ChefHat className="h-3 w-3 text-stone-500 dark:text-stone-400" />
                        {recipe.difficulty}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Heart-doodle decoration on hover */}
                <span
                  className="absolute top-2 right-2 h-3 w-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden
                >
                  <HeartDoodle className="h-full w-full" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
