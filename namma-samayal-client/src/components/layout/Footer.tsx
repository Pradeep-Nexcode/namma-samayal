"use client";

import Link from "next/link";
import { Mail, ChefHat, CookingPot } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

/* ─── Brand social SVGs (kept inline so no external assets) ────────── */
const Facebook = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.78 8.44-4.94 8.44-9.94z" />
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.66.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.66 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13-.66-.66-1.34-1.07-2.13-1.38-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" />
  </svg>
);

const Twitter = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05A4.28 4.28 0 0 0 11.5 9.13 12.13 12.13 0 0 1 3 4.43a4.28 4.28 0 0 0 1.32 5.7 4.27 4.27 0 0 1-1.94-.54v.06a4.28 4.28 0 0 0 3.43 4.19 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.97A8.59 8.59 0 0 1 2 18.57a12.1 12.1 0 0 0 6.56 1.92c7.88 0 12.19-6.53 12.19-12.19 0-.19 0-.37-.01-.56A8.7 8.7 0 0 0 22.46 6z" />
  </svg>
);

const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.55 3.58 12 3.58 12 3.58s-7.55 0-9.39.5A3 3 0 0 0 .5 6.2C0 8.04 0 12 0 12s0 3.96.5 5.8a3 3 0 0 0 2.11 2.12c1.84.5 9.39.5 9.39.5s7.55 0 9.39-.5a3 3 0 0 0 2.11-2.12C24 15.96 24 12 24 12s0-3.96-.5-5.8zM9.6 15.6V8.4l6.24 3.6L9.6 15.6z" />
  </svg>
);

