"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Users,
  BarChart3,
  MapPin,
  ChefHat,
  ChevronRight,
  Star,
  Heart,
  Printer,
  Share2,
  BookOpen,
  Salad,
  Archive,
  UtensilsCrossed,
  User,
  ExternalLink,
  Tag,
  Gamepad2,
  Shuffle,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
import { getRecipeById } from "@/features/recipe/services/recipeApi";
import { useLang } from "@/contexts/LanguageContext";
import type { Recipe, RecipeStep } from "@/types/recipe";

/* ───────────────────────── i18n helper with safe fallback ───────────────────────── */
function useTSafe() {
  const { t, lf } = useLang();
  const ts = (key: string, fallback: string) => {
    try {
      const value = t(key);
      if (!value || value === key) return fallback;
      return value;
    } catch {
      return fallback;
    }
  };
  return { t: ts, lf };
}

/* ───────────────────────── Section style (color-coded pastel pills) ───────────────────────── */
type SectionStyle = {
  pillBg: string;
  pillText: string;
  pillBorder: string;
  numberBg: string;
  numberText: string;
  numberRing: string;
  lineColor: string;
};

function getSectionStyle(title: string): SectionStyle {
  const lower = (title || "").toLowerCase();
  if (lower.includes("prep") || lower.includes("தயார்"))
    return {
      pillBg: "bg-blue-100 dark:bg-blue-500/15",
      pillText: "text-blue-800 dark:text-blue-200",
      pillBorder: "border-blue-200 dark:border-blue-400/30",
      numberBg: "bg-blue-500 dark:bg-blue-600",
      numberText: "text-white",
      numberRing: "ring-blue-200 dark:ring-blue-400/30",
      lineColor: "bg-blue-200 dark:bg-blue-400/30",
    };
  if (
    lower.includes("spice") ||
    lower.includes("grind") ||
    lower.includes("masala") ||
    lower.includes("அரை")
  )
    return {
      pillBg: "bg-violet-100 dark:bg-violet-500/15",
      pillText: "text-violet-800 dark:text-violet-200",
      pillBorder: "border-violet-200 dark:border-violet-400/30",
      numberBg: "bg-violet-500 dark:bg-violet-600",
      numberText: "text-white",
      numberRing: "ring-violet-200 dark:ring-violet-400/30",
      lineColor: "bg-violet-200 dark:bg-violet-400/30",
    };
  if (lower.includes("temper") || lower.includes("season") || lower.includes("தாளி"))
    return {
      pillBg: "bg-amber-100 dark:bg-amber-500/15",
      pillText: "text-amber-900 dark:text-amber-200",
      pillBorder: "border-amber-200 dark:border-amber-400/30",
      numberBg: "bg-amber-500 dark:bg-amber-600",
      numberText: "text-white",
      numberRing: "ring-amber-200 dark:ring-amber-400/30",
      lineColor: "bg-amber-200 dark:bg-amber-400/30",
    };
  if (
    lower.includes("final") ||
    lower.includes("pressure") ||
    lower.includes("finish") ||
    lower.includes("texture") ||
    lower.includes("முடி")
  )
    return {
      pillBg: "bg-emerald-100 dark:bg-emerald-500/15",
      pillText: "text-emerald-800 dark:text-emerald-200",
      pillBorder: "border-emerald-200 dark:border-emerald-400/30",
      numberBg: "bg-emerald-500 dark:bg-emerald-600",
      numberText: "text-white",
      numberRing: "ring-emerald-200 dark:ring-emerald-400/30",
      lineColor: "bg-emerald-200 dark:bg-emerald-400/30",
    };
  if (lower.includes("cook") || lower.includes("process") || lower.includes("சமை"))
    return {
      pillBg: "bg-orange-100 dark:bg-orange-500/15",
      pillText: "text-orange-900 dark:text-orange-200",
      pillBorder: "border-orange-200 dark:border-orange-400/30",
      numberBg: "bg-orange-500 dark:bg-orange-600",
      numberText: "text-white",
      numberRing: "ring-orange-200 dark:ring-orange-400/30",
      lineColor: "bg-orange-200 dark:bg-orange-400/30",
    };
  if (lower.includes("tip") || lower.includes("note") || lower.includes("குறிப்"))
    return {
      pillBg: "bg-teal-100 dark:bg-teal-500/15",
      pillText: "text-teal-800 dark:text-teal-200",
      pillBorder: "border-teal-200 dark:border-teal-400/30",
      numberBg: "bg-teal-500 dark:bg-teal-600",
      numberText: "text-white",
      numberRing: "ring-teal-200 dark:ring-teal-400/30",
      lineColor: "bg-teal-200 dark:bg-teal-400/30",
    };
  return {
    pillBg: "bg-rose-100 dark:bg-rose-500/15",
    pillText: "text-rose-800 dark:text-rose-200",
    pillBorder: "border-rose-200 dark:border-rose-400/30",
    numberBg: "bg-rose-500 dark:bg-rose-600",
    numberText: "text-white",
    numberRing: "ring-rose-200 dark:ring-rose-400/30",
    lineColor: "bg-rose-200 dark:bg-rose-400/30",
  };
}

/* ───────────────────────── Inline SVG decorations ───────────────────────── */
function TitleSquiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 14"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
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

function CurryLeaf({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  const leafPath = "M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z";
  const pairs: Array<[number, number, number]> = [
    [180, 1.05, 22],
    [155, 1.0, 26],
    [130, 0.92, 30],
    [105, 0.82, 35],
    [80, 0.7, 42],
    [58, 0.55, 50],
    [38, 0.4, 58],
  ];
  return (
    <svg
      viewBox="0 0 100 200"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <path
        d="M50 196 Q 47 100, 50 14"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      {pairs.map(([y, scale, angle], i) => {
        const opacity = 0.88 - i * 0.04;
        return (
          <g key={i}>
            <g transform={`translate(50, ${y}) rotate(${-angle}) scale(${scale})`}>
              <path d={leafPath} fill="currentColor" opacity={opacity} />
            </g>
            <g transform={`translate(50, ${y}) rotate(${180 + angle}) scale(${scale})`}>
              <path d={leafPath} fill="currentColor" opacity={opacity} />
            </g>
          </g>
        );
      })}
      <g transform="translate(50, 18) rotate(-90) scale(0.35)">
        <path d={leafPath} fill="currentColor" opacity="0.7" />
      </g>
    </svg>
  );
}

function SmileyDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="11.5" cy="13" r="1.2" fill="currentColor" />
      <circle cx="20.5" cy="13" r="1.2" fill="currentColor" />
      <path d="M10 19 Q 16 24, 22 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Paperclip({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 64" className={className} aria-hidden>
      <path
        d="M22 6 C 28 6, 28 18, 22 18 L 10 18 C 4 18, 4 30, 10 30 L 22 30 C 26 30, 26 40, 22 40 L 12 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ───────────────────────── Tape strip ───────────────────────── */
function TapeStrip({
  className = "",
  rotate = -3,
  color = "yellow",
  width = "w-36",
}: {
  className?: string;
  rotate?: number;
  color?: "yellow" | "pink" | "blue" | "green";
  width?: string;
}) {
  const colorClass =
    color === "pink"
      ? "bg-pink-200/75 dark:bg-pink-400/25"
      : color === "blue"
      ? "bg-sky-200/75 dark:bg-sky-400/25"
      : color === "green"
      ? "bg-emerald-200/75 dark:bg-emerald-400/25"
      : "bg-yellow-200/80 dark:bg-yellow-400/25";
  return (
    <div
      className={`${width} h-7 ${colorClass} ${className} shadow-sm rounded-[1px]`}
      style={{
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 6px)",
      }}
    />
  );
}

/* ───────────────────────── Sticker badges ───────────────────────── */
function SourceSticker({ source, label }: { source: string; label: string }) {
  const palettes: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    traditional: {
      bg: "bg-yellow-200/80 dark:bg-yellow-400/25",
      text: "text-amber-900 dark:text-amber-100",
      dot: "bg-rose-500",
    },
    youtube: {
      bg: "bg-rose-200/80 dark:bg-rose-400/25",
      text: "text-rose-900 dark:text-rose-100",
      dot: "bg-rose-600",
    },
    ai: {
      bg: "bg-violet-200/80 dark:bg-violet-400/25",
      text: "text-violet-900 dark:text-violet-100",
      dot: "bg-violet-600",
    },
  };
  const key = source === "ai" || source === "youtube" ? source : "traditional";
  const p = palettes[key];
  return (
    <span
      className={`font-note-hw relative inline-flex items-center gap-2 ${p.bg} ${p.text} px-4 py-1 text-[16px] font-bold tracking-tight shadow-[0_2px_4px_rgba(120,90,40,0.18)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.5)] rounded-[1px]`}
      style={{
        transform: "rotate(-2deg)",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
      }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
      {label}
    </span>
  );
}

