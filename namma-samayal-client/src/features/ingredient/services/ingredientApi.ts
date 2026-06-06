import { api } from "@/services/api";
import type {
  Ingredient,
  IngredientCreateInput,
  IngredientItemResponse,
  IngredientListResponse,
  IngredientMutationResponse,
  PaginationMeta,
} from "@/types/ingredient";

export type IngredientQueryParams = {
  category?: string;
  subCategory?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
};

export type IngredientsResult = {
  data: Ingredient[];
  pagination: PaginationMeta | undefined;
};

export const getIngredients = async (
  params?: IngredientQueryParams,
): Promise<IngredientsResult> => {
  const response = await api.get<IngredientListResponse>("/ingredients", {
    params,
  });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getIngredientById = async (id: string): Promise<Ingredient> => {
  const response = await api.get<IngredientItemResponse>(`/ingredients/${id}`);
  return response.data.data;
};

function appendTextGroup(
  formData: FormData,
  key: "name" | "description",
  text?: { en: string; ta?: string },
) {
  if (!text) return;
  if (text.en) formData.append(`${key}[en]`, text.en);
  if (text.ta) formData.append(`${key}[ta]`, text.ta);
}

function appendOptional(
  formData: FormData,
  key: string,
  value?: string | number | boolean,
) {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
}

function buildIngredientFormData(
  input: IngredientCreateInput,
  imageFile?: File | null,
) {
  const formData = new FormData();

  if (imageFile) formData.append("image", imageFile);

  appendTextGroup(formData, "name", input.name);
  appendOptional(formData, "slug", input.slug);
  appendOptional(formData, "category", input.category);
  appendOptional(formData, "subCategory", input.subCategory);
  appendTextGroup(formData, "description", input.description);
  appendOptional(formData, "imageUrl", input.imageUrl);
  appendOptional(formData, "isActive", input.isActive);

  if (input.tags?.length) {
    input.tags.forEach((tag) => formData.append("tags", tag));
  }

  if (input.nutrition) {
    appendOptional(
      formData,
      "nutrition[calories]",
      input.nutrition.calories,
    );
    appendOptional(formData, "nutrition[protein]", input.nutrition.protein);
    appendOptional(formData, "nutrition[carbs]", input.nutrition.carbs);
    appendOptional(formData, "nutrition[fat]", input.nutrition.fat);
  }

  return formData;
}

export const createIngredient = async (
  input: IngredientCreateInput,
  imageFile?: File | null,
): Promise<Ingredient> => {
  const formData = buildIngredientFormData(input, imageFile);
  const response = await api.post<IngredientMutationResponse>(
    "/ingredients",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data.data;
};

export const updateIngredient = async (
  id: string,
  input: IngredientCreateInput,
  imageFile?: File | null,
): Promise<Ingredient> => {
  const formData = buildIngredientFormData(input, imageFile);
  const response = await api.patch<IngredientMutationResponse>(
    `/ingredients/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data.data;
};

export const deleteIngredient = async (id: string): Promise<void> => {
  await api.delete(`/ingredients/${id}`);
};
