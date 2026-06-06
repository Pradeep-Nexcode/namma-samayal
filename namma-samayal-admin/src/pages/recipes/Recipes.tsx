import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import AdminLayout from "../../components/layout/AdminLayout";
import RecipeModal from "../../components/recipes/RecipeModal";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import SmartPagination from "../../components/common/SmartPagination";
import AdminFilterBar, { type FilterDef } from "../../components/common/AdminFilterBar";

interface Category {
  _id: string;
  name: { en: string; ta?: string };
}

interface CreatedBy {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Recipe {
  _id: string;
  dishName: { en: string; ta?: string };
  slug: string;
  description: { en: string; ta?: string };
  category?: Category;
  subCategory?: Category;
  imageUrl?: string | null;
  cookingTime?: number;
  servings?: number;
  difficulty: "easy" | "medium" | "hard";
  isApproved: boolean;
  isPublic: boolean;
  averageRating: number;
  tags: string[];
  source: "manual" | "youtube" | "blog" | "ai";
  createdBy: CreatedBy;
  location: { country: string; state?: string; region?: string; city?: string; };
  createdAt: string;
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy:   { label: "Easy",   color: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" },
  medium: { label: "Medium", color: "bg-amber-500/15 text-amber-300 border border-amber-500/25" },
  hard:   { label: "Hard",   color: "bg-[#e74c3c]/15 text-[#ff8a7e] border border-[#e74c3c]/30" },
};

const SOURCE_CONFIG: Record<string, { label: string; emoji: string }> = {
  manual:  { label: "Manual",  emoji: "✍️" },
  youtube: { label: "YouTube", emoji: "▶️" },
  blog:    { label: "Blog",    emoji: "📝" },
  ai:      { label: "AI",      emoji: "🤖" },
};

type Tab = "all" | "pending" | "approved";

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Filters — synced to URL so refresh/back/forward preserves state
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: Tab = tabParam === "pending" || tabParam === "approved" ? tabParam : "all";
  const search = searchParams.get("search") ?? "";
  const filterCategory = searchParams.get("category") ?? "";
  const filterSubCategory = searchParams.get("subCategory") ?? "";
  const filterDifficulty = searchParams.get("difficulty") ?? "";
  const filterSource = searchParams.get("source") ?? "";
  const filterPublic = searchParams.get("isPublic") ?? "";
  const filterRegion = searchParams.get("region") ?? "";
  const filterHasImage = searchParams.get("hasImage") ?? "";
  const sortOrder = searchParams.get("sort") ?? "newest";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 12;

