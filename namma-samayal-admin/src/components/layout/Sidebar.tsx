import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";

// ─── Nav structure — grouped into logical sections ────────────────────────

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: "pending"; // dynamic badge key
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        path: "/",
        label: "Dashboard",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Library",
    items: [
      {
        path: "/recipes",
        label: "Recipes",
        badge: "pending",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        ),
      },
      {
        path: "/ingredients",
        label: "Ingredients",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a5 5 0 0 1 5 5c0 5.25-5 13-5 13S7 12.25 7 7a5 5 0 0 1 5-5z" />
            <circle cx="12" cy="7" r="2" />
          </svg>
        ),
      },
      {
        path: "/categories",
        label: "Categories",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h7v7H3z" />
            <path d="M14 3h7v7h-7z" />
            <path d="M3 14h7v7H3z" />
            <path d="M14 14h7v7h-7z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        path: "/users",
        label: "Users",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        path: "/youtube",
        label: "YouTube Import",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
          </svg>
        ),
      },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("admin@gmail.com");

  // Fetch pending recipes count for the Recipes badge — refresh every 60s
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axiosInstance.get("/admin/recipes/pending?limit=1");
        const total = res.data?.pagination?.total ?? res.data?.data?.length ?? 0;
        setPendingCount(total);
      } catch {
        setPendingCount(null);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Best-effort: pick up admin email from token / localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem("adminEmail");
    if (stored) setAdminEmail(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  const isPathActive = (path: string): boolean => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getBadge = (item: NavItem): number | null => {
    if (item.badge === "pending" && pendingCount && pendingCount > 0) return pendingCount;
    return null;
  };

  return (
    <aside className="w-60 h-screen flex flex-col shrink-0 fixed left-0 top-0 z-30 bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#0a0a0a] border-r border-white/[0.06] text-white">
      {/* Top hairline highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
      {/* Soft red brand glow at the top */}
      <div className="pointer-events-none absolute -top-24 -left-12 w-64 h-64 rounded-full bg-[#e74c3c]/[0.08] blur-3xl" />

      {/* ─── Brand block ─── */}
      <div className="relative px-5 py-5 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#e74c3c] to-[#c0392b] flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(231,76,60,0.5)] group-hover:shadow-[0_12px_30px_-6px_rgba(231,76,60,0.7)] transition-shadow">
            <span className="text-white text-[12px] font-black tracking-tight">NS</span>
            {/* tiny brand spark */}
            <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white/60" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black leading-tight tracking-tight text-white">Namma Samayal</p>
            <p className="text-[9px] text-[#ff8a7e] tracking-[0.25em] uppercase font-bold mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="relative flex-1 py-5 px-3 overflow-y-auto">
        {groups.map((group, gIdx) => (
          <div key={group.label} className={gIdx > 0 ? "mt-5" : ""}>
            {/* Section eyebrow */}
            <div className="flex items-center gap-2 px-3 mb-2">
              <span className="h-px w-3 bg-gradient-to-r from-[#e74c3c] to-transparent" />
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.22em] font-black">
                {group.label}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = isPathActive(item.path);
                const badgeCount = getBadge(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-[#e74c3c]/[0.14] to-[#e74c3c]/[0.02] text-white font-bold"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Active left rail */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-[#e74c3c] to-[#c0392b] shadow-[0_0_12px_rgba(231,76,60,0.6)]" />
                    )}

                    <span
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-[#ff8a7e]" : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span className="flex-1 truncate">{item.label}</span>

                    {/* Badge */}
                    {badgeCount != null && (
                      <span
                        className={`inline-flex items-center justify-center min-w-[20px] h-[18px] rounded-full px-1.5 text-[10px] font-black ${
                          isActive
                            ? "bg-amber-500/25 text-amber-100 border border-amber-400/40"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                        }`}
                        title={`${badgeCount} pending`}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Footer / profile ─── */}
      <div className="relative px-3 py-3 border-t border-white/[0.06] space-y-1">
        {/* Status indicator */}
        <div className="px-3 py-2 mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="text-emerald-300">System Online</span>
        </div>

        {/* Profile chip */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white flex items-center justify-center text-[11px] font-black shadow-[0_4px_12px_-3px_rgba(231,76,60,0.5)] shrink-0">
            {adminEmail[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white leading-tight truncate">{adminEmail}</p>
            <p className="text-[9px] text-[#ff8a7e] tracking-[0.18em] uppercase font-black">Super Admin</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-[#ff8a7e] hover:bg-[#e74c3c]/[0.08] transition-all group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500 group-hover:text-[#ff8a7e] transition-colors"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="text-xs font-black uppercase tracking-[0.15em]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