function PaperTag({
  rotation,
  icon,
  children,
}: {
  rotation: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative inline-flex items-center gap-1.5 rounded-md border border-dashed border-stone-400/70 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/60 pl-4 pr-3 py-1 text-[11.5px] font-semibold text-stone-700 dark:text-stone-200 shadow-[1px_2px_0_rgba(120,90,40,0.12)] dark:shadow-[1px_2px_0_rgba(0,0,0,0.35)]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
      {icon}
      {children}
    </div>
  );
}

/* ───────────────────────── Tag sticky-note chips ─────────────────────────
   Small rotated mini sticky-note labels — pastel cycling, Kalam font. */
const TAG_PALETTES = [
  {
    bg: "#fff3b0",
    text: "#7a5b00",
    shadow: "rgba(180,140,0,0.32)",
    tape: "bg-rose-200/70",
  },
  {
    bg: "#fbd5dd",
    text: "#831a3a",
    shadow: "rgba(160,40,80,0.32)",
    tape: "bg-amber-200/70",
  },
  {
    bg: "#cfe6f6",
    text: "#0c4a6e",
    shadow: "rgba(20,80,140,0.32)",
    tape: "bg-yellow-200/70",
  },
  {
    bg: "#d6f0d2",
    text: "#1a5e2a",
    shadow: "rgba(20,90,30,0.32)",
    tape: "bg-pink-200/70",
  },
];

function TagStickyChip({
  label,
  index,
}: {
  label: string;
  index: number;
}) {
  const palette = TAG_PALETTES[index % TAG_PALETTES.length];
  const rotations = [-3, 2, -1.5, 3];
  const rot = rotations[index % rotations.length];
  const showTape = index % 2 === 1;
  return (
    <span
      className="font-note-hw relative inline-flex items-center px-2.5 py-0.5 text-[12.5px] font-bold leading-tight rounded-[2px] my-1.5"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
        transform: `rotate(${rot}deg)`,
        boxShadow: `0 2px 4px ${palette.shadow}`,
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.04) 100%)",
      }}
    >
      {showTape && (
        <span
          className={`absolute -top-1.5 left-1/2 h-2 w-5 ${palette.tape} rounded-[1px] shadow-sm`}
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 1.5px, transparent 1.5px 4px)",
            transform: "translateX(-50%) rotate(-4deg)",
          }}
        />
      )}
      #{label}
    </span>
  );
}

/* ───────────────────────── Extra free-floating sticky note ───────────────────────── */
function ExtraSticky({
  title,
  body,
  color,
  rotate = -3,
  className = "",
  pinColor = "rose",
  width = "w-44",
}: {
  title: string;
  body: string;
  color: "yellow" | "pink" | "blue" | "green";
  rotate?: number;
  className?: string;
  pinColor?: "rose" | "amber" | "sky" | "emerald";
  width?: string;
}) {
  const palettes: Record<
    string,
    { bg: string; text: string; titleText: string; shadow: string }
  > = {
    yellow: {
      bg: "#fff5b0",
      text: "#5b3a00",
      titleText: "#7a4a00",
      shadow: "rgba(180,140,0,0.35)",
    },
    pink: {
      bg: "#fbd5dd",
      text: "#7a1133",
      titleText: "#a01a3c",
      shadow: "rgba(180,40,80,0.35)",
    },
    blue: {
      bg: "#d6e9f5",
      text: "#0c3a5e",
      titleText: "#0e4a76",
      shadow: "rgba(20,80,140,0.35)",
    },
    green: {
      bg: "#d6efce",
      text: "#1a4a1e",
      titleText: "#205a26",
      shadow: "rgba(20,80,30,0.35)",
    },
  };
  const pinPalette: Record<string, { bg: string; ring: string }> = {
    rose: { bg: "bg-rose-500", ring: "ring-rose-300" },
    amber: { bg: "bg-amber-500", ring: "ring-amber-300" },
    sky: { bg: "bg-sky-500", ring: "ring-sky-300" },
    emerald: { bg: "bg-emerald-500", ring: "ring-emerald-300" },
  };
  const p = palettes[color];
  const pin = pinPalette[pinColor];
  return (
    <div
      className={`relative ${width} px-4 pt-5 pb-4 ${className}`}
      style={{
        backgroundColor: p.bg,
        transform: `rotate(${rotate}deg)`,
        boxShadow: `0 8px 20px -8px ${p.shadow}`,
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
      }}
    >
      <span
        className={`absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full ${pin.bg} shadow-[0_2px_4px_rgba(0,0,0,0.4)] ring-2 ${pin.ring}`}
      />
      <p
        className="font-note-hw text-[14px] font-black uppercase tracking-wide mb-1.5 leading-none"
        style={{ color: p.titleText }}
      >
        {title}
      </p>
      <p
        className="font-note-hw text-[15.5px] leading-snug"
        style={{ color: p.text }}
      >
        {body}
      </p>
    </div>
  );
}

/* ───────────────────────── Dotted leader ingredient row ───────────────────────── */
function DottedLeaderRow({
  name,
  qty,
  href,
}: {
  name: string;
  qty: string;
  href?: string;
}) {
  const content = (
    <span className="flex items-baseline gap-2 py-2 px-1 group">
      <span className="font-note-hw text-[17.5px] font-semibold text-stone-800 dark:text-stone-200 group-hover:text-[var(--color-primary)] transition-colors whitespace-nowrap">
        {name}
      </span>
      <span
        aria-hidden
        className="flex-1 self-end h-[8px] text-stone-400 dark:text-stone-600 translate-y-[-3px]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1.5px)",
          backgroundSize: "6px 8px",
          backgroundPosition: "0 100%",
          backgroundRepeat: "repeat-x",
        }}
      />
      <span className="font-body text-[14px] font-bold text-stone-600 dark:text-stone-400 tabular-nums whitespace-nowrap">
        {qty}
      </span>
    </span>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-md hover:bg-amber-50/60 dark:hover:bg-stone-800/40 transition-colors"
      >
        {content}
      </Link>
    );
  }
  return <div className="block">{content}</div>;
}

/* ───────────────────────── Seeded shuffle (Fisher-Yates) ───────────────────────── */
function seededRandom(seedStr: string): () => number {
  let seed = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    seed ^= seedStr.charCodeAt(i);
    seed = Math.imul(seed, 0x01000193) >>> 0;
  }
  // Mix in a small constant so weak seeds don't collapse
  seed = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
}

function shuffleWithSeed<T>(arr: T[], seedStr: string): T[] {
  const out = arr.slice();
  if (out.length < 2) return out;
  const rand = seededRandom(seedStr);
  // Guarantee at least one displacement: keep reshuffling if identity permutation
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    const identical = out.every((v, idx) => v === arr[idx]);
    if (!identical) break;
  }
  return out;
}

/* ───────────────────────── Learn Recipe Modal ───────────────────────── */
type FlatStep = { id: number; description: string };

/* ───────────────────────── Sticky-note tile (square scrap-book style) ─────────────────────────
   Used by the LearnRecipeModal — renders a step as a square sticky note with
   number, text, pin/clip decoration, and slight rotation. */
const TILE_PALETTES = [
  { bg: "#fff3b0", text: "#5b3a00", pin: "#d97706" }, // yellow
  { bg: "#fbd5dd", text: "#7a1133", pin: "#e11d48" }, // pink
  { bg: "#d6e9f5", text: "#0c3a5e", pin: "#0284c7" }, // blue
  { bg: "#d6efce", text: "#1a4a1e", pin: "#16a34a" }, // green
  { bg: "#e9dafb", text: "#3a1a6e", pin: "#7c3aed" }, // purple
  { bg: "#fde4c0", text: "#6a3a00", pin: "#ea580c" }, // peach
];

