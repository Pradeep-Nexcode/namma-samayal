"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";
type ThemePref = Theme | "system";

/**
 * Master switch for the dark theme + theme toggle. Temporarily OFF — the site
 * is light-only for now. Flip to `true` to bring back dark mode and the toggle
 * button (no other changes needed; the dark CSS and toggle code are intact).
 */
export const THEME_SWITCHER_ENABLED = false;

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePref;
  setPreference: (pref: ThemePref) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  preference: "system",
  setPreference: () => {},
  toggle: () => {},
});

const STORAGE_KEY = "ns_theme";

function resolveTheme(pref: ThemePref): Theme {
  // Dark theme disabled — always resolve to light regardless of stored/system pref.
  if (!THEME_SWITCHER_ENABLED) return "light";
  if (pref === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePref>("system");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePref | null;
    const pref: ThemePref = stored === "dark" || stored === "light" || stored === "system" ? stored : "system";
    setPreferenceState(pref);
    const resolved = resolveTheme(pref);
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved: Theme = mq.matches ? "dark" : "light";
      setTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePref) => {
    setPreferenceState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggle = useCallback(() => {
    if (!THEME_SWITCHER_ENABLED) return;
    const next: Theme = theme === "dark" ? "light" : "dark";
    setPreference(next);
  }, [theme, setPreference]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
