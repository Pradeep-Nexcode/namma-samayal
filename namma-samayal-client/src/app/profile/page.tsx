"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Heart,
  Bookmark,
  Star,
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Link as LinkIcon,
  Leaf,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Flame,
  Award,
  Users as UsersIcon,
  CookingPot,
} from "lucide-react";
import {
  getUserProfile,
  removeRecipeFromFavorites,
  unsaveRecipe,
  updateUserProfile,
} from "@/features/auth/services/authApi";
import { getAuthToken } from "@/utils/authToken";
import { logoutUser } from "@/features/auth/services/authApi";
import type { CookingLevel, User, UserRecipe } from "@/types/user";

type TabId = "profile" | "recipes" | "favorites" | "saved" | "settings";

type EditableProfile = {
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: string;
  favoriteCuisine: string;
  cookingLevel: CookingLevel | "";
  specialDish: string;
  location: string;
};

/* ──────────────── Helpers ──────────────── */
function recipeId(value: string | UserRecipe): string {
  return typeof value === "string" ? value : value._id;
}
function recipeLabel(value: string | UserRecipe): string {
  return typeof value === "string" ? value : value.title;
}
function recipeImage(value: string | UserRecipe): string {
  return typeof value === "string" ? "" : value.imageUrl || "";
}
function recipeHref(value: string | UserRecipe): string {
  if (typeof value === "string") return `/recipe/${value}`;
  return `/recipe/${value.slug ?? value._id}`;
}

const COOKING_LEVEL_LABEL: Record<CookingLevel | "", string> = {
  "": "—",
  "beginner": "Beginner 🌱",
  "home-cook": "Home Cook 🍲",
  "intermediate": "Intermediate 🥘",
  "expert": "Expert 🌶️",
  "master": "Tamil Master 👑",
};

/* ──────────────── Decorative SVGs ──────────────── */
function HeartDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      <path
        d="M32 55 C 10 40, 4 25, 12 14 C 19 5, 28 10, 32 18 C 36 10, 45 5, 52 14 C 60 25, 54 40, 32 55 Z"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function TitleSquiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 14" className={className} preserveAspectRatio="none" aria-hidden>
      <path
        d="M2,8 Q 30,1 60,7 T 120,7 T 180,7 T 240,7 T 318,7"
        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      />
    </svg>
  );
}

