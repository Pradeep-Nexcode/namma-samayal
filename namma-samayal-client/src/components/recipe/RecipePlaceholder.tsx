"use client";

import type { Recipe } from "@/types/recipe";
import { getRecipeVisual } from "@/utils/recipeVisual";

/**
 * Branded fallback tile shown in a recipe card's image slot when the recipe has
 * no photo. Visual hierarchy (most → least prominent):
 *   1. Big dish emoji        — "what food is this?"
 *   2. Veg / non-veg mark     — top-left, the familiar Indian square symbol
 * Derived deterministically from the recipe's own data. (Location/district is
 * intentionally NOT shown here — it lives on the full recipe page.)
 *
 * Must be placed inside a `relative` container (the card's image wrapper).
 */
export function RecipePlaceholder({ recipe }: { recipe: Recipe }) {
  const { emoji, theme, diet } = getRecipeVisual(recipe);

  const dietColor = diet === "nonveg" ? "#b23120" : "#3f7d2b";
  const dietLabel = diet === "nonveg" ? "Non-Veg" : "Veg";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(150deg, ${theme.from} 0%, ${theme.to} 100%)`,
      }}
      aria-hidden
    >
      {/* faint dotted texture for a "paper" feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(120,80,30,0.10) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />

      {/* Veg / Non-veg mark — top-left (Indian standard square + dot) */}
      <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md bg-white/85 px-1.5 py-[3px] shadow-sm">
        <span
          className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border-[1.5px]"
          style={{ borderColor: dietColor }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: dietColor }}
          />
        </span>
        <span
          className="text-[8.5px] font-extrabold uppercase tracking-wide"
          style={{ color: dietColor }}
        >
          {dietLabel}
        </span>
      </span>

      {/* Hero dish emoji */}
      <div className="relative text-[72px] leading-none drop-shadow-[0_3px_5px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-110">
        {emoji}
      </div>
    </div>
  );
}
