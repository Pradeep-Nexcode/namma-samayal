"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChefHat,
  Clock,
  BarChart3,
  Sparkles,
  Plus,
  ArrowRight,
  Filter,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
import { getRecipes } from "@/features/recipe/services/recipeApi";
import type { Recipe, RecipePaginationMeta } from "@/types/recipe";

const PAGE_SIZE = 12;

type RecipeFilter = "all" | "with-description" | "quick";

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

interface PaginationProps {
  pagination: RecipePaginationMeta;
  onPageChange: (page: number) => void;
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page: currentPage, pages: totalPages, total, limit } = pagination;
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-16 flex flex-col items-center gap-5">
      <p className="text-sm font-medium text-gray-500">
        Showing{" "}
        <span className="font-bold text-gray-300">{from}–{to}</span> of{" "}
        <span className="font-bold text-gray-300">{total}</span> recipes
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#e74c3c]/40 hover:bg-[#e74c3c]/10 hover:text-[#e74c3c] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5 disabled:hover:text-gray-400"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-10 w-10 items-center justify-center text-sm text-gray-600"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-all ${
                p === currentPage
                  ? "border-[#e74c3c] bg-[#e74c3c] text-white shadow-[0_4px_20px_rgba(231,76,60,0.4)]"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-[#e74c3c]/40 hover:bg-[#e74c3c]/10 hover:text-[#e74c3c]"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#e74c3c]/40 hover:bg-[#e74c3c]/10 hover:text-[#e74c3c] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-white/5 disabled:hover:text-gray-400"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RecipesPageContent() {
  // URL is the source of truth for search/filter/page — refresh & back/forward safe
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    [router, pathname, searchParams],
  );

  // Local input state for snappy typing UX; debounced to URL
  const [query, setQuery] = useState(urlQuery);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<RecipePaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync external URL changes (back/forward, bookmarked links) into the input
  useEffect(() => {
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // Debounce input → URL (resets page to 1 when search actually changes)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === urlQuery) return;
    const t = setTimeout(() => {
      updateUrl({ q: trimmed || null, page: 1 });
    }, 400);
    return () => clearTimeout(t);
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

  // Client-side tab filters applied on top of the current page
  const filteredRecipes = useMemo(() => {
    if (activeFilter === "with-description") {
      return recipes.filter((r) => Boolean(r.description?.en?.trim()));
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

  return (
    <div className="min-h-screen bg-[#0b0b0b] font-sans text-white pt-28 pb-20">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#e74c3c]/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-bold text-[#e74c3c] backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              THE CULINARY ARCHIVE
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">
              Discover Your <br />
              Next <span className="text-[#e74c3c]">Masterpiece</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl font-medium">
              Explore a curated collection of authentic recipes, from traditional family secrets to modern culinary innovations.
            </p>
          </div>

          <Link
            href="/recipes/create"
            className="group relative inline-flex h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[#e74c3c] px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#e74c3c]/20 transition-all hover:bg-[#c0392b] hover:-translate-y-1 active:scale-95 shrink-0"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            Create Recipe
          </Link>
        </div>

        {/* Search & Filters */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#e74c3c] transition-colors" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, ingredients..."
                className="w-full rounded-2xl bg-white/5 border border-white/10 py-3.5 pl-12 pr-10 text-sm font-medium outline-none focus:border-[#e74c3c]/30 focus:bg-white/[0.08] transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#e74c3c] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {[
                { id: "all", label: "All Recipes", icon: Utensils },
                { id: "with-description", label: "Detailed", icon: Filter },
                { id: "quick", label: "Quick Fix", icon: Clock },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => updateUrl({ filter: item.id === "all" ? null : item.id, page: 1 })}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeFilter === item.id
                      ? "bg-white/10 text-white border border-white/20 shadow-lg"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Status bar */}
        {!loading && !error && pagination && (
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              {urlQuery
                ? `${pagination.total} result${pagination.total !== 1 ? "s" : ""} for "${urlQuery}"`
                : `${pagination.total} recipe${pagination.total !== 1 ? "s" : ""} in collection`}
            </p>
            {pagination.pages > 1 && (
              <p className="text-sm font-medium text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </p>
            )}
          </div>
        )}

        {/* Recipe Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="rounded-[32px] bg-[#121212] border border-white/5 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-white/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-3/4 rounded-full bg-white/5" />
                    <div className="h-4 w-full rounded-full bg-white/5" />
                    <div className="h-4 w-2/3 rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-12">
              <ErrorMessage message={error} />
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredRecipes.map((recipe, idx) => (
                    <motion.article
                      layout
                      key={recipe._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative flex flex-col rounded-[32px] bg-[#121212] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#e74c3c]/30 hover:shadow-2xl hover:shadow-[#e74c3c]/10"
                    >
                      <Link href={`/recipe/${recipe._id}`} className="relative aspect-[4/3] overflow-hidden">
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.seo?.title?.en || recipe.title || recipe.dishName.en}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-white/[0.03] to-white/[0.01] flex items-center justify-center">
                            <ChefHat className="h-16 w-16 text-white/5 group-hover:text-[#e74c3c]/20 transition-colors duration-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-60" />
                        <div className="absolute top-4 right-4">
                          <div className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                            {recipe.difficulty}
                          </div>
                        </div>
                      </Link>

                      <div className="flex-1 p-6 flex flex-col gap-4">
                        <div className="space-y-1">
                          <h2 className="text-xl font-black tracking-tight group-hover:text-[#e74c3c] transition-colors line-clamp-1">
                            {recipe.seo?.title?.en || recipe.title || recipe.dishName.en}
                          </h2>
                          {(recipe.seo?.title?.ta || recipe.dishName.ta) && (
                            <p className="text-sm font-bold text-gray-600 line-clamp-1">
                              {recipe.seo?.title?.ta || recipe.dishName.ta}
                            </p>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed h-10">
                          {recipe.description.en}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-auto pt-4 border-t border-white/5">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5">
                            <Clock className="h-3.5 w-3.5" />
                            {recipe.cookingTime || "--"}m
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5">
                            <Sparkles className="h-3.5 w-3.5" />
                            {recipe.ingredients?.length || 0} Ingredients
                          </div>
                        </div>

                        <Link
                          href={`/recipe/${recipe._id}`}
                          className="mt-2 flex items-center justify-between group/link h-12 rounded-2xl bg-white/5 group-hover:bg-[#e74c3c] transition-all px-5"
                        >
                          <span className="text-sm font-black uppercase tracking-wider group-hover:text-white transition-colors">View Recipe</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredRecipes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No recipes found</h3>
                  <p className="text-gray-500 max-w-xs">
                    Try adjusting your search query or filters.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

// Wrap in Suspense — required by Next.js 15 when using useSearchParams
export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <RecipesPageContent />
    </Suspense>
  );
}
