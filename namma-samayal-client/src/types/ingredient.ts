import type { Category } from "@/types/category";

export interface IngredientText {
  en: string;
  ta?: string;
}

export interface IngredientNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
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
}
