"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChefHat,
  Clock,
  Users,
  Filter,
  Plus,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
import { RecipePlaceholder } from "@/components/recipe/RecipePlaceholder";
import { getRecipes } from "@/features/recipe/services/recipeApi";
import type { Recipe, RecipePaginationMeta } from "@/types/recipe";
import { useLang } from "@/contexts/LanguageContext";

const PAGE_SIZE = 12;

type RecipeFilter = "all" | "with-description" | "quick";

/* ───────────── Helpers ───────────── */
function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  const delta = 2;
  const left = current - delta;
  const right = current + delta;
  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = Math.max(2, left); i <= Math.min(total - 1, right); i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

// Deterministic small hash so each recipe gets a stable palette + rotation
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const CARD_PALETTES = [
  { bg: "#fbd5dd", tape: "yellow", pin: "#e11d48" }, // pink
  { bg: "#fff3b0", tape: "pink", pin: "#d97706" },   // yellow
  { bg: "#d6efce", tape: "blue", pin: "#16a34a" },   // green
  { bg: "#fde4c0", tape: "pink", pin: "#ea580c" },   // peach
  { bg: "#d6e9f5", tape: "yellow", pin: "#0284c7" }, // blue
  { bg: "#e9dafb", tape: "green", pin: "#7c3aed" },  // purple
] as const;

const ROTATIONS = [-2.5, 1.8, -1.5, 2.2, -2, 1.2, -1.8, 2.5];

/* ───────────── Decorative SVGs ───────────── */
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
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i * 0.04} />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180 + angle}) scale(${scale})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i * 0.04} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function CookingPot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <path d="M50 22 Q 48 10, 55 6 Q 60 14, 56 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M62 26 Q 60 14, 68 10 Q 72 18, 68 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 42 L 22 80 Q 22 92, 35 92 L 85 92 Q 98 92, 98 80 L 98 42 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 42 L 102 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="34" r="3" fill="currentColor" />
      <path d="M12 50 Q 4 50, 4 58 Q 4 66, 12 66" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M108 50 Q 116 50, 116 58 Q 116 66, 108 66" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 60 Q 60 56, 90 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M104 80 C 99 76, 97 72, 101 69 C 104 67, 106 69, 107 72 C 108 69, 110 67, 113 69 C 117 72, 115 76, 107 82 Z" fill="#e74c3c" opacity="0.7" />
    </svg>
  );
}

function TapeStrip({
  color = "yellow",
  className = "",
  rotate = -4,
  width = "w-12",
}: {
  color?: "yellow" | "pink" | "blue" | "green";
  className?: string;
  rotate?: number;
  width?: string;
}) {
  const bg =
    color === "pink"
      ? "rgba(251, 213, 221, 0.85)"
      : color === "blue"
      ? "rgba(214, 233, 245, 0.85)"
      : color === "green"
      ? "rgba(214, 239, 206, 0.85)"
      : "rgba(255, 243, 176, 0.85)";
  return (
    <div
      className={`${width} h-3.5 ${className}`}
      style={{
        backgroundColor: bg,
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }}
      aria-hidden
    />
  );
}

function Pushpin({ color = "#e11d48", className = "" }: { color?: string; className?: string }) {
  return (
    <span
      className={`block h-3 w-3 rounded-full shadow-md ${className}`}
      style={{
        backgroundColor: color,
        border: "1.5px solid rgba(255,255,255,0.7)",
        boxShadow: "0 2px 3px rgba(0,0,0,0.35), inset -1px -1px 2px rgba(0,0,0,0.2)",
      }}
      aria-hidden
    />
  );
}

