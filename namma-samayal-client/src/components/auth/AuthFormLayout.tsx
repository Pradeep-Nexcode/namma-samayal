"use client";

import Link from "next/link";
import { useState } from "react";
import {
  User as UserIcon,
  AtSign,
  Lock,
  ArrowRight,
  Check,
  ChefHat,
} from "lucide-react";
import { loginUser, registerUser } from "@/features/auth/services/authApi";

type AuthMode = "register" | "login";

interface AuthFormLayoutProps {
  mode: AuthMode;
}

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
      ].map(([y, s, a], i) => (
        <g key={i}>
          <g transform={`translate(50, ${y}) rotate(${-a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i * 0.04} />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180 + a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i * 0.04} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function SmileyDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" />
      <path d="M8 14 Q 12 17, 16 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ArrowDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <path
        d="M5 15 Q 18 5, 30 18 Q 40 24, 50 15"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 15 L 45 11 M50 15 L 45 19"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Spiral binding column ─── */
function SpiralBinding() {
  return (
    <div
      className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-7 z-30 hidden md:flex flex-col items-center justify-evenly py-6 pointer-events-none"
      aria-hidden
    >
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} className="relative">
          <span
            className="block h-3.5 w-3.5 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(120,90,40,0.55) 0%, rgba(120,90,40,0.2) 60%, transparent 100%)",
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

/* ─── Input row with leading icon ─── */
function FieldInput({
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
        className="block font-title-hw text-[14px] md:text-[15px] font-bold text-stone-700 dark:text-stone-200 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border-2 border-stone-200 dark:border-white/[0.06] bg-white/70 dark:bg-white/5 py-2.5 pl-10 pr-3.5 font-body text-[14px] text-stone-900 dark:text-stone-50 placeholder-stone-400 outline-none focus:border-[#e74c3c] transition-colors"
        />
      </div>
    </div>
  );
}

/* ─── Notebook page background style ─── */
function pageStyle(): React.CSSProperties {
  return {
    backgroundColor: "#f3ecda",
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(120,90,40,0.04) 0 1px, transparent 1px 6px), radial-gradient(rgba(120,80,30,0.05) 1px, transparent 1px)",
    backgroundSize: "auto, 4px 4px",
  };
}

function pageStyleRight(): React.CSSProperties {
  return {
    backgroundColor: "#fefcf5",
    backgroundImage:
      "repeating-linear-gradient(to bottom, transparent 0, transparent 32px, rgba(120,90,40,0.04) 32px, rgba(120,90,40,0.04) 33px)",
  };
}

/* ─── Tape strip ─── */
function TapeStrip({
  color = "yellow",
  className = "",
  rotate = -6,
  width = "w-16",
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
      : "rgba(255, 243, 176, 0.85)";
  return (
    <div
      className={`${width} h-4 ${className}`}
      style={{
        backgroundColor: bg,
        transform: `rotate(${rotate}deg)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }}
      aria-hidden
    />
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export function AuthFormLayout({ mode }: AuthFormLayoutProps) {
  const isRegister = mode === "register";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (isRegister && (!form.username || !form.firstName || !form.lastName)) {
      setError("First name, last name and username are required.");
      return;
    }
    if (isRegister && !acceptedTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isRegister) {
        await registerUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await loginUser({
          email: form.email.trim(),
          password: form.password,
        });
      }
      window.location.href = "/";
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Authentication failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative w-full max-w-[980px] rounded-[12px] border-4 shadow-[0_24px_60px_-20px_rgba(120,90,40,0.55)]"
      style={{ borderColor: "#8c6938", backgroundColor: "#8c6938" }}
    >
      <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-[680px] rounded-[4px] overflow-hidden">
        <SpiralBinding />

        {/* ─── LEFT PAGE — Scrapbook ─── */}
        <div
          className="relative px-4 md:px-6 py-8 md:py-10 md:pr-12 flex flex-col"
          style={pageStyle()}
        >
          {/* Polaroid — large, dominates the left page */}
          <div className="relative flex justify-center mt-2">
            {/* Tape corners on the polaroid */}
            <TapeStrip color="pink" className="absolute -top-1 left-8 z-30" rotate={-12} width="w-20" />
            <TapeStrip color="yellow" className="absolute -top-1 right-14 z-30" rotate={10} width="w-20" />

            <div
              className="relative bg-white p-3.5 pb-12 shadow-[0_18px_36px_-12px_rgba(0,0,0,0.5)]"
              style={{ transform: "rotate(-2deg)" }}
            >
              <div className="relative w-full aspect-[4/5] max-w-[340px] md:max-w-[380px] overflow-hidden bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/main-hero.png"
                  alt="Tamil meal"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-amber-100 to-rose-100 -z-10 flex items-center justify-center"
                  aria-hidden
                >
                  <ChefHat className="h-16 w-16 text-stone-400 dark:text-stone-500" />
                </div>
              </div>
            </div>

            {/* "From our kitchen" yellow sticky overlapping the polaroid right side */}
            <div
              className="absolute top-4 -right-1 md:right-0 z-30 max-w-[120px] pointer-events-none"
              style={{ transform: "rotate(4deg)" }}
            >
              <TapeStrip
                color="pink"
                className="absolute -top-1 left-1/2 -translate-x-1/2"
                rotate={-6}
                width="w-10"
              />
              <div
                className="relative px-3 pt-4 pb-3 shadow-[0_8px_18px_-6px_rgba(180,140,0,0.4)]"
                style={{
                  backgroundColor: "#fff3b0",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                }}
              >
                <p className="font-note-hw text-[12.5px] leading-tight text-amber-900 text-center font-bold">
                  From our kitchen to your heart{" "}
                  <span className="text-rose-500">❤</span>
                </p>
              </div>
            </div>
          </div>

          {/* Torn paper "Namma Samayal" card — overlaps the polaroid bottom */}
          <div className="relative -mt-10 md:-mt-12 max-w-[300px] mx-auto z-20">
            <div
              className="relative px-5 py-3.5 shadow-[0_8px_20px_-6px_rgba(120,90,40,0.4)]"
              style={{
                backgroundColor: "#fffaee",
                clipPath:
                  "polygon(0 4%, 4% 0, 98% 2%, 100% 8%, 99% 90%, 96% 100%, 4% 98%, 1% 92%, 0 50%)",
                transform: "rotate(-1.5deg)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <ChefHat className="h-5 w-5 text-stone-700 dark:text-stone-200" />
                <p className="font-title-hw text-[20px] font-bold text-stone-900 dark:text-stone-50">
                  Namma <span className="text-[#e74c3c]">Samayal</span>
                </p>
              </div>
              <p className="font-note-hw text-[13.5px] text-stone-700 dark:text-stone-200 leading-snug">
                Authentic Tamil recipes, ingredients and traditions in one place.
              </p>
            </div>
          </div>

          {/* Curry-leaf sprig — bottom left */}
          <div
            className="hidden md:block absolute bottom-3 left-1 h-32 w-14 text-lime-700 opacity-80 pointer-events-none"
            style={{ transform: "rotate(-14deg)" }}
            aria-hidden
          >
            <LeafSprig className="h-full w-full" />
          </div>

          {/* Scattered seeds / pepper dots at bottom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1.5 opacity-70 pointer-events-none" aria-hidden>
            <span className="block h-1.5 w-1.5 rounded-full bg-stone-700" />
            <span className="block h-2 w-2 rounded-full bg-amber-700" />
            <span className="block h-1.5 w-1.5 rounded-full bg-stone-800" />
            <span className="block h-2 w-2 rounded-full bg-amber-600" />
            <span className="block h-1.5 w-1.5 rounded-full bg-stone-700" />
          </div>
        </div>

        {/* ─── RIGHT PAGE — Form ─── */}
        <div
          className="relative px-6 md:px-10 py-10 md:py-12 md:pl-14"
          style={pageStyleRight()}
        >
          {/* Sign In / Sign Up tape tabs */}
          <div className="relative flex items-center gap-3 mb-6">
            <Link
              href="/auth/login"
              scroll={false}
              className={`relative px-4 py-1.5 font-title-hw text-[15px] font-bold transition-all ${
                !isRegister
                  ? "text-amber-900"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
              }`}
              style={
                !isRegister
                  ? {
                      backgroundColor: "rgba(255, 243, 176, 0.95)",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                      transform: "rotate(-1.5deg)",
                      boxShadow: "0 3px 6px rgba(180,140,0,0.18)",
                    }
                  : undefined
              }
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              scroll={false}
              className={`relative px-4 py-1.5 font-title-hw text-[15px] font-bold transition-all ${
                isRegister
                  ? "text-amber-900"
                  : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
              }`}
              style={
                isRegister
                  ? {
                      backgroundColor: "rgba(255, 243, 176, 0.95)",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                      transform: "rotate(1.5deg)",
                      boxShadow: "0 3px 6px rgba(180,140,0,0.18)",
                    }
                  : undefined
              }
            >
              Sign Up
            </Link>
          </div>

          {/* Title with heart doodle */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-title-hw text-[36px] md:text-[42px] font-bold leading-tight text-stone-900 dark:text-stone-50">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <span className="h-6 w-7 text-[#e74c3c]" aria-hidden>
              <HeartDoodle className="h-full w-full" />
            </span>
          </div>

          {/* Subtitle with red squiggle underline on "Namma Samayal" */}
          <p className="font-body text-[14px] md:text-[15px] text-stone-700 dark:text-stone-200 mb-6">
            {isRegister ? "Start your " : "Sign in to continue your "}
            <span className="relative inline-block font-semibold">
              Namma Samayal
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-1.5 text-[#e74c3c]"
                aria-hidden
              >
                <TitleSquiggle className="h-full w-full" />
              </span>
            </span>
            {isRegister ? " journey today." : " journey."}
          </p>

          {/* Decorative leaf top-right */}
          <div
            className="hidden md:block absolute top-12 right-4 h-20 w-10 text-lime-700 opacity-60 pointer-events-none"
            style={{ transform: "rotate(14deg)" }}
            aria-hidden
          >
            <LeafSprig className="h-full w-full" />
          </div>

          {/* Form */}
          <form className="space-y-4 relative" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  id="firstName"
                  label="First Name"
                  placeholder="John"
                  icon={UserIcon}
                  value={form.firstName}
                  onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
                  autoComplete="given-name"
                />
                <FieldInput
                  id="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  icon={UserIcon}
                  value={form.lastName}
                  onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
                  autoComplete="family-name"
                />
              </div>
            )}

            <FieldInput
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={AtSign}
              value={form.email}
              onChange={(v) => setForm((p) => ({ ...p, email: v }))}
              autoComplete="email"
            />

            {isRegister && (
              <FieldInput
                id="username"
                label="Username"
                placeholder="yourname"
                icon={UserIcon}
                value={form.username}
                onChange={(v) => setForm((p) => ({ ...p, username: v }))}
                autoComplete="username"
              />
            )}

            <FieldInput
              id="password"
              label="Password"
              type="password"
              placeholder="********"
              icon={Lock}
              value={form.password}
              onChange={(v) => setForm((p) => ({ ...p, password: v }))}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />

            {/* Terms / Remember-me */}
            {isRegister ? (
              <label className="flex items-center gap-2.5 cursor-pointer select-none mt-1">
                <span
                  className={`relative flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                    acceptedTerms
                      ? "bg-[#e74c3c] border-[#e74c3c]"
                      : "bg-white border-stone-300 dark:border-white/10 hover:border-[#e74c3c]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  {acceptedTerms && (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  )}
                </span>
                <span className="font-body text-[13px] text-stone-700 dark:text-stone-200">
                  I agree to terms and conditions
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 font-body text-stone-700 dark:text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-[#e74c3c]"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="font-title-hw font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit */}
            <div className="relative pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full rounded-lg bg-[#c0392b] hover:bg-[#a02b1f] py-3 font-title-hw text-[17px] font-bold text-white transition-colors shadow-[0_6px_14px_-6px_rgba(231,76,60,0.5)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait…"
                  : isRegister
                  ? "Sign Up"
                  : "Sign In"}
              </button>
              {/* Hand-drawn arrow doodle next to the button */}
              <span
                className="absolute -right-2 -bottom-1 h-6 w-10 text-stone-700 dark:text-stone-200 pointer-events-none hidden md:block"
                aria-hidden
              >
                <ArrowDoodle className="h-full w-full" />
              </span>
            </div>

            {error && (
              <p className="font-body text-[13px] text-rose-600 dark:text-rose-400 font-semibold">
                {error}
              </p>
            )}
          </form>

          {/* Footer link */}
          <p className="mt-5 font-body text-[14px] text-stone-700 dark:text-stone-200">
            {isRegister ? "Already have an account? " : "New to Namma Samayal? "}
            <Link
              href={isRegister ? "/auth/login" : "/auth/register"}
              className="relative font-title-hw font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors inline-block"
            >
              {isRegister ? "Sign In" : "Create Account"}
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-1 text-[#e74c3c]"
                aria-hidden
              >
                <TitleSquiggle className="h-full w-full" />
              </span>
            </Link>
          </p>

          {/* Pink "Let's cook something amazing!" sticky note bottom-right */}
          <div
            className="hidden md:block absolute -bottom-2 -right-2 max-w-[150px] pointer-events-none"
            style={{ transform: "rotate(4deg)" }}
            aria-hidden
          >
            <TapeStrip color="yellow" className="absolute -top-1 right-4 z-10" rotate={6} width="w-10" />
            <div
              className="relative px-3 pt-4 pb-3 shadow-[0_8px_18px_-8px_rgba(220,80,90,0.4)]"
              style={{
                backgroundColor: "#fbd5dd",
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
              }}
            >
              <p className="font-note-hw text-[12.5px] leading-snug text-rose-950 text-center font-bold">
                Let's cook something amazing!{" "}
                <span className="text-rose-500">❤</span>
              </p>
              <div className="flex justify-center mt-1 text-rose-600 dark:text-rose-400">
                <SmileyDoodle className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
