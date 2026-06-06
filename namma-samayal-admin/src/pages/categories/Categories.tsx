import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import AdminLayout from "../../components/layout/AdminLayout";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import AdminFilterBar, { type FilterDef } from "../../components/common/AdminFilterBar";
import SmartPagination from "../../components/common/SmartPagination";

interface Category {
  _id: string;
  name: {
    en: string;
    ta?: string;
  };
  slug: string;
  level: number;
  isActive: boolean;
  parent?: any;
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  // Separate list of ALL main categories (level=0) for the modal's parent dropdown.
  // Not paginated — we always want the full list there.
  const [allMainCategories, setAllMainCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // URL-synced filters
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const filterLevel = searchParams.get("level") ?? "all"; // "all" | "0" | "1"
  const filterStatus = searchParams.get("status") ?? "all"; // "active" | "inactive" | "all"
  const sortOrder = searchParams.get("sort") ?? "name-asc";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 12;

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

  const categoryFilters: FilterDef[] = useMemo(
    () => [
      {
        key: "level",
        label: "Level",
        value: filterLevel === "all" ? "" : filterLevel,
        primary: true,
        options: [
          { value: "", label: "All Levels" },
          { value: "0", label: "Main only" },
          { value: "1", label: "Sub only" },
        ],
      },
      {
        key: "status",
        label: "Status",
        value: filterStatus === "all" ? "" : filterStatus,
        primary: true,
        options: [
          { value: "", label: "Active + Inactive" },
          { value: "active", label: "Active only" },
          { value: "inactive", label: "Inactive only" },
        ],
      },
    ],
    [filterLevel, filterStatus],
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [nameEn, setNameEn] = useState("");
  const [nameTa, setNameTa] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");

  useEscapeKey(isModalOpen, () => setIsModalOpen(false));

  useEffect(() => {
    fetchCategories();
  }, [search, filterLevel, filterStatus, sortOrder, currentPage, pageSize]);

  // Fetch all main categories once (for the parent dropdown). Doesn't depend on filters.
  useEffect(() => {
    axiosInstance
      .get("/categories?level=0&limit=500&includeInactive=true")
      .then((res) => res.data?.success && setAllMainCategories(res.data.data))
      .catch(() => setAllMainCategories([]));
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (search) params.set("search", search);
      // Level: server interprets undefined as "level 0 default". Send "all" explicitly to get both levels.
      params.set("level", filterLevel === "" ? "all" : filterLevel);
      // Status: server uses includeInactive=true to return both; we filter client-side for "active"/"inactive"
      // so the count is accurate. To do that with server pagination we need it server-side; pass through.
      params.set("includeInactive", filterStatus === "active" ? "false" : "true");

      const res = await axiosInstance.get(`/categories?${params}`);
      if (res.data.success) {
        let data: Category[] = res.data.data;
        // Server doesn't filter "inactive only" — apply client-side as a final pass.
        if (filterStatus === "inactive") {
          data = data.filter((c) => !c.isActive);
        }
        // Sort client-side (server defaults to natural insertion order)
        const sortFns: Record<string, (a: Category, b: Category) => number> = {
          "name-asc": (a, b) => a.name.en.localeCompare(b.name.en),
          "name-desc": (a, b) => b.name.en.localeCompare(a.name.en),
          "level-asc": (a, b) => a.level - b.level || a.name.en.localeCompare(b.name.en),
          "level-desc": (a, b) => b.level - a.level || a.name.en.localeCompare(b.name.en),
        };
        data = [...data].sort(sortFns[sortOrder] || sortFns["name-asc"]);
        setCategories(data);
        setPagination(res.data.pagination ?? null);
      }
    } catch (err: any) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingId(category._id);
      setNameEn(category.name.en);
      setNameTa(category.name.ta || "");
      setSlug(category.slug);
      setParentId(category.parent?._id || "");
    } else {
      setEditingId(null);
      setNameEn("");
      setNameTa("");
      setSlug("");
      setParentId("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    
    const payload = {
      name: { en: nameEn, ta: nameTa || undefined },
      slug: slug || undefined,
      parent: parentId || null
    };

    try {
      if (editingId) {
        await axiosInstance.patch(`/categories/${editingId}`, payload);
      } else {
        await axiosInstance.post("/categories", payload);
      }
      setIsModalOpen(false);
      fetchCategories();
      refreshAllMain();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save category");
    } finally {
      setModalLoading(false);
    }
  };

  const refreshAllMain = () => {
    axiosInstance
      .get("/categories?level=0&limit=500&includeInactive=true")
      .then((res) => res.data?.success && setAllMainCategories(res.data.data))
      .catch(() => { /* keep existing list */ });
  };

  const toggleStatus = async (category: Category) => {
    try {
      // Soft delete in this API is setting isActive to false
      if (category.isActive) {
        if (confirm(`Are you sure you want to deactivate ${category.name.en}?`)) {
          await axiosInstance.delete(`/categories/${category._id}`);
          fetchCategories();
          refreshAllMain();
        }
      } else {
        // To reactivate, we use patch
        await axiosInstance.patch(`/categories/${category._id}`, { isActive: true });
        fetchCategories();
        refreshAllMain();
      }
    } catch (err: any) {
      alert("Failed to update status");
    }
  };

  // Derived stats (from FULL dataset for accuracy, not just current page)
  const totalAllMain = allMainCategories.length;
  const totalAllActive = allMainCategories.filter((c) => c.isActive).length;

  return (
    <AdminLayout>
      {/* Page header — premium dark */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
            <span className="h-1 w-8 bg-gradient-to-r from-[#e74c3c] to-transparent" />
            Taxonomy
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-3 font-medium">
            {pagination
              ? <><span className="font-black text-gray-300">{pagination.total.toLocaleString()}</span> categories match your filters</>
              : "Manage recipe categories and sub-categories"}
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] px-5 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_28px_-8px_rgba(231,76,60,0.55)] hover:shadow-[0_12px_36px_-8px_rgba(231,76,60,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:rotate-90">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Stats row — totals from the FULL dataset (independent of current filters) */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Main", value: totalAllMain, accent: "text-white" },
          { label: "Active", value: totalAllActive, accent: "text-emerald-300" },
          { label: "Inactive", value: totalAllMain - totalAllActive, accent: "text-[#ff8a7e]" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
            <p className={`mt-1 text-xl font-black ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <AdminFilterBar
        className="mb-6"
        searchValue={search}
        searchPlaceholder="Search categories by name (EN or TA)..."
        onSearchChange={(q) => updateUrl({ search: q, page: 1 })}
        totalCount={pagination?.total}
        countLabel="categories"
        filters={categoryFilters}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        sort={{
          value: sortOrder,
          options: [
            { value: "name-asc", label: "Name A-Z" },
            { value: "name-desc", label: "Name Z-A" },
            { value: "level-asc", label: "Main first" },
            { value: "level-desc", label: "Sub first" },
          ],
        }}
        onSortChange={(value) => updateUrl({ sort: value === "name-asc" ? null : value, page: 1 })}
        onClearAll={() => setSearchParams(new URLSearchParams(), { replace: true })}
      />

      {/* Content */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-48" />
                <div className="h-3 bg-white/5 rounded w-32" />
              </div>
              <div className="h-6 bg-white/5 rounded w-24" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] text-[#ff8a7e] px-5 py-4 text-sm font-medium flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 mb-4 text-3xl">🗂</div>
          <p className="text-white font-bold text-base">No categories match</p>
          <p className="text-gray-500 text-sm mt-1.5">Try clearing filters or adding a new category.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const isMain = cat.level === 0;
              return (
                <div
                  key={cat._id}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl px-5 py-3.5 transition-all hover:border-[#e74c3c]/25 hover:from-white/[0.06]"
                >
                  <div className="min-w-0 flex items-center gap-3 pr-3 flex-1">
                    {/* Initials chip — red for main, violet for sub */}
                    <div className={`shrink-0 w-10 h-10 rounded-lg inline-flex items-center justify-center font-black text-sm border ${
                      isMain
                        ? "bg-[#e74c3c]/[0.15] border-[#e74c3c]/25 text-[#ff8a7e]"
                        : "bg-violet-500/[0.12] border-violet-500/25 text-violet-300"
                    }`}>
                      {cat.name.en.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white tracking-tight truncate">
                          {cat.name.en}
                        </h3>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.15em] border px-1.5 py-0.5 rounded ${
                          isMain
                            ? "text-[#ff8a7e] bg-[#e74c3c]/10 border-[#e74c3c]/25"
                            : "text-violet-300 bg-violet-500/10 border-violet-500/25"
                        }`}>
                          {isMain ? "Main" : "Sub"}
                        </span>
                        {!cat.isActive && (
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 bg-white/5 border border-white/[0.10] px-1.5 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                        {cat.name.ta && <span className="text-gray-400">{cat.name.ta}</span>}
                        {cat.name.ta && <span className="mx-1.5 text-gray-700">·</span>}
                        <span className="font-mono text-gray-600">{cat.slug}</span>
                        {!isMain && cat.parent?.name?.en && (
                          <>
                            <span className="mx-1.5 text-gray-700">·</span>
                            <span>under <span className="text-gray-400">{cat.parent.name.en}</span></span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider rounded-md px-2 py-1 ${
                      cat.isActive
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/5 text-gray-500 border border-white/[0.08]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => openModal(cat)}
                      className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.18] transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(cat)}
                      className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        cat.isActive
                          ? "border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] text-[#ff8a7e] hover:bg-[#e74c3c]/[0.15] hover:text-white hover:border-[#e74c3c]/45"
                          : "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 hover:bg-emerald-500/[0.15] hover:text-white hover:border-emerald-500/45"
                      }`}
                    >
                      {cat.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && (
            <SmartPagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              pageSize={pageSize}
              onPageChange={(page) => updateUrl({ page })}
              onPageSizeChange={(size, page) => updateUrl({ limit: size, page })}
              itemLabel="categories"
            />
          )}
        </>
      )}

      {/* Add/Edit Modal — dark premium */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="relative w-full max-w-md my-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#141414] to-[#0a0a0a] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />
            <div className="pointer-events-none absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#e74c3c]/[0.06] blur-3xl" />

            <div className="relative px-6 py-5 border-b border-white/[0.06] flex justify-between items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
                  <span className="h-1 w-6 bg-gradient-to-r from-[#e74c3c] to-transparent" />
                  {editingId ? "Edit" : "New"}
                </div>
                <h3 className="font-black text-xl text-white tracking-tight">
                  {editingId ? "Edit Category" : "Add Category"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.16] text-gray-500 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="relative p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name (English)*</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Spices"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Name (Tamil)</label>
                  <input
                    type="text"
                    value={nameTa}
                    onChange={(e) => setNameTa(e.target.value)}
                    placeholder="e.g. மசாலா"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Slug <span className="text-gray-600 normal-case font-medium tracking-normal">(optional)</span></label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                  placeholder="auto-generated-if-blank"
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="label">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="input"
                >
                  <option value="">None (Main Category)</option>
                  {allMainCategories.filter((c) => c._id !== editingId).map((c) => (
                    <option key={c._id} value={c._id}>{c.name.en}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1.5">Leave as "None" to create a main category.</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.02] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.18] hover:text-white disabled:opacity-40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="group flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_28px_-8px_rgba(231,76,60,0.55)] hover:shadow-[0_12px_36px_-8px_rgba(231,76,60,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all"
                >
                  {modalLoading ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      {editingId ? "Update" : "Create"}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:translate-x-0.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Categories;
