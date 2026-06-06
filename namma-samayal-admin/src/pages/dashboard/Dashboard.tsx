import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import AdminLayout from "../../components/layout/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────

interface RecipeSummary {
  _id: string;
  slug: string;
  dishName: { en: string; ta?: string };
  title?: string;
  seo?: { title?: { en?: string } };
  imageUrl?: string | null;
  isApproved: boolean;
  difficulty: "easy" | "medium" | "hard";
  cookingTime?: number;
  servings?: number;
  source: "manual" | "youtube" | "blog" | "ai";
  createdBy?: { firstName?: string; lastName?: string; email?: string };
  createdAt: string;
  category?: { name: { en: string } };
}

interface Stats {
  recipes: number;
  pendingRecipes: number;
  approvedRecipes: number;
  ingredients: number;
  categories: number;
  mainCategories: number;
  subCategories: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function timeAgo(iso?: string): string {
  if (!iso) return "—";
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
  return `${mo}mo ago`;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good evening";
}

function todayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const DIFF_COLOR: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  hard: "bg-[#e74c3c]/15 text-[#ff8a7e] border-[#e74c3c]/30",
};

const SOURCE_EMOJI: Record<string, string> = {
  manual: "✍️",
  youtube: "▶️",
  blog: "📝",
  ai: "🤖",
};

