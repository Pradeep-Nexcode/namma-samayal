"use client";

import Link from "next/link";
import {
  ChefHat,
  ArrowRight,
  Heart,
  Users,
  Star,
  Sparkles,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

/* ──────── Decorative inline SVGs ──────── */
function HeartBurst({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75">
        <line x1="46" y1="4"  x2="50" y2="12" />
        <line x1="58" y1="10" x2="62" y2="18" />
        <line x1="68" y1="22" x2="60" y2="26" />
        <line x1="64" y1="36" x2="56" y2="34" />
      </g>
      <path
        d="M44 50 C 24 38, 18 24, 26 14 C 32 6, 40 10, 44 18 C 48 10, 56 6, 62 14 C 70 24, 64 38, 44 50 Z"
        fill="currentColor"
        opacity="0.9"
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
      {[[170,1.05,22],[140,1.0,28],[110,0.9,34],[80,0.78,42],[55,0.6,50]].map(([y,s,a],i)=>(
        <g key={i}>
          <g transform={`translate(50, ${y}) rotate(${-a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85-i*0.04} />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180+a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85-i*0.04} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function MixingBowl({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 80" className={className} aria-hidden>
      {/* Steam / heart over bowl */}
      <path
        d="M44 24 C 38 18, 34 10, 40 6 C 44 4, 48 8, 48 12 C 48 8, 52 4, 56 6 C 62 10, 58 18, 48 24 Z"
        fill="#f43f5e"
        opacity="0.8"
      />
      {/* Whisk handle */}
      <rect x="60" y="14" width="3" height="22" rx="1.5" fill="#a07532" transform="rotate(20, 60, 14)" />
      {/* Whisk wires */}
      <g stroke="#a07532" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M64 36 Q 68 44, 64 52" />
        <path d="M68 36 Q 72 44, 68 52" />
        <path d="M72 36 Q 74 44, 72 52" />
      </g>
      {/* Bowl */}
      <path d="M12 42 Q 12 70, 50 70 Q 88 70, 88 42 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Bowl rim */}
      <ellipse cx="50" cy="42" rx="38" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Inside shadow */}
      <ellipse cx="50" cy="44" rx="34" ry="3" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

function TitleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 14" className={className} preserveAspectRatio="none" aria-hidden>
      <path
        d="M2,8 Q 30,1 60,7 T 120,7 T 180,7 T 240,7 T 318,7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Washi tape */
function TapeStrip({
  className = "",
  rotate = -4,
  width = "w-16",
  color = "yellow",
}: {
  className?: string;
  rotate?: number;
  width?: string;
  color?: "yellow" | "pink";
}) {
  const bg = color === "pink" ? "rgba(251,213,221,0.9)" : "rgba(255,243,176,0.92)";
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

/* Side tick marks around "It only takes 2 minutes!" */
function SideTicks({ className = "", flip }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 40 20" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <line x1="4" y1="10" x2="14" y2="10" />
        <line x1="18" y1="4" x2="24" y2="10" />
        <line x1="18" y1="16" x2="24" y2="10" />
      </g>
    </svg>
  );
}

/* ──────── Component ──────── */
export function HomeCTA() {
  const { t } = useLang();

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-16 md:py-20 lg:px-12 z-10">
      {/* ─── Notebook-paper card ─── */}
      <div className="relative rounded-[2.5rem] paper-card border border-stone-200 dark:border-white/[0.06] shadow-[0_10px_40px_-12px_rgba(120,90,40,0.25)] overflow-hidden">
        {/* Top-left washi tape */}
        <TapeStrip
          color="yellow"
          rotate={-6}
          width="w-24"
          className="absolute top-6 left-8 z-30"
        />
        {/* Top-right leaf sprigs */}
        <div
          className="hidden md:block absolute top-4 right-4 h-28 w-12 text-emerald-700/60 pointer-events-none z-10"
          style={{ transform: "rotate(20deg)" }}
          aria-hidden
        >
          <LeafSprig className="h-full w-full" flip />
        </div>
        <div
          className="hidden md:block absolute top-2 right-16 h-20 w-10 text-emerald-700/50 pointer-events-none z-10"
          style={{ transform: "rotate(35deg)" }}
          aria-hidden
        >
          <LeafSprig className="h-full w-full" />
        </div>
        {/* Left leaf sprig */}
        <div
          className="hidden lg:block absolute left-4 top-1/3 h-36 w-12 text-emerald-700/55 pointer-events-none z-10"
          style={{ transform: "rotate(-12deg)" }}
          aria-hidden
        >
          <LeafSprig className="h-full w-full" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 px-6 md:px-12 lg:px-16 py-12 md:py-16">
          {/* ─── LEFT: copy + CTA ─── */}
          <div className="relative">
            {/* Join Our Community pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fcedeb] dark:bg-[#c0392b]/15 px-4 py-1.5 text-[11.5px] font-bold text-[#c0392b] dark:text-rose-300 tracking-widest uppercase mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              {t("home.joinCommunity")}
            </div>

            {/* Title */}
            <div className="relative inline-block">
              <h2 className="font-title-hw text-[40px] md:text-[52px] lg:text-[58px] font-bold leading-[1.05] tracking-tight">
                <span className="text-stone-900 dark:text-stone-50">
                  {t("home.ctaHeading1")}
                </span>
                <br />
                <span className="text-[#c0392b] dark:text-rose-400">
                  {t("home.ctaHeading2")}
                </span>
              </h2>
              {/* Hand-drawn underline below the title */}
              <span
                className="absolute left-0 -bottom-1 h-2.5 w-[min(100%,400px)] text-[#e67e22] opacity-80 pointer-events-none"
                aria-hidden
              >
                <TitleUnderline className="h-full w-full" />
              </span>
              {/* Heart burst doodle next to title */}
              <span
                className="absolute -right-12 top-12 md:top-14 h-10 w-12 text-rose-400 pointer-events-none hidden sm:block"
                aria-hidden
              >
                <HeartBurst className="h-full w-full" />
              </span>
            </div>

            {/* Description */}
            <p className="mt-7 font-body text-[15px] md:text-[16px] leading-relaxed text-stone-700 dark:text-stone-300 max-w-xl">
              {t("home.ctaDesc")}
            </p>

            {/* Feature row */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              {[
                { Icon: Heart, en: "Preserve your family tradition" },
                { Icon: Users, en: "Inspire millions of home cooks" },
                { Icon: Star,  en: "Get featured on our website" },
              ].map(({ Icon, en }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-100 dark:border-rose-500/30 text-[#c0392b] dark:text-rose-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="font-body text-[12.5px] font-semibold text-stone-700 dark:text-stone-200 leading-tight pt-1">
                    {en}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button + reassurance */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/recipes/create"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#c0392b] text-white px-7 py-3.5 font-title-hw text-[16px] md:text-[17px] font-bold shadow-[0_8px_20px_-6px_rgba(192,57,43,0.5)] hover:bg-[#a02b1f] hover:shadow-[0_10px_24px_-6px_rgba(192,57,43,0.6)] transition-all active:translate-y-px"
              >
                <ChefHat className="h-5 w-5" />
                <span>{t("home.shareRecipe")}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Whisk / mixing bowl doodle next to the CTA */}
              <span
                className="h-12 w-14 text-stone-500 dark:text-stone-400 pointer-events-none hidden md:block"
                aria-hidden
              >
                <MixingBowl className="h-full w-full" />
              </span>
            </div>

            {/* "It only takes 2 minutes!" */}
            <div className="mt-4 flex items-center gap-2">
              <span className="h-3 w-6 text-[#e67e22] opacity-70" aria-hidden>
                <SideTicks className="h-full w-full" />
              </span>
              <p className="font-note-hw text-[14px] md:text-[15px] text-stone-700 dark:text-stone-300">
                {t("home.ctaNote")}
              </p>
              <span className="h-3 w-6 text-[#e67e22] opacity-70" aria-hidden>
                <SideTicks className="h-full w-full" flip />
              </span>
            </div>
          </div>

          {/* ─── RIGHT: Polaroid + sticky note ─── */}
          <div className="relative flex items-center justify-center min-h-[400px]">
            {/* Polaroid frame */}
            <div className="relative" style={{ transform: "rotate(2deg)" }}>
              {/* Yellow tape strips at top corners */}
              <TapeStrip
                color="yellow"
                rotate={-12}
                width="w-16"
                className="absolute -top-2 -left-2 z-30"
              />
              <TapeStrip
                color="yellow"
                rotate={10}
                width="w-16"
                className="absolute -top-2 right-2 z-30"
              />

              <div
                className="relative bg-white dark:bg-stone-100 p-3 md:p-4 pb-14 shadow-[0_18px_40px_-14px_rgba(120,90,40,0.45)]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(120,90,40,0.04) 0 1px, transparent 1px 6px)",
                }}
              >
                {/* Photo well */}
                <div className="relative w-[260px] h-[260px] md:w-[320px] md:h-[320px] overflow-hidden bg-gradient-to-br from-amber-100 via-rose-100 to-amber-50">
                  {/* Stylised illustration — sits in for an actual food photo */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-900/50">
                    <ChefHat className="h-24 w-24 md:h-28 md:w-28" strokeWidth={1.4} />
                    <p className="mt-3 font-title-hw text-[18px] md:text-[20px] font-bold text-amber-900/70 text-center px-6">
                      Your recipe here
                    </p>
                  </div>
                  {/* Decorative dots */}
                  <span className="absolute top-4 left-4 h-2 w-2 rounded-full bg-rose-300/70" />
                  <span className="absolute bottom-8 right-6 h-2 w-2 rounded-full bg-amber-400/70" />
                  <span className="absolute top-1/2 right-4 h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                </div>
                {/* Polaroid caption */}
                <p className="absolute bottom-3 left-0 right-0 text-center font-note-hw text-[13px] text-stone-600">
                  Share your story
                </p>
              </div>

              {/* "Every recipe has a story" sticky note — pinned to bottom-left of polaroid */}
              <div
                className="absolute -bottom-6 -left-8 md:-left-10 z-30 pointer-events-none"
                style={{ transform: "rotate(-6deg)" }}
                aria-hidden
              >
                <TapeStrip
                  color="yellow"
                  rotate={5}
                  width="w-10"
                  className="absolute -top-1 left-1/2 -translate-x-1/2"
                />
                <div
                  className="relative px-3 py-3 w-[130px] md:w-[150px] shadow-[0_6px_14px_-4px_rgba(120,80,0,0.4)]"
                  style={{
                    backgroundColor: "#fff3b0",
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                  }}
                >
                  <p className="font-note-hw text-[12.5px] md:text-[13px] leading-tight text-amber-900 text-center font-bold">
                    Every recipe
                    <br />
                    has a story.
                    <br />
                    Share yours!{" "}
                    <span className="text-rose-500">❤</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
