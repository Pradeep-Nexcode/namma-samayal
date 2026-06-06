import { useLocation } from "react-router-dom";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/":            { title: "Dashboard",       subtitle: "Overview of your platform" },
  "/recipes":     { title: "Recipes",         subtitle: "Manage and approve recipes" },
  "/ingredients": { title: "Ingredients",     subtitle: "Manage ingredient library" },
  "/categories":  { title: "Categories",      subtitle: "Manage recipe categories" },
  "/youtube":     { title: "YouTube Import",  subtitle: "Extract transcripts and import recipes from YouTube" },
};

const Header = () => {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: "Admin", subtitle: "" };

  return (
    <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-sm font-bold text-white tracking-tight leading-tight">{page.title}</h1>
        <p className="text-[11px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 text-gray-400 hover:text-white transition-all">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#e74c3c] shadow-[0_0_8px_rgba(231,76,60,0.6)]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 hover:bg-white/[0.08] transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white flex items-center justify-center text-[11px] font-black shadow-[0_2px_12px_rgba(231,76,60,0.35)]">
            A
          </div>
          <span className="text-xs font-bold text-gray-200 tracking-wide">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
