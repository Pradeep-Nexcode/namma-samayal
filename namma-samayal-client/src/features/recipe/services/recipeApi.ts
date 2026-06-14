import { api } from "@/services/api";
import type {
  Recipe,
  RecipeCreateInput,
  RecipeItemResponse,
  RecipeListResponse,
  RecipeMutationResponse,
  RecipePaginationMeta,
  RecipeRateResponse,
} from "@/types/recipe";

export type RecipeQueryParams = {
  page?: number;
  limit?: number;
  category?: string;
  subCategory?: string;
  difficulty?: "easy" | "medium" | "hard";
  country?: string;
  state?: string;
  region?: string;
  search?: string;
  /** Filter recipes that use this ingredient. Accepts a single id or a
   *  comma-separated list of ids (server treats multiple as AND). */
  ingredient?: string;
};

export type RecipesResult = {
  data: Recipe[];
  pagination: RecipePaginationMeta | undefined;
};

export const getRecipes = async (
  params?: RecipeQueryParams,
): Promise<RecipesResult> => {
  const response = await api.get<RecipeListResponse>("/recipes", { params });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await api.get<RecipeItemResponse>(`/recipes/${id}`);
  return response.data.data;
};

function appendOptional(
  formData: FormData,
  key: string,
  value?: string | number | boolean,
) {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
}

function appendTextGroup(
  formData: FormData,
  key: "dishName" | "description" | "speciality",
  text?: { en: string; ta?: string },
) {
  if (!text) return;
  if (text.en) formData.append(`${key}[en]`, text.en);
  if (text.ta) formData.append(`${key}[ta]`, text.ta);
}

function buildRecipeFormData(input: RecipeCreateInput, imageFile?: File | null) {
  const formData = new FormData();

  if (imageFile) formData.append("image", imageFile);

  appendTextGroup(formData, "dishName", input.dishName);
  appendOptional(formData, "slug", input.slug);
  appendOptional(formData, "title", input.title);

  appendOptional(formData, "location[country]", input.location.country);
  appendOptional(formData, "location[state]", input.location.state);
  appendOptional(formData, "location[region]", input.location.region);
  appendOptional(formData, "location[city]", input.location.city);

  appendTextGroup(formData, "description", input.description);
  appendTextGroup(formData, "speciality", input.speciality);

  if (input.ingredients?.length) {
    formData.append("ingredients", JSON.stringify(input.ingredients));
  }
  if (input.steps?.length) {
    formData.append("steps", JSON.stringify(input.steps));
  }

  appendOptional(formData, "cookingTime", input.cookingTime);
  appendOptional(formData, "servings", input.servings);
  appendOptional(formData, "difficulty", input.difficulty);
  appendOptional(formData, "category", input.category);
  appendOptional(formData, "subCategory", input.subCategory);
  appendOptional(formData, "imageUrl", input.imageUrl);
  appendOptional(formData, "source", input.source);

  if (input.tags) {
    formData.append("tags", JSON.stringify(input.tags));
  }

  appendOptional(formData, "coordinates[lat]", input.coordinates?.lat);
  appendOptional(formData, "coordinates[lng]", input.coordinates?.lng);

  return formData;
}

export const createRecipe = async (
  input: RecipeCreateInput,
  imageFile?: File | null,
): Promise<Recipe> => {
  const formData = buildRecipeFormData(input, imageFile);
  const response = await api.post<RecipeMutationResponse>("/recipes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const updateRecipe = async (
  id: string,
  input: RecipeCreateInput,
  imageFile?: File | null,
): Promise<Recipe> => {
  const formData = buildRecipeFormData(input, imageFile);
  const response = await api.put<RecipeMutationResponse>(
    `/recipes/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data.data;
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};

export const rateRecipe = async (
  id: string,
  rating: number,
): Promise<RecipeRateResponse["data"]> => {
  const response = await api.post<RecipeRateResponse>(`/recipes/${id}/rate`, {
    rating,
  });
  return response.data.data;
};
