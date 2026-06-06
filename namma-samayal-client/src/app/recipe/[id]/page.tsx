"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Users,
  BarChart3,
  MapPin,
  ChefHat,
  UtensilsCrossed,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  PlayCircle,
  Tag,
  User,
  ExternalLink,
  Timer,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loader } from "@/components/common/Loader";
import { getRecipeById } from "@/features/recipe/services/recipeApi";
import { useLang } from "@/contexts/LanguageContext";
import type { Recipe } from "@/types/recipe";

function getSectionStyle(title: string): { bg: string; border: string; text: string } {
  const lower = title.toLowerCase();
  if (lower.includes("prep")) return { bg: "bg-blue-500/10", border: "border-blue-500/25", text: "text-blue-300" };
  if (lower.includes("cook") || lower.includes("process")) return { bg: "bg-orange-500/10", border: "border-orange-500/25", text: "text-orange-300" };
  if (lower.includes("spice") || lower.includes("grind") || lower.includes("masala")) return { bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-300" };
  if (lower.includes("temper") || lower.includes("season")) return { bg: "bg-yellow-500/10", border: "border-yellow-500/25", text: "text-yellow-300" };
  if (lower.includes("tip") || lower.includes("note")) return { bg: "bg-green-500/10", border: "border-green-500/25", text: "text-green-300" };
  if (lower.includes("final") || lower.includes("texture") || lower.includes("finish")) return { bg: "bg-teal-500/10", border: "border-teal-500/25", text: "text-teal-300" };
  return { bg: "bg-[#e74c3c]/10", border: "border-[#e74c3c]/25", text: "text-[#e74c3c]" };
}

function parseSpecialityBullets(text: string): string[] {
  // Split on " * " separator used in some recipes
  const parts = text.split(/\s*\*\s+/).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

function SpecialityCard({ en, ta, label }: { en: string; ta?: string; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const { t, lf } = useLang();
  const text = lf({ en, ta });
  const bullets = parseSpecialityBullets(text);
  const isLong = text.length > 160 || bullets.length > 1;

  return (
    <div className="rounded-2xl bg-[#121212] border border-white/8 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
        <Sparkles className="h-3.5 w-3.5 text-[#e74c3c] shrink-0" />
        <span className="text-[10px] font-black text-[#e74c3c] uppercase tracking-widest">{label}</span>
      </div>

      <div className="px-5 pb-1">
        {bullets.length > 1 ? (
          <ul className={`space-y-2.5 ${!expanded ? "max-h-[88px] overflow-hidden" : ""}`}>
            {bullets.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#e74c3c]/50 shrink-0" />
                <span className="text-sm text-gray-300 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm text-gray-300 leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
            {text}
          </p>
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1.5 px-5 py-3 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors border-t border-white/5 mt-3"
        >
          {expanded ? (
            <>{t("recipe.showLess")} <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>{t("recipe.readMore")} <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      )}

      {!isLong && <div className="pb-4" />}
    </div>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    easy: "bg-green-500/15 text-green-400 border-green-500/20",
    medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    hard: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider capitalize ${map[level] ?? map.medium}`}>
      {level}
    </span>
  );
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const { t, lf } = useLang();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await getRecipeById(params.id);
        setRecipe(data);
      } catch {
        setError("Failed to load recipe details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0b0b0b]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 pt-32 pb-12 bg-[#0b0b0b] min-h-screen">
        <ErrorMessage message={error} />
      </main>
    );
  }

  if (!recipe) return null;

  const hasSection = recipe.sections && recipe.sections.length > 0;
  const totalSteps = hasSection
    ? recipe.sections!.reduce((sum, s) => sum + (s.steps?.length ?? 0), 0)
    : recipe.steps?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#0b0b0b] pt-28 pb-24 overflow-x-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center gap-2 text-sm text-gray-500"
        >
          <Link
            href="/recipes"
            className="flex items-center gap-1.5 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t("recipe.allRecipes")}
          </Link>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="text-gray-400 truncate max-w-xs">{lf(recipe.seo?.title) || recipe.title || lf(recipe.dishName)}</span>
        </motion.div>

        {/* ── HERO ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[40px] bg-[#121212] border border-white/5 shadow-2xl mb-10"
        >
          {recipe.imageUrl ? (
            <div className="absolute inset-0 z-0">
              <img
                src={recipe.imageUrl}
                alt={recipe.seo?.title?.en || recipe.title || recipe.dishName.en}
                className="h-full w-full object-cover opacity-35 brightness-75 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/75 to-transparent" />
            </div>
          ) : (
            <>
              <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#e74c3c]/8 to-transparent" />
              <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]" />
              <div className="absolute -top-24 right-24 h-96 w-96 rounded-full bg-[#e74c3c]/10 blur-[120px]" />
            </>
          )}

          <div className="relative z-10 p-8 md:p-14">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">

              {/* Left: Title + Description */}
              <div className="flex-1 space-y-5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e74c3c] px-4 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider shadow-lg shadow-[#e74c3c]/20">
                    {recipe.source === "ai" ? t("recipe.aiCrafted") : recipe.source === "youtube" ? t("recipe.youtubeRecipe") : t("recipe.traditional")}
                  </span>
                  {recipe.location.city || recipe.location.state ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-[11px] font-medium text-gray-300">
                      <MapPin className="h-3 w-3 text-[#e74c3c]" />
                      {[recipe.location.city, recipe.location.state].filter(Boolean).join(", ")}
                    </div>
                  ) : null}
                  {recipe.category && (
                    <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-[11px] font-medium text-gray-400">
                      {lf(recipe.category.name)}
                    </div>
                  )}
                  <DifficultyBadge level={recipe.difficulty} />
                </div>

                {/* Name */}
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                    {lf(recipe.seo?.title) || recipe.title || lf(recipe.dishName)}
                  </h1>
                </div>

                {/* Description */}
                <div className="pt-1">
                  <p className="text-base md:text-lg text-gray-300 max-w-3xl leading-relaxed font-normal">
                    {lf(recipe.description)}
                  </p>
                </div>

                {/* Author */}
                {recipe.createdBy && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-[11px] font-bold text-white shadow-sm">
                      {recipe.createdBy.firstName?.[0]}{recipe.createdBy.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">{t("recipe.recipeBy")}</p>
                      <p className="text-sm font-semibold text-gray-400">
                        {recipe.createdBy.firstName} {recipe.createdBy.lastName}
                        {recipe.createdBy.username && (
                          <span className="text-gray-600 ml-1">@{recipe.createdBy.username}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Metadata Cards */}
              <div className="flex flex-row flex-wrap lg:flex-col gap-3 shrink-0 lg:w-[200px]">
                {(recipe.prepTime || recipe.cookingTime) && (
                  <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 backdrop-blur-xl flex-1 min-w-[150px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e74c3c]/10 text-[#e74c3c]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{t("recipe.cookTime")}</p>
                      <p className="text-base font-bold text-white">
                        {recipe.totalTime
                          ? `${recipe.totalTime} min`
                          : recipe.cookingTime
                            ? `${recipe.cookingTime} min`
                            : "--"}
                      </p>
                    </div>
                  </div>
                )}

                {recipe.prepTime && (
                  <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 backdrop-blur-xl flex-1 min-w-[150px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Timer className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{t("recipe.prepTime")}</p>
                      <p className="text-base font-bold text-white">{recipe.prepTime} min</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 backdrop-blur-xl flex-1 min-w-[150px]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{t("recipe.difficulty")}</p>
                    <p className="text-base font-bold text-white capitalize">{t(`difficulty.${recipe.difficulty}`)}</p>
                  </div>
                </div>

                {recipe.servings && (
                  <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 backdrop-blur-xl flex-1 min-w-[150px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{t("recipe.serves")}</p>
                      <p className="text-base font-bold text-white">{recipe.servings} {t("recipe.people")}</p>
                    </div>
                  </div>
                )}

                {recipe.averageRating > 0 && (
                  <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 backdrop-blur-xl flex-1 min-w-[150px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{t("recipe.rating")}</p>
                      <p className="text-base font-bold text-white">{recipe.averageRating.toFixed(1)} / 5</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── BODY: Ingredients + Steps ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Column 1: Ingredients + Speciality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-28 space-y-5">

              {/* Speciality — collapsible card */}
              {recipe.speciality && (
                <SpecialityCard en={recipe.speciality.en} ta={recipe.speciality.ta} label={t("recipe.speciality")} />
              )}

              {/* Ingredients */}
              <div className="rounded-[28px] bg-[#121212] border border-white/5 p-6 md:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="flex items-center gap-2.5 text-xl font-black text-white">
                    <UtensilsCrossed className="h-5 w-5 text-[#e74c3c]" />
                    {t("recipe.ingredients")}
                  </h2>
                  <span className="rounded-full bg-white/5 border border-white/8 px-3 py-1 text-xs font-bold text-gray-500">
                    {recipe.ingredients?.length || 0} {t("recipe.items")}
                  </span>
                </div>

                <div className="space-y-2">
                  {recipe.ingredients
                    ?.filter((item) => item.ingredient)
                    .map((item, index) => (
                      <Link
                        key={`${item.ingredient?._id}-${index}`}
                        href={`/ingredient/${item.ingredient?._id}`}
                        className="group flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 hover:bg-white/[0.07] hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e74c3c]/40 group-hover:bg-[#e74c3c] transition-colors shrink-0" />
                          <span className="text-sm md:text-[15px] font-medium text-gray-300 group-hover:text-white transition-colors">
                            {lf(item.ingredient?.name)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-500 group-hover:text-[#F4C430] transition-colors tabular-nums shrink-0 ml-2">
                          {[item.quantity, item.unit].filter(Boolean).join(" ") || "—"}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="rounded-[28px] bg-[#121212] border border-white/5 p-6 shadow-xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{t("recipe.tags")}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/5 border border-white/8 px-3 py-1.5 text-xs font-medium text-gray-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Link */}
              {recipe.recipeSource?.url && (
                <a
                  href={recipe.recipeSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[28px] bg-[#121212] border border-white/5 p-5 hover:border-white/15 transition-all group"
                >
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{t("recipe.originalSource")}</p>
                    <p className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors capitalize">
                      {recipe.recipeSource.type} {t("recipe.sourceLabel")}
                    </p>
                  </div>
                </a>
              )}

            </div>
          </motion.div>

          {/* Column 2: Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div className="rounded-[28px] bg-[#121212] border border-white/5 p-6 md:p-10 shadow-xl">

              {/* Steps header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/5">
                <h2 className="flex items-center gap-3.5 text-2xl md:text-3xl font-black text-white">
                  <PlayCircle className="h-7 w-7 text-[#e74c3c]" />
                  {t("recipe.cookingProcess")}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {totalSteps} {t("recipe.steps")}
                  {hasSection && ` · ${recipe.sections!.length} ${t("recipe.sections")}`}
                </div>
              </div>

              {/* Sections-based steps */}
              {hasSection ? (
                <div className="space-y-14">
                  {recipe.sections!.map((section, sectionIdx) => {
                    const style = getSectionStyle(section.title?.en ?? "");
                    return (
                      <div key={sectionIdx} className="space-y-6">
                        {section.title && (
                          <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border ${style.bg} ${style.border}`}>
                            <span className={`text-xs font-black tracking-widest uppercase ${style.text}`}>
                              {lf(section.title)}
                            </span>
                          </div>
                        )}

                        <div className="space-y-4 relative">
                          <div className="absolute left-[22px] top-8 bottom-8 w-px bg-white/4 hidden md:block" />
                          {section.steps?.map((step, index) => (
                            <div key={index} className="relative flex gap-5 md:gap-7 group">
                              <div className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b0b0b] border-2 border-white/8 text-sm font-black text-gray-400 z-10 group-hover:border-[#e74c3c] group-hover:text-white group-hover:bg-[#e74c3c] transition-all">
                                {step.step || index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg bg-[#e74c3c] text-xs font-black text-white mb-2.5">
                                  {step.step || index + 1}
                                </div>
                                <div className="rounded-2xl bg-white/[0.03] border border-white/6 p-5 md:p-6 transition-all group-hover:bg-white/[0.05] group-hover:border-white/10">
                                  <p className="text-[15px] md:text-base text-gray-200 font-normal leading-relaxed">
                                    {lf(step.description)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Flat steps */
                <div className="space-y-4 relative">
                  <div className="absolute left-[22px] top-8 bottom-8 w-px bg-white/4 hidden md:block" />
                  {recipe.steps?.map((step, index) => (
                    <div key={index} className="relative flex gap-5 md:gap-7 group">
                      <div className="hidden md:flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b0b0b] border-2 border-white/8 text-sm font-black text-gray-400 z-10 group-hover:border-[#e74c3c] group-hover:text-white group-hover:bg-[#e74c3c] transition-all">
                        {step.step || index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg bg-[#e74c3c] text-xs font-black text-white mb-2.5">
                          {step.step || index + 1}
                        </div>
                        <div className="rounded-2xl bg-white/[0.03] border border-white/6 p-5 md:p-6 transition-all group-hover:bg-white/[0.05] group-hover:border-white/10">
                          <p className="text-[15px] md:text-base text-gray-200 font-normal leading-relaxed">
                            {lf(step.description)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Done card */}
              <div className="mt-12 rounded-2xl bg-white/[0.03] border border-dashed border-white/8 p-8 text-center">
                <ChefHat className="h-9 w-9 text-gray-600 mx-auto mb-3" />
                <h4 className="text-white font-bold text-base mb-1.5">{t("recipe.readyToServe")}</h4>
                <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
                  {t("recipe.readyToServeMsg")}
                </p>
              </div>
            </div>

            {/* Recipe meta footer */}
            <div className="mt-6 rounded-[28px] bg-[#121212] border border-white/5 p-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
              {recipe.category && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{t("recipe.category")}</p>
                  <p className="text-sm font-semibold text-gray-300">{lf(recipe.category.name)}</p>
                </div>
              )}
              {recipe.subCategory && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{t("recipe.subCategory")}</p>
                  <p className="text-sm font-semibold text-gray-300">{lf(recipe.subCategory.name)}</p>
                </div>
              )}
              {recipe.location.region && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{t("recipe.region")}</p>
                  <p className="text-sm font-semibold text-gray-300">{recipe.location.region}</p>
                </div>
              )}
              {recipe.createdBy && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{t("recipe.addedBy")}</p>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-300">
                      {recipe.createdBy.firstName} {recipe.createdBy.lastName}
                    </p>
                  </div>
                </div>
              )}
              {recipe.aiGenerated && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{t("recipe.aiCrafted")}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-400">
                    {t("recipe.aiGenerated")}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
