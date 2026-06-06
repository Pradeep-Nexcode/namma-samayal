export interface CategoryName {
  en: string;
  ta?: string;
}

export interface Category {
  _id: string;
  name: CategoryName;
  slug: string;
  parent?: string | null;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CategoryTreeNode {
  category: Category;
  subCategories: Category[];
}

export interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTreeNode[];
}
