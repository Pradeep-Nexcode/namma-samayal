"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Sparkles, Heart } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { useLang } from "@/contexts/LanguageContext";
import { RecipePlaceholder } from "@/components/recipe/RecipePlaceholder";

interface RecipeCardProps {
  recipe: Recipe;
}

/* Tiny inline tape strip — washi look */
function CornerTape({ rotate = -8 }: { rotate?: number }) {
  return (
    <div
      className="absolute top-2 right-4 z-20 w-12 h-3.5 shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
      style={{
        backgroundColor: "rgba(255, 243, 176, 0.92)",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        transform: `rotate(${rotate}deg)`,
      }}
      aria-hidden
    />
  );
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t, lf } = useLang();
  const title = lf(recipe.seo?.title) || recipe.title || lf(recipe.dishName);
  const desc =
    lf(recipe.seo?.description) ||
    lf(recipe.description) ||
    t("home.recipeCardFallback");
  const time = recipe.totalTime || recipe.cookingTime;
  const itemsCount = recipe.ingredients?.length || 0;

  return (
    <article className="group relative flex flex-col rounded-3xl paper-card border border-stone-200 dark:border-white/[0.06] overflow-hidden shadow-[0_6px_18px_-10px_rgba(120,90,40,0.22)] hover:shadow-[0_14px_30px_-12px_rgba(120,90,40,0.32)] hover:border-stone-300 dark:hover:border-white/10 transition-all duration-300 hover:-translate-y-0.5">
      <CornerTape />

      {/* Image */}
      <Link
        href={`/recipe/${recipe.slug ?? recipe._id}`}
        className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-white/5"
      >
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <RecipePlaceholder recipe={recipe} />
        )}

        {/* Subtle dark gradient at bottom for legibility of the difficulty pill */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 via-black/10 to-transparent pointer-events-none" />

        {/* Difficulty pill — top-left */}
        {recipe.difficulty && (
          <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-[#fff3b0]/95 backdrop-blur-sm shadow-sm px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest text-amber-900">
            {recipe.difficulty}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 px-5 md:px-6 py-5 flex flex-col gap-3">
        <Link href={`/recipe/${recipe.slug ?? recipe._id}`} className="block">
          <h3 className="font-title-hw text-[20px] md:text-[22px] font-bold leading-tight text-stone-900 dark:text-stone-50 line-clamp-2 group-hover:text-[#c0392b] transition-colors">
            {title}
          </h3>
        </Link>

        <p className="font-body text-[13.5px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
          {desc}
        </p>

        {/* Meta row */}
        <div className="mt-auto pt-3 border-t border-dashed border-stone-200 dark:border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 font-body text-[12px] font-semibold text-stone-600 dark:text-stone-300">
            {time ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                {time} min
              </span>
            ) : null}
            {time && itemsCount > 0 ? (
              <span className="text-stone-300 dark:text-stone-600" aria-hidden>
                |
              </span>
            ) : null}
            {itemsCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                {itemsCount} {t("recipe.items")}
              </span>
            ) : null}
          </div>

          {/* Heart button (visual only — actual favorite logic lives on detail page) */}
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-400 dark:text-stone-500 group-hover:bg-rose-50 dark:group-hover:bg-rose-500/15 group-hover:text-rose-500 group-hover:border-rose-200 dark:group-hover:border-rose-500/40 transition-colors"
            aria-hidden
          >
            <Heart className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
