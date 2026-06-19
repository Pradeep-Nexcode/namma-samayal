import axios from "axios";

import { api } from "@/services/api";
import type { Comment, CommentSort, CommentsResponse } from "@/types/comment";

function extractApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return "Something went wrong.";
  const message = (error.response?.data as { message?: string } | undefined)
    ?.message;
  return message || "Request failed. Please try again.";
}

export const getRecipeComments = async (
  recipeId: string,
  options: { page?: number; sort?: CommentSort } = {},
): Promise<CommentsResponse> => {
  try {
    const response = await api.get<CommentsResponse>(
      `/comments/recipe/${recipeId}`,
      { params: { page: options.page ?? 1, sort: options.sort ?? "newest" } },
    );
    return response.data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const createComment = async (payload: {
  recipeId: string;
  content: string;
  parentComment?: string;
}): Promise<Comment> => {
  try {
    const response = await api.post<{ data: Comment }>("/comments", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const updateComment = async (
  id: string,
  content: string,
): Promise<Comment> => {
  try {
    const response = await api.patch<{ data: Comment }>(`/comments/${id}`, {
      content,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const deleteComment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/comments/${id}`);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};
