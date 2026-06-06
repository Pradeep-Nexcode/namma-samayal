"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories } from "@/features/category/services/categoryApi";
import type { Category } from "@/types/category";
import { Loader } from "@/components/common/Loader";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Utensils, Grid, Leaf, Flame, Droplets, Coffee, Egg, Wheat } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export function HomeCategories() {
  const { t, lf } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const getCategoryIcon = (categoryName: string) => {
    const key = categoryName.toLowerCase();
    if (key.includes("veg") || key.includes("salad")) return <Leaf className="h-8 w-8" />;
    if (key.includes("meat") || key.includes("grill")) return <Flame className="h-8 w-8" />;
    if (key.includes("drink") || key.includes("beverage")) return <Droplets className="h-8 w-8" />;
    if (key.includes("breakfast") || key.includes("egg")) return <Egg className="h-8 w-8" />;
    if (key.includes("bakery") || key.includes("bread")) return <Wheat className="h-8 w-8" />;
    if (key.includes("coffee") || key.includes("tea")) return <Coffee className="h-8 w-8" />;
    return <Utensils className="h-8 w-8" />;
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-16 lg:px-12 z-10">
      <div className="mb-12 flex items-end justify-between">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f3efe6]/80 px-4 py-2 text-xs font-bold text-slate-600 tracking-widest uppercase">
            <Grid className="h-3.5 w-3.5 text-[#e74c3c]" />
            {t("home.browseCategories")}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            {t("home.flavorProfiles")}
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            {t("home.findCraving")}
          </p>
        </div>

        <Link
          href="/explore"
          className="hidden md:inline-flex items-center gap-2 font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors"
        >
          {t("home.viewAllGroups")}
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Loader /></div>
      ) : error ? (
        <div className="py-6"><ErrorMessage message={error} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/recipes?category=${category._id}`}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-slate-50 border border-slate-100 p-8 text-center transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_20px_rgba(231,76,60,0.05)] hover:-translate-y-1 hover:border-[#e74c3c]/30"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#fcedeb] group-hover:text-[#e74c3c]">
                {getCategoryIcon(category.name.en)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 transition-colors group-hover:text-[#e74c3c]">
                  {lf(category.name)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
