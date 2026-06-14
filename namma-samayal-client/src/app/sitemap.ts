import type { MetadataRoute } from "next";
import { getRecipes } from "@/features/recipe/services/recipeApi";
import { getIngredients } from "@/features/ingredient/services/ingredientApi";
import type { Recipe } from "@/types/recipe";
import type { Ingredient } from "@/types/ingredient";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

// Regenerate the sitemap at most once per hour. New recipes/ingredients
// will appear within an hour without redeploying.
export const revalidate = 3600;

// API caps page size at 500; walk pages until exhausted.
const PAGE_SIZE = 500;

async function fetchAllRecipes(): Promise<Recipe[]> {
  const all: Recipe[] = [];
  for (let page = 1; ; page++) {
    const { data, pagination } = await getRecipes({ page, limit: PAGE_SIZE });
    all.push(...data);
    if (!pagination || page >= pagination.pages) break;
  }
  return all;
}

async function fetchAllIngredients(): Promise<Ingredient[]> {
  const all: Ingredient[] = [];
  for (let page = 1; ; page++) {
    const { data, pagination } = await getIngredients({ page, limit: PAGE_SIZE });
    all.push(...data);
    if (!pagination || page >= pagination.pages) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/recipes`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ingredients`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/auth/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/auth/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let recipeUrls: MetadataRoute.Sitemap = [];
  let ingredientUrls: MetadataRoute.Sitemap = [];

  try {
    const [recipes, ingredients] = await Promise.all([
      fetchAllRecipes(),
      fetchAllIngredients(),
    ]);

    recipeUrls = recipes.map((r) => ({
      url: `${SITE_URL}/recipe/${r.slug || r._id}`,
      lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    ingredientUrls = ingredients.map((i) => ({
      url: `${SITE_URL}/ingredient/${i.slug || i._id}`,
      lastModified: i.updatedAt ? new Date(i.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch (err) {
    console.error("[sitemap] failed to fetch dynamic URLs:", err);
  }

  return [...staticUrls, ...recipeUrls, ...ingredientUrls];
}
