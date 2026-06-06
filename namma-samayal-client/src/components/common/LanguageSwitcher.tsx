"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import type { Lang } from "@/contexts/LanguageContext";

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "ta", label: "தமிழ்", short: "தமிழ்" },
];

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const isLight = variant === "light";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
          isLight
            ? "border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 bg-white"
            : "border border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200 bg-transparent"
        }`}
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span>{current.short}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-44 rounded-2xl border shadow-xl py-1.5 z-50 ${
          isLight
            ? "bg-white border-gray-100"
            : "bg-[#1a1a1a] border-white/10"
        }`}>
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => { setLang(language.code); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                isLight
                  ? lang === language.code
                    ? "bg-gray-50 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  : lang === language.code
                    ? "bg-white/8 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <span className="w-8 text-xs font-black text-gray-400 shrink-0">{language.short}</span>
              <span>{language.label}</span>
              {lang === language.code && (
                <Check className="h-3.5 w-3.5 ml-auto text-[#e74c3c] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
