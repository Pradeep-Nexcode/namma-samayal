import type { Category } from "@/types/category";
import type { Ingredient } from "@/types/ingredient";

export interface RecipeText {
  en: string;
  ta?: string;
}

export interface RecipeLocation {
  country: string;
  state?: string;
  region?: string;
  city?: string;
}

export interface RecipeIngredientItem {
  ingredient: Ingredient;
  ingredientSnapshot?: RecipeText;
  quantity?: string;
  unit?: string;
}

export interface RecipeStep {
  step?: number;
  description: RecipeText;
}

export interface RecipeSection {
  type: string;
  title?: RecipeText;
  steps: RecipeStep[];
}

export interface RecipeRating {
  user: string;
  rating: number;
}

export interface RecipeCreator {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export type RecipeDifficulty = "easy" | "medium" | "hard";
export type RecipeSource = "manual" | "youtube" | "blog" | "ai";

export interface RecipeSeo {
  title?: RecipeText;
  description?: RecipeText;
  keywords?: string[];
}

export interface Recipe {
  _id: string;
  dishName: RecipeText;
  slug: string;
  title?: string;
  seo?: RecipeSeo;
  location: RecipeLocation;
  description: RecipeText;
  ingredients: RecipeIngredientItem[];
  steps: RecipeStep[];
  sections?: RecipeSection[];
  speciality?: RecipeText;
  prepTime?: number;
  cookingTime?: number;
  totalTime?: number;
  servings?: number;
  difficulty: RecipeDifficulty;
  category?: Category;
  subCategory?: Category;
  imageUrl?: string;
  tags: string[];
  createdBy: RecipeCreator;
  isPublic: boolean;
  isApproved: boolean;
  ratings: RecipeRating[];
  averageRating: number;
  source: RecipeSource;
  recipeSource?: {
    type: "youtube" | "blog" | "other";
    url: string;
  };
  searchKeywords?: string[];
  aiGenerated?: boolean;
  aiReviewed?: boolean;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecipePaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface RecipeListResponse {
  success: boolean;
  data: Recipe[];
  pagination?: RecipePaginationMeta;
}

export interface RecipeItemResponse {
  success: boolean;
  data: Recipe;
}

export interface RecipeMutationResponse {
  success: boolean;
  message: string;
  data: Recipe;
}

export interface RecipeRateResponse {
  success: boolean;
  message: string;
  data: {
    userRating: number;
    averageRating: number;
    totalRatings: number;
  };
}

export interface RecipeIngredientInput {
  ingredient: string;
  ingredientSnapshot?: RecipeText;
  quantity?: string;
  unit?: string;
}

export interface RecipeStepInput {
  step?: number;
  description: RecipeText;
}

export interface RecipeCreateInput {
  dishName: RecipeText;
  slug?: string;
  title?: string;
  location: RecipeLocation;
  description: RecipeText;
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
  speciality?: RecipeText;
  cookingTime?: number;
  servings?: number;
  difficulty?: RecipeDifficulty;
  category?: string;
  subCategory?: string;
  imageUrl?: string;
  tags?: string[];
  source?: RecipeSource;
  recipeSource?: {
    type: "youtube" | "blog" | "other";
    url: string;
  };
  searchKeywords?: string[];
  aiGenerated?: boolean;
  aiReviewed?: boolean;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}
