"use client";

import Link from "next/link";
import { ChefHat } from "lucide-react";
import type { ReactNode } from "react";

/* ─── Red squiggle underline (shared look with AuthFormLayout) ─── */
function TitleSquiggle({ className = "" }: { className?: string }) {
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

/* ─── Tape strip ─── */
function TapeStrip({
  rotate = -6,
  className = "",
}: {
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      className={`w-20 h-5 ${className}`}
      style={{
        backgroundColor: "rgba(255, 243, 176, 0.85)",
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }}
      aria-hidden
    />
  );
}

function pageStyle(): React.CSSProperties {
  return {
    backgroundColor: "#fefcf5",
    backgroundImage:
      "repeating-linear-gradient(to bottom, transparent 0, transparent 32px, rgba(120,90,40,0.04) 32px, rgba(120,90,40,0.04) 33px)",
  };
}

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundColor: "#f3ecda",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(120,90,40,0.04) 0 1px, transparent 1px 6px), radial-gradient(rgba(120,80,30,0.05) 1px, transparent 1px)",
        backgroundSize: "auto, 4px 4px",
      }}
    >
      <section
        className="relative w-full max-w-md rounded-[12px] border-4 shadow-[0_24px_60px_-20px_rgba(120,90,40,0.55)]"
        style={{ borderColor: "#8c6938", backgroundColor: "#8c6938" }}
      >
        <TapeStrip
          rotate={-5}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
        />
        <div
          className="relative rounded-[4px] px-6 py-9 md:px-9 md:py-11 overflow-hidden"
          style={pageStyle()}
        >
          {/* Brand chip */}
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ChefHat className="h-5 w-5 text-stone-700" />
            <span className="font-title-hw text-[19px] font-bold text-stone-900">
              Namma <span className="text-[#e74c3c]">Samayal</span>
            </span>
          </Link>

          {/* Title with squiggle */}
          <div className="relative inline-block mb-2">
            <h1 className="font-title-hw text-[30px] md:text-[34px] font-bold leading-tight text-stone-900">
              {title}
            </h1>
            <span
              className="absolute left-0 right-0 -bottom-1 h-1.5 text-[#e74c3c]"
              aria-hidden
            >
              <TitleSquiggle className="h-full w-full" />
            </span>
          </div>

          {subtitle && (
            <p className="font-body text-[14px] md:text-[15px] text-stone-700 mb-6 mt-2">
              {subtitle}
            </p>
          )}

          <div className="mt-6">{children}</div>
        </div>
      </section>
    </main>
  );
}

/* ─── Shared field input (mirrors AuthFormLayout) ─── */
export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-title-hw text-[14px] md:text-[15px] font-bold text-stone-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border-2 border-stone-200 bg-white/70 py-2.5 pl-10 pr-3.5 font-body text-[14px] text-stone-900 placeholder-stone-400 outline-none focus:border-[#e74c3c] transition-colors"
        />
      </div>
    </div>
  );
}

/* ─── Shared submit button ─── */
export function AuthSubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="relative w-full rounded-lg bg-[#c0392b] hover:bg-[#a02b1f] py-3 font-title-hw text-[17px] font-bold text-white transition-colors shadow-[0_6px_14px_-6px_rgba(231,76,60,0.5)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