/* ───────────── Recipe card (scrapbook polaroid) ───────────── */
function RecipeCard({ recipe, index, lf }: {
  recipe: Recipe;
  index: number;
  lf: (f: { en: string; ta?: string } | undefined | null) => string;
}) {
  const seed = hashId(recipe._id);
  const palette = CARD_PALETTES[seed % CARD_PALETTES.length];
  const rotation = ROTATIONS[(seed >> 3) % ROTATIONS.length];
  const titleEn = recipe.seo?.title?.en || recipe.title || recipe.dishName.en;
  const titleTa = recipe.seo?.title?.ta || recipe.dishName.ta;
  const displayTitle = lf({ en: titleEn, ta: titleTa });
  const time = recipe.totalTime || recipe.cookingTime;
  const categoryLabel = recipe.category ? lf(recipe.category.name) : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative pt-6"
    >
      {/* Pushpin sticking out the top */}
      <span className="absolute top-1 left-1/2 -translate-x-1/2 z-30">
        <Pushpin color={palette.pin} />
      </span>

      {/* Tape strip behind the pushpin */}
      <TapeStrip
        color={palette.tape}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20"
        rotate={-3}
        width="w-16"
      />

      <Link href={`/recipe/${recipe.slug ?? recipe._id}`} className="group block">
        <div
          className="relative rounded-[6px] p-3 pb-4 shadow-[0_12px_26px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_36px_-16px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:-translate-y-1"
          style={{
            backgroundColor: palette.bg,
            transform: `rotate(${rotation}deg)`,
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.04) 100%)",
          }}
        >
          {/* Polaroid-style image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-stone-200 rounded-[2px]">
            {recipe.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.imageUrl}
                alt={titleEn}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <RecipePlaceholder recipe={recipe} />
            )}
          </div>

          {/* Title + meta */}
          <div className="pt-3 px-1">
            <h3 className="font-title-hw text-[20px] font-bold leading-tight text-stone-900 dark:text-stone-50 line-clamp-2">
              {displayTitle}
            </h3>

            <div className="mt-2.5 flex items-center gap-3 font-body text-[12px] text-stone-700 dark:text-stone-200">
              {time != null && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {time} Mins
                </span>
              )}
              {recipe.servings != null && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {recipe.servings} People
                </span>
              )}
            </div>

            {categoryLabel && (
              <div className="mt-2 inline-flex">
                <span className="inline-flex items-center font-body text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/60 dark:bg-white/5 text-stone-700 dark:text-stone-200 border border-stone-300/60">
                  {categoryLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

/* ───────────── Skeleton card ───────────── */
function CardSkeleton({ index }: { index: number }) {
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];
  const rotation = ROTATIONS[index % ROTATIONS.length];
  return (
    <div className="relative pt-6">
      <div
        className="relative rounded-[6px] p-3 pb-4 animate-pulse"
        style={{
          backgroundColor: palette.bg,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.6,
        }}
      >
        <div className="aspect-[4/3] bg-stone-200 rounded-[2px]" />
        <div className="pt-3 px-1 space-y-2">
          <div className="h-4 w-3/4 bg-stone-300/60 rounded" />
          <div className="h-3 w-2/3 bg-stone-300/40 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ───────────── Featured recipe card (top hero strip) ───────────── */
function FeaturedRecipe({
  recipe,
  lf,
  t,
}: {
  recipe: Recipe;
  lf: (f: { en: string; ta?: string } | undefined | null) => string;
  t: (key: string, fallback: string) => string;
}) {
  const titleEn = recipe.seo?.title?.en || recipe.title || recipe.dishName.en;
  const titleTa = recipe.seo?.title?.ta || recipe.dishName.ta;
  const description =
    recipe.seo?.description?.en?.slice(0, 140) ||
    recipe.description?.en?.slice(0, 140) ||
    "";
  const time = recipe.totalTime || recipe.cookingTime;
  const region = recipe.location?.region || recipe.location?.city;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-12 rounded-[16px] overflow-hidden border border-amber-200/70 shadow-[0_10px_30px_-15px_rgba(180,140,40,0.35)]"
      style={{
        backgroundColor: "#fff5cc",
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.04) 100%)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 p-6 md:p-8 items-center relative">
        {/* Leaf decoration on the far right */}
        <div
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-3 h-28 w-14 text-amber-700/60"
          style={{ transform: "translateY(-50%) rotate(10deg)" }}
          aria-hidden
        >
          <LeafSprig className="h-full w-full" />
        </div>

        {/* Left: text */}
        <div className="md:col-span-5 space-y-3 min-w-0">
          <div className="inline-flex items-center gap-1.5 font-title-hw text-[13px] font-bold uppercase tracking-[0.18em] text-[#e74c3c]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {t("recipes.featured", "Featured Recipe")}
          </div>
          <h2 className="font-title-hw text-[28px] md:text-[34px] leading-tight text-stone-900 dark:text-stone-50">
            {lf({ en: titleEn, ta: titleTa })}
          </h2>
          {description && (
            <p className="font-body text-[14px] text-stone-700 dark:text-stone-200 leading-relaxed max-w-md">
              {description}…
            </p>
          )}

          <div className="flex flex-wrap gap-3 font-body text-[12.5px] text-stone-700 dark:text-stone-200 pt-1">
            {time != null && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {time} Mins
              </span>
            )}
            {recipe.servings != null && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {recipe.servings} People
              </span>
            )}
            {region && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {region}
              </span>
            )}
          </div>

          <Link
            href={`/recipe/${recipe.slug ?? recipe._id}`}
            className="inline-flex items-center gap-1.5 mt-3 rounded-lg bg-[#c0392b] text-white font-title-hw text-[15px] font-bold px-5 py-2 border-2 border-[#c0392b]/40 hover:bg-[#a02b1f] transition-colors shadow-[1px_2px_0_rgba(120,40,40,0.25)] active:translate-y-px active:shadow-none"
          >
            {t("recipes.viewRecipe", "View Recipe")}
          </Link>
        </div>

        {/* Middle: polaroid image */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative pt-3">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
              <Pushpin color="#e11d48" />
            </span>
            <div
              className="bg-white p-2.5 pb-6 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.4)]"
              style={{ transform: "rotate(-3deg)" }}
            >
              <div className="relative aspect-[4/3] w-[220px] md:w-[260px] overflow-hidden bg-stone-200">
                {recipe.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.imageUrl}
                    alt={titleEn}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100">
                    <ChefHat className="h-12 w-12 text-stone-400 dark:text-stone-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Grandma Tip sticky */}
        <div className="md:col-span-3 flex justify-center md:justify-start">
          <div className="relative pt-3 max-w-[200px]">
            <span className="absolute top-0 left-6 z-20">
              <Pushpin color="#16a34a" />
            </span>
            <div
              className="relative px-4 pt-4 pb-3 shadow-[0_6px_18px_-6px_rgba(60,140,60,0.35)]"
              style={{
                backgroundColor: "#d6efce",
                transform: "rotate(2.5deg)",
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
              }}
            >
              <p className="font-title-hw text-[14px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
                {t("recipes.grandmaTip", "Grandma Tip")}
              </p>
              <p className="font-note-hw text-[14px] leading-snug text-emerald-950">
                {t(
                  "recipes.grandmaTipText",
                  "Use gingelly oil for that authentic Kongu Nadu flavor!"
                )}
              </p>
              <p className="text-center mt-1 text-base">😊</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ───────────── Pagination (notebook style) ───────────── */
function NotebookPagination({
  pagination,
  onPageChange,
  t,
}: {
  pagination: RecipePaginationMeta;
  onPageChange: (page: number) => void;
  t: (key: string, fallback: string) => string;
}) {
  const { page: currentPage, pages: totalPages, total, limit } = pagination;
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div
      className="relative mt-14 rounded-[16px] border border-stone-200/80 shadow-[0_6px_18px_-12px_rgba(120,90,40,0.18)] overflow-hidden"
      style={{
        backgroundColor: "var(--ns-nav-bg, #fffdf6)",
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0, transparent 28px, rgba(120,90,40,0.06) 28px, rgba(120,90,40,0.06) 29px)",
      }}
    >
      {/* Spiral binding holes */}
      <div className="hidden md:flex absolute top-0 bottom-0 left-2 w-4 flex-col items-center justify-evenly py-3 pointer-events-none" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="block h-2.5 w-2.5 rounded-full bg-stone-200 ring-2 ring-stone-300/60 shadow-inner"
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 md:pl-12 md:pr-6 py-4">
        {/* Showing */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block h-10 w-7 text-lime-600" aria-hidden>
            <LeafSprig className="h-full w-full" />
          </span>
          <p className="font-body text-[13.5px] text-stone-700 dark:text-stone-200">
            {t("recipes.showing", "Showing")}{" "}
            <span className="font-bold text-stone-900 dark:text-stone-50">
              {from}–{to}
            </span>{" "}
            {t("recipes.of", "of")}{" "}
            <span className="font-bold text-stone-900 dark:text-stone-50">{total}</span>{" "}
            {t("recipes.recipes", "recipes")}
          </p>
        </div>

        {/* Pages */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-title-hw text-[14px] font-bold text-stone-700 dark:text-stone-200 bg-white/70 dark:bg-white/5 border border-stone-300 dark:border-white/10 hover:border-[#e74c3c] hover:text-[#e74c3c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {t("recipes.prev", "Prev")}
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span
                  key={`e-${idx}`}
                  className="px-1 font-body text-stone-500 dark:text-stone-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`h-9 min-w-9 px-2.5 rounded-md font-title-hw text-[15px] font-bold transition-all ${
                    p === currentPage
                      ? "bg-[#c0392b] text-white shadow-[1px_2px_0_rgba(120,40,40,0.25)]"
                      : "text-stone-700 dark:text-stone-200 hover:bg-amber-100/70"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            disabled={!hasNext}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-title-hw text-[14px] font-bold text-stone-700 dark:text-stone-200 bg-white/70 dark:bg-white/5 border border-stone-300 dark:border-white/10 hover:border-[#e74c3c] hover:text-[#e74c3c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            {t("recipes.next", "Next")}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Happy Cooking sticky */}
        <div className="hidden md:block relative pt-3">
          <TapeStrip
            color="pink"
            className="absolute -top-1 left-2 z-20"
            rotate={-4}
            width="w-10"
          />
          <div
            className="relative px-3 py-2 shadow-[0_4px_10px_-3px_rgba(180,140,0,0.3)]"
            style={{
              backgroundColor: "#fff3b0",
              transform: "rotate(2deg)",
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
            }}
          >
            <p className="font-note-hw text-[13px] font-bold text-amber-900 leading-tight">
              {t("recipes.happyCooking", "Happy Cooking!")} 😊
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Page content ───────────── */
function RecipesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t: tRaw, lf } = useLang();

  // Safe translation with fallback
  const t = (key: string, fallback: string) => {
    try {
      const v = tRaw(key);
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  const urlQuery = searchParams.get("q") ?? "";
  const urlFilter = searchParams.get("filter");
  const activeFilter: RecipeFilter =
    urlFilter === "with-description" || urlFilter === "quick" ? urlFilter : "all";
  const currentPage = Number(searchParams.get("page")) || 1;

  const updateUrl = useCallback(
    (updates: Record<string, string | number | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, String(v));
      }
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const [query, setQuery] = useState(urlQuery);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<RecipePaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (urlQuery !== query) setQuery(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === urlQuery) return;
    const timeout = setTimeout(() => {
      updateUrl({ q: trimmed || null, page: 1 });
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, urlQuery, updateUrl]);

  const loadRecipes = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const result = await getRecipes({
        page: currentPage,
        limit: PAGE_SIZE,
        search: urlQuery || undefined,
      });
      setRecipes(result.data);
      setPagination(result.pagination ?? null);
    } catch {
      setError("Failed to load recipes. Please try again later.");
      setRecipes([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, urlQuery]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const filteredRecipes = useMemo(() => {
    if (activeFilter === "with-description") {
      return recipes.filter((r) =>
        Boolean(r.seo?.description?.en?.trim() || r.description?.en?.trim())
      );
    }
    if (activeFilter === "quick") {
      return recipes.filter((r) => (r.ingredients?.length ?? 0) <= 6);
    }
    return recipes;
  }, [recipes, activeFilter]);

  const handlePageChange = (page: number) => {
    updateUrl({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Featured: first recipe of current page (only on page 1, no search)
  const showFeatured =
    currentPage === 1 && !urlQuery && filteredRecipes.length > 0;
  const featured = showFeatured ? filteredRecipes[0] : null;
  const gridRecipes = featured ? filteredRecipes.slice(1) : filteredRecipes;

  const FILTERS = [
    { id: "all", label: t("recipes.allRecipes", "All Recipes"), icon: Sparkles },
    { id: "with-description", label: t("recipes.detailed", "Detailed"), icon: Filter },
    { id: "quick", label: t("recipes.quick", "Quick"), icon: Clock },
  ] as const;

  return (
    <main className="paper-bg min-h-screen font-ui text-stone-900 dark:text-stone-50 pt-28 pb-16 px-4 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* ─── Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          {/* Left: title */}
          <div className="flex items-start gap-3 min-w-0">
            <span className="hidden md:inline-block h-16 w-20 text-stone-400 dark:text-stone-500 shrink-0 -mt-1" aria-hidden>
              <CookingPot className="h-full w-full" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-title-hw text-[40px] md:text-[48px] font-bold leading-tight text-stone-900 dark:text-stone-50">
                  {t("recipes.title", "All Recipes")}
                </h1>
                <span className="h-7 w-7 text-[#e74c3c] -ml-1" aria-hidden>
                  <HeartDoodle className="h-full w-full" />
                </span>
              </div>
              <p className="font-body text-[14.5px] text-stone-700 dark:text-stone-200 max-w-md mt-1 leading-relaxed">
                {t(
                  "recipes.subtitle",
                  "Discover traditional flavors and modern favorites from our collection of tried and loved recipes."
                )}
              </p>
            </div>
          </div>

          {/* Right: search + create */}
          <div className="flex items-center gap-3 w-full lg:w-auto lg:max-w-md">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("recipes.searchPlaceholder", "Search recipes, ingredients…")}
                className="w-full rounded-xl border-2 border-stone-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/5 py-2.5 pl-10 pr-10 font-body text-sm font-medium text-stone-900 dark:text-stone-50 placeholder-stone-400 outline-none focus:border-[#e74c3c] transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-[#e74c3c] transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <Link
              href="/recipes/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#c0392b] text-white font-title-hw text-[14.5px] font-bold px-4 py-2.5 border-2 border-[#c0392b]/40 hover:bg-[#a02b1f] transition-colors shadow-[1px_2px_0_rgba(120,40,40,0.25)] active:translate-y-px active:shadow-none shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("recipes.create", "Create")}</span>
            </Link>
          </div>
        </div>

        {/* ─── Filter chips row ─── */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
          {FILTERS.map(({ id, label, icon: Icon }) => {
            const isActive = activeFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  updateUrl({
                    filter: id === "all" ? null : id,
                    page: 1,
                  })
                }
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-title-hw text-[14px] font-bold border-2 transition-all shrink-0 ${
                  isActive
                    ? "bg-[#c0392b] text-white border-[#c0392b]/40 shadow-[1px_2px_0_rgba(120,40,40,0.25)]"
                    : "bg-white/80 dark:bg-white/5 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-white/[0.06] hover:border-[#e74c3c] hover:text-[#e74c3c]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* ─── Featured ─── */}
        {!loading && !error && featured && (
          <FeaturedRecipe recipe={featured} lf={lf} t={t} />
        )}

        {/* ─── Status (when searching) ─── */}
        {!loading && !error && pagination && urlQuery && (
          <p className="font-body text-[14px] text-stone-600 dark:text-stone-300 mb-6">
            <span className="font-bold text-stone-900 dark:text-stone-50">{pagination.total}</span>{" "}
            {t("recipes.resultsFor", "result(s) for")}{" "}
            <span className="font-bold">&ldquo;{urlQuery}&rdquo;</span>
          </p>
        )}

        {/* ─── Grid ─── */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : error ? (
            <div className="py-12">
              <ErrorMessage message={error} />
            </div>
          ) : gridRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-stone-400 dark:text-stone-500" />
              </div>
              <h3 className="font-title-hw text-[22px] font-bold mb-2 text-stone-800 dark:text-stone-100">
                {t("recipes.noResults", "No recipes found")}
              </h3>
              <p className="font-body text-stone-500 dark:text-stone-400 max-w-xs">
                {t(
                  "recipes.noResultsMsg",
                  "Try adjusting your search query or filters."
                )}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {gridRecipes.map((recipe, idx) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    index={idx}
                    lf={lf}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>

        {/* ─── Pagination ─── */}
        {pagination && pagination.pages > 1 && (
          <NotebookPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            t={t}
          />
        )}
      </div>
    </main>
  );
}

/* ───────────── Suspense boundary ───────────── */
export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="paper-bg min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <RecipesPageContent />
    </Suspense>
  );
}
