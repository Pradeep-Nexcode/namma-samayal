"use client";

import Link from "next/link";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { useLang } from "@/contexts/LanguageContext";

interface HomeLatestRecipesProps {
  recipes: Recipe[];
}

export function HomeLatestRecipes({ recipes }: HomeLatestRecipesProps) {
  const { t, lf } = useLang();

  if (!recipes || recipes.length === 0) return null;

  const featured = recipes[0];
  const others = recipes.slice(1, 4);

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-20 lg:px-12 z-10 border-t border-slate-100">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fcedeb] px-4 py-2 text-xs font-bold text-[#e74c3c] tracking-widest uppercase mb-4">
            <Sparkles className="h-4 w-4" />
            {t("home.freshArrivals")}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            {t("home.latestAdditions")}
          </h2>
        </div>
        <Link
          href="/recipes"
          className="hidden md:flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-500 hover:bg-[#e74c3c] hover:text-white transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {featured && (
          <Link
            href={`/recipe/${featured._id}`}
            className="group lg:col-span-7 relative flex flex-col justify-end overflow-hidden rounded-[2.5rem] bg-slate-900 aspect-[4/3] sm:aspect-auto sm:min-h-[500px]"
          >
            {featured.imageUrl ? (
              <img
                src={featured.imageUrl}
                alt={featured.seo?.title?.en || featured.title || featured.dishName.en}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent opacity-60" />

            <div className="relative z-10 p-8 sm:p-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white border border-white/30">
                {t("recipe.new")}
              </div>
              <h3 className="mb-4 text-3xl sm:text-4xl font-black text-white leading-tight group-hover:text-[#e74c3c] transition-colors">
                {lf(featured.seo?.title) || featured.title || lf(featured.dishName)}
              </h3>
              <p className="mb-6 text-base text-gray-300 font-medium line-clamp-2 max-w-xl">
                {lf(featured.description) || t("home.featuredFallback")}
              </p>

              <div className="flex items-center gap-6 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {featured.totalTime || featured.cookingTime || "--"} min
                </div>
                {featured.difficulty && (
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e74c3c]"></span>
                    {featured.difficulty}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-8 right-8 flex h-14 w-14 translate-x-10 -translate-y-10 items-center justify-center rounded-full bg-[#e74c3c] text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-[0_0_30px_rgba(231,76,60,0.5)]">
              <ArrowRight className="h-6 w-6 -rotate-45" />
            </div>
          </Link>
        )}

        <div className="lg:col-span-5 flex flex-col gap-6">
          {others.map((recipe) => (
            <Link
              key={recipe._id}
              href={`/recipe/${recipe._id}`}
              className="group flex flex-row items-center gap-6 rounded-3xl p-4 transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.seo?.title?.en || recipe.title || recipe.dishName.en}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-200">
                    <Clock className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center flex-1 py-2">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#e74c3c]">
                  {recipe.category?.name ? lf(recipe.category.name) : ""}
                </div>
                <h3 className="font-bold text-lg text-slate-800 line-clamp-2 leading-snug group-hover:text-[#e74c3c] transition-colors">
                  {lf(recipe.seo?.title) || recipe.title || lf(recipe.dishName)}
                </h3>
                <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {recipe.totalTime || recipe.cookingTime || "--"}m
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