function LeafSprig({ className = "", flip }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 100 200" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M50 195 Q 47 100, 50 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
      {[[170,1.05,22],[140,1.0,28],[110,0.9,34],[80,0.78,42],[55,0.6,50]].map(([y,s,a],i)=>(
        <g key={i}>
          <g transform={`translate(50, ${y}) rotate(${-a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i*0.04} />
          </g>
          <g transform={`translate(50, ${y}) rotate(${180+a}) scale(${s})`}>
            <path d="M0,0 C 8,-5 22,-5 28,0 C 22,5 8,5 0,0 Z" fill="currentColor" opacity={0.85 - i*0.04} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function ArrowDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 30" className={className} aria-hidden>
      <path d="M5 18 Q 25 6, 50 16 Q 65 22, 72 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 14 L 65 11 M72 14 L 67 19" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CookingPotDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 70" className={className} aria-hidden>
      <path d="M20 14 Q 18 22, 24 28" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M32 10 Q 36 18, 30 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M44 14 Q 46 22, 40 28" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M14 32 L 14 56 Q 14 60, 18 60 L 50 60 Q 54 60, 54 56 L 54 32 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 32 L 58 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 44 C 26 41, 24 38, 28 36 C 30 35, 32 36 33 38 C 34 36, 36 35, 38 36 C 42 38, 40 41, 33 47 Z" fill="#e74c3c" opacity="0.7" />
    </svg>
  );
}

/* ──────────────── Spiral binding ──────────────── */
function SpiralBinding({ offset = "26px" }: { offset?: string }) {
  return (
    <div
      className="absolute top-0 bottom-0 w-7 z-30 hidden lg:flex flex-col items-center justify-evenly py-4 pointer-events-none"
      style={{ left: offset, transform: "translateX(-50%)" }}
      aria-hidden
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="relative">
          <span
            className="block h-4 w-4 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(120,90,40,0.55) 0%, rgba(120,90,40,0.2) 60%, transparent 100%)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            }}
          />
          <span
            className="absolute inset-0 rounded-full border-[2.5px]"
            style={{
              borderColor: "#b8915b",
              borderTopColor: "#d4a76b",
              borderRightColor: "#a47a3f",
              borderBottomColor: "#7f5a28",
              transform: "rotate(-25deg)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Tape strip ──────────────── */
function TapeStrip({
  color = "yellow", className = "", rotate = -4, width = "w-16",
}: {
  color?: "yellow" | "pink" | "blue" | "green";
  className?: string; rotate?: number; width?: string;
}) {
  const bg = color === "pink" ? "rgba(251,213,221,0.85)"
    : color === "blue" ? "rgba(214,233,245,0.85)"
    : color === "green" ? "rgba(214,239,206,0.85)"
    : "rgba(255,243,176,0.85)";
  return (
    <div className={`${width} h-4 ${className}`}
      style={{
        backgroundColor: bg, transform: `rotate(${rotate}deg)`,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
      }} aria-hidden />
  );
}

/* ──────────────── Input class (shared) ──────────────── */
const inputClass =
  "w-full rounded-lg border-2 border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2.5 font-body text-[14px] text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-[#e74c3c] dark:focus:border-[#e74c3c] transition-colors";

/* ──────────────── Field wrapper ──────────────── */
function Field({
  label, icon: Icon, children, className = "",
}: {
  label: string; icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="flex items-center gap-1.5 font-title-hw text-[14px] md:text-[15px] font-bold text-stone-700 dark:text-stone-200 mb-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}

/* ──────────────── Page ──────────────── */
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMutatingRecipe, setIsMutatingRecipe] = useState<string | null>(null);
  const [active, setActive] = useState<TabId>("profile");
  const [profileMessage, setProfileMessage] = useState("");
  const [form, setForm] = useState<EditableProfile>({
    firstName: "", lastName: "", bio: "", profileImage: "",
    favoriteCuisine: "", cookingLevel: "", specialDish: "", location: "",
  });

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
        favoriteCuisine: data.favoriteCuisine || "",
        cookingLevel: (data.cookingLevel as CookingLevel | "") || "",
        specialDish: data.specialDish || "",
        location: data.location || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setProfileMessage("");
      setIsSaving(true);
      const updated = await updateUserProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim(),
        profileImage: form.profileImage.trim(),
        favoriteCuisine: form.favoriteCuisine.trim(),
        cookingLevel: form.cookingLevel || "",
        specialDish: form.specialDish.trim(),
        location: form.location.trim(),
      });
      setUser(updated);
      setProfileMessage("Profile saved! ❤");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFavorite = async (item: string | UserRecipe) => {
    const id = recipeId(item);
    try {
      setIsMutatingRecipe(id);
      await removeRecipeFromFavorites(id);
      await loadProfile();
    } finally { setIsMutatingRecipe(null); }
  };

  const handleUnsave = async (item: string | UserRecipe) => {
    const id = recipeId(item);
    try {
      setIsMutatingRecipe(id);
      await unsaveRecipe(id);
      await loadProfile();
    } finally { setIsMutatingRecipe(null); }
  };

  /* ─── Stats + achievements (derived) ─── */
  const createdCount = user?.createdRecipes?.length ?? 0;
  const favoritesCount = user?.favoriteRecipes?.length ?? 0;
  const savedCount = user?.savedRecipes?.length ?? 0;
  const followersCount = 0; // not in current data model; shown as placeholder
  const achievements = useMemo(() => {
    const list: { key: string; title: string; sub: string; unlocked: boolean; icon: React.ComponentType<{ className?: string }>; tint: string; }[] = [
      { key: "first",   title: "First Recipe",    sub: "Created 1 recipe",        unlocked: createdCount   >= 1,  icon: ChefHat, tint: "bg-amber-100 text-amber-700 border-amber-200" },
      { key: "rising",  title: "Rising Chef",     sub: "Created 10 recipes",      unlocked: createdCount   >= 10, icon: CookingPot, tint: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      { key: "lover",   title: "Food Lover",      sub: "Saved 25 recipes",        unlocked: savedCount     >= 25, icon: Heart, tint: "bg-rose-100 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40" },
      { key: "star",    title: "Community Star",  sub: "50+ followers",           unlocked: followersCount >= 50, icon: Star, tint: "bg-violet-100 text-violet-700 border-violet-200" },
    ];
    return list;
  }, [createdCount, savedCount]);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (loading) {
    return (
      <main className="paper-bg min-h-[60vh] pt-28 pb-12 flex items-center justify-center">
        <p className="font-note-hw text-stone-500 dark:text-stone-400">Loading your kitchen notebook…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="paper-bg min-h-screen pt-28 pb-12 mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 px-6 py-5 text-rose-700 dark:text-rose-300 font-body text-sm">
          {error || "Unable to load profile."}
        </div>
        <Link
          href="/auth/login"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#e74c3c] text-white px-6 py-2.5 font-title-hw text-[15px] font-bold hover:bg-[#c0392b] transition-colors"
        >
          Go to Login
        </Link>
      </main>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <main className="paper-bg font-ui text-stone-900 dark:text-stone-50 pt-28 pb-12 overflow-x-hidden">
      <div className="relative mx-auto w-full max-w-7xl px-3 lg:px-6">
        {/* ─── Notebook shell ─── */}
        <div
          className="relative rounded-[16px] border-4 shadow-[0_20px_50px_-18px_rgba(120,90,40,0.5)]"
          style={{ borderColor: "#8c6938", backgroundColor: "#8c6938" }}
        >
          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] min-h-[680px] rounded-[4px] overflow-hidden">
            <SpiralBinding />

            {/* ─── LEFT PAGE: Chef Identity Card ─── */}
            <aside className="np-page-kraft relative px-5 md:px-7 py-8 md:py-10 lg:pl-14 lg:pr-7">
              {/* Polaroid */}
              <div className="relative flex justify-center mt-2">
                <TapeStrip color="pink" className="absolute -top-1 left-10 z-30" rotate={-12} width="w-16" />
                <TapeStrip color="yellow" className="absolute -top-1 right-14 z-30" rotate={10} width="w-16" />

                <div
                  className="relative bg-white p-3 pb-10 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.4)]"
                  style={{ transform: "rotate(-2deg)" }}
                >
                  <div className="relative w-[180px] h-[180px] md:w-[200px] md:h-[200px] overflow-hidden bg-stone-200">
                    {user.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.profileImage} alt={fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100">
                        <span className="font-title-hw text-[44px] font-bold text-stone-600 dark:text-stone-300">{initials}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Heart doodle next to polaroid */}
                <span className="absolute top-1/2 -translate-y-1/2 -left-2 h-5 w-6 text-rose-500 hidden md:block" aria-hidden>
                  <HeartDoodle className="h-full w-full" />
                </span>

                {/* Tiny leaves on the right of polaroid */}
                <div className="absolute top-4 -right-2 h-20 w-12 text-lime-700 opacity-80 pointer-events-none hidden md:block" style={{ transform: "rotate(20deg)" }} aria-hidden>
                  <LeafSprig className="h-full w-full" />
                </div>
              </div>

              {/* Name */}
              <div className="text-center mt-4">
                <h2 className="font-title-hw text-[28px] md:text-[32px] font-bold text-stone-900 dark:text-stone-50 leading-tight">
                  {fullName || user.username}
                </h2>
                <p className="font-body text-[14px] text-stone-600 dark:text-stone-300 mt-0.5">
                  @{user.username}
                </p>
              </div>

              {/* Home Chef tape badge */}
              <div className="flex justify-center mt-3">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                  style={{
                    backgroundColor: "rgba(255, 243, 176, 0.95)",
                    backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                    transform: "rotate(-1.5deg)",
                  }}
                >
                  <ChefHat className="h-3.5 w-3.5 text-amber-700" />
                  <span className="font-title-hw text-[14px] font-bold text-amber-900">
                    {COOKING_LEVEL_LABEL[form.cookingLevel || "home-cook"]}
                  </span>
                  <Star className="h-3 w-3 text-rose-500 fill-current" />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-7 grid grid-cols-3 gap-2 px-2">
                {[
                  { icon: ChefHat, label: "Recipes", value: createdCount },
                  { icon: Heart, label: "Saved", value: savedCount, color: "text-rose-500" },
                  { icon: UsersIcon, label: "Followers", value: followersCount },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Icon className={`h-4 w-4 ${s.color || "text-stone-500 dark:text-stone-400"}`} />
                      </div>
                      <p className="font-title-hw text-[20px] font-bold text-stone-900 dark:text-stone-50 leading-none">
                        {s.value}
                      </p>
                      <p className="font-body text-[11.5px] text-stone-600 dark:text-stone-300 mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-stone-300/70 dark:border-white/[0.06] my-6" />

              {/* Vertical nav */}
              <nav className="space-y-1">
                {[
                  { id: "profile" as TabId, label: "Edit Profile", icon: UserIcon },
                  { id: "recipes" as TabId, label: "My Recipes", icon: ChefHat },
                  { id: "favorites" as TabId, label: "Favorite Recipes", icon: Heart },
                  { id: "saved" as TabId, label: "Saved Recipes", icon: Bookmark },
                  { id: "settings" as TabId, label: "Settings", icon: SettingsIcon },
                ].map((tab) => {
                  const isActive = active === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActive(tab.id)}
                      className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left ${
                        isActive
                          ? "bg-rose-50/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/40 shadow-sm"
                          : "hover:bg-white/40"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-rose-600 dark:text-rose-400" : "text-stone-500 dark:text-stone-400"}`} />
                      <span className={`font-title-hw text-[15px] font-bold ${isActive ? "text-rose-700 dark:text-rose-300" : "text-stone-700 dark:text-stone-200"}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-dashed border-stone-300/70 dark:border-white/[0.06] my-4" />

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  window.location.href = "/";
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-rose-50/60 dark:hover:bg-rose-500/15 transition-colors text-left"
              >
                <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span className="font-title-hw text-[15px] font-bold text-rose-700 dark:text-rose-300">Logout</span>
              </button>

              {/* Red checkered cloth corner (decorative, bottom-left of left page) */}
              <div
                className="hidden lg:block absolute -bottom-2 -left-2 h-32 w-32 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(220,80,80,0.6) 0 1px, transparent 1px 12px), repeating-linear-gradient(90deg, rgba(220,80,80,0.6) 0 1px, transparent 1px 12px), repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 12px)",
                  backgroundColor: "rgba(254, 252, 245, 0.5)",
                  transform: "rotate(-6deg)",
                  borderRadius: "8px 24px 8px 24px",
                  clipPath: "polygon(0 50%, 30% 100%, 100% 100%, 100% 50%, 70% 0, 0 0)",
                  opacity: 0.4,
                }}
                aria-hidden
              />
            </aside>

            {/* ─── RIGHT PAGE: Tab content ─── */}
            <div className="np-page relative px-5 md:px-8 lg:px-10 py-9 md:py-11 lg:pl-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {active === "profile" && (
                    <EditProfileTab
                      form={form} setForm={setForm}
                      onSave={onSave} isSaving={isSaving}
                      profileMessage={profileMessage}
                      username={user.username}
                    />
                  )}
                  {active === "recipes" && (
                    <RecipeListTab
                      title="My Recipes"
                      subtitle="Recipes you've shared with the world."
                      emptyHint="Share your first family recipe — your kitchen story starts here."
                      items={user.createdRecipes}
                      action={null}
                      onItemAction={() => {}}
                      isMutatingRecipe={isMutatingRecipe}
                    />
                  )}
                  {active === "favorites" && (
                    <RecipeListTab
                      title="Favorite Recipes"
                      subtitle="The dishes you can't stop coming back to."
                      emptyHint="No favorites yet — tap the heart on any recipe you love."
                      items={user.favoriteRecipes}
                      action="unfavorite"
                      onItemAction={handleRemoveFavorite}
                      isMutatingRecipe={isMutatingRecipe}
                    />
                  )}
                  {active === "saved" && (
                    <RecipeListTab
                      title="Saved Recipes"
                      subtitle="Bookmarked for your next cooking adventure."
                      emptyHint="No saved recipes yet — tap the bookmark on any recipe to add it here."
                      items={user.savedRecipes}
                      action="unsave"
                      onItemAction={handleUnsave}
                      isMutatingRecipe={isMutatingRecipe}
                    />
                  )}
                  {active === "settings" && (
                    <SettingsTab user={user} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Chef Note sticky (inside right page, top-right) */}
              <div
                className="hidden xl:block absolute top-8 right-6 z-20 pointer-events-none"
                style={{ transform: "rotate(2deg)" }}
                aria-hidden
              >
                <TapeStrip color="green" className="absolute -top-1 left-1/2 -translate-x-1/2" rotate={-5} width="w-12" />
                <div
                  className="relative px-4 pt-5 pb-4 w-[180px] shadow-[0_10px_22px_-8px_rgba(180,140,0,0.4)]"
                  style={{
                    backgroundColor: "#fff3b0",
                    backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                  }}
                >
                  <div className="flex items-center gap-1 mb-1.5">
                    <p className="font-title-hw text-[16px] font-bold text-amber-900">Chef Note</p>
                    <span className="h-3.5 w-4 text-rose-500"><HeartDoodle className="h-full w-full" /></span>
                  </div>
                  <p className="font-note-hw text-[13.5px] leading-snug text-amber-950">
                    Every great recipe has a story. Share yours with the world! 👨‍🍳
                  </p>
                  <div className="mt-2 -mr-2 text-stone-500 dark:text-stone-400 flex justify-end">
                    <ArrowDoodle className="h-4 w-12" />
                  </div>
                </div>
              </div>

              {/* Cooking pot doodle bottom-right of right page */}
              <div className="hidden md:block absolute bottom-6 right-10 h-16 w-20 text-stone-400 dark:text-stone-500 pointer-events-none" aria-hidden>
                <CookingPotDoodle className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom: Kitchen Journey + Achievements ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 mt-7">
          {/* Kitchen Journey */}
          <section className="rounded-2xl border border-stone-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/5 shadow-[0_6px_18px_-10px_rgba(120,90,40,0.18)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <h3 className="font-title-hw text-[20px] font-bold text-stone-900 dark:text-stone-50">
                Your Kitchen Journey
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: createdCount, label: "Recipes Created", sub: "Keep cooking! 📖", bg: "#dff0d8", border: "#b5d7a8", text: "#1a5e2a", icon: "📗" },
                { value: favoritesCount, label: "Favorite Recipes", sub: "Recipes you love ❤", bg: "#fce4e8", border: "#f1b4c1", text: "#7a1133", icon: "❤" },
                { value: savedCount, label: "Saved Recipes", sub: "Your collection 📑", bg: "#fff3b0", border: "#e8c878", text: "#6a4f00", icon: "📌" },
                { value: unlockedCount, label: "Achievements", sub: "You're doing great! ⭐", bg: "#ece1f6", border: "#c9b6dd", text: "#3a1a6e", icon: "🏆" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl p-3 border text-center"
                  style={{ backgroundColor: card.bg, borderColor: card.border }}
                >
                  <p className="text-[20px]" aria-hidden>{card.icon}</p>
                  <p className="font-title-hw text-[24px] md:text-[28px] font-bold leading-none mt-1" style={{ color: card.text }}>
                    {card.value}
                  </p>
                  <p className="font-title-hw text-[12px] font-bold leading-tight mt-1" style={{ color: card.text }}>
                    {card.label}
                  </p>
                  <p className="font-note-hw text-[11.5px] leading-tight mt-1" style={{ color: card.text, opacity: 0.75 }}>
                    {card.sub}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Achievements */}
          <section className="rounded-2xl border border-stone-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/5 shadow-[0_6px_18px_-10px_rgba(120,90,40,0.18)] p-5 relative">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Award className="h-4 w-4 text-amber-600" />
                <h3 className="font-title-hw text-[20px] font-bold text-stone-900 dark:text-stone-50 truncate">
                  Achievements
                </h3>
                <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
              </div>
              <Link
                href="#"
                className="inline-flex items-center gap-1 font-title-hw text-[14px] font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors shrink-0"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {achievements.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.key} className="text-center min-w-0">
                    <div
                      className={`mx-auto h-14 w-14 md:h-16 md:w-16 rounded-full border-2 flex items-center justify-center mb-2 ${
                        a.unlocked ? a.tint : "bg-stone-100 dark:bg-white/5 text-stone-300 dark:text-stone-600 border-stone-200 dark:border-white/[0.06]"
                      }`}
                      style={a.unlocked ? {
                        clipPath:
                          "polygon(50% 0, 90% 25%, 90% 75%, 50% 100%, 10% 75%, 10% 25%)",
                        borderRadius: 0,
                      } : { borderRadius: "9999px" }}
                    >
                      <Icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <p className="font-title-hw text-[12.5px] md:text-[13px] font-bold leading-tight text-stone-900 dark:text-stone-50 line-clamp-1">
                      {a.title}
                    </p>
                    <p className="font-body text-[11px] text-stone-500 dark:text-stone-400 leading-tight line-clamp-2 mt-0.5">
                      {a.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ──────────────── TAB: Edit Profile ──────────────── */
function EditProfileTab({
  form, setForm, onSave, isSaving, profileMessage, username,
}: {
  form: EditableProfile;
  setForm: React.Dispatch<React.SetStateAction<EditableProfile>>;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
  profileMessage: string;
  username: string;
}) {
  return (
    <form onSubmit={onSave} className="space-y-5">
      {/* Header */}
      <div className="relative inline-block">
        <h2 className="flex items-center gap-2 font-title-hw text-[26px] md:text-[30px] font-bold text-stone-900 dark:text-stone-50 leading-tight">
          <ChefHat className="h-5 w-5 text-amber-700" />
          Edit Your Profile
        </h2>
        <span className="absolute left-7 -bottom-1 h-2.5 w-[min(100%,260px)] text-[#e74c3c]" aria-hidden>
          <TitleSquiggle className="h-full w-full" />
        </span>
      </div>
      <p className="font-body text-[14px] text-stone-700 dark:text-stone-200 mt-2">
        Update your personal details and tell us more about your culinary journey.
      </p>

      {/* Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First Name" icon={UserIcon}>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              placeholder="Pradeep"
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>
        <Field label="Last Name" icon={UserIcon}>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              placeholder="M"
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>
      </div>

      {/* Username (read) + Profile Image URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Username" icon={UserIcon}>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              value={`@${username}`}
              disabled
              className={`${inputClass} pl-9 bg-stone-100/70 cursor-not-allowed`}
              readOnly
            />
          </div>
        </Field>
        <Field label="Profile Image URL" icon={LinkIcon}>
          <div className="relative">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              value={form.profileImage}
              onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))}
              placeholder="https://…"
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>
      </div>

      {/* Bio */}
      <Field label="Bio" icon={Leaf}>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          rows={3}
          placeholder="A home cook who loves exploring traditional Tamil recipes and sharing the joy of homemade food."
          className={`${inputClass} resize-y`}
        />
      </Field>

      {/* Favorite Cuisine + Cooking Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Favorite Cuisine" icon={Flame}>
          <div className="relative">
            <Flame className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <select
              value={form.favoriteCuisine}
              onChange={(e) => setForm((p) => ({ ...p, favoriteCuisine: e.target.value }))}
              className={`${inputClass} pl-9 appearance-none`}
            >
              <option value="">Select cuisine</option>
              <option value="Tamil Nadu Cuisine">Tamil Nadu Cuisine</option>
              <option value="Chettinad">Chettinad</option>
              <option value="Kongu Nadu">Kongu Nadu</option>
              <option value="Madurai">Madurai</option>
              <option value="South Indian">South Indian</option>
              <option value="North Indian">North Indian</option>
              <option value="Continental">Continental</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 dark:text-stone-400 pointer-events-none" />
          </div>
        </Field>
        <Field label="Cooking Level" icon={ChefHat}>
          <div className="relative">
            <ChefHat className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <select
              value={form.cookingLevel}
              onChange={(e) => setForm((p) => ({ ...p, cookingLevel: e.target.value as CookingLevel | "" }))}
              className={`${inputClass} pl-9 appearance-none`}
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="home-cook">Home Cook</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
              <option value="master">Tamil Master</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500 dark:text-stone-400 pointer-events-none" />
          </div>
        </Field>
      </div>

      {/* Special Dish + Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Special Dish" icon={Star}>
          <div className="relative">
            <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              value={form.specialDish}
              onChange={(e) => setForm((p) => ({ ...p, specialDish: e.target.value }))}
              placeholder="Chicken Biryani"
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>
        <Field label="Location" icon={Leaf}>
          <div className="relative">
            <Leaf className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Coimbatore, Tamil Nadu, India"
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>
      </div>

      {/* Save button + reminder */}
      <div className="flex flex-wrap items-center gap-3 pt-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#e74c3c] text-white px-5 py-2.5 font-title-hw text-[15px] font-bold hover:bg-[#c0392b] transition-colors shadow-[0_6px_14px_-6px_rgba(231,76,60,0.5)] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Heart className="h-4 w-4 fill-current" />
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
        <span className="h-5 w-12 text-stone-500 dark:text-stone-400" aria-hidden>
          <ArrowDoodle className="h-full w-full" />
        </span>
        <p className="font-note-hw text-[14px] text-stone-600 dark:text-stone-300">
          Don&apos;t forget to save!
        </p>
      </div>

      {profileMessage && (
        <p className={`font-body text-[13px] mt-2 ${profileMessage.includes("Failed") ? "text-rose-600 dark:text-rose-400" : "text-emerald-700"}`}>
          {profileMessage}
        </p>
      )}
    </form>
  );
}

/* ──────────────── TAB: Recipe list ──────────────── */
function RecipeListTab({
  title, subtitle, emptyHint, items, action, onItemAction, isMutatingRecipe,
}: {
  title: string;
  subtitle: string;
  emptyHint: string;
  items: Array<string | UserRecipe>;
  action: "unfavorite" | "unsave" | null;
  onItemAction: (item: string | UserRecipe) => void;
  isMutatingRecipe: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="relative inline-block">
        <h2 className="font-title-hw text-[26px] md:text-[30px] font-bold text-stone-900 dark:text-stone-50 leading-tight">
          {title}
        </h2>
        <span className="absolute left-0 -bottom-1 h-2.5 w-full text-[#e74c3c]" aria-hidden>
          <TitleSquiggle className="h-full w-full" />
        </span>
      </div>
      <p className="font-body text-[14px] text-stone-700 dark:text-stone-200">{subtitle}</p>

      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-300 dark:border-white/10 px-6 py-10 text-center">
          <p className="font-note-hw text-[15px] text-stone-500 dark:text-stone-400">{emptyHint}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => {
            const id = recipeId(item);
            const label = recipeLabel(item) || "Recipe";
            const image = recipeImage(item);
            const mutating = isMutatingRecipe === id;
            return (
              <li
                key={id}
                className="rounded-xl border border-stone-200 dark:border-white/[0.06] bg-white/70 dark:bg-white/5 shadow-[0_2px_8px_-4px_rgba(120,90,40,0.18)] p-3 flex items-center gap-3"
              >
                {/* Thumb */}
                <Link
                  href={recipeHref(item)}
                  className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-white/5"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-400 dark:text-stone-500">
                      <ChefHat className="h-5 w-5" />
                    </div>
                  )}
                </Link>
                {/* Name */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={recipeHref(item)}
                    className="font-title-hw text-[15px] font-bold text-stone-900 dark:text-stone-50 hover:text-[#e74c3c] transition-colors line-clamp-1"
                  >
                    {label}
                  </Link>
                  <Link
                    href={recipeHref(item)}
                    className="inline-flex items-center gap-1 font-body text-[12px] text-stone-500 dark:text-stone-400 hover:text-[#e74c3c] transition-colors"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                {/* Action */}
                {action && (
                  <button
                    type="button"
                    onClick={() => onItemAction(item)}
                    disabled={mutating}
                    className="inline-flex items-center gap-1.5 rounded-md border-2 border-dashed border-stone-300 dark:border-white/10 hover:border-rose-400 text-stone-600 dark:text-stone-300 hover:text-rose-600 px-3 py-1.5 font-body text-[12px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {action === "unfavorite" ? <Heart className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                    {mutating ? "…" : "Remove"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ──────────────── TAB: Settings ──────────────── */
function SettingsTab({ user }: { user: User }) {
  return (
    <div className="space-y-5">
      <div className="relative inline-block">
        <h2 className="font-title-hw text-[26px] md:text-[30px] font-bold text-stone-900 dark:text-stone-50 leading-tight">
          Settings
        </h2>
        <span className="absolute left-0 -bottom-1 h-2.5 w-full text-[#e74c3c]" aria-hidden>
          <TitleSquiggle className="h-full w-full" />
        </span>
      </div>
      <p className="font-body text-[14px] text-stone-700 dark:text-stone-200">
        Account info and preferences.
      </p>

      <dl className="space-y-2 rounded-xl border border-stone-200 dark:border-white/[0.06] bg-white/70 dark:bg-white/5 p-4">
        {[
          { label: "Username", value: `@${user.username}` },
          { label: "Email", value: user.email },
          { label: "Member since", value: new Date(user.createdAt).toLocaleDateString() },
          { label: "Role", value: user.role },
          { label: "Language", value: user.language === "ta" ? "Tamil" : "English" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between font-body text-[13.5px] py-1.5 border-b last:border-0 border-dashed border-stone-200 dark:border-white/[0.06]">
            <dt className="text-stone-600 dark:text-stone-300">{row.label}</dt>
            <dd className="font-bold text-stone-900 dark:text-stone-50 capitalize">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
