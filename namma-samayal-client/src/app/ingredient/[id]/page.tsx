"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Tag, 
  Layers, 
  Info, 
  Leaf, 
  Activity,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
import { getIngredientById } from "@/features/ingredient/services/ingredientApi";
import type { Ingredient } from "@/types/ingredient";

export default function IngredientDetailPage() {
  const params = useParams<{ id: string }>();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadIngredient = async () => {
      try {
        const data = await getIngredientById(params.id);
        setIngredient(data);
      } catch {
        setError("Failed to load ingredient detail. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadIngredient();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 pt-32 pb-12">
        <ErrorMessage message={error} />
      </main>
    );
  }

  if (!ingredient) return null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pt-28 pb-20 overflow-x-hidden">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-6">
        {/* Navigation / Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500"
        >
          <Link 
            href="/ingredients" 
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Ingredients
          </Link>
          <ChevronRight className="h-3 w-3 opacity-20" />
          <span className="text-gray-500 dark:text-gray-400 font-medium">{ingredient.name.en}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Hero & Visuals */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 flex flex-col gap-6"
          >
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[var(--color-card)] border border-white/5 shadow-2xl">
              {/* Image OR Background Glow */}
              {ingredient.imageUrl ? (
                <div className="absolute inset-0 z-0">
                  <img 
                    src={ingredient.imageUrl} 
                    alt={ingredient.name.en}
                    className="h-full w-full object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] via-[#121212]/80 to-transparent" />
                </div>
              ) : (
                <>
                  <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#e74c3c]/10 blur-[100px]" />
                  <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px]" />
                </>
              )}

              <div className="relative z-10 p-8 lg:p-12">
                <div className="flex flex-col gap-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-semibold text-[#e74c3c] backdrop-blur-md"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    PREMIUM INGREDIENT
                  </motion.div>

                  <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {ingredient.name.en}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 mt-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e74c3c]/10 text-[#e74c3c]">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Category</p>
                        <p className="text-sm font-medium text-gray-200">{ingredient.category?.name?.en || "General"}</p>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Status</p>
                        <p className="text-sm font-medium text-gray-200">
                          {ingredient.isActive ? "Fresh & Available" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                    <Info className="h-4 w-4" />
                    About this ingredient
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed font-medium">
                    {ingredient.description?.en || 
                      `A essential component in many culinary creations, ${ingredient.name.en} brings a unique profile to every dish it's featured in.`}
                  </p>
                </div>
              </div>

              {/* Tags Section */}
              <div className="border-t border-white/5 bg-white/[0.02] p-6 lg:px-12">
                <div className="flex flex-wrap gap-3">
                  {ingredient.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors cursor-default"
                    >
                      <Tag className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Nutrition Card - Conditional */}
            {ingredient.nutrition && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl bg-[var(--color-card)] border border-white/5 p-8 shadow-xl"
              >
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                  <Activity className="h-5 w-5 text-[#e74c3c]" />
                  Nutritional Insights
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Calories", value: ingredient.nutrition.calories, unit: "kcal" },
                    { label: "Protein", value: ingredient.nutrition.protein, unit: "g" },
                    { label: "Carbs", value: ingredient.nutrition.carbs, unit: "g" },
                    { label: "Fat", value: ingredient.nutrition.fat, unit: "g" },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 text-center">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {item.value ?? 0}
                        <span className="ml-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">{item.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column: Actions / Related Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 flex flex-col gap-6"
          >
            <div className="rounded-3xl bg-[var(--color-card)] border border-white/5 p-6 shadow-xl h-fit">
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-3">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e74c3c] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#c0392b] transition-all shadow-lg shadow-[#e74c3c]/20">
                  Find Recipes with this
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all">
                  Show Substitutes
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#e74c3c]/20 to-transparent border border-[#e74c3c]/20 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e74c3c] text-white shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Chef's Tip
                </h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "When using {ingredient.name.en.toLowerCase()} in your cooking, always ensure it's at peak freshness to capture the most vibrant flavor profile."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