/* ─── tiny inline doodles ────────────────────────────────────────── */
const HeartDoodle = ({ className }: { className?: string }) => (
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

const LeafSprig = ({ className, flip }: { className?: string; flip?: boolean }) => (
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

/* Sticky-note column header */
function StickyHeader({
  label,
  color = "yellow",
  pin = "red",
  rotation = -2,
}: {
  label: string;
  color?: "yellow" | "pink" | "green";
  pin?: "red" | "green" | "violet";
  rotation?: number;
}) {
  const bg =
    color === "pink"
      ? "#fbd5dd"
      : color === "green"
      ? "#d6efce"
      : "#fff3b0";
  const text =
    color === "pink"
      ? "#7a1133"
      : color === "green"
      ? "#1a4a1e"
      : "#5b3a00";
  const pinColor =
    pin === "green" ? "#16a34a" : pin === "violet" ? "#7c3aed" : "#e11d48";
  return (
    <div className="relative inline-block mb-5" style={{ transform: `rotate(${rotation}deg)` }}>
      {/* Pushpin */}
      <span
        className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full shadow-md"
        style={{
          backgroundColor: pinColor,
          border: "1.5px solid rgba(255,255,255,0.7)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.35)",
        }}
        aria-hidden
      />
      <div
        className="relative px-4 py-1.5 shadow-[0_4px_10px_-4px_rgba(120,80,0,0.3)]"
        style={{
          backgroundColor: bg,
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
        }}
      >
        <p
          className="font-note-hw text-[14px] font-bold uppercase tracking-[0.18em]"
          style={{ color: text }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* Hand-drawn underline for active link */
const ActiveUnderline = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 6" className={className} preserveAspectRatio="none" aria-hidden>
    <path
      d="M2,3 Q 22,1 44,3 T 88,3 T 98,3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-2 font-body text-[15px] transition-colors"
    >
      <span
        className={`inline-flex h-4 w-4 items-center justify-center text-emerald-600/80 dark:text-emerald-400/80`}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3 11 0 16-15 16-15-1 2-8 2.25-13 3.25S2 12.5 2 16.5 4.5 22 4.5 22" />
        </svg>
      </span>
      <span
        className={`relative font-semibold ${
          active
            ? "text-[#e74c3c]"
            : "text-stone-700 dark:text-stone-200 group-hover:text-[#e74c3c] dark:group-hover:text-[#e74c3c]"
        }`}
      >
        {children}
        {active && (
          <span className="absolute left-0 right-0 -bottom-0.5 h-1.5 text-[#e74c3c] pointer-events-none">
            <ActiveUnderline className="h-full w-full" />
          </span>
        )}
      </span>
    </Link>
  );
}

/* ─── Footer ────────────────────────────────────────────────────── */
export function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  // Safe translation lookup with English fallback
  const ts = (key: string, fallback: string) => {
    try {
      const v = t(key);
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  return (
    <footer className="w-full mt-16 px-4 lg:px-6 pb-6">
      <div className="relative mx-auto w-full max-w-7xl">
        {/* Washi tape strips at top corners */}
        <div
          className="absolute -top-2 left-12 z-30 h-4 w-24 opacity-90"
          style={{
            backgroundColor: "rgba(251, 213, 221, 0.85)",
            transform: "rotate(-5deg)",
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          }}
          aria-hidden
        />
        <div
          className="absolute -top-2 right-16 z-30 h-4 w-24 opacity-90"
          style={{
            backgroundColor: "rgba(214, 239, 206, 0.85)",
            transform: "rotate(6deg)",
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          }}
          aria-hidden
        />

        {/* Main paper card */}
        <div
          className="relative rounded-[20px] border border-stone-200/80 dark:border-white/[0.06] shadow-[0_10px_30px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{
            backgroundColor: "var(--ns-nav-bg, #fffdf6)",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 30px, rgba(120,90,40,0.06) 30px, rgba(120,90,40,0.06) 31px)",
          }}
        >
          {/* Spiral binding holes on the LEFT edge */}
          <div className="hidden md:flex absolute top-0 bottom-0 left-2 w-6 flex-col items-center justify-evenly py-6 pointer-events-none" aria-hidden>
            {Array.from({ length: 15 }).map((_, i) => (
              <span
                key={i}
                className="block h-3 w-3 rounded-full bg-stone-200 ring-2 ring-stone-300/70 dark:ring-stone-600/70 shadow-inner"
              />
            ))}
          </div>

          {/* Red heart doodle top-right corner */}
          <div
            className="hidden lg:block absolute top-8 right-10 z-10 h-10 w-10 text-[#e74c3c] pointer-events-none"
            aria-hidden
          >
            <HeartDoodle className="h-full w-full" />
          </div>

          {/* Body */}
          <div className="relative px-6 md:pl-16 md:pr-10 lg:pl-20 py-10 md:py-14">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-10">
              {/* ─── Column 1: Brand ─── */}
              <div className="flex flex-col gap-5">
                <Link href="/" className="flex items-center gap-2.5 shrink-0">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-500/20 dark:to-rose-500/20 text-stone-700 dark:text-stone-200 shadow-sm border border-amber-200/80 dark:border-amber-400/30"
                    aria-hidden
                  >
                    <ChefHat className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="font-title-hw text-[26px] md:text-[28px] font-bold tracking-tight text-stone-900 dark:text-white">
                    Namma <span className="text-[#e74c3c]">Samayal</span>
                  </span>
                </Link>

                <p className="font-note-hw text-[15px] text-stone-600 dark:text-stone-300 -mt-2">
                  Namma veetu samayal, ungal veetukku{" "}
                  <span className="text-rose-500">❤</span>
                </p>

                <p className="font-body text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300">
                  {ts(
                    "footer.tagline",
                    "Your ultimate culinary companion. Explore, catalog, and share the best recipes and ingredients."
                  )}
                </p>

                {/* Dashed separator */}
                <div className="border-t border-dashed border-stone-300 dark:border-white/10 my-1" />

                {/* Language */}
                <div>
                  <p className="font-title-hw text-[12px] font-bold uppercase tracking-[0.18em] text-[#e74c3c] mb-2">
                    {ts("footer.language", "Language")}
                  </p>
                  <LanguageSwitcher variant="light" />
                </div>

                {/* Socials */}
                <div className="flex items-center gap-3 mt-2">
                  {[
                    {
                      label: "Facebook",
                      Comp: Facebook,
                      color: "text-[#1877f2]",
                      bg: "bg-blue-50 dark:bg-blue-500/10",
                    },
                    {
                      label: "Instagram",
                      Comp: Instagram,
                      color: "text-[#e1306c]",
                      bg: "bg-pink-50 dark:bg-pink-500/10",
                    },
                    {
                      label: "YouTube",
                      Comp: Youtube,
                      color: "text-[#ff0000]",
                      bg: "bg-red-50 dark:bg-red-500/10",
                    },
                    {
                      label: "Twitter",
                      Comp: Twitter,
                      color: "text-[#1da1f2]",
                      bg: "bg-sky-50 dark:bg-sky-500/10",
                    },
                  ].map(({ label, Comp, color, bg }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} ${color} transition-transform hover:scale-110 hover:-rotate-3 shadow-sm`}
                    >
                      <Comp className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* ─── Column 2: Home & Explore ─── */}
              <div className="flex flex-col gap-1">
                <StickyHeader
                  label={ts("footer.homeExplore", "Home & Explore")}
                  color="yellow"
                  pin="red"
                  rotation={-2}
                />
                <nav className="flex flex-col gap-3">
                  <NavLink href="/">{ts("nav.home", "Home")}</NavLink>
                  <NavLink href="/recipes" active>
                    {ts("footer.allRecipes", "All Recipes")}
                  </NavLink>
                  <NavLink href="/ingredients">
                    {ts("footer.ingredientLibrary", "Ingredient Library")}
                  </NavLink>
                  <NavLink href="/explore">
                    {ts("footer.exploreCuisines", "Explore Cuisines")}
                  </NavLink>
                  <NavLink href="#">{ts("footer.foodStories", "Food Stories")}</NavLink>
                  <NavLink href="#">
                    {ts("footer.recipeCollections", "Recipe Collections")}
                  </NavLink>
                  <NavLink href="#">
                    {ts("footer.seasonalRecipes", "Seasonal Recipes")}
                  </NavLink>
                </nav>
              </div>

              {/* ─── Column 3: Community ─── */}
              <div className="flex flex-col gap-1">
                <StickyHeader
                  label={ts("footer.community", "Community")}
                  color="pink"
                  pin="green"
                  rotation={2}
                />
                <nav className="flex flex-col gap-3">
                  <NavLink href="/recipes/create">
                    {ts("footer.submitRecipe", "Submit a Recipe")}
                  </NavLink>
                  <NavLink href="/profile">
                    {ts("footer.myProfile", "My Profile")}
                  </NavLink>
                  <NavLink href="#">{ts("footer.myRecipes", "My Recipes")}</NavLink>
                  <NavLink href="#">
                    {ts("footer.topAuthors", "Top Authors")}
                  </NavLink>
                  <NavLink href="#">
                    {ts("footer.communityFeed", "Community Feed")}
                  </NavLink>
                  <NavLink href="#">
                    {ts("footer.communityRules", "Community Rules")}
                  </NavLink>
                  <NavLink href="#">
                    {ts("footer.helpSupport", "Help & Support")}
                  </NavLink>
                </nav>
              </div>

              {/* ─── Column 4: Stay Updated ─── */}
              <div className="flex flex-col gap-1">
                <StickyHeader
                  label={ts("footer.stayUpdated", "Stay Updated")}
                  color="green"
                  pin="violet"
                  rotation={-1.5}
                />
                <p className="font-body text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 mb-3">
                  {ts(
                    "footer.newsletterDesc",
                    "Join our newsletter for the latest seasonal recipes, ingredient drops, and more."
                  )}
                </p>
                <form className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                    <input
                      type="email"
                      placeholder={ts(
                        "footer.emailPlaceholder",
                        "Enter your email"
                      )}
                      className="w-full rounded-lg border-2 border-stone-200 dark:border-white/[0.06] bg-white/70 dark:bg-white/5 py-2.5 pl-10 pr-3 font-body text-sm font-medium text-stone-900 dark:text-stone-50 placeholder-stone-400 outline-none focus:border-[#e74c3c] transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center rounded-lg bg-[#e74c3c] px-4 py-2.5 font-title-hw text-[16px] font-bold text-white border-2 border-[#c0392b]/40 hover:bg-[#c0392b] transition-colors shadow-[1px_2px_0_rgba(120,40,40,0.25)] active:translate-y-px active:shadow-none"
                  >
                    {ts("footer.subscribe", "Subscribe")}
                    {/* Heart doodle on the right of button */}
                    <span
                      className="absolute -right-3 -bottom-2 h-6 w-6 text-rose-500 hidden sm:block"
                      aria-hidden
                    >
                      <HeartDoodle className="h-full w-full" />
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom-row stickies + central cooking pot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-12">
              {/* Blue sticky bottom-left */}
              <div className="flex md:justify-start justify-center">
                <div className="relative pt-2">
                  <div
                    className="absolute -top-1 left-4 z-20 h-3 w-14 opacity-90"
                    style={{
                      backgroundColor: "rgba(251, 213, 221, 0.85)",
                      transform: "rotate(-4deg)",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                    }}
                    aria-hidden
                  />
                  <div
                    className="relative px-4 pt-4 pb-3 shadow-[0_6px_18px_-6px_rgba(0,120,180,0.25)]"
                    style={{
                      backgroundColor: "#d6e9f5",
                      transform: "rotate(-2deg)",
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                    }}
                  >
                    <p className="font-note-hw text-[15px] leading-snug text-sky-900 text-center font-bold">
                      Made with love
                      <br /> by food lovers!{" "}
                      <span className="text-rose-500">❤</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Central cooking pot illustration */}
              <div className="flex justify-center text-stone-400 dark:text-stone-500">
                <svg viewBox="0 0 120 100" className="h-20 w-24" aria-hidden>
                  {/* Steam */}
                  <path
                    d="M50 22 Q 48 10, 55 6 Q 60 14, 56 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M62 26 Q 60 14, 68 10 Q 72 18, 68 26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M74 22 Q 72 12, 78 8 Q 82 16, 78 22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Pot body */}
                  <path
                    d="M22 42 L 22 80 Q 22 92, 35 92 L 85 92 Q 98 92, 98 80 L 98 42 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Pot lid */}
                  <path
                    d="M18 42 L 102 42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="34" r="3" fill="currentColor" />
                  {/* Handles */}
                  <path
                    d="M12 50 Q 4 50, 4 58 Q 4 66, 12 66"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M108 50 Q 116 50, 116 58 Q 116 66, 108 66"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Soup line inside */}
                  <path
                    d="M30 60 Q 60 56, 90 60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                  {/* Heart next to pot */}
                  <path
                    d="M108 78 C 102 74, 100 70, 104 67 C 107 65, 109 67, 110 70 C 111 67, 113 65, 116 67 C 120 70, 118 74, 110 80 Z"
                    fill="#e74c3c"
                    opacity="0.65"
                  />
                </svg>
              </div>

              {/* Yellow sticky bottom-right */}
              <div className="flex md:justify-end justify-center">
                <div className="relative pt-2">
                  <div
                    className="absolute -top-1 right-6 z-20 h-3 w-14 opacity-90"
                    style={{
                      backgroundColor: "rgba(214, 239, 206, 0.85)",
                      transform: "rotate(5deg)",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                    }}
                    aria-hidden
                  />
                  <div
                    className="relative px-4 pt-4 pb-3 shadow-[0_6px_18px_-6px_rgba(180,140,0,0.3)]"
                    style={{
                      backgroundColor: "#fff3b0",
                      transform: "rotate(2deg)",
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                    }}
                  >
                    <p className="font-note-hw text-[14px] leading-snug text-amber-900 text-center">
                      Cook with love <span className="text-rose-500">★</span>
                      <br />
                      Share with joy,
                      <br />
                      Eat with family.
                    </p>
                    <p className="text-center mt-1 text-base">😊</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative leaf sprigs in bottom corners */}
            <div
              className="hidden lg:block absolute bottom-6 left-12 h-24 w-12 opacity-70 text-lime-600 dark:text-lime-400"
              style={{ transform: "rotate(-12deg)" }}
              aria-hidden
            >
              <LeafSprig className="h-full w-full" />
            </div>
            <div
              className="hidden lg:block absolute bottom-6 right-8 h-24 w-12 opacity-70 text-lime-600 dark:text-lime-400"
              style={{ transform: "rotate(14deg)" }}
              aria-hidden
            >
              <LeafSprig className="h-full w-full" flip />
            </div>
          </div>

          {/* Kraft-paper torn bottom strip */}
          <div
            className="relative px-6 md:px-10 py-4 border-t border-stone-300/60"
            style={{
              backgroundColor: "#e9d9b8",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 8px), radial-gradient(rgba(120,80,30,0.12) 1px, transparent 1px)",
              backgroundSize: "auto, 4px 4px",
            }}
          >
            {/* "Torn edge" — small triangular notches along the top */}
            <div
              className="absolute -top-2 left-0 right-0 h-2 pointer-events-none"
              style={{
                backgroundColor: "#e9d9b8",
                clipPath:
                  "polygon(0 100%, 1% 0, 2% 100%, 3% 20%, 4% 100%, 5% 30%, 6% 100%, 7% 10%, 8% 100%, 9% 50%, 10% 100%, 11% 0, 12% 100%, 13% 30%, 14% 100%, 15% 10%, 16% 100%, 17% 20%, 18% 100%, 19% 0, 20% 100%, 21% 30%, 22% 100%, 23% 10%, 24% 100%, 25% 50%, 26% 100%, 27% 0, 28% 100%, 29% 30%, 30% 100%, 31% 10%, 32% 100%, 33% 20%, 34% 100%, 35% 0, 36% 100%, 37% 30%, 38% 100%, 39% 10%, 40% 100%, 41% 50%, 42% 100%, 43% 0, 44% 100%, 45% 30%, 46% 100%, 47% 10%, 48% 100%, 49% 20%, 50% 100%, 51% 0, 52% 100%, 53% 30%, 54% 100%, 55% 10%, 56% 100%, 57% 50%, 58% 100%, 59% 0, 60% 100%, 61% 30%, 62% 100%, 63% 10%, 64% 100%, 65% 20%, 66% 100%, 67% 0, 68% 100%, 69% 30%, 70% 100%, 71% 10%, 72% 100%, 73% 50%, 74% 100%, 75% 0, 76% 100%, 77% 30%, 78% 100%, 79% 10%, 80% 100%, 81% 20%, 82% 100%, 83% 0, 84% 100%, 85% 30%, 86% 100%, 87% 10%, 88% 100%, 89% 50%, 90% 100%, 91% 0, 92% 100%, 93% 30%, 94% 100%, 95% 10%, 96% 100%, 97% 20%, 98% 100%, 99% 0, 100% 100%)",
              }}
              aria-hidden
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                <CookingPot className="h-4 w-4 text-stone-700 dark:text-stone-200" />
                <p className="font-body text-[13.5px] font-semibold">
                  © {year} Namma Samayal.{" "}
                  {ts("footer.allRights", "All rights reserved.")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <Link
                  href="#"
                  className="font-title-hw text-[14.5px] font-bold text-stone-800 dark:text-stone-100 hover:text-[#e74c3c] transition-colors"
                >
                  {ts("footer.privacy", "Privacy Policy")}
                </Link>
                <span className="text-stone-500 dark:text-stone-400" aria-hidden>
                  |
                </span>
                <Link
                  href="#"
                  className="font-title-hw text-[14.5px] font-bold text-stone-800 dark:text-stone-100 hover:text-[#e74c3c] transition-colors"
                >
                  {ts("footer.terms", "Terms of Service")}
                </Link>
                <span className="text-stone-500 dark:text-stone-400" aria-hidden>
                  |
                </span>
                <Link
                  href="#"
                  className="font-title-hw text-[14.5px] font-bold text-stone-800 dark:text-stone-100 hover:text-[#e74c3c] transition-colors"
                >
                  {ts("footer.cookies", "Cookies")}
                </Link>
                <span className="text-stone-500 dark:text-stone-400" aria-hidden>
                  |
                </span>
                <Link
                  href="#"
                  className="font-title-hw text-[14.5px] font-bold text-stone-800 dark:text-stone-100 hover:text-[#e74c3c] transition-colors"
                >
                  {ts("footer.sitemap", "Sitemap")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
