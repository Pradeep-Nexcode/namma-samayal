"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Heart,
  Sparkles,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ChevronDown,
  LayoutGrid,
  List,
  ArrowRight,
  Filter,
} from "lucide-react";
import { CreateIngredientModal } from "@/components/ingredients/CreateIngredientModal";
import {
  createIngredient,
  getIngredients,
} from "@/features/ingredient/services/ingredientApi";
import {
  getCategories,
  getSubcategoriesByParent,
} from "@/features/category/services/categoryApi";
import { useLang } from "@/contexts/LanguageContext";
import type { Category } from "@/types/category";
import type {
  Ingredient,
  IngredientCreateInput,
  PaginationMeta,
} from "@/types/ingredient";

const PAGE_SIZE = 24;

/* ─── Helpers ─────────────────────────────────────────────────── */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

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

const CARD_PALETTES = [
  { bg: "#fff7d6", pin: "#d97706" }, // light yellow
  { bg: "#fce4e8", pin: "#e11d48" }, // light pink
  { bg: "#e2f0e1", pin: "#16a34a" }, // light green
  { bg: "#fbe4c8", pin: "#ea580c" }, // light peach
  { bg: "#e1ecf6", pin: "#0284c7" }, // light blue
  { bg: "#ece1f6", pin: "#7c3aed" }, // light purple
] as const;

const CARD_ROTATIONS = [-1.5, 1.2, -1, 1.5, -1.8, 0.8, -1.2, 1.4];

const POPULAR_SEARCHES = [
  "Turmeric",
  "Basmati Rice",
  "Coconut",
  "Curry Leaves",
  "Black Pepper",
];

