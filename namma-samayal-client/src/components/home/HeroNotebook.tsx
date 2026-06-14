"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  Clock,
  Heart,
  Check,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { getRecipes } from "@/features/recipe/services/recipeApi";
import type { Recipe } from "@/types/recipe";

/* ─── Inline decorative SVGs ───────────────────────── */
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

function TitleSquiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 14" className={className} preserveAspectRatio="none" aria-hidden>
      <path
        d="M2,8 Q 30,1 60,7 T 120,7 T 180,7 T 240,7 T 318,7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeafSprig({ className = "", flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 200"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <path d="M50 195 Q 47 100, 50 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
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
}

function Chilli({ className = "", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      viewBox="0 0 40 100"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      {/* Stem cap */}
      <path
        d="M20 6 Q 14 4, 12 10 Q 14 14, 18 14 L 22 14 Q 26 14, 28 10 Q 26 4, 20 6 Z"
        fill="#15803d"
      />
      <path d="M20 6 L 20 14" stroke="#166534" strokeWidth="1.2" />
      {/* Body — curved chilli */}
      <path
        d="M16 14 Q 10 30, 14 50 Q 16 65, 18 78 Q 20 90, 24 78 Q 28 60, 26 40 Q 24 22, 22 14 Z"
        fill="#dc2626"
      />
      {/* Highlight */}
      <path
        d="M18 18 Q 14 30, 16 48"
        stroke="#fca5a5"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function Shallots({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 70" className={className} aria-hidden>
      {/* Back-left shallot */}
      <ellipse cx="20" cy="38" rx="14" ry="20" fill="#7c2d12" />
      <ellipse cx="20" cy="38" rx="14" ry="20" fill="url(#shallotGlow)" />
      <path d="M20 18 Q 18 8, 14 4" stroke="#15803d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* Right-front shallot */}
      <ellipse cx="63" cy="44" rx="16" ry="22" fill="#9a3412" />
      <ellipse cx="63" cy="44" rx="16" ry="22" fill="url(#shallotGlow)" />
      <path d="M63 22 Q 67 12, 70 6" stroke="#15803d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* Center small */}
      <ellipse cx="42" cy="49" rx="11" ry="14" fill="#7c2d12" />
      <ellipse cx="42" cy="49" rx="11" ry="14" fill="url(#shallotGlow)" />
      <path d="M42 35 Q 40 28, 38 24" stroke="#15803d" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <defs>
        <radialGradient id="shallotGlow" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function WoodenSpoon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 110" className={className} aria-hidden>
      {/* Handle */}
      <rect x="16.5" y="0" width="7" height="65" rx="3" fill="#a07532" />
      <rect x="17.5" y="0" width="2" height="65" rx="1" fill="#c3924b" opacity="0.7" />
      {/* Bowl */}
      <ellipse cx="20" cy="85" rx="16" ry="22" fill="#8b6914" />
      <ellipse cx="20" cy="83" rx="12" ry="17" fill="#a07532" />
      <ellipse cx="18" cy="78" rx="6" ry="9" fill="#bf8c40" opacity="0.6" />
    </svg>
  );
}

function Steam({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${10 + i * 18} 70 Q ${8 + i * 18} 50, ${14 + i * 18} 32 Q ${10 + i * 18} 18, ${14 + i * 18} 4`}
          fill="none"
          stroke="rgba(180,180,180,0.65)"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 0.7, 0], y: [-2, -14, -22] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

function PepperBowl({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} aria-hidden>
      {/* Bowl */}
      <ellipse cx="50" cy="42" rx="38" ry="8" fill="#78716c" />
      <path d="M12 42 Q 12 68, 50 68 Q 88 68, 88 42" fill="#57534e" />
      {/* Peppercorns piled */}
      {[
        [30, 35],
        [38, 32],
        [46, 31],
        [54, 32],
        [62, 33],
        [70, 36],
        [34, 38],
        [44, 36],
        [56, 36],
        [66, 39],
        [50, 35],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#1c1917" />
      ))}
      <ellipse cx="50" cy="42" rx="34" ry="4" fill="#1c1917" opacity="0.4" />
    </svg>
  );
}

/* ─── Sticky tape strip ─── */
function TapeStrip({
  color = "yellow",
  className = "",
  rotate = -4,
  width = "w-20",
}: {
  color?: "yellow" | "pink" | "blue" | "green";
  className?: string;
  rotate?: number;
  width?: string;
}) {
  const bg =
    color === "pink"
      ? "rgba(251, 213, 221, 0.85)"
      : color === "blue"
      ? "rgba(214, 233, 245, 0.85)"
      : color === "green"
      ? "rgba(214, 239, 206, 0.85)"
      : "rgba(255, 243, 176, 0.9)";
  return (
    <div
      className={`${width} h-4 ${className}`}
      style={{
        backgroundColor: bg,
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      }}
      aria-hidden
    />
  );
}

/* ─── Spiral binding column (between the two notebook pages) ─── */
function SpiralBinding() {
  return (
    <div
      className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-7 z-30 hidden lg:flex flex-col items-center justify-evenly py-6 pointer-events-none"
      aria-hidden
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="relative">
          {/* Hole shadow */}
          <span
            className="block h-4 w-4 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(120,90,40,0.55) 0%, rgba(120,90,40,0.2) 60%, transparent 100%)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            }}
          />
          {/* Coil ring */}
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

/* ─── Notebook page background (with red margin line + ruled lines) ─── */
function pageStyle(): React.CSSProperties {
  return {
    backgroundColor: "#fefcf5",
    backgroundImage:
      // red margin line — felt, not noticed
      "linear-gradient(90deg, transparent 0 36px, rgba(220, 38, 38, 0.25) 36px 37px, transparent 37px), " +
      // horizontal ruling — much fainter
      "repeating-linear-gradient(to bottom, transparent 0, transparent 32px, rgba(120,90,40,0.05) 32px, rgba(120,90,40,0.05) 33px)",
  };
}

/* ─── Featured polaroid (right page) ─── */
function FeaturedPolaroid({
  recipe,
  lf,
}: {
  recipe: Recipe | null;
  lf: (f: { en: string; ta?: string } | undefined | null) => string;
}) {
  const title =
    recipe?.seo?.title?.en ||
    recipe?.title ||
    recipe?.dishName?.en ||
    "Erode Arisi Paruppu Sathham";
  const displayTitle = recipe
    ? lf({ en: title, ta: recipe.seo?.title?.ta || recipe.dishName?.ta })
    : title;

  return (
    <div className="relative pt-2">
      <div
        className="relative bg-white p-3 pb-12 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]"
        style={{ transform: "rotate(-2.5deg)" }}
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
          {recipe?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.imageUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100">
              <ChefHat className="h-12 w-12 text-stone-400 dark:text-stone-500" />
            </div>
          )}
        </div>
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 px-3">
          <p
            className="font-note-hw text-[15px] md:text-[16px] text-stone-700 dark:text-stone-200 truncate"
            title={displayTitle}
          >
            {displayTitle}
          </p>
          <span className="text-rose-500 shrink-0" aria-hidden>
            ❤
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─── */
export function HeroNotebook() {
  const { t, lf } = useLang();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [index, setIndex] = useState(0);

  // Safe i18n with English fallback
  const ts = useCallback(
    (key: string, fallback: string) => {
      try {
        const v = t(key);
        if (!v || v === key) return fallback;
        return v;
      } catch {
        return fallback;
      }
    },
    [t]
  );

  useEffect(() => {
    getRecipes({ page: 1, limit: 5 })
      .then((r) => setRecipes(r.data))
      .catch(() => {});
  }, []);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (recipes.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % recipes.length);
    }, 8000);
    return () => clearInterval(id);
  }, [recipes.length]);

  const featured = recipes[index] ?? null;
  const total = Math.max(recipes.length, 1);

  const next = () =>
    setIndex((i) => (recipes.length ? (i + 1) % recipes.length : 0));
  const prev = () =>
    setIndex((i) =>
      recipes.length ? (i - 1 + recipes.length) % recipes.length : 0
    );

  return (
    <section className="relative paper-bg pt-24 md:pt-28 pb-12 overflow-hidden">
      {/* Far-left decoration: curry leaves */}
      <div
        className="hidden lg:block absolute top-32 left-2 h-48 w-24 text-lime-700 opacity-70 pointer-events-none"
        style={{ transform: "rotate(-15deg)" }}
        aria-hidden
      >
        <LeafSprig className="h-full w-full" />
      </div>

      {/* Pepper bowl */}
      <div className="hidden xl:block absolute top-[28%] left-6 w-24 pointer-events-none" aria-hidden>
        <PepperBowl className="h-auto w-full" />
      </div>

      {/* Far-right decorations: chillies */}
      <div className="hidden lg:block absolute top-32 right-4 w-10 pointer-events-none" aria-hidden>
        <Chilli className="h-auto w-full" rotate={20} />
      </div>
      <div className="hidden lg:block absolute top-48 right-10 w-8 pointer-events-none" aria-hidden>
        <Chilli className="h-auto w-full" rotate={-12} />
      </div>
      <div className="hidden lg:block absolute top-[42%] right-2 w-9 pointer-events-none" aria-hidden>
        <Chilli className="h-auto w-full" rotate={10} />
      </div>

      {/* Curry leaves on far right too */}
      <div
        className="hidden xl:block absolute bottom-20 right-3 h-36 w-20 text-lime-700 opacity-60 pointer-events-none"
        style={{ transform: "rotate(20deg)" }}
        aria-hidden
      >
        <LeafSprig className="h-full w-full" flip />
      </div>

      {/* Shallots bottom-right */}
      <div
        className="hidden xl:block absolute bottom-44 right-14 w-24 pointer-events-none drop-shadow-md"
        aria-hidden
      >
        <Shallots className="h-auto w-full" />
      </div>

      {/* Wooden spoon top-right */}
      <div
        className="hidden xl:block absolute top-44 right-20 w-10 pointer-events-none drop-shadow-md"
        style={{ transform: "rotate(28deg)" }}
        aria-hidden
      >
        <WoodenSpoon className="h-auto w-full" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 lg:px-12">
        <div className="flex items-start gap-3 md:gap-6">
          {/* LEFT decoration: "Today's Inspiration" sticky */}
          <div
            className="hidden lg:flex flex-col items-center gap-4 shrink-0 pt-32"
            aria-hidden
          >
            <div className="relative max-w-[180px]" style={{ transform: "rotate(-6deg)" }}>
              <TapeStrip color="yellow" className="absolute -top-1 left-3" rotate={-8} width="w-10" />
              <div
                className="relative px-4 pt-4 pb-3 shadow-[0_8px_18px_-8px_rgba(220,80,90,0.3)]"
                style={{
                  backgroundColor: "#fbd5dd",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                  clipPath:
                    "polygon(0% 0%, 100% 4%, 98% 96%, 4% 100%, 2% 50%)",
                }}
              >
                <p className="font-title-hw text-[14px] font-bold uppercase tracking-wider text-[#e74c3c] mb-1.5">
                  {ts("home.todaysInspiration", "Today's Inspiration")}
                </p>
                <p className="font-note-hw text-[14px] leading-snug text-rose-950">
                  {ts(
                    "home.inspirationText",
                    "Good food brings people together"
                  )}
                </p>
                <p className="text-center mt-1 text-sm">😊</p>
              </div>
            </div>
          </div>

          {/* CENTER: Open notebook */}
          <div className="relative flex-1 min-w-0">
            {/* Arrow navigation buttons */}
            {recipes.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous page"
                  className="absolute top-1/2 -translate-y-1/2 -left-2 md:-left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-white/5 border border-stone-300 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-white hover:text-[#e74c3c] hover:border-[#e74c3c] transition-colors shadow-md backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next page"
                  className="absolute top-1/2 -translate-y-1/2 -right-2 md:-right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-white/5 border border-stone-300 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-white hover:text-[#e74c3c] hover:border-[#e74c3c] transition-colors shadow-md backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Notebook surface */}
            <div
              className="relative rounded-[8px] border-4 shadow-[0_24px_50px_-20px_rgba(120,90,40,0.45)]"
              style={{
                borderColor: "#8c6938",
                backgroundColor: "#8c6938",
              }}
            >
              {/* Inner padding to show "leather" cover edge */}
              <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[520px] md:min-h-[560px] overflow-hidden rounded-[3px]">
                <SpiralBinding />

                {/* ─── LEFT PAGE ─── */}
                <div
                  className="np-page-margin relative px-7 md:px-12 lg:pr-16 py-10 md:py-12 lg:pl-14"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`l-${featured?._id || "placeholder"}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.35 }}
                    >
                      {/* "Today's Featured Recipe" overline tape */}
                      <div
                        className="inline-block px-3 py-1 mb-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                        style={{
                          backgroundColor: "rgba(255, 243, 176, 0.92)",
                          backgroundImage:
                            "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                          transform: "rotate(-1.5deg)",
                        }}
                      >
                        <span className="font-note-hw text-[12px] md:text-[13px] font-bold uppercase tracking-[0.18em] text-amber-800">
                          {ts("home.todaysFeatured", "Today's Featured Recipe")}
                        </span>
                      </div>

                      {/* Recipe title (real recipe from carousel) */}
                      {(() => {
                        const recipeTitle = featured
                          ? lf({
                              en:
                                featured.seo?.title?.en ||
                                featured.title ||
                                featured.dishName.en,
                              ta:
                                featured.seo?.title?.ta ||
                                featured.dishName.ta,
                            })
                          : ts("home.heroFallbackTitle", "Erode Arisi Paruppu Satham");
                        return (
                          <div className="relative inline-block">
                            <h1 className="font-title-hw text-[34px] md:text-[44px] lg:text-[52px] font-bold leading-[1.05] text-stone-900 dark:text-stone-50 pr-8">
                              {recipeTitle}
                            </h1>
                            {/* Red squiggle underline */}
                            <span
                              className="absolute left-0 -bottom-1 h-3 w-[min(100%,360px)] text-[#e74c3c] pointer-events-none"
                              aria-hidden
                            >
                              <TitleSquiggle className="h-full w-full" />
                            </span>
                            {/* Heart doodle */}
                            <span
                              className="absolute -top-1 -right-2 text-[#e74c3c] h-6 w-7"
                              aria-hidden
                            >
                              <HeartDoodle className="h-full w-full" />
                            </span>
                          </div>
                        );
                      })()}

                      {/* Handwritten tagline (the Namma Samayal heart line) */}
                      <p className="font-note-hw text-[16px] md:text-[17px] text-stone-700 dark:text-stone-200 mt-3 italic">
                        {ts(
                          "home.kitchenTagline",
                          "From our kitchen to your heart"
                        )}{" "}
                        <span className="text-rose-500 not-italic">❤</span>
                      </p>

                      {/* Description */}
                      <p className="font-body text-[14px] md:text-[15px] text-stone-700 dark:text-stone-200 leading-relaxed mt-4 max-w-md line-clamp-3">
                        {featured
                          ? lf({
                              en:
                                featured.seo?.description?.en ||
                                featured.description?.en ||
                                "",
                              ta:
                                featured.seo?.description?.ta ||
                                featured.description?.ta,
                            }) ||
                            ts(
                              "home.heroFallbackDesc",
                              "A traditional one-pot dish from Erode, made with rice, dal, and freshly ground spices."
                            )
                          : ts(
                              "home.heroFallbackDesc",
                              "A traditional one-pot dish from Erode, made with rice, dal, and freshly ground spices."
                            )}
                      </p>

                      {/* Meta chips — location / time / difficulty */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 font-body text-[13px] text-stone-700 dark:text-stone-200">
                        {(featured?.location?.city ||
                          featured?.location?.region) && (
                          <span className="inline-flex items-center gap-1.5">
                            <span aria-hidden>📍</span>
                            <span className="font-semibold">
                              {featured?.location?.city ||
                                featured?.location?.region}
                            </span>
                          </span>
                        )}
                        {(featured?.totalTime || featured?.cookingTime) && (
                          <span className="inline-flex items-center gap-1.5">
                            <span aria-hidden>⏱️</span>
                            <span className="font-semibold">
                              {featured?.totalTime || featured?.cookingTime} mins
                            </span>
                          </span>
                        )}
                        {featured?.difficulty && (
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <span aria-hidden>🔥</span>
                            <span className="font-semibold">
                              {featured.difficulty}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="mt-6">
                        <Link
                          href={featured ? `/recipe/${featured.slug ?? featured._id}` : "/recipes"}
                          className="inline-flex items-center gap-2 rounded-full bg-stone-900 dark:bg-[#c0392b] text-white px-6 py-3 font-title-hw text-[16px] font-bold hover:bg-stone-700 dark:hover:bg-[#a02b1f] transition-colors shadow-[0_6px_14px_-6px_rgba(0,0,0,0.35)] active:translate-y-px"
                        >
                          {featured
                            ? ts("home.viewThisRecipe", "View This Recipe")
                            : ts("home.exploreRecipes", "Explore Recipes")}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ─── RIGHT PAGE ─── */}
                <div
                  className="np-page-margin relative px-6 md:px-10 lg:pl-14 py-10 md:py-12 lg:pr-12"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`r-${featured?._id || "placeholder"}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35 }}
                      className="relative h-full flex items-center justify-center"
                    >
                      {/* Bigger polaroid — 70-80% of right page width */}
                      <div className="relative w-[85%] max-w-[420px] pt-6">
                        {/* Two corner tape strips */}
                        <div className="absolute -top-1 left-4 z-30">
                          <TapeStrip color="pink" rotate={-12} width="w-16" />
                        </div>
                        <div className="absolute -top-1 right-4 z-30">
                          <TapeStrip color="yellow" rotate={10} width="w-16" />
                        </div>

                        {/* Steam — only when there's an actual food image */}
                        {featured?.imageUrl && (
                          <div
                            className="absolute -top-12 left-1/2 -translate-x-1/2 h-14 w-14 pointer-events-none z-20"
                            aria-hidden
                          >
                            <Steam className="h-full w-full" />
                          </div>
                        )}

                        {/* Polaroid */}
                        <div
                          className="relative bg-white p-3.5 pb-14 shadow-[0_18px_36px_-12px_rgba(0,0,0,0.4)]"
                          style={{ transform: "rotate(-3deg)" }}
                        >
                          <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-200">
                            {featured?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={featured.imageUrl}
                                alt={
                                  featured.seo?.title?.en ||
                                  featured.title ||
                                  featured.dishName.en
                                }
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100">
                                <ChefHat className="h-14 w-14 text-stone-400 dark:text-stone-500" />
                              </div>
                            )}
                          </div>
                          {/* Handwritten caption */}
                          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 px-4">
                            <p
                              className="font-note-hw text-[15px] md:text-[17px] text-stone-700 dark:text-stone-200 truncate"
                              title={
                                featured
                                  ? featured.seo?.title?.en ||
                                    featured.title ||
                                    featured.dishName.en
                                  : ""
                              }
                            >
                              {featured
                                ? lf({
                                    en:
                                      featured.seo?.title?.en ||
                                      featured.title ||
                                      featured.dishName.en,
                                    ta:
                                      featured.seo?.title?.ta ||
                                      featured.dishName.ta,
                                  })
                                : ts(
                                    "home.heroFallbackTitle",
                                    "Erode Arisi Paruppu Satham"
                                  )}
                            </p>
                            <span className="text-rose-500 shrink-0" aria-hidden>
                              ❤
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* GRANDMA TIP yellow sticky overlapping bottom-left */}
                      <div
                        className="absolute bottom-2 left-0 md:left-2 z-20 max-w-[200px]"
                        style={{ transform: "rotate(-4deg)" }}
                      >
                        <TapeStrip
                          color="pink"
                          className="absolute -top-1 right-4"
                          rotate={3}
                          width="w-10"
                        />
                        <div
                          className="relative px-3.5 pt-3 pb-2.5 shadow-[0_8px_18px_-8px_rgba(180,140,0,0.35)]"
                          style={{
                            backgroundColor: "#fff3b0",
                            backgroundImage:
                              "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                          }}
                        >
                          <p className="font-title-hw text-[11px] font-bold uppercase tracking-[0.14em] text-amber-900 mb-1">
                            {ts("home.grandmaTip", "Grandma Tip")}
                          </p>
                          <p className="font-note-hw text-[13px] leading-snug text-amber-950">
                            {ts(
                              "home.grandmaTipText",
                              "Use freshly ground spices for that authentic aroma!"
                            )}
                          </p>
                          <p className="text-right text-sm">😊</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Page-corner fold (bottom-right) — click to advance */}
                  {recipes.length > 1 && (
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Next recipe"
                      className="absolute bottom-0 right-0 z-30 group"
                    >
                      <svg
                        viewBox="0 0 60 60"
                        className="h-10 w-10 md:h-14 md:w-14 text-stone-300 group-hover:text-[#e74c3c] transition-colors"
                        aria-hidden
                      >
                        {/* The folded triangle (visible "back" of the page) */}
                        <path
                          d="M60 60 L 60 20 L 20 60 Z"
                          fill="#f3ebd9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        {/* The crease shadow line */}
                        <path
                          d="M60 20 L 20 60"
                          stroke="rgba(120,90,40,0.35)"
                          strokeWidth="1"
                        />
                        {/* Tiny "next →" hint inside the fold (visible on hover) */}
                        <g
                          opacity="0"
                          className="group-hover:opacity-100 transition-opacity"
                        >
                          <path
                            d="M37 47 L 47 47 M44 44 L 47 47 L 44 50"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </g>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dot indicators (pagination) */}
            {recipes.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous"
                  className="text-stone-400 dark:text-stone-500 hover:text-[#e74c3c] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {recipes.map((r, i) => (
                  <button
                    key={r._id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => setIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === index
                        ? "bg-[#e74c3c] w-6 shadow-sm"
                        : "bg-stone-300 hover:bg-stone-400 w-2.5"
                    }`}
                  />
                ))}
                <span className="font-body text-[11px] text-stone-400 dark:text-stone-500 ml-1">
                  {index + 1} / {total}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT decoration: "Our Promise" kraft card */}
          <div className="hidden lg:flex flex-col items-center gap-4 shrink-0 pt-32" aria-hidden>
            <div
              className="relative max-w-[200px] px-5 pt-4 pb-5 shadow-[0_10px_22px_-10px_rgba(120,90,40,0.35)]"
              style={{
                backgroundColor: "#cbb38a",
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 4px), radial-gradient(rgba(120,80,30,0.15) 1px, transparent 1px)",
                backgroundSize: "auto, 4px 4px",
                transform: "rotate(3deg)",
              }}
            >
              {/* Top tape */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-12"
                style={{
                  backgroundColor: "rgba(255, 243, 176, 0.9)",
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                  transform: "rotate(-6deg)",
                }}
              />
              <div className="flex items-center justify-center gap-1.5 mb-3 pt-1">
                <h3 className="font-title-hw text-[18px] font-bold text-stone-800 dark:text-stone-100">
                  {ts("home.ourPromise", "Our Promise")}
                </h3>
                <span className="text-[#e74c3c] h-4 w-4">
                  <HeartDoodle className="h-full w-full" />
                </span>
              </div>
              <ul className="space-y-2.5 font-body text-[12.5px] text-stone-700 dark:text-stone-200">
                <li className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300 shrink-0" />
                  {ts("home.promise1", "Authentic Recipes")}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300 shrink-0" />
                  {ts("home.promise2", "Tried & Tested")}
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300 shrink-0" />
                  {ts("home.promise3", "Made with Love")}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-10 md:mt-14 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Find by Category teaser */}
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="relative font-title-hw text-[24px] md:text-[28px] font-bold text-stone-900 dark:text-stone-50 inline-block">
              {ts("home.findByCategory", "Find Recipes by Category")}
              <span
                className="absolute left-0 right-4 -bottom-1 h-1 bg-[#e74c3c] rounded-full opacity-80"
                aria-hidden
              />
            </h3>
          </div>

          {/* Stats card */}
          <div className="relative pt-2">
            <TapeStrip
              color="pink"
              className="absolute -top-1 left-10 z-20"
              rotate={-4}
              width="w-14"
            />
            <div
              className="relative rounded-md border border-stone-200 dark:border-white/[0.06] shadow-[0_8px_20px_-8px_rgba(120,90,40,0.25)]"
              style={{
                backgroundColor: "rgba(255, 253, 246, 0.95)",
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(120,90,40,0.04) 0 1px, transparent 1px 6px)",
              }}
            >
              <div className="flex flex-wrap items-center gap-5 md:gap-7 px-5 py-3">
                {[
                  {
                    icon: "📖",
                    label: ts("home.statRecipes", "500 Recipes"),
                  },
                  {
                    icon: "🍛",
                    label: ts("home.statCuisines", "25 Cuisine Styles"),
                  },
                  {
                    icon: "👵🏽",
                    label: ts("home.statApproved", "Grandma Approved"),
                  },
                  {
                    icon: "❤",
                    label: ts("home.statMadeWithLove", "Made With Love"),
                    accentClass: "text-rose-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 min-w-[120px]"
                  >
                    <span
                      className={`text-[20px] leading-none ${s.accentClass ?? ""}`}
                      aria-hidden
                    >
                      {s.icon}
                    </span>
                    <p className="font-note-hw text-[14px] md:text-[15px] font-bold text-stone-800 dark:text-stone-100 leading-tight">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* "Cook with Love" toast (visible XL+) — mirrors the navbar sticky */}
        <span
          className="hidden xl:flex absolute top-3 right-12 z-10 items-center gap-1 px-2 py-1 bg-amber-100 text-amber-900 font-note-hw text-[12px] font-bold rounded shadow-sm border border-amber-200"
          aria-hidden
        >
          <Check className="h-3 w-3 text-emerald-600" />
          Cook with love
        </span>
      </div>
    </section>
  );
}
