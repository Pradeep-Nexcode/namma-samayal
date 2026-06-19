"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_SWITCHER_ENABLED, useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  variant?: "light" | "dark" | "auto";
  className?: string;
}

export function ThemeToggle({ variant = "auto", className = "" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();

  // Theme switching is temporarily disabled — hide the button entirely.
  if (!THEME_SWITCHER_ENABLED) return null;

  const isDark = theme === "dark";

  const baseClasses =
    variant === "light"
      ? "text-gray-500 hover:text-gray-900"
      : variant === "dark"
      ? "text-gray-400 hover:text-white"
      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${baseClasses} ${className}`}
    >
      <Sun
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
        strokeWidth={2}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ${
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
