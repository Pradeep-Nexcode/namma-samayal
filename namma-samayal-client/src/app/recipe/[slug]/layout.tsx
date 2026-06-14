import type { Metadata } from "next";
import type { Recipe } from "@/types/recipe";

const SITE_NAME = "Namma Samayal";
const SITE_DESCRIPTION = "A Tamil/South Indian recipe and ingredient platform";

/**
 * Server-side fetch of a single recipe for SEO/metadata.
 *
 * Uses plain fetch (no axios) so this works in a server component without
 * dragging in the browser-only auth-token interceptor. Recipes are public,
 * so no auth is required.
 *
 * Revalidates every hour (good for SEO; new recipes get indexed fast,
 * existing recipes don't hammer the API).
 */
async function fetchRecipeForMetadata(id: string): Promise<Recipe | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return null;

  try {
    const res = await fetch(`${apiBase}/recipes/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: Recipe };
    return json?.data ?? null;
  } catch {
    return null;
  }
}

function isoDuration(minutes?: number): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  return `PT${Math.round(minutes)}M`;
}

function buildIngredientStrings(recipe: Recipe): string[] {
  return (recipe.ingredients || [])
    .map((ri) => {
      const name = ri.ingredientSnapshot?.en
        || ri.ingredient?.name?.en
        || "";
      if (!name) return "";
      const qty = [ri.quantity, ri.unit].filter(Boolean).join(" ").trim();
      return qty ? `${qty} ${name}` : name;
    })
    .filter(Boolean);
}

function buildInstructionSteps(recipe: Recipe): Array<{ "@type": "HowToStep"; name?: string; text: string }> {
  const out: Array<{ "@type": "HowToStep"; name?: string; text: string }> = [];

  if (recipe.sections && recipe.sections.length > 0) {
    for (const section of recipe.sections) {
      for (const step of section.steps || []) {
        out.push({
          "@type": "HowToStep",
          name: section.title?.en,
          text: step.description?.en || "",
        });
      }
    }
  } else if (recipe.steps && recipe.steps.length > 0) {
    for (const step of recipe.steps) {
      out.push({
        "@type": "HowToStep",
        text: step.description?.en || "",
      });
    }
  }

  return out.filter((s) => s.text);
}

function buildRecipeJsonLd(recipe: Recipe, canonicalUrl: string): Record<string, unknown> {
  const titleEn = recipe.seo?.title?.en || recipe.title || recipe.dishName?.en || "Recipe";
  const descEn = recipe.seo?.description?.en
    || recipe.description?.en
    || `Authentic ${titleEn} recipe`;
  const author = recipe.createdBy
    ? [recipe.createdBy.firstName, recipe.createdBy.lastName].filter(Boolean).join(" ") || recipe.createdBy.username
    : SITE_NAME;
  const cuisine = recipe.location?.region
    ? `${recipe.location.region}, ${recipe.location.country}`
    : recipe.location?.country;
  const keywords = recipe.seo?.keywords && recipe.seo.keywords.length > 0
    ? recipe.seo.keywords.join(", ")
    : (recipe.tags || []).join(", ") || undefined;

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: titleEn,
    description: descEn,
    url: canonicalUrl,
    author: { "@type": "Person", name: author },
    datePublished: recipe.createdAt,
    dateModified: recipe.updatedAt,
  };

  if (recipe.imageUrl) ld.image = [recipe.imageUrl];
  if (cuisine) ld.recipeCuisine = cuisine;
  if (recipe.category?.name?.en) ld.recipeCategory = recipe.category.name.en;
  if (recipe.servings) ld.recipeYield = `${recipe.servings} servings`;
  if (keywords) ld.keywords = keywords;

  const prep = isoDuration(recipe.prepTime);
  const cook = isoDuration(recipe.cookingTime);
  const total = isoDuration(recipe.totalTime ?? ((recipe.prepTime ?? 0) + (recipe.cookingTime ?? 0)));
  if (prep) ld.prepTime = prep;
  if (cook) ld.cookTime = cook;
  if (total) ld.totalTime = total;

  const ingredients = buildIngredientStrings(recipe);
  if (ingredients.length > 0) ld.recipeIngredient = ingredients;

  const instructions = buildInstructionSteps(recipe);
  if (instructions.length > 0) ld.recipeInstructions = instructions;

  const ratingsCount = recipe.ratings?.length || 0;
  if (recipe.averageRating && ratingsCount > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: recipe.averageRating,
      ratingCount: ratingsCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (recipe.recipeSource?.url) {
    ld.isBasedOn = recipe.recipeSource.url;
  }

  return ld;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await fetchRecipeForMetadata(slug);

  if (!recipe) {
    return {
      title: `Recipe | ${SITE_NAME}`,
      description: SITE_DESCRIPTION,
    };
  }

  const titleEn = recipe.seo?.title?.en || recipe.title || recipe.dishName?.en || "Recipe";
  const descEn = recipe.seo?.description?.en
    || recipe.description?.en?.slice(0, 160)
    || SITE_DESCRIPTION;
  const keywords = recipe.seo?.keywords && recipe.seo.keywords.length > 0
    ? recipe.seo.keywords
    : recipe.tags;

  return {
    title: `${titleEn} | ${SITE_NAME}`,
    description: descEn,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    openGraph: {
      type: "article",
      title: titleEn,
      description: descEn,
      siteName: SITE_NAME,
      images: recipe.imageUrl ? [{ url: recipe.imageUrl, alt: titleEn }] : undefined,
    },
    twitter: {
      card: recipe.imageUrl ? "summary_large_image" : "summary",
      title: titleEn,
      description: descEn,
      images: recipe.imageUrl ? [recipe.imageUrl] : undefined,
    },
    alternates: {
      canonical: `/recipe/${slug}`,
    },
  };
}

export default async function RecipeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await fetchRecipeForMetadata(slug);

  const jsonLd = recipe ? buildRecipeJsonLd(recipe, `/recipe/${slug}`) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
