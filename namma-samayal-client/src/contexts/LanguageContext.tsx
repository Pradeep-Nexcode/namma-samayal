"use client";

import { createContext, useContext, useEffect, useState } from "react";
import en from "@/locales/en.json";
import ta from "@/locales/ta.json";

export type Lang = "en" | "ta";

type Translations = typeof en;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : string };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  lf: (field: { en: string; ta?: string } | undefined | null) => string;
}

const translations: Record<Lang, DeepPartial<Translations>> = {
  en,
  ta: ta as DeepPartial<Translations>,
};

function lookup(obj: unknown, key: string): string {
  const parts = key.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (typeof cur !== "object" || cur === null) return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : key;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => lookup(en, key),
  lf: (field) => field?.en ?? "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("ns_lang") as Lang | null;
    if (stored === "en" || stored === "ta") setLangState(stored);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem("ns_lang", next);
  };

  const t = (key: string): string => lookup(translations[lang], key);

  const lf = (field: { en: string; ta?: string } | undefined | null): string => {
    if (!field) return "";
    if (lang === "ta" && field.ta) return field.ta;
    return field.en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, lf }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
