"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getSubcategoriesByParent,
} from "@/features/category/services/categoryApi";
import { getIngredients } from "@/features/ingredient/services/ingredientApi";
import { createRecipe } from "@/features/recipe/services/recipeApi";
import type { Category } from "@/types/category";
import type { Ingredient } from "@/types/ingredient";
import type {
  RecipeCreateInput,
  RecipeDifficulty,
  RecipeSource,
} from "@/types/recipe";

type IngredientRow = {
  ingredient: string;
  quantity: string;
  unit: string;
};

type StepRow = {
  step: number;
  en: string;
  ta: string;
};

const initialIngredientRow = (): IngredientRow => ({
  ingredient: "",
  quantity: "",
  unit: "",
});

const initialStepRow = (step = 1): StepRow => ({
  step,
  en: "",
  ta: "",
});

export default function CreateRecipePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<Ingredient[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

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

  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    initialIngredientRow(),
  ]);
  const [steps, setSteps] = useState<StepRow[]>([initialStepRow(1)]);

  useEffect(() => {
    const loadInitialOptions = async () => {
      try {
        setLoadingOptions(true);
        const [categoryData, ingredientData] = await Promise.all([
          getCategories({ level: 0, limit: 100 }),
          getIngredients({ page: 1, limit: 100 }),
        ]);

        setCategories(categoryData);
        setIngredientOptions(ingredientData.data);
      } catch {
        setError("Failed to load form options. Please refresh.");
      } finally {
        setLoadingOptions(false);
      }
    };

    loadInitialOptions();
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      setSubCategoryId("");
      return;
    }

    const loadSubCategories = async () => {
      try {
        setSubCategoriesLoading(true);
        const data = await getSubcategoriesByParent(categoryId);
        setSubCategories(data);
      } catch {
        setSubCategories([]);
      } finally {
        setSubCategoriesLoading(false);
      }
    };

    loadSubCategories();
  }, [categoryId]);

  const ingredientMap = useMemo(() => {
    const map = new Map<string, Ingredient>();
    ingredientOptions.forEach((item) => map.set(item._id, item));
    return map;
  }, [ingredientOptions]);

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, initialIngredientRow()]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateIngredientRow = (
    index: number,
    field: keyof IngredientRow,
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addStepRow = () => {
    setSteps((prev) => [...prev, initialStepRow(prev.length + 1)]);
  };

  const removeStepRow = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, step: idx + 1 })),
    );
  };

  const updateStepRow = (
    index: number,
    field: keyof StepRow,
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: field === "step" ? Number(value) : value,
            }
          : item,
      ),
    );
  };

  const resetForm = () => {
    setDishNameEn("");
    setDishNameTa("");
    setTitle("");
    setCountry("");
    setStateName("");
    setRegion("");
    setCity("");
    setDescriptionEn("");
    setDescriptionTa("");
    setSpecialityEn("");
    setSpecialityTa("");
    setDifficulty("medium");
    setSource("manual");
    setCategoryId("");
    setSubCategoryId("");
    setCookingTime("");
    setServings("");
    setTags("");
    setImageUrl("");
    setImageFile(null);
    setIngredients([initialIngredientRow()]);
    setSteps([initialStepRow(1)]);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedIngredients = ingredients
      .filter((item) => item.ingredient)
      .map((item) => ({
        ingredient: item.ingredient,
        quantity: item.quantity || undefined,
        unit: item.unit || undefined,
      }));

    const normalizedSteps = steps
      .filter((item) => item.en.trim())
      .map((item, index) => ({
        step: index + 1,
        description: {
          en: item.en.trim(),
          ta: item.ta.trim() || undefined,
        },
      }));

    if (!dishNameEn.trim()) {
      setError("Dish name (English) is required.");
      return;
    }

    if (!country.trim()) {
      setError("Country is required.");
      return;
    }

    if (!descriptionEn.trim()) {
      setError("Description (English) is required.");
      return;
    }

    if (normalizedIngredients.length === 0) {
      setError("Add at least one ingredient.");
      return;
    }

    if (normalizedSteps.length === 0) {
      setError("Add at least one step.");
      return;
    }

    const payload: RecipeCreateInput = {
      dishName: {
        en: dishNameEn.trim(),
        ta: dishNameTa.trim() || undefined,
      },
      title: title.trim() || undefined,
      location: {
        country: country.trim(),
        state: stateName.trim() || undefined,
        region: region.trim() || undefined,
        city: city.trim() || undefined,
      },
      description: {
        en: descriptionEn.trim(),
        ta: descriptionTa.trim() || undefined,
      },
      ingredients: normalizedIngredients,
      steps: normalizedSteps,
      speciality:
        specialityEn.trim() || specialityTa.trim()
          ? {
              en: specialityEn.trim() || dishNameEn.trim(),
              ta: specialityTa.trim() || undefined,
            }
          : undefined,
      difficulty,
      source,
      category: categoryId || undefined,
      subCategory: subCategoryId || undefined,
      cookingTime: cookingTime ? Number(cookingTime) : undefined,
      servings: servings ? Number(servings) : undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      imageUrl: imageUrl.trim() || undefined,
    };

    try {
      setIsSubmitting(true);
      const created = await createRecipe(payload, imageFile);
      resetForm();
      router.push(`/recipe/${created._id}`);
    } catch {
      setError(
        "Failed to create recipe. Please check your data and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
          Create Recipe
        </h1>
        <Link
          href="/recipes"
          className="text-sm text-[#F4C430] hover:underline"
        >
          Back to recipes
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-3xl border border-white/10 bg-[var(--color-card)] p-5 text-slate-900 dark:text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:p-6"
      >
        {error ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Basic Info</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={dishNameEn}
              onChange={(event) => setDishNameEn(event.target.value)}
              placeholder="Dish name (English) *"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <input
              value={dishNameTa}
              onChange={(event) => setDishNameTa(event.target.value)}
              placeholder="Dish name (Tamil)"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title (optional)"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C] sm:col-span-2"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Location</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="Country *"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <input
              value={stateName}
              onChange={(event) => setStateName(event.target.value)}
              placeholder="State"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <input
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="Region"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Description</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <textarea
              value={descriptionEn}
              onChange={(event) => setDescriptionEn(event.target.value)}
              placeholder="Description (English) *"
              rows={4}
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <textarea
              value={descriptionTa}
              onChange={(event) => setDescriptionTa(event.target.value)}
              placeholder="Description (Tamil)"
              rows={4}
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={specialityEn}
              onChange={(event) => setSpecialityEn(event.target.value)}
              placeholder="Speciality (English)"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <input
              value={specialityTa}
              onChange={(event) => setSpecialityTa(event.target.value)}
              placeholder="Speciality (Tamil)"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ingredients</h2>
            <button
              type="button"
              onClick={addIngredientRow}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              + Add Ingredient
            </button>
          </div>

          {ingredients.map((item, index) => (
            <div
              key={`ingredient-row-${index}`}
              className="grid gap-2 sm:grid-cols-[1.5fr_1fr_1fr_auto]"
            >
              <select
                value={item.ingredient}
                onChange={(event) =>
                  updateIngredientRow(index, "ingredient", event.target.value)
                }
                className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
                disabled={loadingOptions}
              >
                <option value="">
                  {loadingOptions
                    ? "Loading ingredients..."
                    : "Select ingredient *"}
                </option>
                {ingredientOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name.en}
                  </option>
                ))}
              </select>

              <input
                value={item.quantity}
                onChange={(event) =>
                  updateIngredientRow(index, "quantity", event.target.value)
                }
                placeholder="Quantity"
                className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
              />

              <input
                value={item.unit}
                onChange={(event) =>
                  updateIngredientRow(index, "unit", event.target.value)
                }
                placeholder="Unit"
                className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
              />

              <button
                type="button"
                onClick={() => removeIngredientRow(index)}
                disabled={ingredients.length === 1}
                className="rounded-lg border border-white/15 px-2 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Steps</h2>
            <button
              type="button"
              onClick={addStepRow}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              + Add Step
            </button>
          </div>

          {steps.map((step, index) => (
            <div
              key={`step-row-${index}`}
              className="rounded-xl border border-white/10 bg-[var(--color-card)] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Step {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeStepRow(index)}
                  disabled={steps.length === 1}
                  className="rounded-lg border border-white/15 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <textarea
                  value={step.en}
                  onChange={(event) =>
                    updateStepRow(index, "en", event.target.value)
                  }
                  placeholder="Step description (English) *"
                  rows={3}
                  className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
                />
                <textarea
                  value={step.ta}
                  onChange={(event) =>
                    updateStepRow(index, "ta", event.target.value)
                  }
                  placeholder="Step description (Tamil)"
                  rows={3}
                  className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Metadata</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as RecipeDifficulty)
              }
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={source}
              onChange={(event) =>
                setSource(event.target.value as RecipeSource)
              }
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            >
              <option value="manual">Manual</option>
              <option value="youtube">YouTube</option>
              <option value="blog">Blog</option>
              <option value="ai">AI</option>
            </select>

            <input
              value={cookingTime}
              onChange={(event) => setCookingTime(event.target.value)}
              placeholder="Cooking time (mins)"
              type="number"
              min={1}
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />

            <input
              value={servings}
              onChange={(event) => setServings(event.target.value)}
              placeholder="Servings"
              type="number"
              min={1}
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setSubCategoryId("");
              }}
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
              disabled={loadingOptions}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name.en}
                </option>
              ))}
            </select>

            <select
              value={subCategoryId}
              onChange={(event) => setSubCategoryId(event.target.value)}
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
              disabled={!categoryId || subCategoriesLoading}
            >
              <option value="">
                {subCategoriesLoading
                  ? "Loading sub categories..."
                  : "Select sub category"}
              </option>
              {subCategories.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name.en}
                </option>
              ))}
            </select>
          </div>

          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="Image URL (optional)"
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[#E74C3C]"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] || null)
              }
              className="rounded-xl border border-white/10 bg-[var(--color-elevated)] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#E74C3C] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-900 dark:text-white"
            />
          </div>

          {ingredients.some((row) => row.ingredient) ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300">
              <p className="mb-1 font-medium text-zinc-200">
                Selected ingredients preview
              </p>
              <p>
                {ingredients
                  .filter((row) => row.ingredient)
                  .map(
                    (row) =>
                      ingredientMap.get(row.ingredient)?.name.en || "Unknown",
                  )
                  .join(", ")}
              </p>
            </div>
          ) : null}
        </section>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting || loadingOptions}
            className="rounded-xl bg-[#E74C3C] px-5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white shadow-[0_10px_25px_rgba(231,76,60,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Recipe"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>
    </main>
  );
}
