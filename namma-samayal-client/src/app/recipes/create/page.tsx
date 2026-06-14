"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Save,
  Send,
  X,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileText,
  Leaf,
  Flame,
  Tag as TagIcon,
  Eye,
  Camera,
  Heart,
  Users,
  Clock,
  BarChart3,
  Utensils,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { getCategories, getSubcategoriesByParent } from "@/features/category/services/categoryApi";
import { getIngredients } from "@/features/ingredient/services/ingredientApi";
import { createRecipe } from "@/features/recipe/services/recipeApi";
import { useLang } from "@/contexts/LanguageContext";
import type { Category } from "@/types/category";
import type { Ingredient } from "@/types/ingredient";
import type { RecipeCreateInput, RecipeDifficulty, RecipeSource } from "@/types/recipe";

/* ──────────────── Types ──────────────── */
type IngredientRow = { ingredient: string; quantity: string; unit: string };
type StepRow = { step: number; en: string; ta: string; minutes?: string };

type StepKey =
  | "basic"
  | "description"
  | "ingredients"
  | "steps"
  | "metadata"
  | "preview";

const STEPS: { key: StepKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "basic", label: "Basic Info", icon: ClipboardList },
  { key: "description", label: "Description", icon: FileText },
  { key: "ingredients", label: "Ingredients", icon: Leaf },
  { key: "steps", label: "Cooking Steps", icon: Flame },
  { key: "metadata", label: "Metadata", icon: TagIcon },
  { key: "preview", label: "Preview & Publish", icon: Eye },
];

const DRAFT_KEY = "ns_recipe_draft_v1";

/* ──────────────── Inline SVG bits ──────────────── */
function HeartDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden>
      <path
        d="M32 55 C 10 40, 4 25, 12 14 C 19 5, 28 10, 32 18 C 36 10, 45 5, 52 14 C 60 25, 54 40, 32 55 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmileyDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8 14 Q 12 17, 16 14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
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

/* Section-label component (yellow/pink tape badge with optional heart) */
function SectionLabel({
  children, color = "yellow", heart = true, className = "",
}: {
  children: React.ReactNode;
  color?: "yellow" | "pink" | "blue" | "green";
  heart?: boolean;
  className?: string;
}) {
  const bg = color === "pink" ? "rgba(251, 213, 221, 0.9)"
    : color === "blue" ? "rgba(214, 233, 245, 0.9)"
    : color === "green" ? "rgba(214, 239, 206, 0.9)"
    : "rgba(255, 243, 176, 0.9)";
  return (
    <div className={`relative flex items-center gap-2 mb-4 ${className}`}>
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
        style={{
          backgroundColor: bg,
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
          transform: "rotate(-1.5deg)",
        }}
      >
        <span className="font-title-hw text-[17px] font-bold text-stone-900 dark:text-stone-50">
          {children}
        </span>
      </div>
      {heart && (
        <span className="h-4 w-5 text-rose-500" aria-hidden>
          <HeartDoodle className="h-full w-full" />
        </span>
      )}
    </div>
  );
}

