export interface UserRecipe {
  _id: string;
  title: string;
  slug: string;
  cookingTime?: number;
  difficulty?: string;
  imageUrl?: string;
}

export type CookingLevel =
  | "beginner"
  | "home-cook"
  | "intermediate"
  | "expert"
  | "master";

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  language: "en" | "ta";
  profileImage?: string | null;
  bio?: string | null;
  /** Personal "Chef Identity" fields shown on the user profile page. */
  favoriteCuisine?: string | null;
  cookingLevel?: CookingLevel | null;
  specialDish?: string | null;
  location?: string | null;
  favoriteRecipes: Array<string | UserRecipe>;
  savedRecipes: Array<string | UserRecipe>;
  createdRecipes: Array<string | UserRecipe>;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSuccessResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UserProfileResponse {
  success: boolean;
  data: User;
}

export interface UserMessageResponse {
  success: boolean;
  message: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
  favoriteCuisine?: string;
  cookingLevel?: CookingLevel | "";
  specialDish?: string;
  location?: string;
}
