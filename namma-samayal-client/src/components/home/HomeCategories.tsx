"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Leaf, Users, Heart } from "lucide-react";
import { getCategories } from "@/features/category/services/categoryApi";
import type { Category } from "@/types/category";
import { Loader } from "@/components/common/Loader";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useLang } from "@/contexts/LanguageContext";

/* ─── Pastel sticky palettes ───────────────────────────────────── */
const STICKY_PALETTES = [
  { bg: "#fff3b0", pin: "#d97706" }, // yellow
  { bg: "#d6e9f5", pin: "#0284c7" }, // blue
  { bg: "#d6efce", pin: "#16a34a" }, // green
  { bg: "#fbd5dd", pin: "#e11d48" }, // pink
  { bg: "#e9dafb", pin: "#7c3aed" }, // purple
  { bg: "#fde4c0", pin: "#ea580c" }, // peach
  { bg: "#fff3b0", pin: "#d97706" }, // yellow again (loop)
  { bg: "#d4f0e5", pin: "#0d9488" }, // mint
] as const;

const ROTATIONS = [-2.5, 1.8, -1.5, 2.2, -2, 1.2, -1.8, 2.5];

/* Deterministic hash so the same category always gets the same palette/rotation */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/* ─── Tape strip (washi) ──────────────────────────────────────── */
function TapeStrip({
  className = "",
  rotate = -4,
  width = "w-14",
  color = "rgba(255,243,176,0.85)",
}: {
  className?: string;
  rotate?: number;
  width?: string;
  color?: string;
}) {
  return (
    <div
      className={`${width} h-4 ${className}`}
      style={{
        backgroundColor: color,
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }}
      aria-hidden
    />
  );
}

/* ─── Pushpin ─────────────────────────────────────────────────── */
function Pushpin({ color = "#e11d48", className = "" }: { color?: string; className?: string }) {
  return (
    <span
      className={`block h-3.5 w-3.5 rounded-full ${className}`}
      style={{
        backgroundColor: color,
        border: "2px solid rgba(255,255,255,0.7)",
        boxShadow:
          "0 3px 4px rgba(0,0,0,0.35), inset -1.5px -1.5px 2px rgba(0,0,0,0.22)",
      }}
      aria-hidden
    />
  );
}

