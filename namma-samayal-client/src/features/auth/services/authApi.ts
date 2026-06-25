import axios from "axios";
import { api } from "@/services/api";
import { clearAuthToken, setAuthToken } from "@/utils/authToken";
import type {
  AuthSuccessResponse,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  User,
  UserMessageResponse,
  UserProfileResponse,
} from "@/types/user";

function extractApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return "Something went wrong.";
  const message = (error.response?.data as { message?: string } | undefined)
    ?.message;
  return message || "Request failed. Please try again.";
}

export const registerUser = async (
  payload: RegisterInput,
): Promise<string> => {
  try {
    // Registration no longer logs the user in — it sends a verification email.
    const response = await api.post<UserMessageResponse>(
      "/users/register",
      payload,
    );
    return response.data.message;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const verifyEmail = async (token: string): Promise<string> => {
  try {
    const response = await api.post<UserMessageResponse>("/users/verify-email", {
      token,
    });
    return response.data.message;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const resendVerification = async (email: string): Promise<string> => {
  try {
    const response = await api.post<UserMessageResponse>(
      "/users/resend-verification",
      { email },
    );
    return response.data.message;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const forgotPassword = async (email: string): Promise<string> => {
  try {
    const response = await api.post<UserMessageResponse>(
      "/users/forgot-password",
      { email },
    );
    return response.data.message;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const resetPassword = async (
  token: string,
  password: string,
): Promise<string> => {
  try {
    const response = await api.post<UserMessageResponse>(
      "/users/reset-password",
      { token, password },
    );
    return response.data.message;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const loginUser = async (payload: LoginInput): Promise<User> => {
  try {
    const response = await api.post<AuthSuccessResponse>("/users/login", payload);
    setAuthToken(response.data.data.token);
    return response.data.data.user;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Revoke the server-side refresh session + clear the httpOnly cookie.
    await api.post("/users/logout");
  } catch {
    // Ignore — clear local state regardless of the server response.
  }
  clearAuthToken();
};

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<UserProfileResponse>("/users/profile");
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const updateUserProfile = async (
  payload: UpdateProfileInput,
): Promise<User> => {
  try {
    const response = await api.put<UserProfileResponse>("/users/profile", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const addRecipeToFavorites = async (recipeId: string): Promise<void> => {
  try {
    await api.post<UserMessageResponse>(`/users/favorites/${recipeId}`);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const removeRecipeFromFavorites = async (
  recipeId: string,
): Promise<void> => {
  try {
    await api.delete<UserMessageResponse>(`/users/favorites/${recipeId}`);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const saveRecipe = async (recipeId: string): Promise<void> => {
  try {
    await api.post<UserMessageResponse>(`/users/saved/${recipeId}`);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};

export const unsaveRecipe = async (recipeId: string): Promise<void> => {
  try {
    await api.delete<UserMessageResponse>(`/users/saved/${recipeId}`);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
};
