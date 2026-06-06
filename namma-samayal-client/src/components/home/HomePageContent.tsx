"use client";

import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
import { HeroTable } from "@/components/home/HeroTable";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeLatestRecipes } from "@/components/home/HomeLatestRecipes";
import { HomeCTA } from "@/components/home/HomeCTA";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { getRecipes } from "@/features/recipe/services/recipeApi";
import type { Recipe } from "@/types/recipe";
import { useLang } from "@/contexts/LanguageContext";

export function HomePageContent() {
  const { t } = useLang();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const result = await getRecipes({ page: 1, limit: 10 });
        setRecipes(result.data);
      } catch {
        setError("Failed to load recipes.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  return (
    <div className="bg-white min-h-screen text-slate-800">
      <HeroTable />

      <HomeCategories />

      <section className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-12 z-10">
        <HomeLatestRecipes recipes={recipes.slice(0, 4)} />

        <div className="mb-16 mt-24 text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fcedeb] px-4 py-2 text-xs font-bold text-[#e74c3c] tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e74c3c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e74c3c]"></span>
            </span>
            {t("home.trendingNow")}
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            {t("home.popularRecipes")}
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            {t("home.popularDesc")}
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader />
          </div>
        ) : null}

        {error ? (
          <div className="py-10">
            <ErrorMessage message={error} />
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {recipes.slice(4, 10).map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : null}

        {!loading && !error && recipes.length > 6 ? (
          <div className="mt-20 flex justify-center">
            <a
              href="/recipes"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 py-4 font-bold text-slate-700 transition-all hover:border-[#e74c3c] hover:text-[#e74c3c] hover:shadow-[0_10px_30px_rgba(231,76,60,0.1)] active:scale-95"
            >
              {t("home.viewArchive")}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        ) : null}
      </section>

      <HomeCTA />
    </div>
  );
}