/* ─── Inline decorative SVGs ──────────────────────────────────── */
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
      <path d="M50 195 Q 47 100, 50 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
      {[
        [170, 1.05, 22],
        [140, 1.0, 28],
        [110, 0.9, 34],
        [80, 0.78, 42],
        [55, 0.6, 50],
      ].map(([y, s, a], i) => (
        <g key={i}>
          <g transform={`translate(50, ${y}) rotate(${-a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i * 0.04} />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180 + a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i * 0.04} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function Pushpin({ color = "#e11d48", className = "" }: { color?: string; className?: string }) {
  return (
    <span
      className={`block h-3 w-3 rounded-full ${className}`}
      style={{
        backgroundColor: color,
        border: "1.5px solid rgba(255,255,255,0.75)",
        boxShadow:
          "0 3px 4px rgba(0,0,0,0.35), inset -1.5px -1.5px 2px rgba(0,0,0,0.22)",
      }}
      aria-hidden
    />
  );
}

function TapeStrip({
  className = "",
  rotate = -4,
  width = "w-12",
  color = "rgba(255,243,176,0.85)",
}: {
  className?: string;
  rotate?: number;
  width?: string;
  color?: string;
}) {
  return (
    <div
      className={`${width} h-3.5 ${className}`}
      style={{
        backgroundColor: color,
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }}
      aria-hidden
    />
  );
}

/* ─── Ingredient pinboard card ────────────────────────────────── */
function IngredientCard({
  ingredient,
  index,
  saved,
  onToggleSave,
  lf,
}: {
  ingredient: Ingredient;
  index: number;
  saved: boolean;
  onToggleSave: (id: string) => void;
  lf: (f: { en: string; ta?: string } | undefined | null) => string;
}) {
  const seed = hashId(ingredient._id);
  const palette = CARD_PALETTES[seed % CARD_PALETTES.length];
  const rotation = CARD_ROTATIONS[(seed >> 3) % CARD_ROTATIONS.length];
  const name = lf(ingredient.name);
  const categoryLabel = ingredient.category?.name
    ? lf(ingredient.category.name)
    : null;
  // Try to derive a "characteristic" (first tag) and "origin" (subCategory name) from the data
  const characteristic = ingredient.tags?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative pt-5"
    >
      {/* Pushpin */}
      <span className="absolute top-0.5 left-1/2 -translate-x-1/2 z-30">
        <Pushpin color={palette.pin} />
      </span>

      <Link
        href={`/ingredient/${ingredient.slug ?? ingredient._id}`}
        className="group block focus:outline-none"
        aria-label={name}
      >
        <div
          className="relative rounded-[6px] px-3.5 pt-5 pb-4 shadow-[0_10px_22px_-12px_rgba(0,0,0,0.25)] group-hover:shadow-[0_16px_30px_-14px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:-translate-y-1"
          style={{
            backgroundColor: palette.bg,
            transform: `rotate(${rotation}deg)`,
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.04) 100%)",
          }}
        >
          {/* Save / favorite button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(ingredient._id);
            }}
            aria-label={saved ? "Remove from saved" : "Save ingredient"}
            className={`absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
              saved
                ? "bg-rose-100 text-rose-500"
                : "bg-white/70 dark:bg-white/5 text-stone-500 dark:text-stone-400 hover:bg-white"
            }`}
          >
            {saved ? (
              <Heart className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Ingredient image */}
          <div className="relative w-full aspect-[5/4] flex items-center justify-center overflow-hidden">
            {ingredient.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ingredient.imageUrl}
                alt={name}
                loading="lazy"
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-stone-600/40">
                <Leaf className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* Name + category */}
          <div className="mt-3 px-1 text-center">
            <h3 className="font-title-hw text-[18px] md:text-[19px] font-bold leading-tight text-stone-900 dark:text-stone-50 line-clamp-1">
              {name}
            </h3>
            {categoryLabel && (
              <p className="font-body text-[10.5px] font-bold uppercase tracking-[0.16em] text-stone-700 dark:text-stone-200 mt-1">
                {categoryLabel}
              </p>
            )}
          </div>

          {/* Bottom row: characteristic + origin chip */}
          {(characteristic || ingredient.subCategory) && (
            <div className="mt-3 pt-2 border-t border-stone-300/40 flex items-center justify-between gap-2 font-body text-[11px] text-stone-700 dark:text-stone-200">
              {characteristic && (
                <span className="inline-flex items-center gap-1 truncate">
                  <Leaf className="h-3 w-3 text-emerald-700 shrink-0" />
                  {characteristic}
                </span>
              )}
              {ingredient.subCategory && (
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 text-stone-500 dark:text-stone-400 shrink-0" />
                  {lf(ingredient.subCategory.name)}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

/* ─── Browse-by-category horizontal row ───────────────────────── */
function BrowseCategoryStrip({
  categories,
  activeCategoryId,
  onSelect,
  lf,
}: {
  categories: Category[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
  lf: (f: { en: string; ta?: string } | undefined | null) => string;
}) {
  const palettes = [
    "linear-gradient(160deg, #fce4e8 0%, #fff7d6 100%)", // pink-yellow
    "linear-gradient(160deg, #e2f0e1 0%, #fff7d6 100%)", // green-yellow
    "linear-gradient(160deg, #fff7d6 0%, #fbe4c8 100%)", // yellow-peach
    "linear-gradient(160deg, #e2f0e1 0%, #e1ecf6 100%)", // green-blue
    "linear-gradient(160deg, #ece1f6 0%, #fce4e8 100%)", // purple-pink
    "linear-gradient(160deg, #fbe4c8 0%, #fce4e8 100%)", // peach-pink
  ];
  const PLACEHOLDER_COUNTS = [128, 64, 48, 86, 72, 54];

  return (
    <div className="relative">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 -mx-2 px-2 scroll-smooth snap-x">
        {categories.map((cat, i) => {
          const isActive = cat._id === activeCategoryId;
          return (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelect(isActive ? "All" : cat._id)}
              className={`shrink-0 snap-start text-left rounded-[10px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg w-[180px] md:w-[200px] ${
                isActive ? "ring-2 ring-[#e74c3c] shadow-lg" : ""
              }`}
              style={{ backgroundImage: palettes[i % palettes.length] }}
            >
              <div className="px-4 pt-5 pb-4 flex flex-col items-center">
                <div className="h-20 w-20 md:h-24 md:w-24 flex items-center justify-center text-stone-700/70 mb-3">
                  {/* Use a leaf placeholder; in production this could be a category image */}
                  <Leaf className="h-12 w-12" />
                </div>
                <p className="font-title-hw text-[17px] md:text-[18px] font-bold text-stone-900 dark:text-stone-50 text-center leading-tight line-clamp-1">
                  {lf(cat.name)}
                </p>
                <p className="font-body text-[12px] text-stone-700 dark:text-stone-200 mt-1">
                  {PLACEHOLDER_COUNTS[i % PLACEHOLDER_COUNTS.length]} Ingredients
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right scroll hint */}
      <div className="absolute right-0 top-0 bottom-0 hidden md:flex items-center pointer-events-none pl-8 bg-gradient-to-l from-[var(--ns-nav-bg,#fffdf6)] to-transparent w-12">
        <ChevronRight className="h-5 w-5 text-stone-400 dark:text-stone-500" />
      </div>
    </div>
  );
}

/* ─── Notebook pagination (reused pattern) ────────────────────── */
function NotebookPagination({
  pagination,
  onPageChange,
  ts,
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  ts: (key: string, fallback: string) => string;
}) {
  const { page: currentPage, pages: totalPages, total, limit } = pagination;
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-center gap-4">
      <div className="flex items-center gap-1.5 justify-center">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-title-hw text-[14px] font-bold text-stone-700 dark:text-stone-200 bg-white/70 dark:bg-white/5 border border-stone-300 dark:border-white/10 hover:border-[#e74c3c] hover:text-[#e74c3c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {ts("recipes.prev", "Prev")}
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) =>
            p === "..." ? (
              <span key={`e-${idx}`} className="px-1 font-body text-stone-500 dark:text-stone-400">
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
          {ts("recipes.next", "Next")}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="font-body text-[13px] text-stone-600 dark:text-stone-300 text-center md:text-left md:ml-4">
        {ts("ingredients.showing", "Showing")}{" "}
        <span className="font-bold text-stone-900 dark:text-stone-50">
          {from}–{to}
        </span>{" "}
        {ts("ingredients.of", "of")}{" "}
        <span className="font-bold text-stone-900 dark:text-stone-50">{total}</span>{" "}
        {ts("ingredients.ingredients", "ingredients")}
      </p>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function IngredientsPage() {
  const { t, lf } = useLang();

  const ts = (key: string, fallback: string) => {
    try {
      const v = t(key);
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  const [items, setItems] = useState<Ingredient[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryId, setCategoryId] = useState("All");
  const [subCategoryId, setSubCategoryId] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"popular" | "az" | "newest">("popular");

  // Load saved ingredient ids from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("ns_saved_ingredients");
      if (raw) setSavedIds(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(
          "ns_saved_ingredients",
          JSON.stringify(Array.from(next))
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, categoryId, subCategoryId, sortBy]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories({ level: 0, limit: 100 });
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId === "All") {
      setSubCategories([]);
      setSubCategoryId("All");
      return;
    }
    setSubCategoryId("All");
    const loadSubCategories = async () => {
      try {
        const data = await getSubcategoriesByParent(categoryId);
        setSubCategories(data);
      } catch {
        setSubCategories([]);
      }
    };
    loadSubCategories();
  }, [categoryId]);

  const loadIngredients = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);
      const result = await getIngredients({
        search: debouncedQuery || undefined,
        category: categoryId === "All" ? undefined : categoryId,
        subCategory: subCategoryId === "All" ? undefined : subCategoryId,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setItems(result.data);
      setPagination(result.pagination ?? null);
    } catch {
      setError("Failed to load ingredients from API.");
      setItems([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, categoryId, subCategoryId, currentPage]);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  // Client-side sort within the current page result
  const displayedItems = useMemo(() => {
    const arr = items.slice();
    if (sortBy === "az") {
      arr.sort((a, b) =>
        (a.name?.en || "").localeCompare(b.name?.en || "")
      );
    } else if (sortBy === "newest") {
      arr.sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || "")
      );
    }
    return arr;
  }, [items, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateIngredient = async (
    payload: IngredientCreateInput,
    imageFile?: File | null
  ) => {
    setIsCreating(true);
    try {
      await createIngredient(payload, imageFile);
      await loadIngredients();
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="paper-bg min-h-screen font-ui text-stone-900 dark:text-stone-50 pt-28 pb-16">
      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-8">
        {/* ─── HERO ─── */}
        <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Left: title block */}
          <div className="lg:col-span-7 space-y-4 lg:pr-6 pt-2">
            <div className="flex items-center gap-1.5 font-title-hw text-[12.5px] md:text-[13.5px] font-bold uppercase tracking-[0.18em] text-[#e74c3c]">
              <span className="text-[14px]" aria-hidden>🌶</span>
              {ts("ingredients.libraryOverline", "Ingredient Library")}
            </div>
            <div className="relative inline-block">
              <h1 className="font-title-hw text-[44px] md:text-[58px] lg:text-[64px] font-bold leading-[1.04] text-stone-900 dark:text-stone-50">
                {ts("ingredients.heroTitle1", "The Chef's")}{" "}
                <span className="text-[#e74c3c]">
                  {ts("ingredients.heroTitle2", "Pantry")}
                </span>
              </h1>
            </div>
            <p className="font-body text-[14.5px] md:text-[15.5px] text-stone-700 dark:text-stone-200 leading-relaxed max-w-xl">
              {ts(
                "ingredients.heroDesc",
                "Explore our curated collection of high-quality ingredients. From mountain-grown spices to locally sourced vegetables, find the building blocks for your next culinary adventure."
              )}
            </p>
          </div>

          {/* Right: "Add new ingredient" CTA tape */}
          <div className="lg:col-span-5 flex lg:justify-end items-start pt-4 lg:pt-12">
            <div className="relative">
              {/* Heart accent */}
              <span
                className="absolute -top-3 -right-2 h-5 w-5 text-rose-500 z-30"
                aria-hidden
              >
                <HeartDoodle className="h-full w-full" />
              </span>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="relative inline-flex items-center gap-2 px-5 py-3 font-title-hw text-[15.5px] font-bold text-stone-900 dark:text-stone-50 shadow-[0_6px_14px_-6px_rgba(180,140,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                style={{
                  backgroundColor: "rgba(255, 243, 176, 0.95)",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                  transform: "rotate(-1.5deg)",
                }}
              >
                <Plus className="h-4 w-4" />
                {ts("ingredients.addNew", "Add New Ingredient")}
              </button>
            </div>
          </div>
        </section>

        {/* ─── SEARCH + FILTERS card ─── */}
        <section
          className="relative rounded-[16px] border border-stone-200/80 shadow-[0_8px_22px_-12px_rgba(120,90,40,0.18)] p-4 md:p-5 mb-10"
          style={{
            backgroundColor: "var(--ns-nav-bg, #fffdf6)",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 28px, rgba(120,90,40,0.05) 28px, rgba(120,90,40,0.05) 29px)",
          }}
        >
          <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr] items-stretch">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ts(
                  "ingredients.searchPlaceholder",
                  "Search ingredients by name, category, or origin…"
                )}
                className="w-full rounded-lg bg-white/70 dark:bg-white/5 border-2 border-stone-200 dark:border-white/[0.06] py-2.5 pl-10 pr-10 font-body text-[14px] font-medium text-stone-900 dark:text-stone-50 placeholder-stone-400 outline-none focus:border-[#e74c3c] transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-[#e74c3c] transition-colors"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none rounded-lg bg-white/70 dark:bg-white/5 border-2 border-stone-200 dark:border-white/[0.06] py-2.5 pl-3.5 pr-9 font-body text-[14px] font-medium text-stone-800 dark:text-stone-100 outline-none focus:border-[#e74c3c] transition-colors cursor-pointer"
              >
                <option value="All">{ts("ingredients.allCategories", "All Categories")}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {lf(c.name)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 dark:text-stone-400 pointer-events-none" />
            </div>

            {/* Subcategory */}
            <div className="relative">
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                disabled={subCategories.length === 0}
                className="w-full appearance-none rounded-lg bg-white/70 dark:bg-white/5 border-2 border-stone-200 dark:border-white/[0.06] py-2.5 pl-3.5 pr-9 font-body text-[14px] font-medium text-stone-800 dark:text-stone-100 outline-none focus:border-[#e74c3c] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="All">{ts("ingredients.allSubcategories", "All Subcategories")}</option>
                {subCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {lf(c.name)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 dark:text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Popular searches */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="font-body text-[12.5px] font-semibold text-stone-600 dark:text-stone-300">
              {ts("ingredients.popularSearches", "Popular Searches")}:
            </span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-white/5 border border-stone-200 dark:border-white/[0.06] px-2.5 py-1 font-body text-[11.5px] font-semibold text-stone-700 dark:text-stone-200 hover:border-[#e74c3c] hover:text-[#e74c3c] transition-colors"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                {term}
              </button>
            ))}
          </div>
        </section>

        {/* ─── BROWSE BY CATEGORY ─── */}
        {categories.length > 0 && (
          <section className="mb-10">
            <div className="flex items-end justify-between mb-4">
              <h2 className="relative font-title-hw text-[24px] md:text-[26px] font-bold text-stone-900 dark:text-stone-50 inline-block">
                {ts("ingredients.browseCategory", "Browse by Category")}
                <span
                  className="absolute left-0 right-4 -bottom-1 h-1 bg-[#e74c3c] rounded-full opacity-80"
                  aria-hidden
                />
              </h2>
              <Link
                href="/explore"
                className="hidden md:inline-flex items-center gap-1.5 font-title-hw text-[15px] font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors group"
              >
                {ts("ingredients.viewAllCategories", "View All Categories")}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <BrowseCategoryStrip
              categories={categories.slice(0, 8)}
              activeCategoryId={categoryId}
              onSelect={setCategoryId}
              lf={lf}
            />
          </section>
        )}

        {/* ─── INGREDIENTS GRID HEADER ─── */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <p className="font-body text-[14px] text-stone-700 dark:text-stone-200">
            <span className="font-bold text-stone-900 dark:text-stone-50">
              {pagination?.total ?? items.length}
            </span>{" "}
            {ts("ingredients.found", "ingredients found")}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-body text-[13px] text-stone-600 dark:text-stone-300">
                {ts("ingredients.sortBy", "Sort by")}:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "popular" | "az" | "newest")
                  }
                  className="appearance-none rounded-md border border-stone-200 dark:border-white/[0.06] bg-white/70 dark:bg-white/5 px-3 pr-8 py-1.5 font-body text-[13px] font-semibold text-stone-800 dark:text-stone-100 outline-none cursor-pointer hover:border-[#e74c3c] transition-colors"
                >
                  <option value="popular">
                    {ts("ingredients.sortPopular", "Popular")}
                  </option>
                  <option value="az">
                    {ts("ingredients.sortAZ", "A → Z")}
                  </option>
                  <option value="newest">
                    {ts("ingredients.sortNewest", "Newest")}
                  </option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 dark:text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-md border border-stone-200 dark:border-white/[0.06] bg-white/70 dark:bg-white/5 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#e74c3c]/15 text-[#e74c3c]"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-800"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-[#e74c3c]/15 text-[#e74c3c]"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-800"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── BODY ─── */}
        <section>
          {isLoading ? (
            <div
              className={`grid gap-x-5 gap-y-10 ${
                viewMode === "list"
                  ? "grid-cols-1"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              }`}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="relative pt-5 animate-pulse"
                >
                  <div
                    className="rounded-[6px] aspect-[5/6]"
                    style={{
                      backgroundColor: CARD_PALETTES[i % CARD_PALETTES.length].bg,
                      opacity: 0.4,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              className="text-center py-12 rounded-2xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/15 font-body text-rose-700 dark:text-rose-300"
            >
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-60" />
              {error}
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-stone-400 dark:text-stone-500" />
              </div>
              <h3 className="font-title-hw text-[22px] font-bold mb-2 text-stone-800 dark:text-stone-100">
                {ts("ingredients.noResults", "No ingredients found")}
              </h3>
              <p className="font-body text-stone-500 dark:text-stone-400 max-w-xs">
                {ts(
                  "ingredients.noResultsMsg",
                  "Try a different search query or filter."
                )}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div
                className={`grid gap-x-5 gap-y-10 ${
                  viewMode === "list"
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                }`}
              >
                {displayedItems.map((ing, i) => (
                  <IngredientCard
                    key={ing._id}
                    ingredient={ing}
                    index={i}
                    saved={savedIds.has(ing._id)}
                    onToggleSave={toggleSave}
                    lf={lf}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>

        {/* ─── PAGINATION ─── */}
        {pagination && pagination.pages > 1 && (
          <NotebookPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            ts={ts}
          />
        )}

        {/* ─── BOTTOM TRUST STRIP ─── */}
        <section className="relative mt-14 rounded-[16px] border border-stone-200/80 shadow-[0_8px_22px_-12px_rgba(120,90,40,0.18)] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "var(--ns-nav-bg, #fffdf6)",
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 28px, rgba(120,90,40,0.05) 28px, rgba(120,90,40,0.05) 29px)",
            }}
          />

          {/* Left curry-leaf sprig */}
          <div
            className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 h-20 w-12 text-lime-700 opacity-70 pointer-events-none"
            style={{ transform: "translateY(-50%) rotate(-14deg)" }}
            aria-hidden
          >
            <LeafSprig className="h-full w-full" />
          </div>
          {/* Right curry-leaf sprig */}
          <div
            className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 h-20 w-12 text-lime-700 opacity-70 pointer-events-none"
            style={{ transform: "translateY(-50%) rotate(14deg)" }}
            aria-hidden
          >
            <LeafSprig className="h-full w-full" flip />
          </div>

          <div className="relative flex flex-wrap items-center gap-4 md:gap-6 px-4 md:px-12 py-5">
            {/* Pink "Good ingredients" sticky on the left */}
            <div className="relative pt-2 hidden md:block">
              <TapeStrip
                color="rgba(214, 233, 245, 0.85)"
                className="absolute -top-1 left-3 z-10"
                rotate={-6}
                width="w-10"
              />
              <div
                className="relative px-3 pt-3 pb-2.5 max-w-[160px] shadow-[0_6px_14px_-6px_rgba(220,80,90,0.3)]"
                style={{
                  backgroundColor: "#fbd5dd",
                  transform: "rotate(-3deg)",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                }}
              >
                <p className="font-note-hw text-[13.5px] leading-snug text-rose-950 font-bold">
                  {ts(
                    "ingredients.goodSticky",
                    "Good ingredients make great recipes"
                  )}
                </p>
                <p className="text-right text-sm mt-0.5">😊</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3 min-w-0">
              {[
                {
                  icon: <CheckCircle2 className="h-5 w-5" />,
                  tint: "bg-emerald-100 text-emerald-700",
                  title: ts("ingredients.trustNaturalTitle", "100% Natural"),
                  sub: ts(
                    "ingredients.trustNaturalSub",
                    "No artificial additives"
                  ),
                },
                {
                  icon: <ShieldCheck className="h-5 w-5" />,
                  tint: "bg-amber-100 text-amber-700",
                  title: ts(
                    "ingredients.trustTrustedTitle",
                    "Trusted Sources"
                  ),
                  sub: ts(
                    "ingredients.trustTrustedSub",
                    "From verified farmers"
                  ),
                },
                {
                  icon: <Sparkles className="h-5 w-5" />,
                  tint: "bg-rose-100 text-rose-600 dark:text-rose-400",
                  title: ts(
                    "ingredients.trustQualityTitle",
                    "Quality Guaranteed"
                  ),
                  sub: ts("ingredients.trustQualitySub", "Carefully selected"),
                },
              ].map((b) => (
                <div key={b.title} className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${b.tint} shadow-sm`}
                    aria-hidden
                  >
                    {b.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-title-hw text-[15.5px] md:text-[16px] font-bold leading-tight text-stone-900 dark:text-stone-50 truncate">
                      {b.title}
                    </p>
                    <p className="font-body text-[12px] text-stone-600 dark:text-stone-300 truncate mt-0.5">
                      {b.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Yellow "Happy Cooking!" sticky on the right */}
            <div className="relative pt-2 hidden md:block">
              <TapeStrip
                color="rgba(251, 213, 221, 0.85)"
                className="absolute -top-1 right-3 z-10"
                rotate={4}
                width="w-10"
              />
              <div
                className="relative px-3 pt-3 pb-2.5 max-w-[150px] shadow-[0_6px_14px_-6px_rgba(180,140,0,0.3)]"
                style={{
                  backgroundColor: "#fff3b0",
                  transform: "rotate(3deg)",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                }}
              >
                <p className="font-note-hw text-[14px] leading-snug text-amber-900 font-bold flex items-center gap-1">
                  {ts("ingredients.happyCooking", "Happy Cooking!")}{" "}
                  <span className="text-rose-500">❤</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Create modal — unchanged */}
      <CreateIngredientModal
        isOpen={isCreateOpen}
        onClose={() => {
          if (!isCreating) setIsCreateOpen(false);
        }}
        onCreate={handleCreateIngredient}
        isSubmitting={isCreating}
      />
    </main>
  );
}
