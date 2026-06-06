import { api } from "@/services/api";
import type { Category, CategoryListResponse } from "@/types/category";

type CategoryQueryParams = {
  level?: number;
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
};

export const getCategories = async (
  params?: CategoryQueryParams,
): Promise<Category[]> => {
  const response = await api.get<CategoryListResponse>("/categories", { params });
  return response.data.data ?? [];
};

export const getSubcategoriesByParent = async (
  categoryId: string,
): Promise<Category[]> => {
  const response = await api.get<CategoryListResponse>(
    `/categories/${categoryId}/subcategories`,
  );
  return response.data.data ?? [];
};
