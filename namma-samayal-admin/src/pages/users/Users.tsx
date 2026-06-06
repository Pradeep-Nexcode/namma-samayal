import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminFilterBar, { type FilterDef } from "../../components/common/AdminFilterBar";
import SmartPagination from "../../components/common/SmartPagination";
import { useEscapeKey } from "../../hooks/useEscapeKey";

// ─── Types ────────────────────────────────────────────────────────────────

interface RecentRecipe {
  _id: string;
  slug: string;
  dishName: { en: string; ta?: string };
  title?: string;
  imageUrl?: string | null;
  isApproved: boolean;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  source: "manual" | "youtube" | "blog" | "ai";
}

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  language: "en" | "ta";
  profileImage?: string | null;
  bio?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  counts: {
    createdRecipes: number;
    favoriteRecipes: number;
    savedRecipes: number;
  };
  // Only on detail fetch:
  recentRecipes?: RecentRecipe[];
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function timeAgo(iso?: string): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const DIFF_COLOR: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  hard: "bg-[#e74c3c]/15 text-[#ff8a7e] border-[#e74c3c]/30",
};

// ─── Page component ──────────────────────────────────────────────────────

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // URL-synced state
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const filterRole = searchParams.get("role") ?? "all";       // user | admin | all
  const filterStatus = searchParams.get("status") ?? "all";   // active | inactive | all
  const filterLang = searchParams.get("language") ?? "all";   // en | ta | all
  const sortOrder = searchParams.get("sort") ?? "newest";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 12;

  // Detail drawer
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEscapeKey(!!selectedUser, () => setSelectedUser(null));

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

  const filters: FilterDef[] = useMemo(
    () => [
      {
        key: "role",
        label: "Role",
        value: filterRole === "all" ? "" : filterRole,
        primary: true,
        options: [
          { value: "", label: "All Roles" },
          { value: "user", label: "User" },
          { value: "admin", label: "Admin" },
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
      {
        key: "language",
        label: "Language",
        value: filterLang === "all" ? "" : filterLang,
        primary: false,
        options: [
          { value: "", label: "Any Language" },
          { value: "en", label: "English" },
          { value: "ta", label: "Tamil" },
        ],
      },
    ],
    [filterRole, filterStatus, filterLang],
  );

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole, filterStatus, filterLang, sortOrder, currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (search) params.set("search", search);
      params.set("role", filterRole);
      params.set("status", filterStatus);
      params.set("language", filterLang);
      params.set("sort", sortOrder);

      const res = await axiosInstance.get(`/admin/users?${params}`);
      if (res.data?.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination ?? null);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (user: User) => {
    // Open immediately with what we have, then refresh from /admin/users/:id for full data
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/users/${user._id}`);
      if (res.data?.success) setSelectedUser(res.data.data);
    } catch {
      // keep list-snapshot
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleActive = async (user: User) => {
    setActionLoading(user._id + "_toggle");
    try {
      if (user.isActive) {
        if (!confirm(`Deactivate ${user.firstName} ${user.lastName}? They will lose access to the app.`)) {
          setActionLoading(null);
          return;
        }
        await axiosInstance.delete(`/admin/users/${user._id}`);
      } else {
        await axiosInstance.patch(`/admin/users/${user._id}`, { isActive: true });
      }
      fetchUsers();
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser({ ...selectedUser, isActive: !user.isActive });
      }
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const promoteOrDemote = async (user: User, newRole: "user" | "admin") => {
    if (!confirm(`Change role of ${user.firstName} ${user.lastName} to ${newRole}?`)) return;
    setActionLoading(user._id + "_role");
    try {
      await axiosInstance.patch(`/admin/users/${user._id}`, { role: newRole });
      fetchUsers();
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to change role");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      {/* ─── Page header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
            <span className="h-1 w-8 bg-gradient-to-r from-[#e74c3c] to-transparent" />
            Community
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">Users</h1>
          <p className="text-sm text-gray-500 mt-3 font-medium">
            {pagination
              ? <><span className="font-black text-gray-300">{pagination.total.toLocaleString()}</span> user{pagination.total !== 1 && "s"} match your filters</>
              : "Manage registered users and their activity"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilterBar
        className="mb-6"
        searchValue={search}
        searchPlaceholder="Search by name, username, or email..."
        onSearchChange={(q) => updateUrl({ search: q, page: 1 })}
        totalCount={pagination?.total}
        countLabel="users"
        filters={filters}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        sort={{
          value: sortOrder,
          options: [
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "name-asc", label: "Name A-Z" },
            { value: "name-desc", label: "Name Z-A" },
            { value: "recipes-desc", label: "Most recipes" },
            { value: "lastLogin-desc", label: "Recently active" },
          ],
        }}
        onSortChange={(value) => updateUrl({ sort: value === "newest" ? null : value, page: 1 })}
        onClearAll={() => setSearchParams(new URLSearchParams(), { replace: true })}
      />

      {/* Content */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-48" />
                <div className="h-3 bg-white/5 rounded w-32" />
              </div>
              <div className="h-6 bg-white/5 rounded w-20" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] text-[#ff8a7e] px-5 py-4 text-sm font-medium flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 mb-4 text-3xl">👥</div>
          <p className="text-white font-bold text-base">No users match your filters</p>
          <p className="text-gray-500 text-sm mt-1.5">Try clearing filters or wait for users to register.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {users.map((u) => {
              const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || u.username?.[0]?.toUpperCase() || "?";
              const isAdmin = u.role === "admin";
              const isToggling = actionLoading === u._id + "_toggle";
              return (
                <div
                  key={u._id}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl px-5 py-3.5 transition-all hover:border-[#e74c3c]/25 hover:from-white/[0.06]"
                >
                  <button
                    onClick={() => openDetail(u)}
                    className="min-w-0 flex items-center gap-3 pr-3 flex-1 text-left"
                  >
                    {/* Avatar */}
                    <div className={`shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center font-black text-sm border shadow-[0_4px_12px_-4px_rgba(231,76,60,0.4)] ${
                      isAdmin
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400/30 text-white"
                        : "bg-gradient-to-br from-[#e74c3c] to-[#c0392b] border-[#e74c3c]/30 text-white"
                    }`}>
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={initials} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white tracking-tight truncate">
                          {u.firstName} {u.lastName}
                        </h3>
                        {isAdmin && (
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                        {u.language === "ta" && (
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-violet-300 bg-violet-500/10 border border-violet-500/25 px-1.5 py-0.5 rounded">
                            தமிழ்
                          </span>
                        )}
                        {!u.isActive && (
                          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 bg-white/5 border border-white/[0.10] px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate">
                        <span className="font-mono text-gray-400">@{u.username}</span>
                        <span className="mx-1.5 text-gray-700">·</span>
                        <span>{u.email}</span>
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Activity stats */}
                    <div className="hidden md:flex items-center gap-3 text-[11px] font-bold mr-1">
                      <span className="inline-flex items-center gap-1.5 text-gray-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#ff8a7e]"><path d="M3 7h18M3 12h18M3 17h12" /></svg>
                        {u.counts.createdRecipes}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-300"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        {u.counts.favoriteRecipes}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-300"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                        {u.counts.savedRecipes}
                      </span>
                    </div>

                    <span className="hidden lg:inline text-[10px] text-gray-500 font-medium">
                      Last seen <span className="text-gray-300">{timeAgo(u.lastLogin)}</span>
                    </span>

                    <button
                      onClick={() => openDetail(u)}
                      className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.18] transition-all"
                    >
                      View
                    </button>
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={isToggling}
                      className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        u.isActive
                          ? "border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] text-[#ff8a7e] hover:bg-[#e74c3c]/[0.15] hover:text-white hover:border-[#e74c3c]/45"
                          : "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 hover:bg-emerald-500/[0.15] hover:text-white hover:border-emerald-500/45"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isToggling ? "…" : u.isActive ? "Deactivate" : "Activate"}
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
              itemLabel="users"
            />
          )}
        </>
      )}

      {/* ─── Detail drawer ─── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-lg h-full overflow-y-auto flex flex-col border-l border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] shadow-[-24px_0_60px_-12px_rgba(0,0,0,0.8)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />

            {/* Header */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#141414]/90 border-b border-white/[0.06] px-6 py-5 flex justify-between items-start">
              <div className="pr-4 min-w-0">
                <div className="inline-flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
                  <span className="h-1 w-6 bg-gradient-to-r from-[#e74c3c] to-transparent" />
                  Profile
                </div>
                <h2 className="font-black text-xl text-white tracking-tight leading-tight">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-sm text-gray-500 font-medium mt-0.5">
                  <span className="font-mono text-gray-400">@{selectedUser.username}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.16] text-gray-500 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Identity card */}
            <div className="p-6 space-y-6 flex-1">
              <div className="flex items-center gap-4">
                <div className={`shrink-0 w-16 h-16 rounded-full inline-flex items-center justify-center font-black text-xl border-2 ${
                  selectedUser.role === "admin"
                    ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400/40 text-white shadow-[0_8px_24px_-6px_rgba(245,158,11,0.5)]"
                    : "bg-gradient-to-br from-[#e74c3c] to-[#c0392b] border-[#e74c3c]/40 text-white shadow-[0_8px_24px_-6px_rgba(231,76,60,0.5)]"
                }`}>
                  {selectedUser.profileImage ? (
                    <img src={selectedUser.profileImage} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    `${selectedUser.firstName?.[0] ?? ""}${selectedUser.lastName?.[0] ?? ""}`.toUpperCase() || "?"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300 font-medium truncate">{selectedUser.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider rounded-md px-2 py-1 ${
                      selectedUser.role === "admin"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-white/5 text-gray-400 border border-white/[0.10]"
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider rounded-md px-2 py-1 ${
                      selectedUser.isActive
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/5 text-gray-500 border border-white/[0.08]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider rounded-md px-2 py-1 bg-violet-500/10 text-violet-300 border border-violet-500/25">
                      {selectedUser.language === "ta" ? "தமிழ்" : "English"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Bio</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Recipes", value: selectedUser.counts.createdRecipes, accent: "text-[#ff8a7e]" },
                  { label: "Favorites", value: selectedUser.counts.favoriteRecipes, accent: "text-amber-300" },
                  { label: "Saved", value: selectedUser.counts.savedRecipes, accent: "text-emerald-300" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">{s.label}</p>
                    <p className={`text-xl font-black mt-1 ${s.accent}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Metadata */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Account</h4>
                <div className="space-y-2">
                  {[
                    { label: "Joined", value: formatDate(selectedUser.createdAt) },
                    { label: "Last login", value: selectedUser.lastLogin ? `${formatDate(selectedUser.lastLogin)} · ${timeAgo(selectedUser.lastLogin)}` : "Never" },
                    { label: "Last updated", value: timeAgo(selectedUser.updatedAt) },
                    { label: "User ID", value: selectedUser._id },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">{row.label}</span>
                      <span className="text-gray-300 font-mono truncate ml-2 max-w-[60%] text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent recipes */}
              {detailLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] animate-pulse h-14" />
                  ))}
                </div>
              ) : selectedUser.recentRecipes && selectedUser.recentRecipes.length > 0 ? (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Recent recipes ({selectedUser.recentRecipes.length})</h4>
                  <div className="space-y-1.5">
                    {selectedUser.recentRecipes.map((r) => {
                      const title = r.title || r.dishName.en;
                      return (
                        <div key={r._id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                          <div className="w-9 h-9 rounded-md overflow-hidden bg-black/40 border border-white/[0.06] shrink-0">
                            {r.imageUrl ? (
                              <img src={r.imageUrl} alt={title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/20">
                                {title.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white tracking-tight truncate">{title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 font-medium">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 border ${
                                r.isApproved
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/25"
                              }`}>{r.isApproved ? "Approved" : "Pending"}</span>
                              <span className={`inline-flex text-[9px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 border ${DIFF_COLOR[r.difficulty]}`}>{r.difficulty}</span>
                              <span>· {timeAgo(r.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Recent recipes</h4>
                  <p className="text-xs text-gray-600 font-medium italic">Hasn't created any recipes yet.</p>
                </div>
              )}
            </div>

            {/* Sticky actions */}
            <div className="sticky bottom-0 z-10 backdrop-blur-xl bg-[#0a0a0a]/90 border-t border-white/[0.06] px-6 py-4 flex gap-2">
              {selectedUser.role === "user" ? (
                <button
                  onClick={() => promoteOrDemote(selectedUser, "admin")}
                  disabled={actionLoading === selectedUser._id + "_role"}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] py-2.5 text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/[0.15] hover:border-amber-500/45 hover:text-white transition-all disabled:opacity-50"
                >
                  {actionLoading === selectedUser._id + "_role" ? "Promoting…" : "↑ Make Admin"}
                </button>
              ) : (
                <button
                  onClick={() => promoteOrDemote(selectedUser, "user")}
                  disabled={actionLoading === selectedUser._id + "_role"}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.02] py-2.5 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.18] transition-all disabled:opacity-50"
                >
                  {actionLoading === selectedUser._id + "_role" ? "Demoting…" : "↓ Make User"}
                </button>
              )}
              <button
                onClick={() => toggleActive(selectedUser)}
                disabled={actionLoading === selectedUser._id + "_toggle"}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
                  selectedUser.isActive
                    ? "border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] text-[#ff8a7e] hover:bg-[#e74c3c]/[0.15] hover:border-[#e74c3c]/45 hover:text-white"
                    : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_30px_-8px_rgba(16,185,129,0.6)] hover:-translate-y-0.5"
                }`}
              >
                {actionLoading === selectedUser._id + "_toggle"
                  ? "Updating…"
                  : selectedUser.isActive ? "Deactivate" : "✓ Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Users;
