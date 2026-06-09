"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateIngredientModal } from "@/components/ingredients/CreateIngredientModal";
import {
  createIngredient,
  getIngredients,
} from "@/features/ingredient/services/ingredientApi";
import {
  getCategories,
  getSubcategoriesByParent,
} from "@/features/category/services/categoryApi";
import type { Category } from "@/types/category";
import type { Ingredient, IngredientCreateInput, PaginationMeta } from "@/types/ingredient";

const PAGE_SIZE = 24;

function getIngredientEmoji(categoryName: string) {
  const key = categoryName.toLowerCase();
  if (key.includes("spice")) return "🧂";
  if (key.includes("grain") || key.includes("rice")) return "🌾";
  if (key.includes("vegetable")) return "🥬";
  if (key.includes("dairy")) return "🥛";
  if (key.includes("herb")) return "🌿";
  return "🍽️";
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const delta = 2;
  const left = current - delta;
  const right = current + delta;

  pages.push(1);

  if (left > 2) pages.push("...");

  for (let i = Math.max(2, left); i <= Math.min(total - 1, right); i++) {
    pages.push(i);
  }

  if (right < total - 1) pages.push("...");

  pages.push(total);

  return pages;
}

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page: currentPage, pages: totalPages, total: totalItems, limit: itemsPerPage } = pagination;
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-12 flex flex-col items-center gap-6">
      <p className="text-sm font-medium text-[#6b7280]">
        Showing <span className="font-bold text-[#1f2937]">{from}–{to}</span> of{" "}
        <span className="font-bold text-[#1f2937]">{totalItems}</span> ingredients
      </p>

      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE5DC] bg-white dark:bg-[var(--color-card)] text-[#6b7280] shadow-sm transition-all hover:border-[#e74c3c]/40 hover:text-[#e74c3c] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#EAE5DC] disabled:hover:text-[#6b7280]"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-10 w-10 items-center justify-center text-sm text-[#9ca3af]"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold shadow-sm transition-all ${
                p === currentPage
                  ? "border-[#e74c3c] bg-[#e74c3c] text-white shadow-[0_4px_14px_rgba(231,76,60,0.3)]"
                  : "border-[#EAE5DC] bg-white dark:bg-[var(--color-card)] text-[#374151] hover:border-[#e74c3c]/40 hover:text-[#e74c3c]"
              }`}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#EAE5DC] bg-white dark:bg-[var(--color-card)] text-[#6b7280] shadow-sm transition-all hover:border-[#e74c3c]/40 hover:text-[#e74c3c] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#EAE5DC] disabled:hover:text-[#6b7280]"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function IngredientsPage() {
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, categoryId, subCategoryId]);

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

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === categoryId),
    [categories, categoryId],
  );

  const selectedSubCategory = useMemo(
    () => subCategories.find((c) => c._id === subCategoryId),
    [subCategories, subCategoryId],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateIngredient = async (
    payload: IngredientCreateInput,
    imageFile?: File | null,
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
    <div className="min-h-screen bg-[#F7F6F2] font-sans text-[#1f2937]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-[var(--color-card)] pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,76,60,0.05),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(244,196,48,0.03),transparent_50%)]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#e74c3c]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#fde6d4]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#EAE5DC] to-transparent" />

        <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e74c3c]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#e74c3c] uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e74c3c] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e74c3c]"></span>
                </span>
                Ingredient Library
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-7xl">
                The Chef's <span className="text-[#e74c3c]">Pantry</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-xl">
                Explore our curated collection of high-quality ingredients. From mountain-grown spices to locally sourced vegetables, find the building blocks for your next culinary adventure.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white shadow-2xl transition-all hover:bg-gray-800 hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#e74c3c]/0 via-[#e74c3c]/10 to-[#e74c3c]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20" height="20"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                className="transition-transform group-hover:rotate-90"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Ingredient
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-10 sm:px-6">
        {/* Search and Filters */}
        <section className="relative -mt-20 z-10 rounded-3xl border border-[#EAE5DC] bg-white/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <label className="flex items-center gap-3 rounded-2xl border-2 border-[#E6DFD3]/50 bg-[#FCFAF6] px-4 py-3.5 transition-all focus-within:border-[#e74c3c]/30 focus-within:bg-white dark:bg-[var(--color-card)] focus-within:shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 shrink-0 text-[#9ca3af]">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, category, or origin..."
                  className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-[#9ca3af]"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="shrink-0 text-[#9ca3af] hover:text-[#e74c3c] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </label>
            </div>

            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none rounded-2xl border-2 border-[#E6DFD3]/50 bg-[#FCFAF6] px-5 py-3.5 text-[15px] font-medium outline-none transition-all focus:border-[#e74c3c]/30 focus:bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name.en}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full appearance-none rounded-2xl border-2 border-[#E6DFD3]/50 bg-[#FCFAF6] px-5 py-3.5 text-[15px] font-medium outline-none transition-all focus:border-[#e74c3c]/30 focus:bg-white disabled:opacity-50"
                disabled={subCategories.length === 0}
              >
                <option value="All">All Subcategories</option>
                {subCategories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name.en}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">Filtering by:</span>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3efe6] px-3 py-1.5 text-xs font-semibold text-[#1f2937]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1f2937]/30"></span>
                {selectedCategory?.name.en ?? "All Categories"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3efe6] px-3 py-1.5 text-xs font-semibold text-[#1f2937]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e74c3c]/30"></span>
                {selectedSubCategory?.name.en ?? "All Subcategories"}
              </span>
              {debouncedQuery && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e74c3c]/10 px-3 py-1.5 text-xs font-semibold text-[#e74c3c]">
                  "{debouncedQuery}"
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mt-8">
          {/* Status bar */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-medium text-[#6b7280]">
              {isLoading
                ? "Loading ingredients…"
                : pagination
                ? `${pagination.total} ingredient${pagination.total !== 1 ? "s" : ""} found`
                : `${items.length} ingredients`}
            </p>
            {pagination && pagination.pages > 1 && (
              <p className="text-sm font-medium text-[#9ca3af]">
                Page {pagination.page} of {pagination.pages}
              </p>
            )}
          </div>

          {error && (
            <p className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Skeleton loader */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="flex flex-col items-center rounded-3xl border border-[#E7E1D5]/50 bg-white dark:bg-[var(--color-card)] p-5">
                  <div className="mb-5 h-20 w-20 rounded-2xl bg-[#f3efe6] animate-pulse" />
                  <div className="mb-2 h-4 w-3/4 rounded-full bg-[#f3efe6] animate-pulse" />
                  <div className="h-3 w-1/2 rounded-full bg-[#f3efe6] animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && (
            <>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f3efe6] text-4xl">
                    🔍
                  </div>
                  <h3 className="text-lg font-bold text-[#1f2937]">No ingredients found</h3>
                  <p className="mt-2 text-sm text-[#6b7280]">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {items.map((item) => (
                    <Link
                      key={item._id}
                      href={`/ingredient/${item._id}`}
                      className="group relative flex flex-col items-center rounded-3xl border border-[#E7E1D5]/50 bg-white dark:bg-[var(--color-card)] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e74c3c]/30 hover:shadow-[0_20px_40px_rgba(231,76,60,0.1)]"
                    >
                      <div className="relative mb-5">
                        <div className="absolute inset-0 scale-110 rounded-full bg-[#fde6d4]/50 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FCFAF6] to-[#f3efe6] text-3xl shadow-inner transition-transform duration-500 group-hover:rotate-6">
                          {getIngredientEmoji(item.category?.name?.en ?? "")}
                        </div>
                      </div>

                      <h2 className="line-clamp-1 text-center text-[15px] font-bold text-[#1f2937] transition-colors group-hover:text-[#e74c3c]">
                        {item.name.en}
                      </h2>

                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-[#9ca3af]/40"></span>
                        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">
                          {item.category?.name?.en ?? "Uncategorized"}
                        </p>
                      </div>

                      <div className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 opacity-0 transition-all duration-300 group-hover:bg-[#e74c3c]/10 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="text-[#e74c3c]">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
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

      <CreateIngredientModal
        isOpen={isCreateOpen}
        isSubmitting={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateIngredient}
      />
    </div>
  );
}
