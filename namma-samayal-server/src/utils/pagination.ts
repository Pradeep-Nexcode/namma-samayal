export interface PaginationInput {
  page?: string | number;
  limit?: string | number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginationState {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (input: PaginationInput, maxLimit: number = 3000): PaginationState => {
  const pageRaw = Number(input.page ?? 1);
  const limitRaw = Number(input.limit ?? 10);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, maxLimit) : 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});