/* ─── Hand-drawn category doodles ─────────────────────────────── */
function TeaCupDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      {/* Steam */}
      <path d="M22 6 Q 20 12, 24 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M32 4 Q 36 10, 32 16" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M42 6 Q 40 12, 44 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* Cup */}
      <path d="M16 24 L 18 44 Q 18 50, 24 50 L 38 50 Q 44 50, 44 44 L 46 24 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Tea inside */}
      <ellipse cx="31" cy="26" rx="13" ry="2" fill="currentColor" opacity="0.25" />
      {/* Handle */}
      <path d="M46 30 Q 54 30, 54 38 Q 54 44, 46 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Saucer */}
      <ellipse cx="31" cy="54" rx="22" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MilkBottlesDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      {/* Tall bottle */}
      <path d="M18 10 L 18 16 Q 14 18, 14 24 L 14 50 Q 14 54, 18 54 L 26 54 Q 30 54, 30 50 L 30 24 Q 30 18, 26 16 L 26 10 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="14" y1="32" x2="30" y2="32" stroke="currentColor" strokeWidth="1.2" />
      {/* Short bottle */}
      <path d="M36 22 L 36 26 Q 34 28, 34 32 L 34 50 Q 34 54, 38 54 L 46 54 Q 50 54, 50 50 L 50 32 Q 50 28, 48 26 L 48 22 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Small bowl */}
      <path d="M40 38 Q 40 46, 50 46 Q 60 46, 60 38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="40" y1="38" x2="60" y2="38" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FruitBasketDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      {/* Basket */}
      <path d="M10 30 Q 32 24, 54 30 L 50 54 Q 50 56, 48 56 L 16 56 Q 14 56, 14 54 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Weave lines */}
      <line x1="14" y1="38" x2="50" y2="38" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="14" y1="46" x2="50" y2="46" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      {/* Fruits piled on top */}
      <circle cx="20" cy="22" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="32" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="44" cy="22" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M32 11 L 33 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 16 Q 22 13, 25 13" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function WheatDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      {/* Central stem */}
      <path d="M32 56 L 32 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Pairs of grains along stem */}
      {[
        [50, 1.0, 30],
        [42, 0.95, 35],
        [34, 0.9, 40],
        [26, 0.8, 45],
        [18, 0.7, 50],
      ].map(([y, s, a], i) => (
        <g key={i}>
          <ellipse
            cx={32}
            cy={y}
            rx={9 * s}
            ry={3 * s}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            transform={`rotate(${-a} 32 ${y})`}
          />
          <ellipse
            cx={32}
            cy={y}
            rx={9 * s}
            ry={3 * s}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            transform={`rotate(${a} 32 ${y})`}
          />
        </g>
      ))}
      {/* Tip */}
      <path d="M32 12 L 32 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HerbsDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      <path d="M32 56 Q 30 36, 32 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[
        [44, 1.0, 30],
        [36, 0.95, 35],
        [28, 0.85, 42],
        [22, 0.7, 50],
      ].map(([y, s, a], i) => (
        <g key={i}>
          <path
            d={`M0,0 C 10,-6 26,-5 30,0 C 26,5 10,6 0,0 Z`}
            transform={`translate(32, ${y}) rotate(${-a}) scale(${s})`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d={`M0,0 C 10,-6 26,-5 30,0 C 26,5 10,6 0,0 Z`}
            transform={`translate(32, ${y}) rotate(${180 + a}) scale(${s})`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </g>
      ))}
      {/* Tip leaf */}
      <path
        d="M32 14 Q 28 8, 32 4 Q 36 8, 32 14 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MeatDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      {/* Steak shape */}
      <path
        d="M14 26 Q 14 16, 24 14 Q 36 12, 48 18 Q 56 24, 54 36 Q 52 48, 38 50 Q 22 52, 16 44 Q 10 36, 14 26 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Marbling lines */}
      <path d="M22 24 Q 30 22, 38 26" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M20 32 Q 30 30, 42 34" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M24 40 Q 32 38, 44 42" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* Bone (drumstick-y nub) */}
      <ellipse cx="52" cy="22" rx="4" ry="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function NutsDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      {/* Three nuts piled */}
      <ellipse cx="24" cy="36" rx="11" ry="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M14 36 Q 24 32, 34 36" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <ellipse cx="40" cy="32" rx="11" ry="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M30 32 Q 40 28, 50 32" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <ellipse cx="32" cy="46" rx="11" ry="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M22 46 Q 32 42, 42 46" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Small seed scatter */}
      <circle cx="14" cy="20" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="52" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function OilBottleDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      {/* Bottle */}
      <path d="M26 8 L 26 14 Q 22 16, 22 22 L 22 52 Q 22 56, 26 56 L 38 56 Q 42 56, 42 52 L 42 22 Q 42 16, 38 14 L 38 8 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Cap */}
      <rect x="28" y="4" width="8" height="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Label rectangle */}
      <rect x="24" y="30" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="26" y1="36" x2="38" y2="36" stroke="currentColor" strokeWidth="1" />
      <line x1="26" y1="40" x2="36" y2="40" stroke="currentColor" strokeWidth="1" />
      {/* Side droplet */}
      <path d="M50 34 Q 46 38, 50 44 Q 54 38, 50 34 Z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function PotDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      <path d="M20 4 Q 18 10, 24 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M32 2 Q 36 8, 32 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M44 4 Q 46 10, 40 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M14 26 L 14 50 Q 14 54, 18 54 L 46 54 Q 50 54, 50 50 L 50 26 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 26 L 54 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="20" r="2.5" fill="currentColor" />
      <path d="M6 32 Q 2 34, 4 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M58 32 Q 62 34, 60 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* Pick a doodle based on the category name keywords */