  // Top-level categories (for the dropdown) + dynamic sub-categories
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filterSubCategories, setFilterSubCategories] = useState<Category[]>([]);
  useEffect(() => {
    axiosInstance
      .get("/categories?level=0&limit=200")
      .then((res) => res.data.success && setAllCategories(res.data.data))
      .catch(() => setAllCategories([]));
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!filterCategory) {
        if (!cancelled) setFilterSubCategories([]);
        return;
      }
      try {
        const res = await axiosInstance.get(`/categories/${filterCategory}/subcategories`);
        if (!cancelled && res.data.success) setFilterSubCategories(res.data.data);
      } catch {
        if (!cancelled) setFilterSubCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, [filterCategory]);

  const updateUrl = useCallback(
    (updates: Record<string, string | number | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(updates)) {
            if (v == null || v === "") next.delete(k);
            else next.set(k, String(v));
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Filter definitions for AdminFilterBar — primary filters always visible,
  // secondary live in the "More filters" panel
  const recipeFilters: FilterDef[] = useMemo(
    () => [
      {
        key: "category",
        label: "Category",
        value: filterCategory,
        primary: true,
        options: [
          { value: "", label: "All Categories" },
          ...allCategories.map((c) => ({ value: c._id, label: c.name.en })),
        ],
      },
      {
        key: "difficulty",
        label: "Difficulty",
        value: filterDifficulty,
        primary: true,
        options: [
          { value: "", label: "Any Difficulty" },
          { value: "easy", label: "Easy" },
          { value: "medium", label: "Medium" },
          { value: "hard", label: "Hard" },
        ],
      },
      {
        key: "subCategory",
        label: "Sub-category",
        value: filterSubCategory,
        primary: false,
        options: filterCategory
          ? [
              { value: "", label: "All Sub-categories" },
              ...filterSubCategories.map((c) => ({ value: c._id, label: c.name.en })),
            ]
          : [{ value: "", label: "Pick a category first" }],
      },
      {
        key: "source",
        label: "Source",
        value: filterSource,
        primary: false,
        options: [
          { value: "", label: "Any Source" },
          { value: "manual", label: "Manual" },
          { value: "youtube", label: "YouTube" },
          { value: "blog", label: "Blog" },
          { value: "ai", label: "AI-generated" },
        ],
      },
      {
        key: "isPublic",
        label: "Visibility",
        value: filterPublic,
        primary: false,
        options: [
          { value: "", label: "Any" },
          { value: "true", label: "Public" },
          { value: "false", label: "Private" },
        ],
      },
      {
        key: "region",
        label: "Region",
        value: filterRegion,
        primary: false,
        options: [
          { value: "", label: "All Regions" },
          { value: "Kongu", label: "Kongu" },
          { value: "Chettinad", label: "Chettinad" },
          { value: "Madurai", label: "Madurai" },
          { value: "Tirunelveli", label: "Tirunelveli" },
          { value: "Tanjore", label: "Tanjore" },
          { value: "Coastal", label: "Coastal" },
        ],
      },
      {
        key: "hasImage",
        label: "Image",
        value: filterHasImage,
        primary: false,
        options: [
          { value: "", label: "Any" },
          { value: "true", label: "Has image" },
          { value: "false", label: "No image" },
        ],
      },
    ],
    [
      filterCategory,
      filterSubCategory,
      filterDifficulty,
      filterSource,
      filterPublic,
      filterRegion,
      filterHasImage,
      allCategories,
      filterSubCategories,
    ],
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Detail drawer
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const openCreate = () => { setEditingRecipe(null); setIsModalOpen(true); };
  const openEdit = (recipe: Recipe) => { setEditingRecipe(recipe); setSelectedRecipe(null); setIsModalOpen(true); };
  const onModalSaved = () => { setIsModalOpen(false); fetchRecipes(); };

  useEscapeKey(!!selectedRecipe && !isModalOpen, () => setSelectedRecipe(null));

  useEffect(() => {
    fetchRecipes();
  }, [
    activeTab,
    search,
    filterCategory,
    filterSubCategory,
    filterDifficulty,
    filterSource,
    filterPublic,
    filterRegion,
    filterHasImage,
    sortOrder,
    currentPage,
    pageSize,
  ]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(pageSize) });
      if (search) params.set("search", search);
      if (filterCategory) params.set("category", filterCategory);
      if (filterSubCategory) params.set("subCategory", filterSubCategory);
      if (filterDifficulty) params.set("difficulty", filterDifficulty);
      if (filterSource) params.set("source", filterSource);
      if (filterPublic) params.set("isPublic", filterPublic);
      if (filterRegion) params.set("region", filterRegion);
      if (filterHasImage) params.set("hasImage", filterHasImage);
      if (sortOrder) params.set("sort", sortOrder);

      if (activeTab === "pending") {
        const res = await axiosInstance.get(`/admin/recipes/pending?${params}`);
        if (res.data.success) {
          setRecipes(res.data.data);
          setPagination(res.data.pagination);
        }
      } else {
        if (activeTab === "approved") params.set("isApproved", "true");
        const res = await axiosInstance.get(`/admin/recipes?${params}`);
        if (res.data.success) {
          setRecipes(res.data.data);
          setPagination(res.data.pagination);
        }
      }
    } catch (e) {
      setError("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const approveRecipe = async (id: string) => {
    setActionLoading(id + "_approve");
    try {
      await axiosInstance.patch(`/admin/recipes/${id}/approve`);
      fetchRecipes();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to approve recipe");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteRecipe = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
    setActionLoading(id + "_delete");
    try {
      await axiosInstance.delete(`/admin/recipes/${id}`);
      setSelectedRecipe(null);
      fetchRecipes();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete recipe");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = recipes.filter(r => !r.isApproved).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all",     label: "All Recipes" },
    { key: "pending", label: "Pending Approval" },
    { key: "approved",label: "Approved" },
  ];

  return (
    <AdminLayout>
      {/* Create/Edit Modal */}
      {isModalOpen && (
        <RecipeModal
          editingRecipe={editingRecipe}
          onClose={() => setIsModalOpen(false)}
          onSaved={onModalSaved}
        />
      )}

      {/* Page header — premium dark */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
            <span className="h-1 w-8 bg-gradient-to-r from-[#e74c3c] to-transparent" />
            Kitchen
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            Recipes
          </h1>
          <p className="text-sm text-gray-500 mt-3 font-medium">
            {pagination
              ? <><span className="font-black text-gray-300">{pagination.total.toLocaleString()}</span> total recipes</>
              : `${recipes.length} recipes`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "pending" && (pagination ? pagination.total > 0 : recipes.length > 0) && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] text-amber-300 text-xs font-bold uppercase tracking-wider px-3 py-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              {pagination ? pagination.total : recipes.length} awaiting approval
            </div>
          )}
          <button
            onClick={openCreate}
            className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] px-5 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_28px_-8px_rgba(231,76,60,0.55)] hover:shadow-[0_12px_36px_-8px_rgba(231,76,60,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:rotate-90">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Recipe
          </button>
        </div>
      </div>

      {/* Tabs — dark glass strip */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-1 mb-6">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => updateUrl({ tab: tab.key === "all" ? null : tab.key, page: 1 })}
              className={`relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-gradient-to-br from-white/[0.08] to-white/[0.03] text-white border border-white/[0.12] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.5)]"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.03]"
              }`}
            >
              {tab.label}
              {tab.key === "pending" && pendingCount > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-[18px] rounded-full px-1.5 text-[10px] font-black ${
                  isActive
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                    : "bg-amber-500/20 text-amber-300"
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <AdminFilterBar
        className="mb-6"
        searchValue={search}
        searchPlaceholder="Search recipes by name, description, or tags..."
        onSearchChange={(q) => updateUrl({ search: q, page: 1 })}
        totalCount={pagination?.total}
        countLabel="recipes"
        filters={recipeFilters}
        onFilterChange={(key, value) => {
          if (key === "category") updateUrl({ category: value, subCategory: null, page: 1 });
          else updateUrl({ [key]: value, page: 1 });
        }}
        sort={{
          value: sortOrder,
          options: [
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "name-asc", label: "Name A-Z" },
            { value: "name-desc", label: "Name Z-A" },
            { value: "rating-desc", label: "Top rated" },
          ],
        }}
        onSortChange={(value) => updateUrl({ sort: value === "newest" ? null : value, page: 1 })}
        onClearAll={() => {
          // Keep current tab and pagination defaults; wipe filters + search
          const next = new URLSearchParams();
          if (activeTab !== "all") next.set("tab", activeTab);
          setSearchParams(next, { replace: true });
        }}
      />
      {/* (recipeFilters defined via useMemo above) */}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden animate-pulse">
              <div className="h-44 bg-white/5" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
                <div className="h-5 bg-white/5 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-lg border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] text-[#ff8a7e] px-5 py-4 text-sm font-medium flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      ) : recipes.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 mb-4 text-3xl">🍲</div>
          <p className="text-white font-bold text-base">No recipes found</p>
          <p className="text-gray-500 text-sm mt-1.5">
            {activeTab === "pending" ? "All caught up! No pending approvals." : "Try a different search filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {recipes.map((recipe) => {
              const diff = DIFFICULTY_CONFIG[recipe.difficulty];
              const src  = SOURCE_CONFIG[recipe.source] || SOURCE_CONFIG.manual;
              const isApproving = actionLoading === recipe._id + "_approve";
              const isDeleting  = actionLoading === recipe._id + "_delete";

              // Use SEO title if available, else fall back to dishName
              const displayTitleEn = (recipe as any).seo?.title?.en || recipe.dishName.en;
              const displayTitleTa = (recipe as any).seo?.title?.ta || recipe.dishName.ta;

              return (
                <div
                  key={recipe._id}
                  className="group relative flex flex-col rounded-2xl border border-white/[0.10] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-[#e74c3c]/35 hover:-translate-y-1 hover:shadow-[0_20px_44px_-12px_rgba(231,76,60,0.3)]"
                >
                  {/* Top hairline */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent z-10" />

                  {/* Image / hero */}
                  <div className="relative h-48 overflow-hidden">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={displayTitleEn}
                        className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                      />
                    ) : (
                      /* Premium empty state — single consistent dark + brand pattern */
                      <div className="w-full h-full relative overflow-hidden bg-[#0a0a0a]">
                        {/* Subtle red brand glow — same on every card */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#e74c3c]/[0.08] blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[#e74c3c]/[0.04] blur-3xl" />
                        {/* Diagonal hairline pattern — consistent */}
                        <div
                          className="absolute inset-0 opacity-[0.05]"
                          style={{
                            backgroundImage: "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 14px)",
                          }}
                        />
                        {/* Initials — refined, smaller, brand-tinted */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-[36px] font-black tracking-[0.05em] text-white/15 select-none">
                            {displayTitleEn.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom dark fade so title shows over busy images */}
                    <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                    {/* Top-left status badge */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {recipe.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/25 backdrop-blur-md text-emerald-100 border border-emerald-400/45 px-2 py-1 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500/25 backdrop-blur-md text-amber-100 border border-amber-400/45 px-2 py-1 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Top-right difficulty + source */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {recipe.source === "youtube" && (
                        <span title="From YouTube" className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-600/85 backdrop-blur-md border border-red-400/40 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                        </span>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-wider rounded-md px-2 py-1 backdrop-blur-md shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)] ${diff.color}`}>
                        {diff.label}
                      </span>
                    </div>

                    {/* Bottom-of-image: title + Tamil sub */}
                    <div className="absolute bottom-0 inset-x-0 p-4 pt-12">
                      <h3 className="text-[16px] font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                        {displayTitleEn}
                      </h3>
                      {displayTitleTa && (
                        <p className="text-[11px] text-gray-300/90 font-medium mt-1 line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {displayTitleTa}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info body */}
                  <div className="flex-1 px-4 py-3 flex flex-col gap-2.5">
                    {/* Stat pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {recipe.cookingTime && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-300 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="9" />
                            <polyline points="12 7 12 12 15 14" />
                          </svg>
                          {recipe.cookingTime}m
                        </span>
                      )}
                      {recipe.servings && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-300 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 11l4 4 14-14" />
                            <path d="M21 11v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8" />
                          </svg>
                          {recipe.servings}
                        </span>
                      )}
                      {recipe.averageRating > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/[0.10] border border-amber-500/25 rounded px-1.5 py-0.5">
                          ★ {recipe.averageRating.toFixed(1)}
                        </span>
                      )}
                      {recipe.location?.state && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                          {recipe.location.state}
                        </span>
                      )}
                    </div>

                    {/* Category chips */}
                    {(recipe.category || recipe.subCategory) && (
                      <div className="flex flex-wrap gap-1">
                        {recipe.category && (
                          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-[0.15em] bg-[#e74c3c]/10 text-[#ff8a7e] border border-[#e74c3c]/25 px-1.5 py-0.5 rounded">
                            {recipe.category.name.en}
                          </span>
                        )}
                        {recipe.subCategory && (
                          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-[0.15em] bg-white/5 text-gray-400 border border-white/[0.10] px-1.5 py-0.5 rounded">
                            {recipe.subCategory.name.en}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Creator */}
                    {recipe.createdBy && (
                      <div className="flex items-center gap-2 mt-auto pt-1">
                        <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white inline-flex items-center justify-center text-[10px] font-black shadow-[0_2px_8px_-2px_rgba(231,76,60,0.5)]">
                          {recipe.createdBy.firstName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium line-clamp-1 min-w-0 flex-1">
                          <span className="text-gray-300 font-bold">{recipe.createdBy.firstName}</span>
                          <span className="text-gray-700"> · </span>
                          <span className="truncate">{recipe.createdBy.email}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer — icon action strip with tooltips on hover */}
                  <div className="grid grid-cols-4 border-t border-white/[0.06] bg-black/20">
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      title="View"
                      className="group/btn inline-flex items-center justify-center gap-1.5 py-2.5 text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all border-r border-white/[0.06]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 -ml-1 group-hover/btn:ml-0 group-hover/btn:max-w-[40px] max-w-0 overflow-hidden transition-all">View</span>
                    </button>
                    <button
                      onClick={() => openEdit(recipe)}
                      title="Edit"
                      className="group/btn inline-flex items-center justify-center gap-1.5 py-2.5 text-gray-500 hover:text-[#ff8a7e] hover:bg-[#e74c3c]/[0.08] transition-all border-r border-white/[0.06]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 -ml-1 group-hover/btn:ml-0 group-hover/btn:max-w-[40px] max-w-0 overflow-hidden transition-all">Edit</span>
                    </button>
                    {!recipe.isApproved ? (
                      <button
                        onClick={() => approveRecipe(recipe._id)}
                        disabled={!!isApproving}
                        title="Approve"
                        className="group/btn inline-flex items-center justify-center gap-1.5 py-2.5 text-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/[0.12] transition-all border-r border-white/[0.06] disabled:opacity-50"
                      >
                        {isApproving ? (
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 -ml-1 group-hover/btn:ml-0 group-hover/btn:max-w-[40px] max-w-0 overflow-hidden transition-all">OK</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex items-center justify-center text-emerald-500/40 border-r border-white/[0.06]" title="Already approved">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                    )}
                    <button
                      onClick={() => deleteRecipe(recipe._id, recipe.dishName.en)}
                      disabled={!!isDeleting}
                      title="Delete"
                      className="group/btn inline-flex items-center justify-center gap-1.5 py-2.5 text-[#ff8a7e] hover:text-white hover:bg-[#e74c3c]/[0.18] transition-all disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/btn:opacity-100 -ml-1 group-hover/btn:ml-0 group-hover/btn:max-w-[40px] max-w-0 overflow-hidden transition-all">Del</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && (
            <SmartPagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              pageSize={pageSize}
              onPageChange={(page) => updateUrl({ page })}
              onPageSizeChange={(size, page) => updateUrl({ limit: size, page })}
              itemLabel="recipes"
            />
          )}
        </>
      )}

      {/* Detail Drawer — dark premium side panel */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedRecipe(null)}
          />
          <div className="relative w-full max-w-lg h-full overflow-y-auto flex flex-col border-l border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] shadow-[-24px_0_60px_-12px_rgba(0,0,0,0.8)]">
            {/* Top hairline */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#141414]/90 border-b border-white/[0.06] px-6 py-5 flex justify-between items-start">
              <div className="pr-4 min-w-0">
                <div className="inline-flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
                  <span className="h-1 w-6 bg-gradient-to-r from-[#e74c3c] to-transparent" />
                  Recipe
                </div>
                <h2 className="font-black text-xl text-white tracking-tight leading-tight">
                  {selectedRecipe.dishName.en}
                </h2>
                {selectedRecipe.dishName.ta && (
                  <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedRecipe.dishName.ta}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.16] text-gray-500 hover:text-white transition-all"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Image */}
            {selectedRecipe.imageUrl && (
              <div className="relative">
                <img
                  src={selectedRecipe.imageUrl}
                  alt={selectedRecipe.dishName.en}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
              </div>
            )}

            <div className="p-6 space-y-6 flex-1">
              {/* Status row */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-md px-2.5 py-1 ${
                  selectedRecipe.isApproved
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedRecipe.isApproved ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                  {selectedRecipe.isApproved ? "Approved" : "Pending Approval"}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider rounded-md px-2.5 py-1 ${DIFFICULTY_CONFIG[selectedRecipe.difficulty].color}`}>
                  {DIFFICULTY_CONFIG[selectedRecipe.difficulty].label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider rounded-md px-2.5 py-1 bg-white/5 text-gray-400 border border-white/[0.10]">
                  {SOURCE_CONFIG[selectedRecipe.source]?.emoji} {SOURCE_CONFIG[selectedRecipe.source]?.label}
                </span>
                {!selectedRecipe.isPublic && (
                  <span className="text-[10px] font-black uppercase tracking-wider rounded-md px-2.5 py-1 bg-gray-500/15 text-gray-400 border border-gray-500/25">
                    🔒 Private
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Description</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedRecipe.description.en}</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Cook Time", value: selectedRecipe.cookingTime ? `${selectedRecipe.cookingTime}m` : "—" },
                  { label: "Servings",  value: selectedRecipe.servings ? `${selectedRecipe.servings}` : "—" },
                  { label: "Rating",    value: selectedRecipe.averageRating ? `${selectedRecipe.averageRating.toFixed(1)}★` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">{label}</p>
                    <p className="text-base font-black text-white mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {/* Location */}
              {selectedRecipe.location && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Location</h4>
                  <p className="text-sm text-gray-300 font-medium">
                    <span className="text-gray-600">📍</span> {[selectedRecipe.location.city, selectedRecipe.location.state, selectedRecipe.location.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}

              {/* Category */}
              {(selectedRecipe.category || selectedRecipe.subCategory) && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Category</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecipe.category && (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-[#e74c3c]/10 text-[#ff8a7e] border border-[#e74c3c]/25 px-2 py-1 rounded">
                        {selectedRecipe.category.name.en}
                      </span>
                    )}
                    {selectedRecipe.subCategory && (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/[0.10] px-2 py-1 rounded">
                        {selectedRecipe.subCategory.name.en}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedRecipe.tags.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecipe.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-gray-500 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Created By */}
              {selectedRecipe.createdBy && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Created By</h4>
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white flex items-center justify-center text-sm font-black shadow-[0_4px_12px_-4px_rgba(231,76,60,0.5)]">
                      {selectedRecipe.createdBy.firstName?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {selectedRecipe.createdBy.firstName} {selectedRecipe.createdBy.lastName}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium truncate">{selectedRecipe.createdBy.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 z-10 backdrop-blur-xl bg-[#0a0a0a]/90 border-t border-white/[0.06] px-6 py-4 flex gap-2">
              <button
                onClick={() => openEdit(selectedRecipe)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.02] py-2.5 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.18] transition-all"
              >
                Edit
              </button>
              {!selectedRecipe.isApproved && (
                <button
                  onClick={() => approveRecipe(selectedRecipe._id)}
                  disabled={actionLoading === selectedRecipe._id + "_approve"}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_30px_-8px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
                >
                  {actionLoading === selectedRecipe._id + "_approve" ? "Approving…" : "✓ Approve"}
                </button>
              )}
              <button
                onClick={() => deleteRecipe(selectedRecipe._id, selectedRecipe.dishName.en)}
                disabled={actionLoading === selectedRecipe._id + "_delete"}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] py-2.5 text-xs font-black uppercase tracking-wider text-[#ff8a7e] hover:bg-[#e74c3c]/[0.15] hover:border-[#e74c3c]/45 hover:text-white transition-all disabled:opacity-50"
              >
                {actionLoading === selectedRecipe._id + "_delete" ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Recipes;
