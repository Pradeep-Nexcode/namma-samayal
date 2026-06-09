"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getUserProfile,
  removeRecipeFromFavorites,
  unsaveRecipe,
  updateUserProfile,
} from "@/features/auth/services/authApi";
import { getAuthToken } from "@/utils/authToken";
import type { User, UserRecipe } from "@/types/user";
import { User as UserIcon, Heart, Bookmark, ChefHat, LogOut } from "lucide-react";
import { logoutUser } from "@/features/auth/services/authApi";

type EditableProfile = {
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: string;
};

type TabId = "profile" | "favorites" | "saved" | "created";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "profile", label: "Edit Profile", icon: UserIcon },
  { id: "favorites", label: "Favorite Recipes", icon: Heart },
  { id: "saved", label: "Saved Recipes", icon: Bookmark },
  { id: "created", label: "Created Recipes", icon: ChefHat },
];

function recipeId(value: string | UserRecipe): string {
  return typeof value === "string" ? value : value._id;
}

function recipeLabel(value: string | UserRecipe): string {
  return typeof value === "string" ? value : value.title;
}

function recipeSlug(value: string | UserRecipe): string {
  return typeof value === "string" ? "" : value.slug;
}

function recipeHref(value: string | UserRecipe): string {
  return `/recipe/${recipeId(value)}`;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isMutatingRecipe, setIsMutatingRecipe] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [form, setForm] = useState<EditableProfile>({
    firstName: "",
    lastName: "",
    bio: "",
    profileImage: "",
  });
  const [profileMessage, setProfileMessage] = useState("");

  const isAuthenticated = useMemo(() => Boolean(getAuthToken()), []);

  const loadProfile = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getUserProfile();
      setUser(data);
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        profileImage: data.profileImage || "",
      });
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Failed to load profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("Please login to view your profile.");
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const onSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    try {
      setProfileMessage("");
      setIsSavingProfile(true);
      const updated = await updateUserProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim(),
        profileImage: form.profileImage.trim(),
      });
      setUser(updated);
      setProfileMessage("Profile updated successfully.");
    } catch (saveError) {
      setProfileMessage(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRemoveFavorite = async (item: string | UserRecipe) => {
    const id = recipeId(item);
    try {
      setIsMutatingRecipe(id);
      await removeRecipeFromFavorites(id);
      await loadProfile();
    } finally {
      setIsMutatingRecipe(null);
    }
  };

  const handleUnsave = async (item: string | UserRecipe) => {
    const id = recipeId(item);
    try {
      setIsMutatingRecipe(id);
      await unsaveRecipe(id);
      await loadProfile();
    } finally {
      setIsMutatingRecipe(null);
    }
  };

  if (loading) {
    return (
      <main className="w-full mt-32 mb-12 px-4 lg:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-2xl bg-white dark:bg-[var(--color-card)] shadow-sm border border-slate-200 dark:border-white/10 p-12 min-h-[400px]">
          <p className="text-slate-500 dark:text-gray-400 font-medium">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="w-full mt-32 mb-12 px-4 lg:px-6">
        <div className="mx-auto flex flex-col items-center justify-center max-w-7xl rounded-2xl bg-white dark:bg-[var(--color-card)] shadow-sm border border-slate-200 dark:border-white/10 p-12 min-h-[400px]">
          <p className="rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-500/10 px-6 py-4 text-sm font-medium text-red-600 mb-6">
            {error || "Unable to load profile."}
          </p>
          <Link
            href="/auth/login"
            className="rounded-xl bg-[#e74c3c] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#c0392b] hover:shadow-lg"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-white dark:bg-[var(--color-card)] pb-12 pt-32 px-4 lg:px-6">
      <div className="mx-auto w-full max-w-7xl rounded-2xl bg-white dark:bg-[var(--color-card)] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Sidebar (20-25%) */}
        <aside className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 p-6 lg:p-8 flex flex-col gap-8">
          {/* Profile Summary */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-sm bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-gray-500 font-bold text-3xl">
              {form.profileImage ? (
                <Image
                  src={form.profileImage}
                  alt={`${user.firstName} profile`}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-0.5">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#e74c3c] text-white shadow-md shadow-[#e74c3c]/20"
                      : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {tab.label}
                </button>
              );
            })}

            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  window.location.href = "/";
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="h-5 w-5" strokeWidth={2} />
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Right Content Area (80%) */}
        <div className="flex-1 p-6 lg:p-12">
          {activeTab === "profile" && (
            <div className="max-w-2xl animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Profile</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-8">
                Update your personal information and bio.
              </p>
              
              <form onSubmit={onSaveProfile} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="space-y-2 block">
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">First Name</span>
                    <input
                      value={form.firstName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, firstName: event.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-400 dark:text-gray-500 focus:border-[#e74c3c]/50 focus:bg-white focus:ring-4 focus:ring-[#e74c3c]/10"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">Last Name</span>
                    <input
                      value={form.lastName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, lastName: event.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-400 dark:text-gray-500 focus:border-[#e74c3c]/50 focus:bg-white focus:ring-4 focus:ring-[#e74c3c]/10"
                    />
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">Profile Image URL</span>
                  <input
                    value={form.profileImage}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, profileImage: event.target.value }))
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-400 dark:text-gray-500 focus:border-[#e74c3c]/50 focus:bg-white focus:ring-4 focus:ring-[#e74c3c]/10"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">Bio</span>
                  <textarea
                    value={form.bio}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, bio: event.target.value }))
                    }
                    rows={4}
                    placeholder="Tell us about your culinary journey..."
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none transition-all placeholder:text-slate-400 dark:text-gray-500 focus:border-[#e74c3c]/50 focus:bg-white focus:ring-4 focus:ring-[#e74c3c]/10 resize-none"
                  />
                </label>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="rounded-xl bg-[#e74c3c] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#c0392b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  {profileMessage && (
                    <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-lg">
                      {profileMessage}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Favorite Recipes</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-8">
                Recipes you've loved.
              </p>
              
              {user.favoriteRecipes.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <Heart className="mx-auto h-10 w-10 text-slate-300 mb-4" />
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">No favorite recipes yet.</p>
                </div>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {user.favoriteRecipes.map((item) => (
                    <li
                      key={recipeId(item)}
                      className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div className="mb-6">
                        {recipeSlug(item) ? (
                          <Link
                            href={recipeHref(item)}
                            className="text-base font-bold text-white hover:text-[#e74c3c] line-clamp-2 transition-colors leading-tight"
                          >
                            {recipeLabel(item)}
                          </Link>
                        ) : (
                          <span className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {recipeLabel(item)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(item)}
                        disabled={isMutatingRecipe === recipeId(item)}
                        className="self-end text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 hover:text-[#e74c3c] disabled:opacity-50 transition-colors"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Saved Recipes</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-8">
                Recipes you've bookmarked for later.
              </p>

              {user.savedRecipes.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <Bookmark className="mx-auto h-10 w-10 text-slate-300 mb-4" />
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400">No saved recipes.</p>
                </div>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {user.savedRecipes.map((item) => (
                    <li
                      key={recipeId(item)}
                      className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[var(--color-card)] p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div className="mb-6">
                        {recipeSlug(item) ? (
                          <Link
                            href={recipeHref(item)}
                            className="text-base font-bold text-white hover:text-[#e74c3c] line-clamp-2 transition-colors leading-tight"
                          >
                            {recipeLabel(item)}
                          </Link>
                        ) : (
                          <span className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {recipeLabel(item)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnsave(item)}
                        disabled={isMutatingRecipe === recipeId(item)}
                        className="self-end text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 hover:text-amber-500 disabled:opacity-50 transition-colors"
                      >
                        Unsave
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "created" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Created Recipes</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-8">
                Recipes you have authored and published.
              </p>

              {user.createdRecipes.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <ChefHat className="mx-auto h-10 w-10 text-slate-300 mb-4" />
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-4">No created recipes yet.</p>
                  <Link
                    href="/recipes/create"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Create a Recipe
                  </Link>
                </div>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {user.createdRecipes.map((item) => (
                    <li
                      key={recipeId(item)}
                      className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[var(--color-card)] p-5 shadow-sm hover:border-[#e74c3c]/20 transition-all flex flex-col justify-center min-h-[100px]"
                    >
                      {recipeSlug(item) ? (
                        <Link
                          href={recipeHref(item)}
                          className="text-base font-bold text-white hover:text-[#e74c3c] line-clamp-2 transition-colors leading-tight"
                        >
                          {recipeLabel(item)}
                        </Link>
                      ) : (
                        <span className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {recipeLabel(item)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
