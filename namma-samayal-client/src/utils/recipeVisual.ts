import type { Recipe, RecipeText } from "@/types/recipe";

/**
 * Deterministic visual identity for a recipe — used to render a branded
 * placeholder tile when a recipe has no photo. Everything is derived from data
 * the Recipe already carries (category, sub-category, tags, dish name, location,
 * ingredients), so it's free, instant, and 100% consistent across all recipes.
 *
 * To tune the look, edit THEMES + RULES below — no per-recipe work needed.
 */
export interface RecipeVisualTheme {
  from: string;
  to: string;
  accent: string;
}

export interface RecipeVisual {
  emoji: string;
  theme: RecipeVisualTheme;
  /** Veg / non-veg signal, inferred from keywords. */
  diet: "veg" | "nonveg";
  /** Up to 3 ingredient labels for chips (localizable). */
  ingredients: RecipeText[];
  /** District / region tag, e.g. "Erode" or "Kongu". */
  district: string | null;
}

/** Keywords that flag a recipe as non-veg (Tamil + English). */
const NONVEG =
  /chicken|kozhi|mutton|lamb|goat|aatu|aadu|fish|meen|prawn|crab|seafood|eral|sora|nethili|egg|muttai|meat|keema|liver/;

const THEMES: Record<string, RecipeVisualTheme> = {
  red: { from: "#fbe3dd", to: "#f4c7ba", accent: "#b23120" },
  brown: { from: "#efe0d0", to: "#dcc1a3", accent: "#7c4a24" },
  golden: { from: "#fdeecb", to: "#f6d488", accent: "#a9791a" },
  green: { from: "#e4efd6", to: "#c5e0a6", accent: "#4e7d2b" },
  amber: { from: "#fde9cf", to: "#f7cd93", accent: "#a8631a" },
  teal: { from: "#d7ece8", to: "#abd6cf", accent: "#2f6e63" },
  pink: { from: "#fbe0ea", to: "#f3c0d4", accent: "#a83d68" },
  neutral: { from: "#f1e7d5", to: "#e1cfb0", accent: "#7a6a4f" },
};

interface VisualRule {
  match: RegExp;
  emoji: string;
  theme: keyof typeof THEMES;
}

/** First matching rule wins — order from most specific to most general. */
const RULES: VisualRule[] = [
  { match: /chicken|kozhi/, emoji: "🍗", theme: "red" },
  { match: /mutton|lamb|goat|aatu|aadu/, emoji: "🍖", theme: "brown" },
  { match: /fish|meen|prawn|crab|seafood|eral|sora/, emoji: "🐟", theme: "teal" },
  { match: /egg|muttai/, emoji: "🥚", theme: "amber" },
  { match: /biriyani|biryani/, emoji: "🍛", theme: "golden" },
  { match: /rice|sadham|sadam|arisi|soru|pongal/, emoji: "🍚", theme: "golden" },
  {
    match: /dosa|dosai|idli|idly|paniyaram|adai|uttapam|tiffin|appam/,
    emoji: "🥞",
    theme: "amber",
  },
  { match: /rasam|charu|soup/, emoji: "🍅", theme: "red" },
  {
    match: /sambar|kuzhambu|kulambu|gravy|curry|kootu|poriyal|masala|varuval/,
    emoji: "🍲",
    theme: "amber",
  },
  { match: /chutney|thogayal|thuvaiyal|podi/, emoji: "🥥", theme: "green" },
  {
    match: /sweet|payasam|halwa|laddu|ladoo|mithai|dessert|kheer|jamun/,
    emoji: "🍮",
    theme: "pink",
  },
  {
    match: /snack|bajji|bonda|vadai|vada|murukku|seedai|mixture/,
    emoji: "🍢",
    theme: "amber",
  },
  { match: /keerai|greens|vegetable|veg\b|kara/, emoji: "🥬", theme: "green" },
  { match: /drink|juice|tea|coffee|paanagam|neer|sharbat/, emoji: "🥤", theme: "teal" },
];

export function getRecipeVisual(recipe: Recipe): RecipeVisual {
  const haystack = [
    recipe.category?.name?.en,
    recipe.subCategory?.name?.en,
    recipe.dishName?.en,
    recipe.title,
    ...(recipe.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const rule = RULES.find((r) => r.match.test(haystack));
  const emoji = rule?.emoji ?? "🍛";
  const theme = THEMES[rule?.theme ?? "neutral"];

  const ingredients = (recipe.ingredients ?? [])
    .slice(0, 3)
    .map((item) => item.ingredientSnapshot ?? item.ingredient?.name)
    .filter((name): name is RecipeText => Boolean(name?.en));

  const loc = recipe.location;
  const district = loc?.city || loc?.region || loc?.state || null;

  const diet: RecipeVisual["diet"] = NONVEG.test(haystack) ? "nonveg" : "veg";

  return { emoji, theme, diet, ingredients, district };
}
