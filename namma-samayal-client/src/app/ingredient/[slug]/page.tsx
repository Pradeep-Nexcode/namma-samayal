"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Leaf,
  Calendar,
  ChefHat,
  Star,
  RefreshCcw,
  Utensils,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Heart,
  Clock,
  Wheat,
} from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
import { getIngredientById } from "@/features/ingredient/services/ingredientApi";
import { getRecipes } from "@/features/recipe/services/recipeApi";
import { useLang } from "@/contexts/LanguageContext";
import type { Ingredient } from "@/types/ingredient";
import type { Recipe } from "@/types/recipe";

/* ─── Decorative SVGs ─────────────────────────────────────────── */
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
    <svg viewBox="0 0 100 200" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M50 195 Q 47 100, 50 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
      {[[170,1.05,22],[140,1.0,28],[110,0.9,34],[80,0.78,42],[55,0.6,50]].map(([y,s,a],i)=>(
        <g key={i}>
          <g transform={`translate(50, ${y}) rotate(${-a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i*0.04} />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180+a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i*0.04} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 4 L 16 12 M16 20 L 16 28 M4 16 L 12 16 M20 16 L 28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <path d="M8 8 L 12 12 M20 20 L 24 24 M24 8 L 20 12 M12 20 L 8 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function SmileyDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8 14 Q 12 17, 16 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Spiral binding for the notebook hero ─── */
function SpiralBinding() {
  return (
    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-7 z-30 hidden lg:flex flex-col items-center justify-evenly py-4 pointer-events-none" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="relative">
          <span
            className="block h-4 w-4 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(120,90,40,0.55) 0%, rgba(120,90,40,0.2) 60%, transparent 100%)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            }}
          />
          <span
            className="absolute inset-0 rounded-full border-[2.5px]"
            style={{
              borderColor: "#b8915b",
              borderTopColor: "#d4a76b",
              borderRightColor: "#a47a3f",
              borderBottomColor: "#7f5a28",
              transform: "rotate(-25deg)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Tape strip helper ─── */
function TapeStrip({
  color = "yellow", className = "", rotate = -4, width = "w-16",
}: {
  color?: "yellow" | "pink" | "blue" | "green";
  className?: string; rotate?: number; width?: string;
}) {
  const bg = color === "pink" ? "rgba(251,213,221,0.85)"
    : color === "blue" ? "rgba(214,233,245,0.85)"
    : color === "green" ? "rgba(214,239,206,0.85)"
    : "rgba(255,243,176,0.85)";
  return (
    <div className={`${width} h-4 ${className}`}
      style={{
        backgroundColor: bg, transform: `rotate(${rotate}deg)`,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }} aria-hidden />
  );
}

/* ─── Page background style for the open notebook ─── */
function notebookPageStyle(): React.CSSProperties {
  return {
    backgroundColor: "#f3ecda",
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(120,90,40,0.04) 0 1px, transparent 1px 6px), radial-gradient(rgba(120,80,30,0.05) 1px, transparent 1px)",
    backgroundSize: "auto, 4px 4px",
  };
}

/* ─── Small info chip used in the hero row ─── */
function InfoChip({
  icon: Icon, label, value, className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; className?: string;
}) {
  return (
    <div className={`rounded-xl bg-white/60 dark:bg-white/5 border border-stone-200/80 px-3 py-2.5 ${className}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
        <span className="font-body text-[9.5px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
          {label}
        </span>
      </div>
      <p className="font-title-hw text-[16px] md:text-[17px] font-bold text-stone-900 dark:text-stone-50 leading-tight">
        {value}
      </p>
    </div>
  );
}

/* ─── Horizontal scroller ─── */
function ScrollRow({
  children, className = "",
}: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) => {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  };
  return (
    <div className={`relative ${className}`}>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-1 scroll-smooth snap-x scrollbar-hide">
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(280)}
        aria-label="Scroll right"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/90 border border-stone-200 dark:border-white/[0.06] text-stone-700 dark:text-stone-200 hover:bg-white hover:text-[#e74c3c] hover:border-[#e74c3c] shadow-md backdrop-blur"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── Substitute card ─── */
function SubstituteCard({
  name, imageUrl, attrs, href,
}: {
  name: string; imageUrl?: string;
  attrs?: { texture?: string; flavor?: string; cookingTime?: string; notes?: string };
  href?: string;
}) {
  const content = (
    <div className="shrink-0 snap-start w-[200px] rounded-2xl paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_6px_16px_-10px_rgba(120,90,40,0.25)] hover:shadow-[0_10px_22px_-10px_rgba(120,90,40,0.35)] hover:-translate-y-1 transition-all duration-300 p-4 flex flex-col items-center text-center">
      <div className="w-full h-24 mb-3 flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} loading="lazy" className="max-h-full max-w-full object-contain drop-shadow-md" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Leaf className="h-8 w-8" />
          </div>
        )}
      </div>
      <p className="font-title-hw text-[17px] font-bold text-stone-900 dark:text-stone-50 leading-tight mb-1.5">
        {name}
      </p>
      <div className="space-y-0.5">
        {attrs?.texture && (
          <p className="font-body text-[11.5px] text-stone-600 dark:text-stone-300">{attrs.texture}</p>
        )}
        {attrs?.flavor && (
          <p className="font-body text-[11.5px] text-stone-600 dark:text-stone-300">{attrs.flavor}</p>
        )}
        {attrs?.cookingTime && (
          <p className="font-body text-[11.5px] text-stone-600 dark:text-stone-300">{attrs.cookingTime}</p>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

/* ─── Helpers ─── */
const STATUS_LABEL: Record<string, string> = {
  "fresh-available": "Fresh & Available",
  "seasonal": "Seasonal",
  "limited": "Limited",
  "out-of-stock": "Out of Stock",
};

function formatOrigin(o?: { country?: string; state?: string }): string {
  if (!o) return "India";
  return [o.state, o.country].filter(Boolean).join(", ") || "India";
}

function formatSeason(s?: { availability?: string; bestMonths?: number[] }): string {
  if (!s || !s.availability || s.availability === "year-round") return "Year Round";
  return "Seasonal";
}

/* ─── Page ─── */
export default function IngredientDetailPage() {
  const params = useParams<{ slug: string }>();
  const { t, lf } = useLang();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [usedInRecipes, setUsedInRecipes] = useState<Recipe[]>([]);

  // Safe translation lookup with English fallback
  const ts = (key: string, fallback: string) => {
    try {
      const v = t(key);
      if (!v || v === key) return fallback;
      return v;
    } catch { return fallback; }
  };

  useEffect(() => {
    if (!params?.slug) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getIngredientById(params.slug);
        if (!cancelled) setIngredient(data);
        // Best-effort fetch of recipes that use this ingredient
        try {
          const result = await getRecipes({ ingredient: params.slug, limit: 10 });
          if (!cancelled) setUsedInRecipes(result.data);
        } catch {
          if (!cancelled) setUsedInRecipes([]);
        }
      } catch {
        if (!cancelled) setError("Failed to load ingredient detail. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params?.slug]);

  // Nutrition rows — only show entries that have a value
  const nutritionRows = useMemo(() => {
    if (!ingredient?.nutrition) return [] as Array<{ key: string; label: string; value: string }>;
    const n = ingredient.nutrition;
    const dv = n.dailyValue;
    const fmt = (v: number | undefined, unit: string) => (v != null ? `${v} ${unit}` : undefined);
    const dvFmt = (v: number | undefined) => (v != null ? `${v}% DV` : undefined);
    const rows: Array<{ key: string; label: string; value: string }> = [];
    const push = (key: string, label: string, value?: string) => {
      if (value) rows.push({ key, label, value });
    };
    push("calories", "Calories", fmt(n.calories, "kcal"));
    push("protein", "Protein", fmt(n.protein, "g"));
    push("carbs", "Carbohydrates", fmt(n.carbs, "g"));
    push("fiber", "Fiber", fmt(n.fiber, "g"));
    push("fat", "Fat", fmt(n.fat, "g"));
    push("iron", "Iron", fmt(n.iron, "mg") || (dv?.iron != null ? dvFmt(dv.iron) : undefined));
    push("calcium", "Calcium", fmt(n.calcium, "mg") || (dv?.calcium != null ? dvFmt(dv.calcium) : undefined));
    push("vitaminA", "Vitamin A", dvFmt(dv?.vitaminA) || fmt(n.vitaminA, "µg"));
    push("vitaminC", "Vitamin C", dvFmt(dv?.vitaminC) || fmt(n.vitaminC, "mg"));
    return rows;
  }, [ingredient]);

  if (loading) {
    return (
      <div className="paper-bg min-h-[60vh] flex items-center justify-center"><Loader /></div>
    );
  }
  if (error) {
    return (
      <main className="paper-bg min-h-screen mx-auto w-full max-w-7xl px-4 pt-32 pb-12">
        <ErrorMessage message={error} />
      </main>
    );
  }
  if (!ingredient) return null;

  const name = lf(ingredient.name);
  const nameTa = ingredient.name.ta;
  const description = lf(ingredient.description) || "";
  const whySpecial = lf(ingredient.whySpecial) || "";
  const chefTipText = ingredient.chefTip
    ? lf({ en: ingredient.chefTip.en ?? "", ta: ingredient.chefTip.ta })
    : "";
  const chefTipBy = ingredient.chefTip?.attributedTo || "Namma Samayal Chef";
  const howToStore = lf(ingredient.howToStore) ||
    "Wash gently and wrap in a clean kitchen towel. Store in the refrigerator and use within 2-3 days for best freshness.";
  const benefits = (ingredient.quickBenefits || []).map((b) => lf(b)).filter(Boolean);
  const bestMonths = new Set<number>(ingredient.season?.bestMonths || []);
  // If year-round and no months specified, mark all months as "best"
  const yearRound = !ingredient.season || ingredient.season.availability === "year-round";

  return (
    <main className="paper-bg min-h-screen font-ui text-stone-900 dark:text-stone-50 pt-28 pb-12 overflow-x-hidden">
      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-2 font-body text-[13px] text-stone-600 dark:text-stone-300"
        >
          <Link href="/ingredients" className="flex items-center gap-1.5 hover:text-[#e74c3c] transition-colors group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            {ts("ingredient.backTo", "Back to Ingredients")}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          {ingredient.category && (
            <>
              <span className="text-stone-500 dark:text-stone-400">{lf(ingredient.category.name)}</span>
              <ChevronRight className="h-3 w-3 opacity-40" />
            </>
          )}
          <span className="font-semibold text-stone-700 dark:text-stone-200 truncate max-w-[200px]">{name}</span>
        </motion.div>

        {/* ─── HERO: open notebook ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-14"
        >
          {/* Notebook (book cover + two pages) */}
          <div
            className="relative rounded-[12px] border-4 shadow-[0_20px_45px_-18px_rgba(120,90,40,0.5)]"
            style={{ borderColor: "#8c6938", backgroundColor: "#8c6938" }}
          >
            <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[440px] rounded-[3px] overflow-hidden">
              <SpiralBinding />

              {/* LEFT PAGE: copy */}
              <div className="np-page-kraft relative px-6 md:px-8 py-7 md:py-9 lg:pr-12">
                {/* PREMIUM tape (always visible — flips between PREMIUM and ORGANIC) */}
                <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                  style={{
                    backgroundColor: "rgba(251, 213, 221, 0.9)",
                    backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                    transform: "rotate(-1.5deg)",
                  }}
                >
                  <Sparkles className="h-3 w-3 text-rose-700 dark:text-rose-300" />
                  <span className="font-note-hw text-[12px] font-bold uppercase tracking-[0.16em] text-rose-900">
                    {ingredient.isPremium ? "Premium Ingredient" : "Featured Ingredient"}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-title-hw text-[34px] md:text-[40px] lg:text-[44px] font-bold leading-[1.05] text-stone-900 dark:text-stone-50">
                  {name}
                </h1>
                {nameTa && (
                  <p className="font-note-hw text-[20px] text-stone-700 dark:text-stone-200 mt-1">{nameTa}</p>
                )}

                {/* Description */}
                {description && (
                  <p className="font-body text-[14px] md:text-[15px] text-stone-700 dark:text-stone-200 leading-relaxed mt-3 max-w-md">
                    {description}
                  </p>
                )}

                {/* 4 info chips */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
                  <InfoChip
                    icon={Tag}
                    label={ts("ingredient.category", "Category")}
                    value={ingredient.category ? lf(ingredient.category.name) : "—"}
                  />
                  <InfoChip
                    icon={ShieldCheck}
                    label={ts("ingredient.status", "Status")}
                    value={STATUS_LABEL[ingredient.status || "fresh-available"]}
                  />
                  <InfoChip
                    icon={MapPin}
                    label={ts("ingredient.origin", "Origin")}
                    value={formatOrigin(ingredient.origin)}
                  />
                  <InfoChip
                    icon={Calendar}
                    label={ts("ingredient.season", "Season")}
                    value={formatSeason(ingredient.season)}
                  />
                </div>

                {/* Why it's special — green sticky */}
                {whySpecial && (
                  <div className="relative mt-5">
                    <TapeStrip color="yellow" className="absolute -top-1 left-6 z-10" rotate={-6} width="w-12" />
                    <div
                      className="px-4 pt-4 pb-3 shadow-[0_6px_14px_-6px_rgba(60,140,60,0.3)]"
                      style={{
                        backgroundColor: "#d6efce",
                        transform: "rotate(-0.6deg)",
                        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="font-title-hw text-[14px] font-bold text-emerald-900">
                          {ts("ingredient.whySpecial", "Why it's special")}
                        </p>
                        <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                      </div>
                      <p className="font-note-hw text-[14px] leading-snug text-emerald-950">
                        {whySpecial}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT PAGE: image */}
              <div className="np-page-kraft relative px-4 md:px-6 py-7 md:py-9 lg:pl-10 flex items-center justify-center">
                <TapeStrip color="yellow" className="absolute top-3 left-1/2 -translate-x-1/2 z-20" rotate={-3} width="w-20" />
                <div className="w-full max-w-[280px] md:max-w-[300px] aspect-square flex items-center justify-center">
                  {ingredient.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ingredient.imageUrl}
                      alt={name}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
                    />
                  ) : (
                    <div className="h-48 w-48 rounded-full bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
                      <Leaf className="h-20 w-20 text-emerald-700 opacity-60" />
                    </div>
                  )}
                </div>

                {/* Small scattered leaves under the image */}
                <div className="absolute bottom-3 right-6 h-10 w-10 text-emerald-700 opacity-60 hidden md:block" style={{ transform: "rotate(20deg)" }} aria-hidden>
                  <Leaf className="h-full w-full" />
                </div>
                <div className="absolute bottom-6 right-16 h-7 w-7 text-emerald-700 opacity-50 hidden md:block" style={{ transform: "rotate(-15deg)" }} aria-hidden>
                  <Leaf className="h-full w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right rail: Quick Actions + Chef's Tip */}
          <div className="space-y-5">
            {/* Quick Actions card */}
            <div className="relative rounded-2xl paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_6px_18px_-10px_rgba(120,90,40,0.2)] p-5">
              <div className="absolute top-3 right-3 h-5 w-5 text-amber-500 pointer-events-none" aria-hidden>
                <Sparkle className="h-full w-full" />
              </div>
              <h3 className="font-title-hw text-[20px] font-bold text-stone-900 dark:text-stone-50 mb-3">
                {ts("ingredient.quickActions", "Quick Actions")}
              </h3>
              <div className="space-y-2.5">
                <a
                  href={`/recipes?ingredient=${ingredient._id}`}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#e74c3c] hover:bg-[#c0392b] text-white px-4 py-2.5 font-title-hw text-[15px] font-bold transition-colors shadow-[1px_2px_0_rgba(120,40,40,0.25)] active:translate-y-px active:shadow-none"
                >
                  <Utensils className="h-4 w-4" />
                  {ts("ingredient.findRecipes", "Find Recipes with this")}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("substitutes")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-lg paper-card text-stone-900 dark:text-stone-50 border-2 border-dashed border-stone-300 dark:border-white/10 px-4 py-2.5 font-title-hw text-[15px] font-bold hover:border-[#e74c3c] hover:text-[#e74c3c] transition-colors shadow-[1px_2px_0_rgba(120,90,40,0.15)] active:translate-y-px active:shadow-none"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {ts("ingredient.showSubstitutes", "Show Substitutes")}
                </button>
              </div>
            </div>

            {/* Chef's Tip card */}
            {chefTipText && (
              <div className="relative rounded-2xl paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_6px_18px_-10px_rgba(120,90,40,0.2)] p-5">
                <div className="absolute top-3 right-3 h-5 w-5 text-rose-500 pointer-events-none" aria-hidden>
                  <Heart className="h-full w-full fill-current" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <ChefHat className="h-4 w-4" />
                  </span>
                  <h3 className="font-title-hw text-[20px] font-bold text-stone-900 dark:text-stone-50">
                    {ts("ingredient.chefTip", "Chef's Tip")}
                  </h3>
                </div>
                <blockquote className="font-body text-[14px] text-stone-700 dark:text-stone-200 italic leading-relaxed mb-3">
                  &ldquo;{chefTipText}&rdquo;
                </blockquote>
                <p className="font-body text-[12.5px] text-stone-500 dark:text-stone-400">
                  – {chefTipBy}
                </p>
                <div className="absolute bottom-3 right-3 h-12 w-6 text-emerald-700 opacity-60 hidden md:block" style={{ transform: "rotate(15deg)" }} aria-hidden>
                  <LeafSprig className="h-full w-full" />
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ─── BEST SUBSTITUTES ─── */}
        {ingredient.substitutes && ingredient.substitutes.length > 0 && (
          <motion.section
            id="substitutes"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative rounded-2xl paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] p-5 md:p-6 mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Leaf className="h-4 w-4" />
              </span>
              <h2 className="font-title-hw text-[22px] md:text-[24px] font-bold text-stone-900 dark:text-stone-50">
                {ts("ingredient.bestSubstitutes", "Best Substitutes")}
              </h2>
            </div>
            <ScrollRow>
              {ingredient.substitutes.map((sub) => {
                const attrs = ingredient.substituteNotes?.[sub._id];
                return (
                  <SubstituteCard
                    key={sub._id}
                    name={lf(sub.name)}
                    imageUrl={sub.imageUrl}
                    attrs={attrs}
                    href={`/ingredient/${sub.slug ?? sub._id}`}
                  />
                );
              })}
            </ScrollRow>
          </motion.section>
        )}

        {/* ─── NUTRITION + USED IN RECIPES ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 mb-12">
          {/* Nutritional Benefits — torn paper card */}
          {nutritionRows.length > 0 && (
            <div className="relative">
              <TapeStrip color="yellow" className="absolute -top-1 left-6 z-10" rotate={-6} width="w-14" />
              <div
                className="relative px-5 pt-5 pb-5 shadow-[0_8px_22px_-8px_rgba(120,90,40,0.3)]"
                style={{
                  backgroundColor: "#fffaee",
                  clipPath: "polygon(0 2%, 4% 0, 98% 1%, 100% 6%, 99% 96%, 96% 100%, 4% 99%, 1% 95%, 0 60%)",
                }}
              >
                <h3 className="font-title-hw text-[19px] md:text-[20px] font-bold text-stone-900 dark:text-stone-50 mb-1">
                  {ts("ingredient.nutrition", "Nutritional Benefits")}{" "}
                  <span className="font-body text-[12px] font-medium text-stone-500 dark:text-stone-400">(per 100g)</span>
                </h3>
                <ul className="divide-y divide-dashed divide-stone-200 font-body text-[13.5px] mt-2">
                  {nutritionRows.map((row) => (
                    <li key={row.key} className="flex items-center justify-between gap-2 py-1.5">
                      <span className="flex items-center gap-2 text-stone-700 dark:text-stone-200">
                        <Leaf className="h-3 w-3 text-emerald-600 shrink-0" />
                        {row.label}
                      </span>
                      <span className="font-bold text-stone-900 dark:text-stone-50 tabular-nums">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pink quick benefits sticky overlay */}
              {benefits.length > 0 && (
                <div
                  className="relative -mt-4 ml-4 max-w-[220px] px-4 pt-4 pb-3 shadow-[0_8px_18px_-8px_rgba(220,80,90,0.4)]"
                  style={{
                    backgroundColor: "#fbd5dd",
                    transform: "rotate(-3deg)",
                    backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                  }}
                >
                  <ul className="space-y-1 font-note-hw text-[14px] text-rose-950">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-rose-700 dark:text-rose-300 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end mt-1.5 text-rose-600 dark:text-rose-400">
                    <SmileyDoodle className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Used in These Recipes */}
          <div className="rounded-2xl paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:text-rose-400">
                  <Utensils className="h-4 w-4" />
                </span>
                <h2 className="font-title-hw text-[22px] md:text-[24px] font-bold text-stone-900 dark:text-stone-50 truncate">
                  {ts("ingredient.usedIn", "Used in These Recipes")}
                </h2>
              </div>
              {usedInRecipes.length > 0 && (
                <Link
                  href={`/recipes?ingredient=${ingredient._id}`}
                  className="inline-flex items-center gap-1 font-title-hw text-[14.5px] font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors shrink-0"
                >
                  {ts("ingredient.viewAll", "View All")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            {usedInRecipes.length === 0 ? (
              <div className="py-10 text-center font-note-hw text-stone-500 dark:text-stone-400">
                {ts("ingredient.noRecipesYet", "No recipes use this ingredient yet — be the first to add one!")}
              </div>
            ) : (
              <ScrollRow>
                {usedInRecipes.map((r) => {
                  const ratings = r.ratings?.length ?? 0;
                  const avg = r.averageRating ?? 0;
                  const title = lf(r.seo?.title) || r.title || lf(r.dishName);
                  return (
                    <Link
                      key={r._id}
                      href={`/recipe/${r.slug ?? r._id}`}
                      className="shrink-0 snap-start w-[180px] group"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100 dark:bg-white/5 mb-2 border border-stone-200 dark:border-white/[0.06]">
                        {r.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.imageUrl}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-stone-400 dark:text-stone-500">
                            <ChefHat className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-title-hw text-[15.5px] font-bold text-stone-900 dark:text-stone-50 line-clamp-1 group-hover:text-[#e74c3c] transition-colors">
                        {title}
                      </h3>
                      {(r.location?.state || r.location?.region) && (
                        <p className="font-body text-[11.5px] text-stone-500 dark:text-stone-400 line-clamp-1">
                          {r.location.state || r.location.region}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1 font-body text-[12px] text-stone-600 dark:text-stone-300">
                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                        <span className="font-bold tabular-nums">{avg > 0 ? avg.toFixed(1) : "—"}</span>
                        {ratings > 0 && (
                          <span className="text-stone-500 dark:text-stone-400">({ratings})</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </ScrollRow>
            )}
          </div>
        </div>

        {/* ─── HOW TO STORE + SEASONAL AVAILABILITY ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mb-12">
          {/* How to Store */}
          <div className="relative rounded-2xl paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Leaf className="h-4 w-4" />
              </span>
              <h3 className="font-title-hw text-[18px] md:text-[19px] font-bold text-stone-900 dark:text-stone-50">
                {ts("ingredient.howToStore", "How to Store")}
              </h3>
            </div>
            <p className="font-body text-[13.5px] text-stone-700 dark:text-stone-200 leading-relaxed">
              {howToStore}
            </p>
            <div className="absolute bottom-3 right-3 h-12 w-10 hidden md:flex items-end justify-end" aria-hidden>
              <div
                className="h-10 w-9 rounded-md flex items-center justify-center text-emerald-700"
                style={{
                  backgroundColor: "#d6efce",
                  transform: "rotate(-6deg)",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                }}
              >
                <Leaf className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Seasonal Availability — month dots */}
          <div className="rounded-2xl paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Calendar className="h-4 w-4" />
              </span>
              <h3 className="font-title-hw text-[18px] md:text-[19px] font-bold text-stone-900 dark:text-stone-50">
                {ts("ingredient.seasonalAvailability", "Seasonal Availability")}
              </h3>
            </div>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mt-2">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, idx) => {
                const isBest = yearRound || bestMonths.has(idx + 1);
                return (
                  <div key={m} className="flex flex-col items-center gap-1.5">
                    <span className="font-body text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-200">
                      {m}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isBest
                          ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                          : "bg-stone-300"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-body text-[12px] text-stone-600 dark:text-stone-300 font-semibold">
                {ts("ingredient.bestSeason", "Best Season")}
              </span>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM TRUST STRIP (kraft texture) ─── */}
        <section className="relative rounded-[16px] overflow-hidden border border-stone-300/40 shadow-[0_8px_22px_-12px_rgba(120,90,40,0.18)]">
          {/* Curry leaf sprigs on both sides */}
          <div className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 h-20 w-12 text-lime-700 opacity-70 pointer-events-none" style={{ transform: "translateY(-50%) rotate(-14deg)" }} aria-hidden>
            <LeafSprig className="h-full w-full" />
          </div>
          <div className="hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 h-20 w-12 text-lime-700 opacity-70 pointer-events-none" style={{ transform: "translateY(-50%) rotate(14deg)" }} aria-hidden>
            <LeafSprig className="h-full w-full" flip />
          </div>
          {/* Scattered seeds bottom-left */}
          <div className="hidden md:flex absolute bottom-3 left-12 items-end gap-1 opacity-60 pointer-events-none" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-stone-700" />
            <span className="h-2 w-2 rounded-full bg-amber-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-stone-800" />
            <span className="h-2 w-2 rounded-full bg-amber-600" />
          </div>

          <div
            className="relative grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-16 py-5"
            style={{
              backgroundColor: "#e9d9b8",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 4px), radial-gradient(rgba(120,80,30,0.1) 1px, transparent 1px)",
              backgroundSize: "auto, 4px 4px",
            }}
          >
            {[
              { icon: <CheckCircle2 className="h-5 w-5" />, tint: "bg-emerald-100 text-emerald-700",
                title: ts("ingredient.trust100Title", "100% Natural"), sub: ts("ingredient.trust100Sub", "No chemicals") },
              { icon: <MapPin className="h-5 w-5" />, tint: "bg-amber-100 text-amber-700",
                title: ts("ingredient.trustLocalTitle", "Locally Sourced"), sub: ts("ingredient.trustLocalSub", "From trusted farmers") },
              { icon: <Wheat className="h-5 w-5" />, tint: "bg-rose-100 text-rose-600 dark:text-rose-400",
                title: ts("ingredient.trustHandTitle", "Handpicked Daily"), sub: ts("ingredient.trustHandSub", "For best quality") },
              { icon: <Sparkles className="h-5 w-5" />, tint: "bg-sky-100 text-sky-700",
                title: ts("ingredient.trustCleanTitle", "Clean & Fresh"), sub: ts("ingredient.trustCleanSub", "Hygienically packed") },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-3 min-w-0">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${b.tint} shadow-sm`} aria-hidden>
                  {b.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-title-hw text-[15px] md:text-[16px] font-bold leading-tight text-stone-900 dark:text-stone-50 truncate">
                    {b.title}
                  </p>
                  <p className="font-body text-[11.5px] text-stone-700 dark:text-stone-200 truncate mt-0.5">
                    {b.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

/* Tag-icon component imported inline (lucide doesn't expose it under this name in some versions) */
function Tag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
    </svg>
  );
}
