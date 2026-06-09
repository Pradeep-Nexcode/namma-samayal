"use client";

import Link from "next/link";
import { Clock, Sparkles, ChefHat, ArrowRight } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { useLang } from "@/contexts/LanguageContext";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t, lf } = useLang();

  return (
    <article className="group relative flex flex-col rounded-3xl bg-white dark:bg-[var(--color-card)] border border-slate-200/60 overflow-hidden transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_20px_rgba(231,76,60,0.05)] hover:-translate-y-1">
      <Link href={`/recipe/${recipe._id}`} className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-white/5">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.seo?.title?.en || recipe.title || recipe.dishName.en}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-slate-200 group-hover:text-slate-300 transition-colors duration-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />

        <div className="absolute top-4 right-4 flex gap-2">
          <div className="rounded-full bg-white/95 backdrop-blur shadow-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#e74c3c]">
            {recipe.difficulty}
          </div>
        </div>
      </Link>

      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-gray-100 transition-colors line-clamp-1 group-hover:text-[#e74c3c]">
            {lf(recipe.seo?.title) || recipe.title || lf(recipe.dishName)}
          </h2>
        </div>

        <p className="text-sm text-slate-500 dark:text-gray-400 font-medium line-clamp-2 leading-relaxed h-10">
          {lf(recipe.seo?.description) || lf(recipe.description) || t("home.recipeCardFallback")}
        </p>

        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 dark:text-gray-500 object-none uppercase tracking-widest mt-auto pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-300" />
            {recipe.totalTime || recipe.cookingTime || "--"}m
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-slate-300" />
            {recipe.ingredients?.length || 0} {t("recipe.items")}
          </div>
        </div>

        <Link
          href={`/recipe/${recipe._id}`}
          className="mt-2 flex items-center justify-between group/link h-12 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-[#fcedeb] dark:bg-[#e74c3c]/15 transition-all px-5"
        >
          <span className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 group-hover:text-[#e74c3c] transition-colors">{t("recipe.cookNow")}</span>
          <ArrowRight className="h-4 w-4 text-slate-400 dark:text-gray-500 group-hover:text-[#e74c3c] transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
