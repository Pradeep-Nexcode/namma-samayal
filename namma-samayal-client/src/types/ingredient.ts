import type { Category } from "@/types/category";

export interface IngredientText {
  en: string;
  ta?: string;
}

export interface IngredientNutritionDailyValue {
  iron?: number;
  calcium?: number;
  vitaminA?: number;
  vitaminC?: number;
}

export interface IngredientNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  iron?: number;
  calcium?: number;
  vitaminA?: number;
  vitaminC?: number;
  dailyValue?: IngredientNutritionDailyValue;
}

export interface IngredientOrigin {
  country?: string;
  state?: string;
}

export type IngredientSeasonAvailability = "year-round" | "seasonal";

export interface IngredientSeason {
  availability?: IngredientSeasonAvailability;
  /** Months are 1-12 (Jan = 1). */
  bestMonths?: number[];
}

export type IngredientStatus =
  | "fresh-available"
  | "seasonal"
  | "limited"
  | "out-of-stock";

export interface IngredientChefTip {
  en?: string;
  ta?: string;
  attributedTo?: string;
}

export interface IngredientSubstituteNote {
  texture?: string;
  flavor?: string;
  cookingTime?: string;
  notes?: string;
}

/** Minimal shape of a substitute returned when an Ingredient is populated. */
export interface IngredientSubstituteRef {
  _id: string;
  name: IngredientText;
  slug?: string;
  imageUrl?: string;
  category?: Pick<Category, "_id" | "name"> & { slug?: string };
  status?: IngredientStatus;
}

export interface Ingredient {
  _id: string;
  name: IngredientText;
  slug: string;
  category: Category;
  subCategory?: Category;
  description?: IngredientText;
  imageUrl?: string;
  nutrition?: IngredientNutrition;
  tags: string[];
  isActive: boolean;

  // Extended fields
  origin?: IngredientOrigin;
  season?: IngredientSeason;
  status?: IngredientStatus;
  isPremium?: boolean;
  whySpecial?: IngredientText;
  chefTip?: IngredientChefTip;
  howToStore?: IngredientText;
  quickBenefits?: IngredientText[];
  /** Populated array of related ingredients (kept slim to avoid huge payloads). */
  substitutes?: IngredientSubstituteRef[];
  /** Object map keyed by substitute Ingredient _id. */
  substituteNotes?: Record<string, IngredientSubstituteNote>;

  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IngredientListResponse {
  success: boolean;
  data: Ingredient[];
  pagination?: PaginationMeta;
}

export interface IngredientItemResponse {
  success: boolean;
  data: Ingredient;
}

export interface IngredientMutationResponse {
  success: boolean;
  message: string;
  data: Ingredient;
}

export interface IngredientCreateInput {
  name: IngredientText;
  slug?: string;
  category: string;
  subCategory?: string;
  description?: IngredientText;
  imageUrl?: string;
  nutrition?: IngredientNutrition;
  tags?: string[];
  isActive?: boolean;

  // Extended optional inputs
  origin?: IngredientOrigin;
  season?: IngredientSeason;
  status?: IngredientStatus;
  isPremium?: boolean;
  whySpecial?: IngredientText;
  chefTip?: IngredientChefTip;
  howToStore?: IngredientText;
  quickBenefits?: IngredientText[];
  /** Array of Ingredient `_id`s. */
  substitutes?: string[];
  substituteNotes?: Record<string, IngredientSubstituteNote>;
}