/* Field wrapper with Patrick Hand label */
function Field({
  label, optional = false, required = false, children, className = "",
}: {
  label: string; optional?: boolean; required?: boolean;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="block font-title-hw text-[14px] md:text-[15px] font-bold text-stone-700 dark:text-stone-200 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
        {optional && (
          <span className="font-body text-[11.5px] font-medium text-stone-500 dark:text-stone-400 ml-1.5">(Optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

/* Cream paper input */
const inputClass =
  "w-full rounded-lg border-2 border-stone-200 dark:border-white/[0.06] bg-white/70 dark:bg-white/5 px-3.5 py-2.5 font-body text-[14px] text-stone-900 dark:text-stone-50 placeholder-stone-400 outline-none focus:border-[#e74c3c] transition-colors";

/* ──────────────── Page ──────────────── */
export default function CreateRecipePage() {
  const router = useRouter();
  const { lf } = useLang();

  const [active, setActive] = useState<StepKey>("basic");

  // Data lookups
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<Ingredient[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Form state
  const [dishNameEn, setDishNameEn] = useState("");
  const [dishNameTa, setDishNameTa] = useState("");
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTa, setDescriptionTa] = useState("");
  const [specialityEn, setSpecialityEn] = useState("");
  const [specialityTa, setSpecialityTa] = useState("");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>("medium");
  const [source, setSource] = useState<RecipeSource>("manual");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ ingredient: "", quantity: "", unit: "" }]);
  const [steps, setSteps] = useState<StepRow[]>([{ step: 1, en: "", ta: "" }]);

  /* Restore draft once on mount */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Record<string, unknown>;
      if (typeof d.dishNameEn === "string") setDishNameEn(d.dishNameEn);
      if (typeof d.dishNameTa === "string") setDishNameTa(d.dishNameTa);
      if (typeof d.title === "string") setTitle(d.title);
      if (typeof d.country === "string") setCountry(d.country);
      if (typeof d.stateName === "string") setStateName(d.stateName);
      if (typeof d.region === "string") setRegion(d.region);
      if (typeof d.city === "string") setCity(d.city);
      if (typeof d.descriptionEn === "string") setDescriptionEn(d.descriptionEn);
      if (typeof d.descriptionTa === "string") setDescriptionTa(d.descriptionTa);
      if (typeof d.specialityEn === "string") setSpecialityEn(d.specialityEn);
      if (typeof d.specialityTa === "string") setSpecialityTa(d.specialityTa);
      if (typeof d.difficulty === "string") setDifficulty(d.difficulty as RecipeDifficulty);
      if (typeof d.source === "string") setSource(d.source as RecipeSource);
      if (typeof d.categoryId === "string") setCategoryId(d.categoryId);
      if (typeof d.subCategoryId === "string") setSubCategoryId(d.subCategoryId);
      if (typeof d.cookingTime === "string") setCookingTime(d.cookingTime);
      if (typeof d.servings === "string") setServings(d.servings);
      if (typeof d.tags === "string") setTags(d.tags);
      if (typeof d.imageUrl === "string") setImageUrl(d.imageUrl);
      if (Array.isArray(d.ingredients)) setIngredients(d.ingredients as IngredientRow[]);
      if (Array.isArray(d.steps)) setSteps(d.steps as StepRow[]);
    } catch {
      /* ignore corrupt drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Load categories + ingredients once */
  useEffect(() => {
    (async () => {
      try {
        setLoadingOptions(true);
        const [cats, ings] = await Promise.all([
          getCategories({ level: 0, limit: 100 }),
          getIngredients({ page: 1, limit: 200 }),
        ]);
        setCategories(cats);
        setIngredientOptions(ings.data);
      } catch {
        setError("Failed to load form options. Please refresh.");
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, []);

  /* Cascade subcategories */
  useEffect(() => {
    if (!categoryId) { setSubCategories([]); setSubCategoryId(""); return; }
    (async () => {
      try {
        setSubCategoriesLoading(true);
        setSubCategories(await getSubcategoriesByParent(categoryId));
      } catch {
        setSubCategories([]);
      } finally {
        setSubCategoriesLoading(false);
      }
    })();
  }, [categoryId]);

  /* Image preview from file */
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  /* Save draft */
  const saveDraft = useCallback(() => {
    try {
      const draft = {
        dishNameEn, dishNameTa, title, country, stateName, region, city,
        descriptionEn, descriptionTa, specialityEn, specialityTa,
        difficulty, source, categoryId, subCategoryId,
        cookingTime, servings, tags, imageUrl, ingredients, steps,
      };
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedAt(new Date());
    } catch {
      /* quota or no storage — silently ignore */
    }
  }, [
    dishNameEn, dishNameTa, title, country, stateName, region, city,
    descriptionEn, descriptionTa, specialityEn, specialityTa,
    difficulty, source, categoryId, subCategoryId,
    cookingTime, servings, tags, imageUrl, ingredients, steps,
  ]);

  /* Ingredient + step mutators */
  const addIngredient = () =>
    setIngredients((p) => [...p, { ingredient: "", quantity: "", unit: "" }]);
  const removeIngredient = (i: number) =>
    setIngredients((p) => p.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, k: keyof IngredientRow, v: string) =>
    setIngredients((p) => p.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const addStep = () =>
    setSteps((p) => [...p, { step: p.length + 1, en: "", ta: "" }]);
  const removeStep = (i: number) =>
    setSteps((p) => p.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, step: idx + 1 })));
  const updateStep = (i: number, k: keyof StepRow, v: string) =>
    setSteps((p) => p.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  /* Derived data */
  const ingredientMap = useMemo(() => {
    const m = new Map<string, Ingredient>();
    ingredientOptions.forEach((i) => m.set(i._id, i));
    return m;
  }, [ingredientOptions]);

  const validIngredients = ingredients.filter((i) => i.ingredient);
  const validSteps = steps.filter((s) => s.en.trim());

  const stepIndex = STEPS.findIndex((s) => s.key === active);
  const stepCompletion: Record<StepKey, boolean> = {
    basic: Boolean(dishNameEn.trim() && country.trim()),
    description: Boolean(descriptionEn.trim()),
    ingredients: validIngredients.length > 0,
    steps: validSteps.length > 0,
    metadata: Boolean(categoryId),
    preview: false,
  };

  const goPrev = () => stepIndex > 0 && setActive(STEPS[stepIndex - 1].key);
  const goNext = () => stepIndex < STEPS.length - 1 && setActive(STEPS[stepIndex + 1].key);

  /* Submit */
  const onPublish = async () => {
    setError("");
    if (!dishNameEn.trim()) { setError("Dish name (English) is required."); setActive("basic"); return; }
    if (!country.trim()) { setError("Country is required."); setActive("basic"); return; }
    if (!descriptionEn.trim()) { setError("Description (English) is required."); setActive("description"); return; }
    if (validIngredients.length === 0) { setError("Add at least one ingredient."); setActive("ingredients"); return; }
    if (validSteps.length === 0) { setError("Add at least one cooking step."); setActive("steps"); return; }

    const payload: RecipeCreateInput = {
      dishName: { en: dishNameEn.trim(), ta: dishNameTa.trim() || undefined },
      title: title.trim() || undefined,
      location: {
        country: country.trim(),
        state: stateName.trim() || undefined,
        region: region.trim() || undefined,
        city: city.trim() || undefined,
      },
      description: { en: descriptionEn.trim(), ta: descriptionTa.trim() || undefined },
      ingredients: validIngredients.map((i) => ({
        ingredient: i.ingredient,
        quantity: i.quantity || undefined,
        unit: i.unit || undefined,
      })),
      steps: validSteps.map((s, idx) => ({
        step: idx + 1,
        description: { en: s.en.trim(), ta: s.ta.trim() || undefined },
      })),
      speciality:
        specialityEn.trim() || specialityTa.trim()
          ? { en: specialityEn.trim() || dishNameEn.trim(), ta: specialityTa.trim() || undefined }
          : undefined,
      difficulty,
      source,
      category: categoryId || undefined,
      subCategory: subCategoryId || undefined,
      cookingTime: cookingTime ? Number(cookingTime) : undefined,
      servings: servings ? Number(servings) : undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrl: imageUrl.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      const created = await createRecipe(payload, imageFile);
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      router.push(`/recipe/${created.slug ?? created._id}`);
    } catch {
      setError("Failed to create recipe. Please check your data and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Preview-side stats */
  const heroTitle = title.trim() || dishNameEn.trim() || "Recipe Name";
  const cuisineLabel = categoryId
    ? lf(categories.find((c) => c._id === categoryId)?.name) || "—"
    : "—";

  return (
    <main className="paper-bg min-h-screen font-ui text-stone-900 dark:text-stone-50 pt-28 pb-12 overflow-x-hidden">
      <div className="relative mx-auto w-full max-w-7xl px-3 lg:px-6">
        {/* Curry leaves at far left + right (decorative) */}
        <div className="hidden xl:block absolute top-32 -left-2 h-44 w-16 text-lime-700 opacity-70 pointer-events-none" style={{ transform: "rotate(-12deg)" }} aria-hidden>
          <LeafSprig className="h-full w-full" />
        </div>
        <div className="hidden xl:block absolute top-32 -right-2 h-44 w-16 text-lime-700 opacity-70 pointer-events-none" style={{ transform: "rotate(14deg)" }} aria-hidden>
          <LeafSprig className="h-full w-full" flip />
        </div>

        {/* Notebook shell */}
        <div
          className="relative rounded-[16px] border-4 shadow-[0_20px_50px_-18px_rgba(120,90,40,0.5)]"
          style={{ borderColor: "#8c6938", backgroundColor: "#8c6938" }}
        >
          <div className="np-page relative rounded-[4px] overflow-hidden">
            {/* Close X */}
            <Link
              href="/recipes"
              aria-label="Cancel and go back to recipes"
              className="absolute top-3 right-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-900 transition-colors shadow-md"
            >
              <X className="h-4 w-4" />
            </Link>

            {/* HEADER */}
            <div className="px-6 md:px-10 pt-7 md:pt-9 pb-3 relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-rose-100 text-stone-700 dark:text-stone-200 border border-amber-200 shadow-sm shrink-0">
                    <ChefHat className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <h1 className="font-title-hw text-[28px] md:text-[34px] font-bold text-stone-900 dark:text-stone-50 leading-tight">
                      Create a New Recipe
                    </h1>
                    <p className="font-note-hw text-[14px] text-stone-600 dark:text-stone-300 -mt-0.5">
                      Share your family recipe with the world{" "}
                      <span className="text-rose-500">❤</span>
                    </p>
                  </div>
                </div>

                {/* Top-right action buttons */}
                <div className="flex items-center gap-2 shrink-0 mr-12">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="relative inline-flex items-center gap-2 px-4 py-2.5 font-title-hw text-[14px] font-bold text-amber-900 shadow-[0_4px_10px_-4px_rgba(180,140,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                    style={{
                      backgroundColor: "rgba(255, 243, 176, 0.95)",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 2px, transparent 2px 7px)",
                      transform: "rotate(-1deg)",
                    }}
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={onPublish}
                    disabled={isSubmitting || loadingOptions}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#e74c3c] text-white px-4 py-2.5 font-title-hw text-[14px] font-bold hover:bg-[#c0392b] transition-colors shadow-[0_6px_14px_-6px_rgba(231,76,60,0.5)] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Publishing…" : "Publish Recipe"}
                  </button>
                </div>
              </div>

              {savedAt && (
                <p className="font-body text-[11.5px] text-emerald-700 mt-2 ml-15">
                  ✓ Draft saved {savedAt.toLocaleTimeString()}
                </p>
              )}

              {error && (
                <div className="mt-3 rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-500/15 px-3 py-2 font-body text-[13px] text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_300px] gap-5 px-4 md:px-6 pb-24 pt-3">
              {/* ─── LEFT: progress sidebar ─── */}
              <aside className="relative">
                <p className="font-title-hw text-[13px] font-black uppercase tracking-[0.18em] text-[#e74c3c] mb-4 px-2">
                  Recipe Steps
                </p>

                <ol className="space-y-1.5">
                  {STEPS.map((s, i) => {
                    const isActive = s.key === active;
                    const isDone = stepCompletion[s.key];
                    const Icon = s.icon;
                    return (
                      <li key={s.key}>
                        <button
                          type="button"
                          onClick={() => setActive(s.key)}
                          className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left ${
                            isActive
                              ? "bg-white shadow-[0_4px_10px_-4px_rgba(120,90,40,0.2)] border border-stone-200 dark:border-white/[0.06]"
                              : "hover:bg-white/40"
                          }`}
                        >
                          {/* Step circle */}
                          <span
                            className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              isActive
                                ? "bg-[#e74c3c] border-[#e74c3c]"
                                : isDone
                                ? "bg-emerald-500 border-emerald-500"
                                : "bg-white border-stone-300 dark:border-white/10"
                            }`}
                          >
                            {isDone && !isActive && <CheckCircle2 className="h-3 w-3 text-white" />}
                            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          {/* Step icon + label */}
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                              isActive
                                ? "bg-amber-100 text-amber-700"
                                : "bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-stone-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span
                            className={`font-title-hw text-[15px] font-bold leading-tight truncate ${
                              isActive ? "text-stone-900 dark:text-stone-50" : "text-stone-600 dark:text-stone-300"
                            }`}
                          >
                            {s.label}
                          </span>
                          {i < STEPS.length - 1 && (
                            <span
                              className="absolute left-[26px] mt-9 h-3 w-px bg-stone-300"
                              aria-hidden
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>

                {/* Tip from Paati sticky */}
                <div className="relative mt-10 max-w-[200px] mx-auto">
                  {/* Paperclip SVG */}
                  <svg viewBox="0 0 32 64" className="absolute -top-3 left-2 h-8 w-4 text-stone-500/80 z-20" aria-hidden>
                    <path d="M22 6 C 28 6, 28 18, 22 18 L 10 18 C 4 18, 4 30, 10 30 L 22 30 C 26 30, 26 40, 22 40 L 12 40"
                      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <div
                    className="relative px-4 pt-5 pb-4 shadow-[0_8px_18px_-8px_rgba(220,80,90,0.4)]"
                    style={{
                      backgroundColor: "#fbd5dd",
                      transform: "rotate(-2.5deg)",
                      backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <p className="font-title-hw text-[13px] font-bold text-rose-900">
                        Tip from Paati
                      </p>
                      <SmileyDoodle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="font-note-hw text-[14px] leading-snug text-rose-950">
                      The secret ingredient is always love and patience{" "}
                      <span className="text-rose-600 dark:text-rose-400">❤</span>
                    </p>
                  </div>
                </div>
              </aside>

              {/* ─── MIDDLE: form ─── */}
              <section className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {active === "basic" && (
                      <BasicInfoStep
                        dishNameEn={dishNameEn} setDishNameEn={setDishNameEn}
                        dishNameTa={dishNameTa} setDishNameTa={setDishNameTa}
                        title={title} setTitle={setTitle}
                        country={country} setCountry={setCountry}
                        stateName={stateName} setStateName={setStateName}
                        region={region} setRegion={setRegion}
                        city={city} setCity={setCity}
                        servings={servings} setServings={setServings}
                        cookingTime={cookingTime} setCookingTime={setCookingTime}
                        difficulty={difficulty} setDifficulty={setDifficulty}
                        categoryId={categoryId} setCategoryId={setCategoryId}
                        categories={categories}
                        loadingOptions={loadingOptions}
                        imageFile={imageFile} setImageFile={setImageFile}
                        imageUrl={imageUrl} setImageUrl={setImageUrl}
                        imagePreview={imagePreview}
                      />
                    )}
                    {active === "description" && (
                      <DescriptionStep
                        descriptionEn={descriptionEn} setDescriptionEn={setDescriptionEn}
                        descriptionTa={descriptionTa} setDescriptionTa={setDescriptionTa}
                        specialityEn={specialityEn} setSpecialityEn={setSpecialityEn}
                        specialityTa={specialityTa} setSpecialityTa={setSpecialityTa}
                      />
                    )}
                    {active === "ingredients" && (
                      <IngredientsStep
                        ingredients={ingredients}
                        ingredientOptions={ingredientOptions}
                        loadingOptions={loadingOptions}
                        onAdd={addIngredient}
                        onRemove={removeIngredient}
                        onUpdate={updateIngredient}
                      />
                    )}
                    {active === "steps" && (
                      <StepsStep
                        steps={steps}
                        onAdd={addStep}
                        onRemove={removeStep}
                        onUpdate={updateStep}
                      />
                    )}
                    {active === "metadata" && (
                      <MetadataStep
                        categoryId={categoryId} setCategoryId={setCategoryId}
                        subCategoryId={subCategoryId} setSubCategoryId={setSubCategoryId}
                        categories={categories} subCategories={subCategories}
                        subCategoriesLoading={subCategoriesLoading}
                        source={source} setSource={setSource}
                        tags={tags} setTags={setTags}
                        loadingOptions={loadingOptions}
                      />
                    )}
                    {active === "preview" && (
                      <PreviewStep
                        heroTitle={heroTitle}
                        dishNameEn={dishNameEn} dishNameTa={dishNameTa}
                        descriptionEn={descriptionEn}
                        country={country} city={city} stateName={stateName} region={region}
                        servings={servings} cookingTime={cookingTime}
                        difficulty={difficulty} cuisineLabel={cuisineLabel}
                        ingredientCount={validIngredients.length}
                        stepCount={validSteps.length}
                        imagePreview={imagePreview} imageUrl={imageUrl}
                        onPublish={onPublish}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>

              {/* ─── RIGHT: live preview rail ─── */}
              <aside className="space-y-4 min-w-0">
                {/* Recipe Preview card */}
                <div className="rounded-2xl border border-stone-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/5 shadow-[0_6px_18px_-10px_rgba(120,90,40,0.18)] p-4 relative">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Eye className="h-4 w-4 text-rose-500" />
                    <h3 className="font-title-hw text-[16px] font-bold text-stone-900 dark:text-stone-50">
                      Recipe Preview
                    </h3>
                    <span className="h-3.5 w-4 text-rose-500" aria-hidden>
                      <HeartDoodle className="h-full w-full" />
                    </span>
                  </div>

                  {/* Polaroid mini */}
                  <div className="relative mx-auto w-full max-w-[220px] mb-3">
                    <TapeStrip color="pink" className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" rotate={-5} width="w-14" />
                    <div
                      className="bg-white p-2.5 pb-6 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.3)]"
                      style={{ transform: "rotate(-2deg)" }}
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone-200">
                        {imagePreview || imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagePreview || imageUrl}
                            alt="preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center bg-stone-100 dark:bg-white/5 text-stone-400 dark:text-stone-500 text-center px-2">
                            <ChefHat className="h-10 w-10 mb-1.5 opacity-60" />
                            <p className="font-note-hw text-[12px] leading-tight">
                              Your recipe photo will appear here
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title + stats */}
                  <p className="font-title-hw text-[18px] font-bold text-stone-900 dark:text-stone-50 leading-tight line-clamp-2">
                    {heroTitle}
                  </p>
                  <p className="font-body text-[12px] text-stone-500 dark:text-stone-400 mb-3">
                    by <span className="text-rose-500">Your Name</span>
                  </p>

                  <dl className="space-y-1.5 font-body text-[12.5px] divide-y divide-dashed divide-stone-200">
                    {[
                      { icon: Users, label: "Servings", value: servings || "—" },
                      { icon: Clock, label: "Cooking Time", value: cookingTime ? `${cookingTime} min` : "—" },
                      { icon: BarChart3, label: "Difficulty", value: difficulty },
                      { icon: Utensils, label: "Cuisine", value: cuisineLabel },
                    ].map((row) => {
                      const Icon = row.icon;
                      return (
                        <div key={row.label} className="flex items-center justify-between py-1.5 first:pt-0">
                          <dt className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                            <Icon className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                            {row.label}
                          </dt>
                          <dd className="font-bold text-stone-900 dark:text-stone-50 capitalize">{row.value}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>

                {/* Chef's Note */}
                <div className="rounded-2xl border border-stone-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/5 shadow-[0_6px_18px_-10px_rgba(120,90,40,0.18)] p-4 relative">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <h3 className="font-title-hw text-[16px] font-bold text-stone-900 dark:text-stone-50">
                      Chef&apos;s Note
                    </h3>
                    <span className="h-3.5 w-4 text-rose-500" aria-hidden>
                      <HeartDoodle className="h-full w-full" />
                    </span>
                  </div>
                  <p className="font-note-hw text-[13.5px] leading-snug text-stone-700 dark:text-stone-200">
                    Take your time and write your recipe with love. Good recipes are meant to be shared!{" "}
                    <span className="text-rose-500">❤</span>
                  </p>
                </div>
              </aside>
            </div>

            {/* BOTTOM BAR */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-4 md:px-8 py-3 border-t border-stone-200 dark:border-white/[0.06] bg-amber-50/60">
              <p className="font-note-hw text-[13px] text-stone-600 dark:text-stone-300 hidden md:block">
                You can save as draft anytime and continue later{" "}
                <span className="text-rose-500">❤</span>
              </p>
              <div className="flex items-center gap-2 ml-auto">
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex items-center gap-1.5 rounded-lg paper-card text-stone-800 dark:text-stone-100 border-2 border-stone-300 dark:border-white/10 px-4 py-2 font-title-hw text-[14px] font-bold hover:border-stone-500 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back: {STEPS[stepIndex - 1].label}
                  </button>
                )}
                {stepIndex < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#e74c3c] text-white px-4 py-2 font-title-hw text-[14px] font-bold hover:bg-[#c0392b] transition-colors shadow-[0_4px_10px_-4px_rgba(231,76,60,0.5)] active:translate-y-px"
                  >
                    Next: {STEPS[stepIndex + 1].label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPublish}
                    disabled={isSubmitting || loadingOptions}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#e74c3c] text-white px-5 py-2 font-title-hw text-[14px] font-bold hover:bg-[#c0392b] transition-colors shadow-[0_4px_10px_-4px_rgba(231,76,60,0.5)] active:translate-y-px disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmitting ? "Publishing…" : "Publish Recipe"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ──────────────── Step: Basic Info ──────────────── */
function BasicInfoStep(props: {
  dishNameEn: string; setDishNameEn: (v: string) => void;
  dishNameTa: string; setDishNameTa: (v: string) => void;
  title: string; setTitle: (v: string) => void;
  country: string; setCountry: (v: string) => void;
  stateName: string; setStateName: (v: string) => void;
  region: string; setRegion: (v: string) => void;
  city: string; setCity: (v: string) => void;
  servings: string; setServings: (v: string) => void;
  cookingTime: string; setCookingTime: (v: string) => void;
  difficulty: RecipeDifficulty; setDifficulty: (v: RecipeDifficulty) => void;
  categoryId: string; setCategoryId: (v: string) => void;
  categories: Category[];
  loadingOptions: boolean;
  imageFile: File | null; setImageFile: (v: File | null) => void;
  imageUrl: string; setImageUrl: (v: string) => void;
  imagePreview: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-7">
      {/* Basic Information */}
      <div>
        <SectionLabel color="yellow">Basic Information</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Dish Name (English)" required>
            <input value={props.dishNameEn} onChange={(e) => props.setDishNameEn(e.target.value)} placeholder="e.g., Vegetable Biryani" className={inputClass} />
          </Field>
          <Field label="Dish Name (Tamil)">
            <input value={props.dishNameTa} onChange={(e) => props.setDishNameTa(e.target.value)} placeholder="உ.கா., காய்கறி பிரியாணி" className={inputClass} />
          </Field>
        </div>
        <Field label="Title" optional className="mt-4">
          <input value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="e.g., Amma's Special One Pot Biryani" className={inputClass} />
        </Field>

        {/* Location row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Field label="Country" required>
            <input value={props.country} onChange={(e) => props.setCountry(e.target.value)} placeholder="India" className={inputClass} />
          </Field>
          <Field label="State">
            <input value={props.stateName} onChange={(e) => props.setStateName(e.target.value)} placeholder="Tamil Nadu" className={inputClass} />
          </Field>
          <Field label="Region">
            <input value={props.region} onChange={(e) => props.setRegion(e.target.value)} placeholder="Kongu" className={inputClass} />
          </Field>
          <Field label="City">
            <input value={props.city} onChange={(e) => props.setCity(e.target.value)} placeholder="Erode" className={inputClass} />
          </Field>
        </div>
        <p className="font-note-hw text-[13px] text-stone-600 dark:text-stone-300 mt-3 flex items-center gap-1.5">
          <Leaf className="h-3.5 w-3.5 text-emerald-600" />
          Where is this recipe from?
        </p>
      </div>

      {/* Quick Details */}
      <div>
        <SectionLabel color="pink">Quick Details</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Servings">
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
              <input value={props.servings} onChange={(e) => props.setServings(e.target.value)} type="number" min={1} placeholder="e.g., 4 people" className={`${inputClass} pl-9`} />
            </div>
          </Field>
          <Field label="Cooking Time">
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
              <input value={props.cookingTime} onChange={(e) => props.setCookingTime(e.target.value)} type="number" min={1} placeholder="e.g., 30 mins" className={`${inputClass} pl-9`} />
            </div>
          </Field>
          <Field label="Difficulty">
            <div className="relative">
              <BarChart3 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
              <select value={props.difficulty} onChange={(e) => props.setDifficulty(e.target.value as RecipeDifficulty)} className={`${inputClass} pl-9 appearance-none`}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </Field>
          <Field label="Cuisine Type">
            <div className="relative">
              <Utensils className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
              <select value={props.categoryId} onChange={(e) => props.setCategoryId(e.target.value)} disabled={props.loadingOptions} className={`${inputClass} pl-9 appearance-none`}>
                <option value="">Select Cuisine</option>
                {props.categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name.en}</option>
                ))}
              </select>
            </div>
          </Field>
        </div>
      </div>

      {/* Recipe Image */}
      <div>
        <SectionLabel color="yellow">Recipe Image <span className="font-body text-[12px] font-medium text-stone-500 dark:text-stone-400 normal-case">(Optional)</span></SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-5 items-start">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-xl border-2 border-dashed border-stone-300 dark:border-white/10 hover:border-[#e74c3c] hover:bg-amber-50/30 transition-colors cursor-pointer min-h-[180px] flex flex-col items-center justify-center text-center px-6 py-10"
          >
            {props.imagePreview || props.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={props.imagePreview || props.imageUrl} alt="preview" className="max-h-32 mb-3 rounded shadow-md" />
                <p className="font-body text-[12px] text-stone-600 dark:text-stone-300">Click to replace</p>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-3">
                  <Camera className="h-5 w-5" />
                </span>
                <p className="font-title-hw text-[15px] font-bold text-stone-700 dark:text-stone-200 leading-snug">
                  Upload a beautiful photo<br />of your recipe
                </p>
                <p className="font-body text-[12px] text-[#e74c3c] mt-2 inline-flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  Click to upload or drag &amp; drop
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => props.setImageFile(e.target.files?.[0] || null)}
              className="sr-only"
            />
          </div>

          {/* Encouragement sticky */}
          <div className="relative pt-3 mx-auto md:mx-0">
            <TapeStrip color="yellow" className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" rotate={-5} width="w-12" />
            <div
              className="relative px-3.5 pt-3 pb-2.5 shadow-[0_6px_14px_-6px_rgba(60,140,60,0.3)] max-w-[180px]"
              style={{
                backgroundColor: "#d6efce",
                transform: "rotate(2deg)",
                backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.04) 100%)",
              }}
            >
              <p className="font-note-hw text-[13.5px] leading-snug text-emerald-950">
                A good photo makes your recipe more delicious! 😊
              </p>
            </div>
          </div>
        </div>

        {/* Or paste image URL */}
        <Field label="Or paste image URL" optional className="mt-4">
          <div className="relative">
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500 pointer-events-none" />
            <input value={props.imageUrl} onChange={(e) => props.setImageUrl(e.target.value)} placeholder="https://…" className={`${inputClass} pl-9`} />
          </div>
        </Field>
      </div>
    </div>
  );
}

/* ──────────────── Step: Description ──────────────── */
function DescriptionStep(props: {
  descriptionEn: string; setDescriptionEn: (v: string) => void;
  descriptionTa: string; setDescriptionTa: (v: string) => void;
  specialityEn: string; setSpecialityEn: (v: string) => void;
  specialityTa: string; setSpecialityTa: (v: string) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <SectionLabel color="yellow">Description</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Description (English)" required>
            <textarea
              value={props.descriptionEn}
              onChange={(e) => props.setDescriptionEn(e.target.value)}
              placeholder="A traditional one-pot dish from Erode, made with rice, dal, and freshly ground spices..."
              rows={6}
              className={`${inputClass} resize-y`}
            />
          </Field>
          <Field label="Description (Tamil)">
            <textarea
              value={props.descriptionTa}
              onChange={(e) => props.setDescriptionTa(e.target.value)}
              placeholder="(Optional)"
              rows={6}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel color="pink">What makes it special?</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Speciality (English)">
            <textarea
              value={props.specialityEn}
              onChange={(e) => props.setSpecialityEn(e.target.value)}
              placeholder="The grandma-secret behind this dish..."
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </Field>
          <Field label="Speciality (Tamil)">
            <textarea
              value={props.specialityTa}
              onChange={(e) => props.setSpecialityTa(e.target.value)}
              placeholder="(Optional)"
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Step: Ingredients ──────────────── */
const INGREDIENT_PALETTES = [
  { bg: "#fff3b0", pin: "#d97706" },
  { bg: "#fbd5dd", pin: "#e11d48" },
  { bg: "#d6e9f5", pin: "#0284c7" },
  { bg: "#d6efce", pin: "#16a34a" },
  { bg: "#e9dafb", pin: "#7c3aed" },
  { bg: "#fde4c0", pin: "#ea580c" },
];

function IngredientsStep(props: {
  ingredients: IngredientRow[];
  ingredientOptions: Ingredient[];
  loadingOptions: boolean;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, k: keyof IngredientRow, v: string) => void;
}) {
  return (
    <div>
      <SectionLabel color="green">Ingredients</SectionLabel>
      <p className="font-note-hw text-[13.5px] text-stone-600 dark:text-stone-300 mb-4">
        Pin every ingredient to the board. Quantity and unit help cooks scale the recipe.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 mb-6">
        {props.ingredients.map((row, idx) => {
          const p = INGREDIENT_PALETTES[idx % INGREDIENT_PALETTES.length];
          const rotation = [-1.5, 1.2, -1, 1.5, -1.8, 0.8][idx % 6];
          return (
            <div key={idx} className="relative pt-4">
              {/* Pin */}
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 z-20 block h-3 w-3 rounded-full shadow-md"
                style={{
                  backgroundColor: p.pin,
                  border: "1.5px solid rgba(255,255,255,0.7)",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.35), inset -1px -1px 2px rgba(0,0,0,0.2)",
                }}
                aria-hidden
              />
              <div
                className="relative px-3.5 pt-4 pb-3 rounded-sm shadow-[0_8px_18px_-8px_rgba(0,0,0,0.25)]"
                style={{
                  backgroundColor: p.bg,
                  transform: `rotate(${rotation}deg)`,
                  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.05) 100%)",
                }}
              >
                {/* Ingredient selector */}
                <select
                  value={row.ingredient}
                  onChange={(e) => props.onUpdate(idx, "ingredient", e.target.value)}
                  disabled={props.loadingOptions}
                  className="w-full rounded-md bg-white/80 dark:bg-white/5 border border-stone-300 dark:border-white/10 px-2.5 py-1.5 font-title-hw text-[15px] font-bold text-stone-900 dark:text-stone-50 outline-none focus:border-[#e74c3c]"
                >
                  <option value="">
                    {props.loadingOptions ? "Loading…" : "Select ingredient"}
                  </option>
                  {props.ingredientOptions.map((opt) => (
                    <option key={opt._id} value={opt._id}>{opt.name.en}</option>
                  ))}
                </select>

                {/* Quantity + unit */}
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <input
                    value={row.quantity}
                    onChange={(e) => props.onUpdate(idx, "quantity", e.target.value)}
                    placeholder="2"
                    className="rounded-md bg-white/80 dark:bg-white/5 border border-stone-300 dark:border-white/10 px-2 py-1.5 font-body text-[13px] text-stone-800 dark:text-stone-100 outline-none focus:border-[#e74c3c]"
                  />
                  <input
                    value={row.unit}
                    onChange={(e) => props.onUpdate(idx, "unit", e.target.value)}
                    placeholder="cups"
                    className="rounded-md bg-white/80 dark:bg-white/5 border border-stone-300 dark:border-white/10 px-2 py-1.5 font-body text-[13px] text-stone-800 dark:text-stone-100 outline-none focus:border-[#e74c3c]"
                  />
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => props.onRemove(idx)}
                  disabled={props.ingredients.length === 1}
                  className="absolute top-1.5 right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-white/70 dark:bg-white/5 text-stone-500 dark:text-stone-400 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-30 transition-colors"
                  aria-label="Remove ingredient"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <button
          type="button"
          onClick={props.onAdd}
          className="relative pt-4 group"
        >
          <div className="rounded-sm border-2 border-dashed border-stone-300 dark:border-white/10 group-hover:border-[#e74c3c] bg-amber-50/30 group-hover:bg-amber-50/60 transition-colors px-3 py-8 flex flex-col items-center justify-center min-h-[140px]">
            <Plus className="h-6 w-6 text-stone-400 dark:text-stone-500 group-hover:text-[#e74c3c]" />
            <p className="font-title-hw text-[14px] font-bold text-stone-600 dark:text-stone-300 group-hover:text-[#e74c3c] mt-1.5">
              Add Ingredient
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ──────────────── Step: Cooking Steps ──────────────── */
function StepsStep(props: {
  steps: StepRow[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, k: keyof StepRow, v: string) => void;
}) {
  return (
    <div>
      <SectionLabel color="pink">Cooking Steps</SectionLabel>
      <p className="font-note-hw text-[13.5px] text-stone-600 dark:text-stone-300 mb-4">
        Write each step on its own recipe card. Cooks will read them in order.
      </p>

      <div className="space-y-5">
        {props.steps.map((step, idx) => (
          <div
            key={idx}
            className="relative rounded-xl bg-white/70 dark:bg-white/5 border border-stone-200 dark:border-white/[0.06] shadow-[0_4px_14px_-8px_rgba(120,90,40,0.25)] p-4 pl-12"
          >
            {/* Step number circle */}
            <div className="absolute top-4 left-3 h-7 w-7 rounded-full bg-[#e74c3c] text-white flex items-center justify-center font-title-hw text-[14px] font-bold">
              {idx + 1}
            </div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="font-title-hw text-[16px] font-bold text-stone-900 dark:text-stone-50">
                Step {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => props.onRemove(idx)}
                disabled={props.steps.length === 1}
                className="text-stone-400 dark:text-stone-500 hover:text-rose-500 disabled:opacity-30 transition-colors"
                aria-label="Remove step"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                value={step.en}
                onChange={(e) => props.onUpdate(idx, "en", e.target.value)}
                placeholder="Step description (English) *"
                rows={3}
                className={`${inputClass} resize-y`}
              />
              <textarea
                value={step.ta}
                onChange={(e) => props.onUpdate(idx, "ta", e.target.value)}
                placeholder="Step description (Tamil)"
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={props.onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg paper-card text-stone-800 dark:text-stone-100 border-2 border-dashed border-stone-300 dark:border-white/10 hover:border-[#e74c3c] hover:text-[#e74c3c] px-5 py-2.5 font-title-hw text-[14px] font-bold transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Another Step
      </button>
    </div>
  );
}

/* ──────────────── Step: Metadata ──────────────── */
function MetadataStep(props: {
  categoryId: string; setCategoryId: (v: string) => void;
  subCategoryId: string; setSubCategoryId: (v: string) => void;
  categories: Category[]; subCategories: Category[];
  subCategoriesLoading: boolean;
  source: RecipeSource; setSource: (v: RecipeSource) => void;
  tags: string; setTags: (v: string) => void;
  loadingOptions: boolean;
}) {
  return (
    <div className="space-y-7">
      <div>
        <SectionLabel color="yellow">Categories</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Cuisine / Main Category">
            <select
              value={props.categoryId}
              onChange={(e) => props.setCategoryId(e.target.value)}
              disabled={props.loadingOptions}
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select category</option>
              {props.categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name.en}</option>
              ))}
            </select>
          </Field>
          <Field label="Sub-Category">
            <select
              value={props.subCategoryId}
              onChange={(e) => props.setSubCategoryId(e.target.value)}
              disabled={!props.categoryId || props.subCategoriesLoading}
              className={`${inputClass} appearance-none disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="">
                {props.subCategoriesLoading ? "Loading…" : "Select sub-category"}
              </option>
              {props.subCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name.en}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel color="pink">Source &amp; Tags</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
          <Field label="Source">
            <select
              value={props.source}
              onChange={(e) => props.setSource(e.target.value as RecipeSource)}
              className={`${inputClass} appearance-none`}
            >
              <option value="manual">Manual</option>
              <option value="youtube">YouTube</option>
              <option value="blog">Blog</option>
              <option value="ai">AI</option>
            </select>
          </Field>
          <Field label="Tags" optional>
            <input
              value={props.tags}
              onChange={(e) => props.setTags(e.target.value)}
              placeholder="biryani, festival, gluten-free (comma separated)"
              className={inputClass}
            />
            {props.tags.trim() && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {props.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="inline-flex items-center font-body text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Step: Preview & Publish ──────────────── */
function PreviewStep(props: {
  heroTitle: string;
  dishNameEn: string; dishNameTa: string;
  descriptionEn: string;
  country: string; city: string; stateName: string; region: string;
  servings: string; cookingTime: string;
  difficulty: RecipeDifficulty;
  cuisineLabel: string;
  ingredientCount: number;
  stepCount: number;
  imagePreview: string; imageUrl: string;
  onPublish: () => void;
  isSubmitting: boolean;
}) {
  const where = [props.city, props.region, props.stateName, props.country].filter(Boolean).join(", ");
  return (
    <div>
      <SectionLabel color="green">Final Preview</SectionLabel>
      <p className="font-note-hw text-[13.5px] text-stone-600 dark:text-stone-300 mb-5">
        One more look before you publish — this is what cooks will see first{" "}
        <span className="text-rose-500">❤</span>
      </p>

      <div className="rounded-2xl border border-stone-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/5 p-5 shadow-[0_6px_18px_-10px_rgba(120,90,40,0.18)]">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
          {/* Polaroid */}
          <div className="relative pt-3">
            <TapeStrip color="pink" className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" rotate={-5} width="w-14" />
            <div className="bg-white p-2.5 pb-6 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.3)]" style={{ transform: "rotate(-2deg)" }}>
              <div className="relative aspect-square overflow-hidden bg-stone-200">
                {props.imagePreview || props.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={props.imagePreview || props.imageUrl} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-stone-100 dark:bg-white/5 text-stone-400 dark:text-stone-500">
                    <ChefHat className="h-12 w-12 opacity-60" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <h2 className="font-title-hw text-[26px] md:text-[30px] font-bold text-stone-900 dark:text-stone-50 leading-tight">
              {props.heroTitle}
            </h2>
            {props.dishNameTa && (
              <p className="font-note-hw text-[16px] text-stone-700 dark:text-stone-200 mt-0.5">{props.dishNameTa}</p>
            )}
            <p className="font-body text-[14px] text-stone-700 dark:text-stone-200 leading-relaxed mt-3 line-clamp-4">
              {props.descriptionEn || (
                <span className="text-stone-400 dark:text-stone-500 italic">No description yet — add one in the Description step.</span>
              )}
            </p>

            {where && (
              <p className="flex items-center gap-1.5 font-body text-[13px] text-stone-600 dark:text-stone-300 mt-3">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                {where}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Servings", value: props.servings || "—" },
                { label: "Time", value: props.cookingTime ? `${props.cookingTime} min` : "—" },
                { label: "Difficulty", value: props.difficulty },
                { label: "Cuisine", value: props.cuisineLabel },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-stone-200 dark:border-white/[0.06] bg-stone-50 dark:bg-white/5 px-3 py-2">
                  <p className="font-body text-[10px] font-black uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">{s.label}</p>
                  <p className="font-title-hw text-[14px] font-bold text-stone-900 dark:text-stone-50 capitalize">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 font-body text-[13px] text-stone-700 dark:text-stone-200">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <strong>{props.ingredientCount}</strong> ingredients
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-600" />
                <strong>{props.stepCount}</strong> cooking steps
              </span>
            </div>
          </div>
        </div>

        {/* Publish button */}
        <div className="mt-5 pt-5 border-t border-dashed border-stone-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-note-hw text-[14px] text-stone-700 dark:text-stone-200">
            Ready to share? <span className="text-rose-500">❤</span>
          </p>
          <button
            type="button"
            onClick={props.onPublish}
            disabled={props.isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#e74c3c] text-white px-6 py-3 font-title-hw text-[16px] font-bold hover:bg-[#c0392b] transition-colors shadow-[0_6px_14px_-6px_rgba(231,76,60,0.5)] active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {props.isSubmitting ? "Publishing…" : "Publish Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