function CategoryDoodle({ name, className }: { name: string; className?: string }) {
  const k = name.toLowerCase();
  if (k.includes("beverage") || k.includes("drink") || k.includes("tea") || k.includes("coffee"))
    return <TeaCupDoodle className={className} />;
  if (k.includes("dairy") || k.includes("milk") || k.includes("curd") || k.includes("paneer"))
    return <MilkBottlesDoodle className={className} />;
  if (k.includes("fruit"))
    return <FruitBasketDoodle className={className} />;
  if (k.includes("grain") || k.includes("rice") || k.includes("wheat") || k.includes("cereal") || k.includes("bakery") || k.includes("bread"))
    return <WheatDoodle className={className} />;
  if (k.includes("herb") || k.includes("leaf") || k.includes("leaves") || k.includes("greens") || k.includes("veg") || k.includes("salad"))
    return <HerbsDoodle className={className} />;
  if (k.includes("meat") || k.includes("chicken") || k.includes("mutton") || k.includes("fish") || k.includes("seafood") || k.includes("egg"))
    return <MeatDoodle className={className} />;
  if (k.includes("nut") || k.includes("seed") || k.includes("legume") || k.includes("bean") || k.includes("dal") || k.includes("lentil"))
    return <NutsDoodle className={className} />;
  if (k.includes("oil") || k.includes("fat") || k.includes("ghee"))
    return <OilBottleDoodle className={className} />;
  return <PotDoodle className={className} />;
}