function StickyTile({
  step,
  paletteIdx,
  rotation,
  showCorrect,
  showWrong,
  draggable = true,
  onDragStart,
  onDragEnd,
  isDragging,
  size = "md",
  hideNumber = false,
}: {
  step: FlatStep;
  paletteIdx: number;
  rotation: number;
  showCorrect?: boolean;
  showWrong?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  size?: "sm" | "md";
  /** Hide the step number badge — used by Learn Recipe so users have to think.
   *  When true, the number stays hidden even after Check; only the ✅/❌ stamps
   *  give feedback. (Revealing the number would give away the correct order.) */
  hideNumber?: boolean;
}) {
  const p = TILE_PALETTES[paletteIdx % TILE_PALETTES.length];
  const decoration = step.id % 2 === 0 ? "pin" : "tape";
  const sizeClasses =
    size === "sm"
      ? "h-[120px] w-[120px] px-2.5 pt-6 pb-2.5"
      : "h-[140px] w-[140px] md:h-[150px] md:w-[150px] px-3 pt-7 pb-3";
  const textSize = size === "sm" ? "text-[12px]" : "text-[13px] md:text-[13.5px]";

  const revealNumber = !hideNumber;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`relative select-none ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "opacity-40" : ""}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "opacity 120ms ease",
      }}
    >
      <div
        className={`relative ${sizeClasses} rounded-[3px] flex flex-col`}
        style={{
          backgroundColor: p.bg,
          boxShadow:
            "0 8px 18px -8px rgba(0,0,0,0.28), 0 1px 0 rgba(0,0,0,0.06)",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.05) 100%)",
        }}
      >
        {/* Step number circle — hidden during play, revealed after check */}
        <div
          className="absolute top-2 left-2 h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] shadow-sm border-2"
          style={{
            backgroundColor: "rgba(255,255,255,0.6)",
            color: p.text,
            borderColor: p.text + "55",
            opacity: revealNumber ? 1 : 0,
            transition: "opacity 240ms ease",
          }}
          aria-hidden={!revealNumber}
        >
          {revealNumber ? step.id : ""}
        </div>

        {/* Decoration: pushpin (red dot) or washi tape */}
        {decoration === "pin" ? (
          <span
            className="absolute -top-1.5 right-3 h-3 w-3 rounded-full shadow-md"
            style={{
              backgroundColor: p.pin,
              boxShadow:
                "0 2px 3px rgba(0,0,0,0.35), inset -1px -1px 2px rgba(0,0,0,0.2)",
              border: "1.5px solid rgba(255,255,255,0.6)",
            }}
            aria-hidden
          />
        ) : (
          <div
            className="absolute -top-1 right-3 h-3 w-10 opacity-80"
            style={{
              backgroundColor: "rgba(232, 220, 160, 0.85)",
              transform: "rotate(-12deg)",
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 2px, transparent 2px 6px)",
            }}
            aria-hidden
          />
        )}

        {/* Step text */}
        <p
          className={`font-note-hw ${textSize} leading-snug flex-1 overflow-hidden ${
            size === "sm" ? "line-clamp-5" : "line-clamp-5"
          }`}
          style={{ color: p.text }}
        >
          {step.description}
        </p>

        {/* Correct / Wrong stamp */}
        {showCorrect && (
          <span
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md ring-2 ring-white z-10"
            style={{ transform: "rotate(8deg)" }}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
        {showWrong && (
          <span
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md ring-2 ring-white z-10"
            style={{ transform: "rotate(-8deg)" }}
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Learn Recipe — Grandma's Notebook ─────────────────────────
   TWO ZONES:
     • Top    — "Messy Notes" scattered deck of sticky tiles
     • Bottom — A LARGE notebook page where users place notes FREELY (no slots).
                Spatial reading order (Y-band rows, then X within row) determines the
                user's sequence; compared to recipe.steps order on Check.
   Native HTML5 drag-drop. Touch fallback: tap a tile to select, tap board to place. */
type LearnDragSrc =
  | { type: "deck"; id: number }
  | { type: "board"; id: number };

type Placement = { step: FlatStep; x: number; y: number };

const TILE_W = 150; // approximate sticky tile width — used for center-on-drop math

function computeOrderFromPlacements(placements: Placement[]): FlatStep[] {
  // Group placements into rows by y-tolerance, then sort by x within each row.
  const ROW_TOL = 90;
  const sorted = placements.slice().sort((a, b) => a.y - b.y);
  const rows: Placement[][] = [];
  for (const p of sorted) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(p.y - last[0].y) < ROW_TOL) last.push(p);
    else rows.push([p]);
  }
  return rows.flatMap((row) => row.slice().sort((a, b) => a.x - b.x).map((p) => p.step));
}

function LearnRecipeModal({
  open,
  onClose,
  steps,
  recipeId,
  recipeTitle,
  t,
}: {
  open: boolean;
  onClose: () => void;
  steps: FlatStep[];
  recipeId: string;
  recipeTitle: string;
  t: (key: string, fallback: string) => string;
}) {
  const [seedCounter, setSeedCounter] = useState(0);
  const initialDeck = useMemo(
    () => shuffleWithSeed(steps, `${recipeId}-${seedCounter}`),
    [steps, recipeId, seedCounter]
  );
  const [deck, setDeck] = useState<FlatStep[]>(initialDeck);
  const [board, setBoard] = useState<Placement[]>([]);
  const [dragSrc, setDragSrc] = useState<LearnDragSrc | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 75, dy: 75 });
  const [selected, setSelected] = useState<LearnDragSrc | null>(null);
  const [checked, setChecked] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  // Reset on shuffle or steps change
  useEffect(() => {
    setDeck(initialDeck);
    setBoard([]);
    setDragSrc(null);
    setSelected(null);
    setChecked(false);
    setCelebrate(false);
  }, [initialDeck, steps.length]);

  // Body scroll lock
  useEffect(() => {
    if (typeof document === "undefined" || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Find a step in the current deck/board by id
  const findInDeck = (id: number) => deck.find((s) => s.id === id);
  const findInBoard = (id: number) => board.find((p) => p.step.id === id);

  const beginDrag = (src: LearnDragSrc) => (e: React.DragEvent) => {
    setDragSrc(src);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("application/json", JSON.stringify(src));
    } catch {
      /* ignore */
    }
    // Capture where on the tile the user grabbed it, so the drop preserves the visual offset
    const target = e.currentTarget as HTMLElement | null;
    if (target) {
      const rect = target.getBoundingClientRect();
      setDragOffset({ dx: e.clientX - rect.left, dy: e.clientY - rect.top });
    }
  };

  const readSrc = (e: React.DragEvent): LearnDragSrc | null => {
    if (dragSrc) return dragSrc;
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (raw) return JSON.parse(raw) as LearnDragSrc;
    } catch {
      /* ignore */
    }
    return null;
  };

  const placeOnBoard = (src: LearnDragSrc, x: number, y: number) => {
    setChecked(false);
    if (src.type === "deck") {
      const step = findInDeck(src.id);
      if (!step) return;
      setDeck((d) => d.filter((s) => s.id !== src.id));
      setBoard((b) => [...b, { step, x, y }]);
    } else {
      setBoard((b) =>
        b.map((p) => (p.step.id === src.id ? { ...p, x, y } : p))
      );
    }
  };

  const returnToDeck = (src: LearnDragSrc) => {
    setChecked(false);
    if (src.type === "deck") return;
    const placement = findInBoard(src.id);
    if (!placement) return;
    setBoard((b) => b.filter((p) => p.step.id !== src.id));
    setDeck((d) => [...d, placement.step]);
  };

  const onBoardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onBoardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const src = readSrc(e);
    if (!src) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Place note top-left such that the drop point keeps the same offset on the tile
    const x = Math.max(0, Math.min(rect.width - TILE_W, e.clientX - rect.left - dragOffset.dx));
    const y = Math.max(0, Math.min(rect.height - TILE_W, e.clientY - rect.top - dragOffset.dy));
    placeOnBoard(src, x, y);
    setDragSrc(null);
  };

  const onDeckDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDeckDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const src = readSrc(e);
    if (!src) return;
    returnToDeck(src);
    setDragSrc(null);
  };

  // Touch fallback — tap deck tile to select, tap board to place at a default position
  const handleDeckTap = (id: number) => {
    if (selected && selected.type === "deck" && selected.id === id) {
      setSelected(null);
      return;
    }
    setSelected({ type: "deck", id });
  };
  const handleBoardTap = (e: React.MouseEvent) => {
    if (!selected) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(rect.width - TILE_W, e.clientX - rect.left - TILE_W / 2));
    const y = Math.max(0, Math.min(rect.height - TILE_W, e.clientY - rect.top - 70));
    placeOnBoard(selected, x, y);
    setSelected(null);
  };
  const handleBoardTileTap = (id: number) => {
    if (selected && selected.type === "board" && selected.id === id) {
      setSelected(null);
      return;
    }
    if (!selected) {
      setSelected({ type: "board", id });
      return;
    }
    // If a deck tile is selected and user taps a board tile, swap positions (deck moves into board tile's slot, board tile returns to deck)
    if (selected.type === "deck") {
      const targetPlace = findInBoard(id);
      if (targetPlace) {
        placeOnBoard(selected, targetPlace.x, targetPlace.y);
        returnToDeck({ type: "board", id });
      }
    }
    setSelected(null);
  };

  const reshuffle = () => {
    setSeedCounter((c) => c + 1);
  };

  const resetBoard = () => {
    setChecked(false);
    setCelebrate(false);
    const boardSteps = board.map((p) => p.step);
    setBoard([]);
    setDeck((d) => [...d, ...boardSteps]);
  };

  // Compute the user's spatial sequence and score
  const userOrder = useMemo(() => computeOrderFromPlacements(board), [board]);
  const correctCount = userOrder.reduce(
    (acc, step, idx) => acc + (step.id === idx + 1 ? 1 : 0),
    0
  );
  const allPlaced = deck.length === 0;
  const N = steps.length;
  const perfect = checked && allPlaced && correctCount === N;

  // Celebrate on a perfect score
  useEffect(() => {
    if (perfect) {
      setCelebrate(true);
      const t1 = setTimeout(() => setCelebrate(false), 4500);
      return () => clearTimeout(t1);
    }
  }, [perfect]);

  const handleCheck = () => {
    if (!allPlaced) return;
    setChecked(true);
  };

  // Build a Set of step-ids that are correctly positioned (used to stamp tiles)
  const correctIds = useMemo(() => {
    const set = new Set<number>();
    if (!checked) return set;
    userOrder.forEach((s, idx) => {
      if (s.id === idx + 1) set.add(s.id);
    });
    return set;
  }, [checked, userOrder]);

  // Position markers along notebook lines (visual guide only — NOT drop slots)
  const ROW_COUNT = N > 6 ? 2 : 1;
  const PER_ROW = Math.ceil(N / ROW_COUNT);

  // Visual rotation seed for scattered deck — stable per step id
  const rotationFor = (id: number) => {
    const arr = [-4, 3, -2, 2.5, -3.5, 1.5, -1.5, 4, -2.5, 3.5, -1, 2];
    return arr[id % arr.length];
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] print:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="learn-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Notebook surface — full-screen on mobile, padded on desktop */}
          <motion.div
            className="absolute inset-1 md:inset-4 lg:inset-6 rounded-[20px] paper-card border border-stone-300 dark:border-stone-700 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Close X */}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("recipe.close", "Close")}
              className="absolute top-3 right-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header bar */}
            <div className="px-4 md:px-8 pt-5 pb-4 border-b border-dashed border-stone-300 dark:border-stone-700 shrink-0 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <p className="font-note-hw text-[12px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                    {t("recipe.learnGame", "Learn the Recipe")}
                  </p>
                </div>
                <h2
                  id="learn-modal-title"
                  className="font-title-hw text-[26px] md:text-[34px] leading-tight text-stone-900 dark:text-stone-100"
                >
                  {t("recipe.arrangeSteps", "Arrange the steps in the correct order")}
                </h2>
                <p className="font-body text-[13px] text-stone-600 dark:text-stone-400 mt-1 truncate">
                  {recipeTitle}
                </p>
              </div>

              {/* Stats card */}
              <div className="hidden sm:flex items-stretch gap-5 px-5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 shadow-sm mr-12">
                <div className="flex flex-col justify-center">
                  <p className="font-body text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t("recipe.stepsToArrange", "Steps to arrange")}
                  </p>
                  <p className="font-title-hw text-[22px] text-rose-600 dark:text-rose-400 leading-none mt-0.5">
                    {N} {t("recipe.stepsShort", "steps")}
                  </p>
                </div>
                <div className="w-px bg-stone-200 dark:bg-stone-700" />
                <div className="flex flex-col justify-center">
                  <p className="font-body text-[11px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t("recipe.yourProgress", "Your progress")}
                  </p>
                  <p className="font-title-hw text-[22px] text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
                    {board.length} / {N}
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN BOARD — top deck + bottom notebook */}
            <div className="flex-1 overflow-y-auto">
              {/* ─── TOP: Messy notes deck ─── */}
              <div
                className="relative px-4 md:px-8 pt-4 pb-6 border-b border-dashed border-stone-300 dark:border-stone-700 bg-[radial-gradient(rgba(120,90,40,0.04)_1px,transparent_1px)] [background-size:8px_8px]"
                onDragOver={onDeckDragOver}
                onDrop={onDeckDrop}
              >
                {/* "How to Play" + intro row */}
                <div className="flex flex-wrap items-start gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowHowTo((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-200 border border-violet-200 dark:border-violet-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors"
                  >
                    {t("recipe.howToPlay", "How to Play")}
                  </button>
                  <p className="font-body text-[13px] text-stone-700 dark:text-stone-300 max-w-2xl leading-snug">
                    {t(
                      "recipe.dragHintFree",
                      "Drag the sticky notes and place them in the correct order on the board below. You can place them anywhere you like!"
                    )}
                  </p>
                </div>

                {/* Tip sticky note (decorative) */}
                <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <div
                    className="relative w-44 px-4 pt-5 pb-3 shadow-[0_8px_20px_-8px_rgba(120,80,0,0.35)]"
                    style={{
                      transform: "rotate(-2deg)",
                      backgroundColor: "#fff7c2",
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                    }}
                  >
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 h-3 w-16 opacity-90"
                      style={{
                        backgroundColor: "rgba(232, 220, 160, 0.85)",
                        transform: "rotate(-3deg)",
                        backgroundImage:
                          "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 2px, transparent 2px 6px)",
                      }}
                    />
                    <p className="font-note-hw text-[14px] leading-tight text-amber-900 text-center font-bold">
                      {t(
                        "recipe.tipNote",
                        "Tip: Read each step carefully and arrange them in the right order!"
                      )}{" "}
                      😊
                    </p>
                  </div>
                </div>

                {/* How To Play expandable panel */}
                {showHowTo && (
                  <div className="mb-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-400/30 text-[12px] font-body text-violet-900 dark:text-violet-100">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>{t("recipe.howTo1", "Drag a sticky note from the top onto the recipe board below.")}</li>
                      <li>{t("recipe.howTo2", "Read your notes left-to-right, top-to-bottom — that's the order.")}</li>
                      <li>{t("recipe.howTo3", "Tap Check Order when you're done!")}</li>
                    </ol>
                  </div>
                )}

                {/* Decorative leaves on right */}
                <div className="hidden lg:block absolute top-2 right-3 h-28 w-16 opacity-50 text-lime-700 dark:text-lime-400 pointer-events-none">
                  <CurryLeaf className="h-full w-full" />
                </div>

                {/* Scattered sticky notes */}
                <div
                  className="flex flex-wrap gap-4 md:gap-5 justify-center md:justify-start items-start min-h-[200px] pt-12 md:pt-16"
                  aria-label={t("recipe.deckLabel", "Steps to place")}
                >
                  {deck.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center font-note-hw text-[16px] text-stone-400 dark:text-stone-500 py-10">
                      {t(
                        "recipe.deckEmpty",
                        "All placed! Tap Check Order to see how you did."
                      )}
                    </div>
                  ) : (
                    deck.map((step) => {
                      const isSelected =
                        selected?.type === "deck" && selected.id === step.id;
                      return (
                        <div
                          key={step.id}
                          onClick={() => handleDeckTap(step.id)}
                          className={`${
                            isSelected
                              ? "ring-4 ring-[var(--color-primary)]/60 rounded-md"
                              : ""
                          }`}
                        >
                          <StickyTile
                            step={step}
                            paletteIdx={step.id - 1}
                            rotation={rotationFor(step.id)}
                            draggable
                            onDragStart={beginDrag({ type: "deck", id: step.id })}
                            onDragEnd={() => setDragSrc(null)}
                            isDragging={
                              dragSrc?.type === "deck" && dragSrc.id === step.id
                            }
                            hideNumber
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ─── BOTTOM: Recipe board (free drop area) ─── */}
              <div className="relative bg-stone-50/60 dark:bg-stone-900/30">
                {/* Spiral binding column on left */}
                <div className="absolute top-0 bottom-0 left-2 md:left-4 w-6 flex flex-col items-center justify-evenly py-6 pointer-events-none">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className="block h-3 w-3 rounded-full bg-stone-200 dark:bg-stone-700 ring-2 ring-stone-300/70 dark:ring-stone-600/70 shadow-inner"
                    />
                  ))}
                </div>

                <div className="pl-12 md:pl-16 pr-4 md:pr-8 pt-5 pb-6">
                  {/* Section heading */}
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="relative font-title-hw text-[24px] md:text-[28px] text-stone-900 dark:text-stone-100 inline-block">
                      {t("recipe.yourRecipeBoard", "Your Recipe Board")}
                      <span className="absolute left-0 right-2 -bottom-1 h-1 bg-[var(--color-primary)] rounded-full opacity-80" />
                    </h3>
                  </div>
                  <p className="font-body text-[12.5px] text-stone-600 dark:text-stone-400 mb-4">
                    {t(
                      "recipe.placeStepsHere",
                      "Place the steps here in the correct order"
                    )}
                  </p>

                  {/* The free-drop board */}
                  <div
                    ref={boardRef}
                    onDragOver={onBoardDragOver}
                    onDrop={onBoardDrop}
                    onClick={handleBoardTap}
                    className="relative paper-ruled rounded-lg border border-stone-200 dark:border-stone-700 min-h-[340px] md:min-h-[400px] overflow-hidden"
                    style={{
                      backgroundColor: "rgba(255, 253, 246, 0.85)",
                    }}
                  >
                    {/* Position-guide markers — small numbered circles with dashed arrows between them.
                        These are HINTS only; users can place notes anywhere. */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-around py-4">
                      {Array.from({ length: ROW_COUNT }).map((_, rowIdx) => {
                        const rowStart = rowIdx * PER_ROW + 1;
                        const rowEnd = Math.min(rowStart + PER_ROW - 1, N);
                        const cells = [];
                        for (let n = rowStart; n <= rowEnd; n++) cells.push(n);
                        return (
                          <div
                            key={rowIdx}
                            className="flex items-center justify-around px-4"
                          >
                            {cells.map((n, i) => (
                              <div key={n} className="flex items-center gap-2">
                                <span
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-stone-300 dark:border-stone-600 font-body text-[11px] font-bold text-stone-400 dark:text-stone-500 bg-white/50 dark:bg-stone-800/50"
                                >
                                  {n}
                                </span>
                                {i < cells.length - 1 && (
                                  <span
                                    className="inline-block h-px w-8 md:w-12 border-t-2 border-dashed border-stone-300 dark:border-stone-700"
                                    aria-hidden
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>

                    {/* Placed sticky notes (absolutely positioned) */}
                    {board.map((p) => {
                      const isSelected =
                        selected?.type === "board" && selected.id === p.step.id;
                      const correct = checked && correctIds.has(p.step.id);
                      const wrong = checked && allPlaced && !correctIds.has(p.step.id);
                      return (
                        <div
                          key={p.step.id}
                          className={`absolute z-10 ${
                            isSelected
                              ? "ring-4 ring-[var(--color-primary)]/60 rounded-md"
                              : ""
                          }`}
                          style={{ left: p.x, top: p.y }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBoardTileTap(p.step.id);
                          }}
                        >
                          <StickyTile
                            step={p.step}
                            paletteIdx={p.step.id - 1}
                            rotation={rotationFor(p.step.id)}
                            draggable
                            onDragStart={beginDrag({ type: "board", id: p.step.id })}
                            onDragEnd={() => setDragSrc(null)}
                            isDragging={
                              dragSrc?.type === "board" && dragSrc.id === p.step.id
                            }
                            showCorrect={correct}
                            showWrong={wrong}
                            size="sm"
                            hideNumber
                          />
                        </div>
                      );
                    })}

                    {/* Hint sticky in the bottom-left of the board */}
                    <div className="absolute bottom-3 left-3 z-0 pointer-events-none hidden md:block">
                      <div
                        className="relative w-36 px-3 pt-4 pb-3 shadow-[0_8px_18px_-8px_rgba(180,40,80,0.35)]"
                        style={{
                          transform: "rotate(-3deg)",
                          backgroundColor: "#fad6e3",
                          backgroundImage:
                            "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base" aria-hidden>
                            💡
                          </span>
                          <span className="font-note-hw text-[14px] font-bold text-rose-900">
                            {t("recipe.hint", "Hint")}
                          </span>
                        </div>
                        <p className="font-note-hw text-[12.5px] leading-snug text-rose-950">
                          {t(
                            "recipe.hintText",
                            "Think about the logical flow of cooking!"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-4 md:px-8 py-3 border-t border-dashed border-stone-300 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50 dark:bg-stone-900/30 shrink-0">
              <button
                type="button"
                onClick={reshuffle}
                className="inline-flex items-center gap-1.5 rounded-lg paper-card text-stone-800 dark:text-stone-100 border-2 border-dashed border-stone-400 dark:border-stone-600 px-3 py-1.5 text-sm font-bold hover:border-stone-700 dark:hover:border-stone-400 transition-all shadow-[1px_2px_0_rgba(120,90,40,0.18)] active:translate-y-px active:shadow-none"
              >
                <Shuffle className="h-3.5 w-3.5" />
                {t("recipe.shuffleNotes", "Shuffle Notes")}
              </button>

              <p className="hidden md:flex items-center gap-1.5 font-note-hw text-[13px] text-stone-500 dark:text-stone-400">
                💡 {t("recipe.stuckHint", "Stuck? Shuffle to get a new arrangement")}
              </p>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={resetBoard}
                  disabled={board.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg paper-card text-stone-800 dark:text-stone-100 border-2 border-solid border-stone-300 dark:border-stone-600 px-3 py-1.5 text-sm font-bold hover:border-stone-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("recipe.resetBoard", "Reset Board")}
                </button>
                <button
                  type="button"
                  disabled={!allPlaced}
                  onClick={handleCheck}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-solid px-4 py-1.5 text-sm font-bold transition-all shadow-[1px_2px_0_rgba(120,90,40,0.22)] active:translate-y-px active:shadow-none bg-stone-900 text-white border-stone-900 dark:bg-[var(--color-primary)] dark:border-[var(--color-primary)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-3.5 w-3.5" />
                  {t("recipe.checkOrder", "Check Order")}
                </button>
              </div>
            </div>

            {/* Score banner overlay after check */}
            {checked && allPlaced && !perfect && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                <div
                  className="font-title-hw text-[22px] font-bold inline-flex items-center gap-2 px-4 py-1.5 border-2 border-dashed rounded-md shadow-md"
                  style={{
                    color: "#7a1133",
                    borderColor: "rgba(122,17,51,0.6)",
                    transform: "rotate(-2deg)",
                    backgroundColor: "rgba(251, 213, 221, 0.85)",
                  }}
                >
                  {t("recipe.score", "Score")}: {correctCount} / {N} —{" "}
                  {t("recipe.tryAgain", "Try Again!")}
                </div>
              </div>
            )}

            {/* GRANDMA APPROVED celebration */}
            <AnimatePresence>
              {celebrate && (
                <motion.div
                  className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Confetti emojis */}
                  {Array.from({ length: 22 }).map((_, i) => {
                    const emojis = ["🎉", "✨", "🌟", "🍲", "💚", "👵🏽", "🥇"];
                    const left = (i * 47) % 100;
                    const delay = (i % 7) * 0.07;
                    const duration = 2.6 + (i % 5) * 0.25;
                    return (
                      <motion.span
                        key={i}
                        initial={{ y: -40, opacity: 0, rotate: -20 }}
                        animate={{ y: "80vh", opacity: [0, 1, 1, 0], rotate: 360 }}
                        transition={{ duration, delay, ease: "easeOut" }}
                        className="absolute text-[26px] select-none"
                        style={{ left: `${left}%`, top: 0 }}
                      >
                        {emojis[i % emojis.length]}
                      </motion.span>
                    );
                  })}
                  {/* "Grandma Approved!" stamp */}
                  <motion.div
                    initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
                    animate={{ scale: 1, rotate: -6, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    className="font-title-hw text-[42px] md:text-[60px] font-bold px-8 py-4 border-4 border-dashed rounded-lg shadow-2xl"
                    style={{
                      color: "#1a5e2a",
                      borderColor: "rgba(26,94,42,0.7)",
                      backgroundColor: "rgba(214, 239, 206, 0.92)",
                    }}
                  >
                    🎉 {t("recipe.grandmaApproved", "Grandma Approved!")}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* ───────────────────────── Page ───────────────────────── */
export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const { t, lf } = useTSafe();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [unitSystem, setUnitSystem] = useState<"metric" | "us">("metric");
  const [learnOpen, setLearnOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !params?.id) return;
    try {
      const key = "ns_saved_recipes";
      const raw = window.localStorage.getItem(key);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setSaved(list.includes(params.id));
    } catch {
      /* ignore */
    }
  }, [params?.id]);

  useEffect(() => {
    if (!params?.id) return;
    const loadRecipe = async () => {
      try {
        const data = await getRecipeById(params.id);
        setRecipe(data);
      } catch {
        setError("Failed to load recipe details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [params?.id]);

  const toggleSaved = () => {
    setSaved((prev) => {
      const next = !prev;
      try {
        if (typeof window !== "undefined" && params?.id) {
          const key = "ns_saved_recipes";
          const raw = window.localStorage.getItem(key);
          const list: string[] = raw ? JSON.parse(raw) : [];
          const filtered = list.filter((id) => id !== params.id);
          if (next) filtered.push(params.id);
          window.localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Flatten steps for the learning game — preserve order, drop empty.
  const flatSteps: FlatStep[] = useMemo(() => {
    if (!recipe) return [];
    const collected: RecipeStep[] =
      recipe.sections && recipe.sections.length > 0
        ? recipe.sections.flatMap((s) => s.steps ?? [])
        : recipe.steps ?? [];
    return collected
      .map((s, i) => ({
        id: i + 1,
        description: (lf(s.description) || "").trim(),
      }))
      .filter((s) => s.description.length > 0);
  }, [recipe, lf]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center paper-bg">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 pt-32 pb-12 paper-bg min-h-screen">
        <ErrorMessage message={error} />
      </main>
    );
  }

  if (!recipe) return null;

  const hasSection = recipe.sections && recipe.sections.length > 0;
  const totalSteps = hasSection
    ? recipe.sections!.reduce((sum, s) => sum + (s.steps?.length ?? 0), 0)
    : recipe.steps?.length ?? 0;

  const heroTitle =
    lf(recipe.seo?.title) || recipe.title || lf(recipe.dishName) || "Recipe";
  const heroDescription =
    lf(recipe.seo?.description) || lf(recipe.description) || "";
  const polaroidCaption = lf(recipe.dishName) || heroTitle;

  const locationStr = [recipe.location?.city, recipe.location?.state]
    .filter(Boolean)
    .join(", ");

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleShare = async () => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; url?: string }) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({ title: heroTitle, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        /* ignore */
      }
    }
  };

  const cookTimeDisplay = recipe.totalTime
    ? `${recipe.totalTime} min`
    : recipe.cookingTime
    ? `${recipe.cookingTime} min`
    : "45 min";

  const rawDifficulty = recipe.difficulty || "";
  const difficultyLabel = t(
    `difficulty.${rawDifficulty}`,
    rawDifficulty
      ? rawDifficulty.charAt(0).toUpperCase() + rawDifficulty.slice(1)
      : "Medium"
  );

  const avgRating = recipe.averageRating ?? 0;
  const visibleTags = (recipe.tags || []).filter(Boolean).slice(0, 4);

  return (
    <main className="font-ui min-h-screen paper-bg pt-28 pb-24 overflow-x-hidden relative print:bg-white print:pt-6 print:pb-6">
      {/* Ambient decorative sprigs at far page corners — small, subtle */}
      <div
        className="pointer-events-none absolute top-36 -left-4 h-32 w-16 opacity-25 hidden xl:block text-lime-700 dark:text-lime-400 dark:opacity-20 print:hidden"
        style={{ transform: "rotate(-18deg)" }}
      >
        <CurryLeaf className="h-full w-full" />
      </div>
      <div
        className="pointer-events-none absolute bottom-40 -right-4 h-32 w-16 opacity-25 hidden xl:block text-lime-700 dark:text-lime-400 dark:opacity-20 print:hidden"
        style={{ transform: "rotate(22deg)" }}
      >
        <CurryLeaf flip className="h-full w-full" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 relative">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 print:hidden"
        >
          <Link
            href="/recipes"
            className="flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-stone-100 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t("recipe.allRecipes", "All Recipes")}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="text-stone-500 dark:text-stone-500 truncate max-w-xs">
            {heroTitle}
          </span>
        </motion.div>

        {/* ─────────────────────────── HERO CARD ─────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-10 rounded-[28px] paper-card border border-stone-200 dark:border-stone-700/60 shadow-[0_10px_40px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)] p-6 md:p-10 overflow-visible"
        >
          {/* Heart doodle top-right corner (hidden on mobile) */}
          <div className="pointer-events-none absolute -top-6 right-12 h-14 w-14 text-[var(--color-primary)] z-10 hidden md:block print:hidden">
            <HeartDoodle className="h-full w-full" />
          </div>

          {/* YELLOW sticky note pinned far-right — escapes the card */}
          <div className="hidden lg:block absolute -top-4 -right-4 z-20 pointer-events-none print:hidden">
            <div
              className="relative w-40 px-4 pt-5 pb-4 shadow-[0_8px_20px_-8px_rgba(120,80,0,0.35)] dark:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)]"
              style={{
                transform: "rotate(4deg)",
                backgroundColor: "#fff7c2",
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
              }}
            >
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-rose-500 shadow-[0_2px_4px_rgba(0,0,0,0.4)] ring-2 ring-rose-300" />
              <p className="font-note-hw text-[18px] leading-tight text-amber-900 text-center font-bold">
                {t("recipe.bestWithSide", "Best with Appalam & Thayir!")}
              </p>
              <div className="flex justify-center mt-2 text-amber-700">
                <SmileyDoodle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* GREEN "Grandma Tip" sticky note — visible from lg up, sits below the yellow one on the right */}
          <div className="hidden lg:block absolute top-44 -right-2 z-20 pointer-events-none print:hidden">
            <ExtraSticky
              title={t("recipe.grandmaTip", "Grandma Tip")}
              body={t(
                "recipe.grandmaTipBody",
                "Use only freshly pressed gingelly oil for that real Tamil aroma."
              )}
              color="green"
              rotate={-5}
              pinColor="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* LEFT: Polaroid + curry leaves + hanging string */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative pt-10 pl-6">
                <div
                  className="pointer-events-none absolute -left-6 top-12 z-30 h-44 w-22 text-lime-700 dark:text-lime-500"
                  style={{ transform: "rotate(-18deg)" }}
                  aria-hidden
                >
                  <CurryLeaf className="h-full w-full" />
                </div>

                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-10 bg-gradient-to-b from-rose-500 to-rose-400/70 z-10"
                  aria-hidden
                />
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -ml-1 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-rose-200 dark:ring-rose-400/40 z-10"
                  aria-hidden
                />

                <TapeStrip
                  className="absolute top-7 left-1/2 -translate-x-1/2 z-30"
                  rotate={-4}
                  color="yellow"
                  width="w-28"
                />

                <div
                  className="relative bg-white dark:bg-stone-100 p-3 pb-10 rounded-sm shadow-[0_14px_34px_-10px_rgba(0,0,0,0.35)] dark:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.8)] z-20"
                  style={{ transform: "rotate(-2deg)" }}
                >
                  <div className="relative w-full aspect-square max-w-[320px] overflow-hidden bg-stone-200">
                    {recipe.imageUrl && !imgError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.imageUrl}
                        alt={heroTitle}
                        width={320}
                        height={320}
                        loading="lazy"
                        onError={() => setImgError(true)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100">
                        <ChefHat className="h-16 w-16 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <p
                    className="font-note-hw text-center text-stone-700 text-xl leading-tight mt-3 px-2 line-clamp-2"
                    title={polaroidCaption}
                  >
                    {polaroidCaption}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Title column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Badges row: SourceSticker + optional category + tag sticky chips */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 pt-1 lg:pr-36">
                <SourceSticker
                  source={recipe.source}
                  label={
                    recipe.source === "ai"
                      ? t("recipe.aiCrafted", "AI Crafted")
                      : recipe.source === "youtube"
                      ? t("recipe.youtubeRecipe", "YouTube Recipe")
                      : t("recipe.traditional", "Traditional")
                  }
                />
                {recipe.category && (
                  <PaperTag rotation={-1}>{lf(recipe.category.name)}</PaperTag>
                )}
                {visibleTags.length > 0 && (
                  <span className="font-note-hw text-stone-400 dark:text-stone-600 mx-0.5">
                    ·
                  </span>
                )}
                {visibleTags.map((tag, i) => (
                  <TagStickyChip key={`${tag}-${i}`} label={tag} index={i} />
                ))}
              </div>

              {/* Title with squiggle — ~15% bigger (60→70 at lg) */}
              <div className="relative lg:pr-24">
                <h1 className="font-title-hw text-4xl md:text-5xl lg:text-[70px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.02]">
                  {heroTitle}
                </h1>
                <div className="absolute -bottom-1 left-0 w-[min(100%,440px)] h-3 text-[var(--color-primary)]">
                  <TitleSquiggle className="h-full w-full" />
                </div>
              </div>

              {/* Description — darker for readability */}
              {heroDescription && (
                <p className="font-body text-[15px] md:text-[16px] text-stone-800 dark:text-stone-200 max-w-2xl leading-relaxed pt-3">
                  {heroDescription}
                </p>
              )}

              {/* 4 stat chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                {[
                  {
                    label: t("recipe.difficulty", "Difficulty"),
                    value: difficultyLabel,
                    icon: <BarChart3 className="h-3.5 w-3.5" />,
                    iconClass:
                      "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                    title: difficultyLabel,
                  },
                  {
                    label: t("recipe.serves", "Serves"),
                    value: `${recipe.servings ?? 4} ${t(
                      "recipe.people",
                      "people"
                    )}`,
                    icon: <Users className="h-3.5 w-3.5" />,
                    iconClass:
                      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                    title: `${recipe.servings ?? 4} ${t(
                      "recipe.people",
                      "people"
                    )}`,
                  },
                  {
                    label: t("recipe.cookTime", "Cook Time"),
                    value: cookTimeDisplay,
                    icon: <Clock className="h-3.5 w-3.5" />,
                    iconClass:
                      "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
                    title: cookTimeDisplay,
                  },
                  {
                    label: t("recipe.from", "From"),
                    value:
                      recipe.location?.city ||
                      locationStr ||
                      recipe.location?.region ||
                      recipe.location?.country ||
                      "—",
                    icon: <MapPin className="h-3.5 w-3.5" />,
                    iconClass:
                      "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                    title:
                      locationStr ||
                      recipe.location?.region ||
                      recipe.location?.country ||
                      "—",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-dashed border-stone-300 dark:border-stone-700 px-3 py-2.5 shadow-[1px_2px_0_rgba(120,90,40,0.08)]"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400 leading-none mb-2">
                      {s.label}
                    </p>
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${s.iconClass}`}
                      >
                        {s.icon}
                      </div>
                      <span
                        className="text-[14px] font-bold text-stone-900 dark:text-stone-100 leading-tight truncate capitalize"
                        title={s.title}
                      >
                        {s.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action toolbar */}
              <div className="flex flex-wrap gap-2.5 pt-3 print:hidden">
                <button
                  type="button"
                  onClick={toggleSaved}
                  aria-pressed={saved}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-solid px-4 py-2 text-sm font-bold transition-all shadow-[1px_2px_0_rgba(120,90,40,0.22)] dark:shadow-[1px_2px_0_rgba(0,0,0,0.5)] active:translate-y-px active:shadow-none bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:brightness-110"
                >
                  <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                  {saved
                    ? t("recipe.saved", "Saved")
                    : t("recipe.save", "Save")}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg paper-card text-stone-800 dark:text-stone-100 border-2 border-dashed border-stone-400 dark:border-stone-600 px-4 py-2 text-sm font-bold hover:border-stone-700 dark:hover:border-stone-400 transition-all shadow-[1px_2px_0_rgba(120,90,40,0.18)] dark:shadow-[1px_2px_0_rgba(0,0,0,0.4)] active:translate-y-px active:shadow-none"
                >
                  <Printer className="h-4 w-4" />
                  {t("recipe.print", "Print")}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-lg paper-card text-stone-800 dark:text-stone-100 border-2 border-dashed border-stone-400 dark:border-stone-600 px-4 py-2 text-sm font-bold hover:border-stone-700 dark:hover:border-stone-400 transition-all shadow-[1px_2px_0_rgba(120,90,40,0.18)] dark:shadow-[1px_2px_0_rgba(0,0,0,0.4)] active:translate-y-px active:shadow-none"
                >
                  <Share2 className="h-4 w-4" />
                  {t("recipe.share", "Share")}
                </button>
                {flatSteps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLearnOpen(true)}
                    className="relative inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-violet-400 dark:border-violet-500/60 bg-violet-50 dark:bg-violet-500/15 text-violet-900 dark:text-violet-200 px-4 py-2 text-sm font-bold hover:border-violet-700 dark:hover:border-violet-300 transition-all shadow-[1px_2px_0_rgba(120,90,40,0.18)] dark:shadow-[1px_2px_0_rgba(0,0,0,0.4)] active:translate-y-px active:shadow-none"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    {t("recipe.learnThisRecipe", "Learn This Recipe")}
                    <span
                      className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm shadow-sm"
                      style={{ transform: "rotate(8deg)" }}
                    >
                      {t("recipe.newBadge", "NEW!")}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─────────────────────────── BODY: Ingredients + How to Make ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* YELLOW "Chef Note" sticky — floats between columns, top, visible from md up */}
          <div className="hidden md:block absolute -top-2 left-[42%] z-30 pointer-events-none print:hidden">
            <ExtraSticky
              title={t("recipe.chefNote", "Chef Note")}
              body={t(
                "recipe.chefNoteBody",
                "Don't skip the asafoetida — it's the secret to digestion."
              )}
              color="yellow"
              rotate={4}
              pinColor="amber"
            />
          </div>

          {/* Ingredients column */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="lg:col-span-5 xl:col-span-5"
          >
            <div className="space-y-6">
              {/* Ingredients card */}
              <div className="relative pt-5">
                <TapeStrip
                  className="absolute -top-1 left-6 z-20"
                  rotate={-4}
                  color="pink"
                  width="w-28"
                />
                <div className="rounded-[20px] paper-card border border-stone-200 dark:border-stone-700/60 shadow-[0_8px_24px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] overflow-hidden">
                  <div className="flex items-center justify-between px-6 pt-6 pb-3">
                    <h2 className="font-title-hw text-[32px] leading-none font-bold text-stone-900 dark:text-stone-100">
                      {t("recipe.ingredients", "Ingredients")}
                    </h2>
                    <span
                      className="inline-flex items-center bg-yellow-200 dark:bg-yellow-400/25 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 shadow-[1px_2px_0_rgba(120,90,40,0.18)]"
                      style={{
                        clipPath:
                          "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                      }}
                    >
                      {recipe.ingredients?.length || 0}{" "}
                      {t("recipe.items", "items")}
                    </span>
                  </div>

                  {/* Unit toggle */}
                  <div className="flex items-center gap-2 px-6 pb-4 print:hidden">
                    <button
                      type="button"
                      onClick={() => setUnitSystem("metric")}
                      className={`inline-flex items-center rounded-full text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-colors ${
                        unitSystem === "metric"
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-transparent text-stone-600 dark:text-stone-400 border-2 border-dashed border-stone-300 dark:border-stone-700"
                      }`}
                    >
                      {t("recipe.metric", "Metric")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitSystem("us")}
                      className={`inline-flex items-center rounded-full text-[10px] font-bold uppercase tracking-wider px-3 py-1 transition-colors ${
                        unitSystem === "us"
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-transparent text-stone-600 dark:text-stone-400 border-2 border-dashed border-stone-300 dark:border-stone-700"
                      }`}
                    >
                      {t("recipe.usCustomary", "US Customary")}
                    </button>
                  </div>

                  {/* Dotted-leader ingredient list on ruled paper */}
                  <div className="paper-ruled px-6 pb-6 pt-1">
                    <ul>
                      {recipe.ingredients
                        ?.filter((item) => item.ingredient)
                        .map((item, index) => {
                          const name = lf(item.ingredient?.name) || "—";
                          const qty =
                            [item.quantity, item.unit]
                              .filter(Boolean)
                              .join(" ") || "—";
                          return (
                            <li key={`${item.ingredient?._id ?? "i"}-${index}`}>
                              <DottedLeaderRow
                                name={name}
                                qty={qty}
                                href={`/ingredient/${item.ingredient?._id}`}
                              />
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </div>

              {/* BLUE Chef's Tip sticky note (from recipe.speciality) */}
              {recipe.speciality && (
                <div className="relative">
                  <div
                    className="relative rounded-[6px] p-5 shadow-[0_8px_22px_-8px_rgba(40,80,120,0.3)] dark:shadow-[0_8px_22px_-8px_rgba(0,0,0,0.6)]"
                    style={{
                      backgroundColor: "rgb(214 233 245)",
                      transform: "rotate(-1deg)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2 relative">
                      <span className="text-lg" aria-hidden>
                        💡
                      </span>
                      <span className="font-note-hw text-[22px] font-bold text-sky-900">
                        {t("recipe.chefsTip", "Chef's Tip")}
                      </span>
                    </div>
                    <p className="font-note-hw text-[17px] leading-snug text-sky-950 relative">
                      {lf(recipe.speciality)}
                    </p>
                  </div>
                </div>
              )}

              {/* Source URL */}
              {recipe.recipeSource?.url && (
                <a
                  href={recipe.recipeSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[20px] paper-card border border-stone-200 dark:border-stone-700/60 p-4 hover:border-[var(--color-primary)] transition-all group print:hidden"
                >
                  <ExternalLink className="h-4 w-4 text-stone-500 dark:text-stone-400 group-hover:text-[var(--color-primary)] transition-colors" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">
                      {t("recipe.originalSource", "Original Source")}
                    </p>
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 group-hover:text-[var(--color-primary)] transition-colors capitalize truncate">
                      {recipe.recipeSource.type}{" "}
                      {t("recipe.sourceLabel", "Source")}
                    </p>
                  </div>
                </a>
              )}

              {/* Tags card */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="rounded-[20px] paper-card border border-stone-200 dark:border-stone-700/60 p-5 shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                    <h3 className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest">
                      {t("recipe.tags", "Tags")}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-2">
                    {recipe.tags.map((tag, i) => (
                      <TagStickyChip
                        key={`${tag}-card-${i}`}
                        label={tag}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>

          {/* How to Make column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="lg:col-span-7 xl:col-span-7 relative"
          >
            <div className="relative pt-5">
              <TapeStrip
                className="absolute -top-1 left-1/3 z-20"
                rotate={3}
                color="blue"
                width="w-32"
              />
              <div className="rounded-[24px] paper-card border border-stone-200 dark:border-stone-700/60 p-6 md:p-9 shadow-[0_10px_30px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-7 pb-5 border-b border-dashed border-stone-300 dark:border-stone-700">
                  <h2 className="font-title-hw text-[32px] leading-none font-bold text-stone-900 dark:text-stone-100">
                    {t("recipe.howToMake", "How to Make")}
                  </h2>
                  <span
                    className="inline-flex items-center bg-violet-200 dark:bg-violet-400/25 text-violet-900 dark:text-violet-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 shadow-[1px_2px_0_rgba(80,40,120,0.18)]"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    {totalSteps} {t("recipe.steps", "Steps")}
                  </span>
                </div>

                {/* Steps — sectioned: "Step N" header + dashed separators + Kalam body */}
                {hasSection ? (
                  <div className="space-y-10">
                    {recipe.sections!.map((section, sectionIdx) => {
                      const style = getSectionStyle(
                        lf(section.title) || section.title?.en || ""
                      );
                      return (
                        <div key={sectionIdx} className="space-y-2">
                          {section.title && (
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border ${style.pillBg} ${style.pillBorder} mb-1`}
                            >
                              <span
                                className={`text-[11px] font-black uppercase tracking-[0.14em] ${style.pillText}`}
                              >
                                {lf(section.title)}
                              </span>
                            </div>
                          )}

                          <ol className="relative">
                            {section.steps?.map((step, index) => {
                              const isLast =
                                index === (section.steps?.length ?? 0) - 1;
                              const stepNum = step.step ?? index + 1;
                              return (
                                <li
                                  key={index}
                                  className={`group relative py-5 md:py-6 ${
                                    !isLast
                                      ? "border-b border-dashed border-stone-300/60 dark:border-stone-700/60"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3 mb-2.5">
                                    <div
                                      className={`flex h-10 w-10 items-center justify-center rounded-full ${style.numberBg} ${style.numberText} font-black text-[15px] shadow-[0_3px_8px_-2px_rgba(0,0,0,0.25)]`}
                                    >
                                      {stepNum}
                                    </div>
                                    <span
                                      className={`font-note-hw text-[18px] font-bold ${style.pillText}`}
                                    >
                                      {t("recipe.step", "Step")} {stepNum}
                                    </span>
                                  </div>
                                  <p className="font-note-hw text-[17.5px] md:text-[18.5px] text-stone-800 dark:text-stone-200 leading-relaxed pl-[52px]">
                                    {lf(step.description)}
                                  </p>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ol>
                    {recipe.steps?.map((step, index) => {
                      const isLast = index === (recipe.steps?.length ?? 0) - 1;
                      const stepNum = step.step ?? index + 1;
                      return (
                        <li
                          key={index}
                          className={`group relative py-5 md:py-6 ${
                            !isLast
                              ? "border-b border-dashed border-stone-300/60 dark:border-stone-700/60"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white font-black text-[15px] shadow-[0_3px_8px_-2px_rgba(0,0,0,0.25)]">
                              {stepNum}
                            </div>
                            <span className="font-note-hw text-[18px] font-bold text-rose-800 dark:text-rose-200">
                              {t("recipe.step", "Step")} {stepNum}
                            </span>
                          </div>
                          <p className="font-note-hw text-[17.5px] md:text-[18.5px] text-stone-800 dark:text-stone-200 leading-relaxed pl-[52px]">
                            {lf(step.description)}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {/* PINK sticky note at bottom with paperclip + smiley */}
                <div className="mt-10 flex justify-center">
                  <div className="relative">
                    <div className="absolute -top-4 right-2 h-9 w-5 text-stone-500 dark:text-stone-400 z-20 rotate-12">
                      <Paperclip className="h-full w-full" />
                    </div>
                    <div
                      className="relative px-7 py-5 shadow-[0_8px_22px_-8px_rgba(180,60,90,0.3)] dark:shadow-[0_8px_22px_-8px_rgba(0,0,0,0.6)] max-w-md"
                      style={{
                        backgroundColor: "rgb(250 214 227)",
                        transform: "rotate(2deg)",
                      }}
                    >
                      <p className="font-note-hw text-[20px] leading-tight text-rose-900 text-center font-bold">
                        {t(
                          "recipe.serveHotWith",
                          "Serve hot with Appalam, Pickle & Thayir!"
                        )}
                      </p>
                      <div className="flex justify-center mt-2 text-rose-700">
                        <SmileyDoodle className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─────────────────────────── 4-column footer ─────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative"
        >
          {/* PINK floating "Best Served With" sticky — visible from md up */}
          <div className="hidden md:block absolute -top-10 right-2 z-20 pointer-events-none print:hidden">
            <ExtraSticky
              title={t("recipe.bestServedWith", "Best Served With")}
              body={t(
                "recipe.bestServedWithBody",
                "Hot rice, papad, and a spoon of ghee."
              )}
              color="pink"
              rotate={3}
              pinColor="rose"
            />
          </div>

          {/* Nutrition */}
          <div className="rounded-2xl paper-card border border-stone-200 dark:border-stone-700/60 p-5 shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-2">
              <Salad className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">
                {t("recipe.nutrition", "Nutrition")}
              </h3>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-500 mb-3">
              {t("recipe.perServing", "per serving")}
            </p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>{t("recipe.calories", "Calories")}</span>
                <span className="font-bold tabular-nums">~ 420 kcal</span>
              </li>
              <li className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>{t("recipe.carbs", "Carbs")}</span>
                <span className="font-bold tabular-nums">65 g</span>
              </li>
              <li className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>{t("recipe.protein", "Protein")}</span>
                <span className="font-bold tabular-nums">12 g</span>
              </li>
              <li className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>{t("recipe.fat", "Fat")}</span>
                <span className="font-bold tabular-nums">12 g</span>
              </li>
              <li className="flex justify-between text-stone-700 dark:text-stone-300">
                <span>{t("recipe.fiber", "Fiber")}</span>
                <span className="font-bold tabular-nums">4 g</span>
              </li>
            </ul>
          </div>

          {/* Best served with */}
          <div className="rounded-2xl paper-card border border-stone-200 dark:border-stone-700/60 p-5 shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">
                {t("recipe.bestServedWith", "Best Served With")}
              </h3>
            </div>
            <ul className="space-y-1.5 text-sm text-stone-700 dark:text-stone-300">
              {[
                "Appalam",
                "Pickle",
                "Thayir (Curd)",
                "Vathal",
                "Roasted Papad",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Storage tips */}
          <div className="rounded-2xl paper-card border border-stone-200 dark:border-stone-700/60 p-5 shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-3">
              <Archive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">
                {t("recipe.storageTips", "Storage Tips")}
              </h3>
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {t(
                "recipe.storageTipsBody",
                "Store in an airtight container in the refrigerator for up to 2 days. Reheat with a splash of water."
              )}
            </p>
          </div>

          {/* Recipe by */}
          <div className="rounded-2xl paper-card border border-stone-200 dark:border-stone-700/60 p-5 shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)] dark:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">
                {t("recipe.recipeBy", "Recipe By")}
              </h3>
            </div>
            {recipe.createdBy ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-[12px] font-bold text-white shadow-sm shrink-0">
                    {recipe.createdBy.firstName?.[0]}
                    {recipe.createdBy.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {recipe.createdBy.firstName} {recipe.createdBy.lastName}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {t("recipe.traditionalRecipes", "Traditional Recipes")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(avgRating)
                            ? "fill-current"
                            : "opacity-30"
                        }`}
                      />
                    ))}
                  </div>
                  {avgRating > 0 ? (
                    <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium">
                      {avgRating.toFixed(1)} ({recipe.ratings?.length ?? 0}{" "}
                      {t("recipe.reviews", "reviews")})
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-500 dark:text-stone-500 font-medium">
                      {t("recipe.noReviewsYet", "No reviews yet")}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {t("recipe.nammaSamayalKitchen", "Namma Samayal Kitchen")}
              </p>
            )}
          </div>
        </motion.section>

        {/* ─────────────────────────── Meta footer strip ─────────────────────────── */}
        <div className="mt-6 rounded-[20px] paper-card border border-stone-200 dark:border-stone-700/60 p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 shadow-[0_6px_20px_-12px_rgba(120,90,40,0.18)]">
          {recipe.category && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">
                {t("recipe.category", "Category")}
              </p>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {lf(recipe.category.name)}
              </p>
            </div>
          )}
          {recipe.subCategory && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">
                {t("recipe.subCategory", "Sub Category")}
              </p>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {lf(recipe.subCategory.name)}
              </p>
            </div>
          )}
          {recipe.location?.region && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">
                {t("recipe.region", "Region")}
              </p>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {recipe.location.region}
              </p>
            </div>
          )}
          {recipe.createdBy && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">
                {t("recipe.addedBy", "Added By")}
              </p>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                  {recipe.createdBy.firstName} {recipe.createdBy.lastName}
                </p>
              </div>
            </div>
          )}
          {recipe.aiGenerated && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">
                {t("recipe.aiCrafted", "AI Crafted")}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-400/30 px-2.5 py-1 text-xs font-bold text-violet-800 dark:text-violet-200">
                {t("recipe.aiGenerated", "AI Generated")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Learn Recipe Modal */}
      <LearnRecipeModal
        open={learnOpen}
        onClose={() => setLearnOpen(false)}
        steps={flatSteps}
        recipeId={recipe._id}
        recipeTitle={heroTitle}
        t={t}
      />
    </main>
  );
}

