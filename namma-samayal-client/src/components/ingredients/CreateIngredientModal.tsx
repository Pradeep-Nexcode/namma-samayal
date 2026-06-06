"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getSubcategoriesByParent,
} from "@/features/category/services/categoryApi";
import type { Category } from "@/types/category";
import type { IngredientCreateInput } from "@/types/ingredient";

type NutritionDraft = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

type IngredientFormDraft = {
  nameEn: string;
  nameTa: string;
  slug: string;
  categoryId: string;
  subCategoryId: string;
  descriptionEn: string;
  descriptionTa: string;
  imageUrl: string;
  tagsInput: string;
  isActive: boolean;
  nutrition: NutritionDraft;
};

interface CreateIngredientModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onCreate: (payload: IngredientCreateInput, imageFile?: File | null) => Promise<void> | void;
}

const initialState: IngredientFormDraft = {
  nameEn: "",
  nameTa: "",
  slug: "",
  categoryId: "",
  subCategoryId: "",
  descriptionEn: "",
  descriptionTa: "",
  imageUrl: "",
  tagsInput: "",
  isActive: true,
  nutrition: {
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toOptionalNumber(value: string): number | undefined {
  if (value.trim().length === 0) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function CreateIngredientModal({
  isOpen,
  isSubmitting = false,
  onClose,
  onCreate,
}: CreateIngredientModalProps) {
  const [form, setForm] = useState<IngredientFormDraft>(initialState);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isSubCategoriesLoading, setIsSubCategoriesLoading] = useState(false);
  const [categoryApiError, setCategoryApiError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const loadMainCategories = async () => {
      try {
        setCategoryApiError("");
        setIsCategoriesLoading(true);
        const data = await getCategories({ level: 0, limit: 100 });
        setCategories(data);
      } catch {
        setCategoryApiError("Failed to load categories from API.");
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadMainCategories();
  }, [isOpen]);

  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      setForm((prev) => ({ ...prev, subCategoryId: "" }));
      return;
    }

    const loadSubCategories = async () => {
      try {
        setIsSubCategoriesLoading(true);
        const data = await getSubcategoriesByParent(form.categoryId);
        setSubCategories(data);
      } catch {
        setSubCategories([]);
      } finally {
        setIsSubCategoriesLoading(false);
      }
    };

    loadSubCategories();
  }, [form.categoryId]);

  const previewSlug = useMemo(() => {
    if (form.slug.trim().length > 0) return form.slug.trim();
    return slugify(form.nameEn);
  }, [form.slug, form.nameEn]);

  if (!isOpen) return null;

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (form.nameEn.trim().length === 0) {
      setError("Name (English) is required.");
      return;
    }

    if (form.categoryId.trim().length === 0) {
      setError("Category is required.");
      return;
    }

    const tags = form.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload: IngredientCreateInput = {
      name: {
        en: form.nameEn.trim(),
        ta: form.nameTa.trim() || undefined,
      },
      slug: previewSlug || undefined,
      category: form.categoryId.trim(),
      subCategory: form.subCategoryId.trim() || undefined,
      description:
        form.descriptionEn.trim().length > 0
          ? {
              en: form.descriptionEn.trim(),
              ta: form.descriptionTa.trim() || undefined,
            }
          : undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      nutrition: {
        calories: toOptionalNumber(form.nutrition.calories),
        protein: toOptionalNumber(form.nutrition.protein),
        carbs: toOptionalNumber(form.nutrition.carbs),
        fat: toOptionalNumber(form.nutrition.fat),
      },
      tags,
      isActive: form.isActive,
    };

    const hasNutrition = Object.values(payload.nutrition ?? {}).some(
      (value) => value !== undefined,
    );
    if (!hasNutrition) delete payload.nutrition;

    try {
      await onCreate(payload, imageFile);
      setForm(initialState);
      setSlugEdited(false);
      setImageFile(null);
      onClose();
    } catch {
      setError("Failed to create ingredient. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        className="max-h-[92vh] w-full max-w-[980px] overflow-y-auto rounded-2xl border border-white/15 bg-[#121212] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.6)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Create Ingredient</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Connected to API. Category and subcategory load from server.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-zinc-300 hover:bg-white/15"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Name (English) *</span>
              <input
                value={form.nameEn}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    nameEn: value,
                    slug: slugEdited ? prev.slug : slugify(value),
                  }));
                }}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                placeholder="Turmeric Powder"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Name (Tamil)</span>
              <input
                value={form.nameTa}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nameTa: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                placeholder="மஞ்சள் தூள்"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Slug</span>
              <input
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }));
                }}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                placeholder="turmeric-powder"
              />
              <p className="text-xs text-zinc-500">Preview: {previewSlug || "-"}</p>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Image File (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#2a2a2a] file:px-3 file:py-1.5 file:text-xs file:text-zinc-200"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Category *</span>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, categoryId: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none"
              >
                <option value="">
                  {isCategoriesLoading ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name.en}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Sub Category</span>
              <select
                value={form.subCategoryId}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    subCategoryId: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none"
              >
                <option value="">
                  {isSubCategoriesLoading
                    ? "Loading sub categories..."
                    : "Select sub category"}
                </option>
                {subCategories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name.en}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {categoryApiError ? (
            <p className="text-sm text-amber-300">{categoryApiError}</p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Description (English)</span>
              <textarea
                value={form.descriptionEn}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    descriptionEn: event.target.value,
                  }))
                }
                className="h-24 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                placeholder="Short ingredient description"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Description (Tamil)</span>
              <textarea
                value={form.descriptionTa}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    descriptionTa: event.target.value,
                  }))
                }
                className="h-24 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                placeholder="தமிழில் குறுகிய விளக்கம்"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Image URL (optional)</span>
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                placeholder="https://..."
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm text-zinc-300">Tags (comma separated)</span>
              <input
                value={form.tagsInput}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tagsInput: event.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                placeholder="spicy, healthy, quick"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm text-zinc-300">Nutrition (optional)</p>
            <div className="grid gap-4 md:grid-cols-4">
              {(
                [
                  ["calories", "Calories"],
                  ["protein", "Protein"],
                  ["carbs", "Carbs"],
                  ["fat", "Fat"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="space-y-1.5">
                  <span className="text-xs text-zinc-400">{label}</span>
                  <input
                    value={form.nutrition[key]}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        nutrition: {
                          ...prev.nutrition,
                          [key]: event.target.value,
                        },
                      }))
                    }
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/35"
                    placeholder="0"
                  />
                </label>
              ))}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
              className="h-4 w-4 accent-[#E74C3C]"
            />
            Ingredient is active
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#E74C3C] px-5 py-2 text-sm font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Ingredient"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