/* ─── Sticky category card ───────────────────────────────────── */
function StickyCategoryCard({
  category,
  recipeCount,
  index,
  lf,
}: {
  category: Category;
  recipeCount: number;
  index: number;
  lf: (f: { en: string; ta?: string } | undefined | null) => string;
}) {
  const seed = hashId(category._id);
  const palette = STICKY_PALETTES[seed % STICKY_PALETTES.length];
  const rotation = ROTATIONS[(seed >> 3) % ROTATIONS.length];
  const showTape = index % 2 === 0; // alternate tape vs pin emphasis

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative pt-5"
    >
      {/* Decorative tape behind/around the pushpin */}
      {showTape && (
        <TapeStrip
          className="absolute top-1 left-1/2 -translate-x-1/2 z-20"
          rotate={-6}
          width="w-16"
        />
      )}

      <Link
        href={`/recipes?category=${category._id}`}
        className="group block"
        aria-label={lf(category.name)}
      >
        {/* Pushpin sticking out the top */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 z-30 -translate-y-1">
          <Pushpin color={palette.pin} />
        </span>

        <div
          className="relative aspect-square rounded-[4px] p-5 flex flex-col items-center justify-center shadow-[0_14px_28px_-12px_rgba(0,0,0,0.28)] group-hover:shadow-[0_20px_36px_-14px_rgba(0,0,0,0.4)] group-hover:-translate-y-1 transition-all duration-300"
          style={{
            backgroundColor: palette.bg,
            transform: `rotate(${rotation}deg)`,
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.04) 100%)",
          }}
        >
          {/* Hand-drawn doodle */}
          <div className="h-20 w-20 md:h-24 md:w-24 mb-4 text-stone-700/70">
            <CategoryDoodle name={category.name.en || ""} className="h-full w-full" />
          </div>

          {/* Category name */}
          <h3 className="font-title-hw text-[20px] md:text-[22px] font-bold text-stone-900 dark:text-stone-50 text-center leading-tight">
            {lf(category.name)}
          </h3>

          {/* Recipe count */}
          <p className="font-body text-[12.5px] text-stone-700 dark:text-stone-200 mt-1.5">
            {recipeCount} {recipeCount === 1 ? "Recipe" : "Recipes"}
          </p>

          {/* Faint paper grain (subtle dot pattern) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[4px] opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(rgba(120,90,40,0.12) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
            aria-hidden
          />
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Section ─────────────────────────────────────────────────── */
export function HomeCategories() {
  const { t, lf } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Safe i18n with fallback
  const ts = (key: string, fallback: string) => {
    try {
      const v = t(key);
      if (!v || v === key) return fallback;
      return v;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories({ level: 0, limit: 8 });
        setCategories(data);
      } catch {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Placeholder recipe counts since the API doesn't return them yet
  const PLACEHOLDER_COUNTS = [124, 86, 92, 112, 64, 78, 55, 38];
  const countFor = (i: number) => PLACEHOLDER_COUNTS[i % PLACEHOLDER_COUNTS.length];

  return (
    <section className="relative paper-bg pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden">
      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl space-y-3">
            {/* Browse Categories tape */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
              style={{
                backgroundColor: "rgba(255, 243, 176, 0.9)",
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                transform: "rotate(-1.5deg)",
              }}
            >
              <span className="text-base" aria-hidden>
                📌
              </span>
              <span className="font-note-hw text-[12.5px] md:text-[13.5px] font-bold uppercase tracking-[0.16em] text-amber-900">
                {ts("home.browseCategories", "Browse Categories")}
              </span>
            </div>

            <h2 className="font-title-hw text-[40px] md:text-[52px] lg:text-[58px] font-bold leading-tight text-stone-900 dark:text-stone-50">
              {ts("home.flavorProfiles", "Flavor Profiles")}
            </h2>
            <p className="font-body text-[15px] md:text-[16px] text-stone-700 dark:text-stone-200 leading-relaxed">
              {ts(
                "home.findCraving",
                "Find exactly what you're craving. Sorted for your convenience."
              )}
            </p>
          </div>

          <Link
            href="/explore"
            className="hidden md:inline-flex items-center gap-2 font-title-hw text-[17px] font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors group relative"
          >
            <span className="relative">
              {ts("home.viewAllGroups", "View All Groups")}
              <span
                className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[#e74c3c] rounded-full"
                aria-hidden
              />
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="py-6">
            <ErrorMessage message={error} />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center font-note-hw text-stone-500 dark:text-stone-400">
            {ts("home.noCategories", "No categories yet — check back soon!")}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {categories.map((category, i) => (
              <StickyCategoryCard
                key={category._id}
                category={category}
                recipeCount={countFor(i)}
                index={i}
                lf={lf}
              />
            ))}
          </div>
        )}

        {/* Bottom info strip */}
        <div
          className="mt-14 rounded-[20px] border border-stone-200/80 shadow-[0_8px_24px_-12px_rgba(120,90,40,0.18)] overflow-hidden"
          style={{
            backgroundColor: "var(--ns-nav-bg, #fffdf6)",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 30px, rgba(120,90,40,0.05) 30px, rgba(120,90,40,0.05) 31px)",
          }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 px-5 md:px-8 py-6">
            {[
              {
                icon: <ChefHat className="h-5 w-5" />,
                tint: "bg-rose-100 text-rose-600 dark:text-rose-400",
                title: ts("home.featCuratedTitle", "Curated with Love"),
                sub: ts("home.featCuratedSub", "Every recipe is handpicked"),
              },
              {
                icon: <Leaf className="h-5 w-5" />,
                tint: "bg-emerald-100 text-emerald-700",
                title: ts("home.featAuthenticTitle", "Authentic & Tested"),
                sub: ts("home.featAuthenticSub", "Tried in our home kitchen"),
              },
              {
                icon: <Users className="h-5 w-5" />,
                tint: "bg-amber-100 text-amber-700",
                title: ts("home.featCommunityTitle", "Community Driven"),
                sub: ts("home.featCommunitySub", "From our kitchen to yours"),
              },
              {
                icon: <Heart className="h-5 w-5" />,
                tint: "bg-pink-100 text-pink-600",
                title: ts("home.featMadeTitle", "Made for You"),
                sub: ts("home.featMadeSub", "Simple, delicious & wholesome"),
              },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${f.tint} shadow-sm`}
                  aria-hidden
                >
                  {f.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-title-hw text-[16px] md:text-[17px] font-bold leading-tight text-stone-900 dark:text-stone-50 truncate">
                    {f.title}
                  </p>
                  <p className="font-body text-[12px] text-stone-600 dark:text-stone-300 truncate mt-0.5">
                    {f.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