// ─── Component ────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    recipes: 0,
    pendingRecipes: 0,
    approvedRecipes: 0,
    ingredients: 0,
    categories: 0,
    mainCategories: 0,
    subCategories: 0,
  });
  const [recentRecipes, setRecentRecipes] = useState<RecipeSummary[]>([]);
  const [pendingRecipes, setPendingRecipes] = useState<RecipeSummary[]>([]);
  const [topCategories, setTopCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [recipesRes, pendingRes, approvedRes, ingredientsRes, categoriesRes, allCategoriesRes, recentRes, recipesByCategoryRes] = await Promise.allSettled([
        axiosInstance.get("/recipes?limit=1"),
        axiosInstance.get("/admin/recipes/pending?limit=5"),
        axiosInstance.get("/admin/recipes?isApproved=true&limit=1"),
        axiosInstance.get("/ingredients?limit=1"),
        axiosInstance.get("/categories?level=0&limit=100"),
        axiosInstance.get("/categories?level=all&limit=500&includeInactive=true"),
        axiosInstance.get("/admin/recipes?sort=newest&limit=6"),
        axiosInstance.get("/admin/recipes?limit=200&sort=newest"),
      ]);

      const total = recipesRes.status === "fulfilled" ? (recipesRes.value.data?.pagination?.totalItems ?? recipesRes.value.data?.pagination?.total ?? 0) : 0;
      const pending = pendingRes.status === "fulfilled" ? (pendingRes.value.data?.pagination?.total ?? pendingRes.value.data?.data?.length ?? 0) : 0;
      const approved = approvedRes.status === "fulfilled" ? (approvedRes.value.data?.pagination?.total ?? 0) : 0;
      const ingredients = ingredientsRes.status === "fulfilled" ? (ingredientsRes.value.data?.pagination?.totalItems ?? ingredientsRes.value.data?.pagination?.total ?? 0) : 0;
      const mainCats = categoriesRes.status === "fulfilled" ? (categoriesRes.value.data?.data?.length ?? 0) : 0;
      const allCats: any[] = allCategoriesRes.status === "fulfilled" ? (allCategoriesRes.value.data?.data ?? []) : [];

      setStats({
        recipes: total,
        pendingRecipes: pending,
        approvedRecipes: approved,
        ingredients,
        categories: allCats.length || mainCats,
        mainCategories: mainCats,
        subCategories: Math.max(0, allCats.length - mainCats),
      });

      if (recentRes.status === "fulfilled") {
        setRecentRecipes(recentRes.value.data?.data ?? []);
      }
      if (pendingRes.status === "fulfilled") {
        setPendingRecipes(pendingRes.value.data?.data ?? []);
      }

      // Top categories by recipe count — aggregate from the recipes-by-category snapshot
      if (recipesByCategoryRes.status === "fulfilled") {
        const recipes: any[] = recipesByCategoryRes.value.data?.data ?? [];
        const tally = new Map<string, number>();
        recipes.forEach((r) => {
          const name = r.category?.name?.en;
          if (!name) return;
          tally.set(name, (tally.get(name) ?? 0) + 1);
        });
        const top = Array.from(tally.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setTopCategories(top);
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await axiosInstance.patch(`/admin/recipes/${id}/approve`);
      fetchAll();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to approve");
    } finally {
      setApproving(null);
    }
  };

  const maxCatCount = topCategories[0]?.count || 1;

  return (
    <AdminLayout>
      {/* ─── Hero banner ─── */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#141414] to-[#0a0a0a] overflow-hidden mb-6">
        {/* Top hairline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />
        {/* Red brand corner glow */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#e74c3c]/[0.10] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#e74c3c]/[0.04] blur-3xl" />
        {/* Pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 18px)" }}
        />

        <div className="relative px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
              <span className="h-1 w-8 bg-gradient-to-r from-[#e74c3c] to-transparent" />
              {todayDate()}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-400 text-sm font-medium">{greeting()}</p>
              <span className="text-base">👋</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Welcome back, Admin
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-2">
              {stats.pendingRecipes > 0 ? (
                <>
                  <span className="text-amber-300 font-bold">{stats.pendingRecipes}</span> recipe{stats.pendingRecipes !== 1 && "s"} pending your review.
                </>
              ) : (
                <>All caught up — no pending approvals right now.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {stats.pendingRecipes > 0 && (
              <Link
                to="/recipes?tab=pending"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/[0.15] hover:border-amber-500/45 hover:text-white transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {stats.pendingRecipes} Pending
              </Link>
            )}
            <Link
              to="/recipes"
              className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_8px_28px_-8px_rgba(231,76,60,0.55)] hover:shadow-[0_12px_36px_-8px_rgba(231,76,60,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              View Recipes
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:translate-x-0.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          to="/recipes"
          label="Total Recipes"
          value={stats.recipes}
          loading={loading}
          accent="red"
          icon={(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7h18M3 12h18M3 17h12" />
            </svg>
          )}
          sub={stats.approvedRecipes > 0 ? `${stats.approvedRecipes} approved` : "Library"}
        />
        <StatCard
          to="/recipes?tab=pending"
          label="Pending Approval"
          value={stats.pendingRecipes}
          loading={loading}
          accent="amber"
          icon={(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          alert={stats.pendingRecipes > 0}
          sub={stats.pendingRecipes > 0 ? "Needs action" : "All caught up"}
        />
        <StatCard
          to="/ingredients"
          label="Ingredients"
          value={stats.ingredients}
          loading={loading}
          accent="emerald"
          icon={(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a5 5 0 0 1 5 5c0 5.25-5 13-5 13S7 12.25 7 7a5 5 0 0 1 5-5z" />
              <circle cx="12" cy="7" r="2" />
            </svg>
          )}
          sub="Library"
        />
        <StatCard
          to="/categories"
          label="Categories"
          value={stats.categories}
          loading={loading}
          accent="violet"
          icon={(
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M3 14h7v7H3z" /><path d="M14 14h7v7h-7z" />
            </svg>
          )}
          sub={`${stats.mainCategories} main · ${stats.subCategories} sub`}
        />
      </div>

      {/* ─── Two-column: Recent recipes (2/3) + Pending queue (1/3) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Recipes */}
        <Panel
          title="Recent Recipes"
          subtitle="Latest 6 additions to your library"
          eyebrow="Activity"
          action={<PanelAction to="/recipes">View all</PanelAction>}
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentRecipes.length === 0 ? (
            <EmptyHint label="No recipes yet — start by adding one." />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentRecipes.map((r) => {
                const title = r.seo?.title?.en || r.title || r.dishName.en;
                return (
                  <Link
                    key={r._id}
                    to={`/recipes`}
                    className="group flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-lg"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/[0.06] bg-black/40">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/20">
                          {title.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("")}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white tracking-tight truncate">{title}</p>
                        <span className="text-xs">{SOURCE_EMOJI[r.source]}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 font-medium">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 border ${
                          r.isApproved
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/25"
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${r.isApproved ? "bg-emerald-400" : "bg-amber-400"}`} />
                          {r.isApproved ? "Approved" : "Pending"}
                        </span>
                        <span className={`inline-flex text-[9px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 border ${DIFF_COLOR[r.difficulty]}`}>
                          {r.difficulty}
                        </span>
                        {r.cookingTime && <span>· {r.cookingTime}m</span>}
                        <span>· {timeAgo(r.createdAt)}</span>
                      </div>
                    </div>
                    <svg className="text-gray-700 group-hover:text-white transition-colors shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Pending Approval Queue */}
        <Panel
          title="Approval Queue"
          subtitle={stats.pendingRecipes > 0 ? `${stats.pendingRecipes} waiting` : "Empty"}
          eyebrow="Pending"
          eyebrowColor="amber"
          action={stats.pendingRecipes > 5 ? <PanelAction to="/recipes?tab=pending">See all</PanelAction> : null}
        >
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.02] animate-pulse h-16" />
              ))}
            </div>
          ) : pendingRecipes.length === 0 ? (
            <div className="text-center py-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 mb-3 text-xl">✓</div>
              <p className="text-white font-bold text-sm">Inbox zero</p>
              <p className="text-gray-500 text-xs mt-1">All recipes are reviewed.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRecipes.map((r) => {
                const title = r.seo?.title?.en || r.title || r.dishName.en;
                const isApproving = approving === r._id;
                return (
                  <div
                    key={r._id}
                    className="group rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 hover:border-amber-500/25 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-bold text-white tracking-tight line-clamp-2 leading-snug flex-1">{title}</p>
                      <span className="text-sm shrink-0">{SOURCE_EMOJI[r.source]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium mb-2.5">
                      {r.createdBy && (
                        <>
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white inline-flex items-center justify-center text-[8px] font-black">
                            {r.createdBy.firstName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="truncate flex-1">{r.createdBy.firstName} {r.createdBy.lastName}</span>
                        </>
                      )}
                      <span className="shrink-0">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleApprove(r._id)}
                        disabled={isApproving}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_4px_14px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_18px_-4px_rgba(16,185,129,0.55)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
                      >
                        {isApproving ? (
                          <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                        ) : (
                          <>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            Approve
                          </>
                        )}
                      </button>
                      <Link
                        to="/recipes?tab=pending"
                        className="inline-flex items-center justify-center rounded-md border border-white/[0.10] bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.18] transition-all"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* ─── Bottom row: Top categories breakdown + Quick actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Top Categories */}
        <Panel
          title="Top Categories"
          subtitle="By recipe count"
          eyebrow="Breakdown"
          eyebrowColor="violet"
          className="lg:col-span-2"
          action={<PanelAction to="/categories">Manage</PanelAction>}
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5 animate-pulse">
                  <div className="flex justify-between"><div className="h-3 bg-white/5 rounded w-24" /><div className="h-3 bg-white/5 rounded w-8" /></div>
                  <div className="h-2 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : topCategories.length === 0 ? (
            <EmptyHint label="No category data yet." />
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat) => {
                const pct = (cat.count / maxCatCount) * 100;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-gray-300">{cat.name}</p>
                      <p className="text-xs font-black text-white">{cat.count} <span className="text-gray-600 font-medium">recipe{cat.count !== 1 && "s"}</span></p>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#e74c3c] via-[#e74c3c]/80 to-[#c0392b] transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Quick Actions */}
        <Panel
          title="Quick Actions"
          subtitle="Common tasks"
          eyebrow="Shortcuts"
        >
          <div className="space-y-2">
            <QuickAction
              to="/recipes?tab=pending"
              title="Approve Recipes"
              desc="Review pending submissions"
              tone="amber"
              icon={(
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              )}
            />
            <QuickAction
              to="/ingredients"
              title="Add Ingredient"
              desc="Expand the library"
              tone="emerald"
              icon={(
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              )}
            />
            <QuickAction
              to="/categories"
              title="Manage Categories"
              desc="Organize structure"
              tone="violet"
              icon={(
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M3 14h7v7H3z" /><path d="M14 14h7v7h-7z" />
                </svg>
              )}
            />
            <QuickAction
              to="/users"
              title="Manage Users"
              desc="View community + activity"
              tone="red"
              icon={(
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
            />
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────

const ACCENT: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  red:     { bg: "bg-[#e74c3c]/[0.10]",   text: "text-[#ff8a7e]",     border: "border-[#e74c3c]/25",     ring: "from-[#e74c3c]/[0.04]" },
  amber:   { bg: "bg-amber-500/[0.10]",   text: "text-amber-300",     border: "border-amber-500/25",     ring: "from-amber-500/[0.04]" },
  emerald: { bg: "bg-emerald-500/[0.10]", text: "text-emerald-300",   border: "border-emerald-500/25",   ring: "from-emerald-500/[0.04]" },
  violet:  { bg: "bg-violet-500/[0.10]",  text: "text-violet-300",    border: "border-violet-500/25",    ring: "from-violet-500/[0.04]" },
};

function StatCard({
  to, label, value, loading, accent, icon, sub, alert,
}: {
  to: string;
  label: string;
  value: number;
  loading: boolean;
  accent: keyof typeof ACCENT;
  icon: React.ReactNode;
  sub?: string;
  alert?: boolean;
}) {
  const a = ACCENT[accent];
  return (
    <Link
      to={to}
      className="group relative rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-5 transition-all hover:border-white/[0.18] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
      <div className={`pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${a.ring} to-transparent blur-2xl`} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg inline-flex items-center justify-center border ${a.bg} ${a.text} ${a.border}`}>
          {icon}
        </div>
        {alert && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-9 w-20 bg-white/5 rounded animate-pulse mb-2" />
      ) : (
        <p className="text-3xl font-black text-white tracking-tight leading-none">
          {value.toLocaleString()}
        </p>
      )}
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 mt-2">{label}</p>
      {sub && (
        <p className={`text-xs font-medium mt-1 ${alert ? a.text : "text-gray-500"}`}>{sub}</p>
      )}
    </Link>
  );
}

function Panel({
  title, subtitle, eyebrow, eyebrowColor = "red", children, action, className = "",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  eyebrowColor?: "red" | "amber" | "emerald" | "violet";
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const eyebrowColors: Record<string, string> = {
    red: "text-[#e74c3c]",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
    violet: "text-violet-300",
  };
  return (
    <div className={`relative rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="relative px-5 pt-5 pb-3 flex items-start justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <div className={`inline-flex items-center gap-2 mb-1.5 text-[10px] font-black uppercase tracking-[0.22em] ${eyebrowColors[eyebrowColor]}`}>
              <span className="h-1 w-5 bg-current rounded-full opacity-80" />
              {eyebrow}
            </div>
          )}
          <h3 className="text-base font-black text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="relative px-5 pb-5 pt-1">
        {children}
      </div>
    </div>
  );
}

function PanelAction({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-white transition-colors shrink-0 px-2 py-1 rounded-md border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06]"
    >
      {children}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <div className="py-6 text-center">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

function QuickAction({
  to, title, desc, icon, tone,
}: {
  to: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tone: keyof typeof ACCENT;
}) {
  const a = ACCENT[tone];
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:border-white/[0.18] hover:bg-white/[0.05]`}
    >
      <div className={`w-9 h-9 rounded-lg inline-flex items-center justify-center border shrink-0 ${a.bg} ${a.text} ${a.border} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white tracking-tight truncate">{title}</p>
        <p className="text-[10px] text-gray-500 font-medium truncate">{desc}</p>
      </div>
      <svg className="text-gray-700 group-hover:text-white transition-colors shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  );
}

export default Dashboard;
