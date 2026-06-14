import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import AdminLayout from "../../components/layout/AdminLayout";
import Toggle from "../../components/ui/Toggle";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import SmartPagination from "../../components/common/SmartPagination";
import AdminFilterBar, { type FilterDef } from "../../components/common/AdminFilterBar";

interface Category {
  _id: string;
  name: { en: string; ta?: string };
  level: number;
}

interface Ingredient {
  _id: string;
  name: { en: string; ta?: string };
  slug: string;
  category: Category;
  subCategory?: Category;
  description?: { en?: string; ta?: string };
  imageUrl?: string;
  nutrition?: {
    calories?: number; protein?: number; carbs?: number; fat?: number;
    fiber?: number; iron?: number; calcium?: number;
    vitaminA?: number; vitaminC?: number;
    dailyValue?: { iron?: number; calcium?: number; vitaminA?: number; vitaminC?: number };
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;

  // Extended fields (all optional)
  origin?: { country?: string; state?: string };
  season?: { availability?: "year-round" | "seasonal"; bestMonths?: number[] };
  status?: "fresh-available" | "seasonal" | "limited" | "out-of-stock";
  isPremium?: boolean;
  whySpecial?: { en?: string; ta?: string };
  chefTip?: { en?: string; ta?: string; attributedTo?: string };
  howToStore?: { en?: string; ta?: string };
  quickBenefits?: { en?: string; ta?: string }[];
  substitutes?: Array<{ _id: string; name: { en: string; ta?: string }; imageUrl?: string }>;
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

const EMPTY_FORM = {
  nameEn: "", nameTa: "",
  descEn: "", descTa: "",
  categoryId: "", subCategoryId: "",
  tags: "",
  calories: "", protein: "", carbs: "", fat: "",
  fiber: "", iron: "", calcium: "", vitaminA: "", vitaminC: "",
  dvIron: "", dvCalcium: "", dvVitaminA: "", dvVitaminC: "",
  // Extended
  originCountry: "", originState: "",
  seasonAvailability: "year-round" as "year-round" | "seasonal",
  status: "fresh-available" as "fresh-available" | "seasonal" | "limited" | "out-of-stock",
  whySpecialEn: "", whySpecialTa: "",
  chefTipEn: "", chefTipTa: "", chefTipBy: "",
  howToStoreEn: "", howToStoreTa: "",
  quickBenefits: "", // one benefit per line (en strings)
};
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const Ingredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters — synced to URL so refresh/back/forward preserves state
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const filterCategory = searchParams.get("category") ?? "";
  const filterSubCategory = searchParams.get("subCategory") ?? "";
  const filterStatus = searchParams.get("status") ?? "active"; // default: only active
  const filterHasImage = searchParams.get("hasImage") ?? "";
  const sortOrder = searchParams.get("sort") ?? "name-asc";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 12;

  // Dropdown options for filters (sub-categories of selected primary category)
  const [filterSubCategories, setFilterSubCategories] = useState<Category[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!filterCategory) {
        if (!cancelled) setFilterSubCategories([]);
        return;
      }
      try {
        const res = await axiosInstance.get(`/categories/${filterCategory}/subcategories`);
        if (!cancelled && res.data.success) setFilterSubCategories(res.data.data);
      } catch {
        if (!cancelled) setFilterSubCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, [filterCategory]);

  const updateUrl = useCallback(
    (updates: Record<string, string | number | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(updates)) {
            if (v == null || v === "") next.delete(k);
            else next.set(k, String(v));
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Filter definitions for AdminFilterBar (memoised so the component doesn't churn)
  const ingredientFilters: FilterDef[] = useMemo(
    () => [
      {
        key: "category",
        label: "Category",
        value: filterCategory,
        primary: true,
        options: [
          { value: "", label: "All Categories" },
          ...categories.map((c) => ({ value: c._id, label: c.name.en })),
        ],
      },
      {
        key: "subCategory",
        label: "Sub-category",
        value: filterSubCategory,
        primary: false,
        options: filterCategory
          ? [
              { value: "", label: "All Sub-categories" },
              ...filterSubCategories.map((c) => ({ value: c._id, label: c.name.en })),
            ]
          : [{ value: "", label: "Pick a category first" }],
      },
      {
        key: "status",
        label: "Status",
        value: filterStatus,
        primary: false,
        options: [
          { value: "active", label: "Active only" },
          { value: "inactive", label: "Inactive only" },
          { value: "all", label: "Active + Inactive" },
        ],
      },
      {
        key: "hasImage",
        label: "Image",
        value: filterHasImage,
        primary: false,
        options: [
          { value: "", label: "Any" },
          { value: "true", label: "Has image" },
          { value: "false", label: "No image" },
        ],
      },
    ],
    [filterCategory, filterSubCategory, filterStatus, filterHasImage, categories, filterSubCategories],
  );

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsPremium, setFormIsPremium] = useState(false);
  const [formBestMonths, setFormBestMonths] = useState<number[]>([]);
  const [formSubstituteIds, setFormSubstituteIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  // All ingredients (small slim list) for the Substitutes picker
  const [allIngredients, setAllIngredients] = useState<Array<{ _id: string; name: { en: string; ta?: string }; imageUrl?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEscapeKey(isModalOpen, () => setIsModalOpen(false));

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [search, filterCategory, filterSubCategory, filterStatus, filterHasImage, sortOrder, currentPage, pageSize]);

  useEffect(() => {
    if (form.categoryId) {
      fetchSubCategories(form.categoryId);
    } else {
      setSubCategories([]);
    }
  }, [form.categoryId]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories?level=0&limit=100");
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      console.error("Failed to load categories");
    }
  };

  const fetchSubCategories = async (catId: string) => {
    try {
      const res = await axiosInstance.get(`/categories/${catId}/subcategories`);
      if (res.data.success) setSubCategories(res.data.data);
    } catch (e) {
      setSubCategories([]);
    }
  };

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (search) params.set("search", search);
      if (filterCategory) params.set("category", filterCategory);
      if (filterSubCategory) params.set("subCategory", filterSubCategory);
      params.set("status", filterStatus); // "active" | "inactive" | "all"
      if (filterHasImage) params.set("hasImage", filterHasImage);
      params.set("sort", sortOrder);
      const res = await axiosInstance.get(`/ingredients?${params}`);
      if (res.data.success) {
        setIngredients(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (e) {
      setError("Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  // Populate form state from a (full) ingredient object — also accepts the
  // raw API populated category shape (where category may be either an _id
  // string or a populated object with _id+name).
  const populateFormFrom = (ingredient: Ingredient) => {
    const catId =
      typeof ingredient.category === "string"
        ? ingredient.category
        : ingredient.category?._id || "";
    const subCatId =
      typeof ingredient.subCategory === "string"
        ? ingredient.subCategory
        : ingredient.subCategory?._id || "";

    const numStr = (v: number | undefined) => (v != null ? String(v) : "");
    const dv = ingredient.nutrition?.dailyValue;

    setEditingId(ingredient._id);
    setForm({
      nameEn: ingredient.name?.en || "",
      nameTa: ingredient.name?.ta || "",
      descEn: ingredient.description?.en || "",
      descTa: ingredient.description?.ta || "",
      categoryId: catId,
      subCategoryId: subCatId,
      tags: (ingredient.tags || []).join(", "),
      calories: numStr(ingredient.nutrition?.calories),
      protein: numStr(ingredient.nutrition?.protein),
      carbs: numStr(ingredient.nutrition?.carbs),
      fat: numStr(ingredient.nutrition?.fat),
      fiber: numStr(ingredient.nutrition?.fiber),
      iron: numStr(ingredient.nutrition?.iron),
      calcium: numStr(ingredient.nutrition?.calcium),
      vitaminA: numStr(ingredient.nutrition?.vitaminA),
      vitaminC: numStr(ingredient.nutrition?.vitaminC),
      dvIron: numStr(dv?.iron),
      dvCalcium: numStr(dv?.calcium),
      dvVitaminA: numStr(dv?.vitaminA),
      dvVitaminC: numStr(dv?.vitaminC),
      originCountry: ingredient.origin?.country || "",
      originState: ingredient.origin?.state || "",
      seasonAvailability: (ingredient.season?.availability || "year-round") as "year-round" | "seasonal",
      status: (ingredient.status || "fresh-available") as "fresh-available" | "seasonal" | "limited" | "out-of-stock",
      whySpecialEn: ingredient.whySpecial?.en || "",
      whySpecialTa: ingredient.whySpecial?.ta || "",
      chefTipEn: ingredient.chefTip?.en || "",
      chefTipTa: ingredient.chefTip?.ta || "",
      chefTipBy: ingredient.chefTip?.attributedTo || "",
      howToStoreEn: ingredient.howToStore?.en || "",
      howToStoreTa: ingredient.howToStore?.ta || "",
      quickBenefits: (ingredient.quickBenefits || []).map((b) => b.en || "").filter(Boolean).join("\n"),
    });
    setFormIsActive(ingredient.isActive);
    setFormIsPremium(ingredient.isPremium === true);
    setFormBestMonths(Array.isArray(ingredient.season?.bestMonths) ? [...ingredient.season!.bestMonths!] : []);
    setFormSubstituteIds((ingredient.substitutes || []).map((s) => s._id));
    setImagePreview(ingredient.imageUrl || "");
  };

  // Lazy-load the slim list of all ingredients (used by the Substitutes picker)
  const loadAllIngredients = useCallback(async () => {
    if (allIngredients.length > 0) return;
    try {
      const res = await axiosInstance.get("/ingredients", {
        params: { status: "all", limit: 500, sort: "name-asc" },
      });
      const list = (res.data?.data || []) as Array<{ _id: string; name: { en: string; ta?: string }; imageUrl?: string }>;
      setAllIngredients(list);
    } catch (err) {
      console.warn("Failed to load ingredient list for substitutes picker", err);
    }
  }, [allIngredients.length]);

  const openModal = async (ingredient?: Ingredient) => {
    setImageFile(null);
    loadAllIngredients();
    if (!ingredient) {
      // Add mode — clear everything.
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setFormIsActive(true);
      setFormIsPremium(false);
      setFormBestMonths([]);
      setFormSubstituteIds([]);
      setImagePreview("");
      setIsModalOpen(true);
      return;
    }

    // Edit mode — open immediately with the list data we already have
    // (so the modal feels instant), then refresh from the API in case the
    // list response was partial/stale.
    populateFormFrom(ingredient);
    setIsModalOpen(true);

    try {
      const res = await axiosInstance.get(`/ingredients/${ingredient._id}`);
      if (res.data?.success && res.data?.data) {
        populateFormFrom(res.data.data as Ingredient);
      }
    } catch (err) {
      // Network failure is fine here — we already populated from the list data.
      console.warn("Failed to refresh ingredient by id; keeping list snapshot.", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const formData = new FormData();
      formData.append("name[en]", form.nameEn);
      if (form.nameTa) formData.append("name[ta]", form.nameTa);
      if (form.descEn) formData.append("description[en]", form.descEn);
      if (form.descTa) formData.append("description[ta]", form.descTa);
      formData.append("category", form.categoryId);
      if (form.subCategoryId) formData.append("subCategory", form.subCategoryId);
      const tagArr = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      tagArr.forEach(tag => formData.append("tags[]", tag));
      // Build a single nutrition JSON object so optional fields stay grouped
      const num = (v: string) => (v !== "" ? Number(v) : undefined);
      const nutrition: Record<string, number | Record<string, number>> = {};
      const addNum = (key: string, v: string) => {
        const n = num(v);
        if (n !== undefined && !Number.isNaN(n)) nutrition[key] = n;
      };
      addNum("calories", form.calories);
      addNum("protein", form.protein);
      addNum("carbs", form.carbs);
      addNum("fat", form.fat);
      addNum("fiber", form.fiber);
      addNum("iron", form.iron);
      addNum("calcium", form.calcium);
      addNum("vitaminA", form.vitaminA);
      addNum("vitaminC", form.vitaminC);
      const dv: Record<string, number> = {};
      [
        ["iron", form.dvIron],
        ["calcium", form.dvCalcium],
        ["vitaminA", form.dvVitaminA],
        ["vitaminC", form.dvVitaminC],
      ].forEach(([k, v]) => {
        const n = num(v);
        if (n !== undefined && !Number.isNaN(n)) dv[k] = n;
      });
      if (Object.keys(dv).length) nutrition.dailyValue = dv;
      if (Object.keys(nutrition).length) {
        formData.append("nutrition", JSON.stringify(nutrition));
      }

      // Extended fields — sent as JSON strings; server parses them via parseMaybeJson
      const origin: Record<string, string> = {};
      if (form.originCountry) origin.country = form.originCountry.trim();
      if (form.originState) origin.state = form.originState.trim();
      if (Object.keys(origin).length) formData.append("origin", JSON.stringify(origin));

      formData.append(
        "season",
        JSON.stringify({
          availability: form.seasonAvailability,
          bestMonths: formBestMonths.slice().sort((a, b) => a - b),
        })
      );

      formData.append("status", form.status);
      formData.append("isPremium", String(formIsPremium));

      const whySpecial: Record<string, string> = {};
      if (form.whySpecialEn) whySpecial.en = form.whySpecialEn.trim();
      if (form.whySpecialTa) whySpecial.ta = form.whySpecialTa.trim();
      formData.append("whySpecial", JSON.stringify(whySpecial));

      const chefTip: Record<string, string> = {};
      if (form.chefTipEn) chefTip.en = form.chefTipEn.trim();
      if (form.chefTipTa) chefTip.ta = form.chefTipTa.trim();
      if (form.chefTipBy) chefTip.attributedTo = form.chefTipBy.trim();
      formData.append("chefTip", JSON.stringify(chefTip));

      const howToStore: Record<string, string> = {};
      if (form.howToStoreEn) howToStore.en = form.howToStoreEn.trim();
      if (form.howToStoreTa) howToStore.ta = form.howToStoreTa.trim();
      formData.append("howToStore", JSON.stringify(howToStore));

      const benefits = form.quickBenefits
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((en) => ({ en }));
      formData.append("quickBenefits", JSON.stringify(benefits));

      formData.append("substitutes", JSON.stringify(formSubstituteIds));

      if (imageFile) formData.append("image", imageFile);
      if (editingId) formData.append("isActive", String(formIsActive));

      if (editingId) {
        await axiosInstance.patch(`/ingredients/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/ingredients", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsModalOpen(false);
      fetchIngredients();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save ingredient");
    } finally {
      setModalLoading(false);
    }
  };

  const toggleStatus = async (ingredient: Ingredient) => {
    const next = !ingredient.isActive;
    setIngredients(prev => prev.map(i => i._id === ingredient._id ? { ...i, isActive: next } : i));
    try {
      await axiosInstance.patch(`/ingredients/${ingredient._id}`, { isActive: next });
    } catch {
      setIngredients(prev => prev.map(i => i._id === ingredient._id ? { ...i, isActive: !next } : i));
      alert("Failed to update status");
    }
  };

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <AdminLayout>
      {/* Page header — premium dark */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
            <span className="h-1 w-8 bg-gradient-to-r from-[#e74c3c] to-transparent" />
            Library
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            Ingredients
          </h1>
          <p className="text-sm text-gray-500 mt-3 font-medium">
            {pagination
              ? <><span className="font-black text-gray-300">{pagination.total.toLocaleString()}</span> ingredients in your library</>
              : "Manage your ingredient library"}
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="group inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] px-5 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_28px_-8px_rgba(231,76,60,0.55)] hover:shadow-[0_12px_36px_-8px_rgba(231,76,60,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:rotate-90">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Ingredient
        </button>
      </div>

      {/* Filters */}
      <AdminFilterBar
        className="mb-6"
        searchValue={search}
        searchPlaceholder="Search ingredients by name, tag, or description..."
        onSearchChange={(q) => updateUrl({ search: q, page: 1 })}
        totalCount={pagination?.total}
        countLabel="ingredients"
        filters={ingredientFilters}
        onFilterChange={(key, value) => {
          // When category changes, also clear subCategory
          if (key === "category") updateUrl({ category: value, subCategory: null, page: 1 });
          else updateUrl({ [key]: value, page: 1 });
        }}
        // (sharper UI from here down — see card grid)
        sort={{
          value: sortOrder,
          options: [
            { value: "name-asc", label: "Name A-Z" },
            { value: "name-desc", label: "Name Z-A" },
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ],
        }}
        onSortChange={(value) => updateUrl({ sort: value === "name-asc" ? null : value, page: 1 })}
        onClearAll={() => {
          // Wipe every filter param but keep limit/sort defaults clean
          setSearchParams(new URLSearchParams(), { replace: true });
        }}
      />
      {/* (filter list defined via useMemo below) */}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden animate-pulse">
              <div className="w-full aspect-[4/3] bg-white/5" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-5 bg-white/5 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-lg border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] text-[#ff8a7e] px-5 py-4 text-sm font-medium flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      ) : ingredients.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-white/5 mb-4 text-3xl">🥕</div>
          <p className="text-white font-bold text-base">No ingredients found</p>
          <p className="text-gray-500 text-sm mt-1.5">Try a different filter or add a new ingredient</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {ingredients.map((ing) => (
              <div
                key={ing._id}
                className={`group relative flex flex-col rounded-xl border bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden transition-all duration-300 ${
                  !ing.isActive
                    ? "border-white/[0.06] opacity-50"
                    : "border-white/[0.12] hover:border-[#e74c3c]/30 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(231,76,60,0.25)]"
                }`}
              >
                {/* Top hairline highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

                {/* Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0f0f0f]">
                  {ing.imageUrl ? (
                    <img
                      src={ing.imageUrl}
                      alt={ing.name.en}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-white/10">🥘</div>
                  )}
                  {/* Bottom gradient fade for text legibility on image */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Status toggle */}
                  <div
                    className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/45 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
                    title={ing.isActive ? "Visible to users" : "Hidden from users"}
                  >
                    <Toggle
                      size="sm"
                      checked={ing.isActive}
                      onChange={() => toggleStatus(ing)}
                      ariaLabel={`Toggle ${ing.name.en} active`}
                    />
                  </div>

                  {/* Inactive ribbon */}
                  {!ing.isActive && (
                    <div className="absolute top-2.5 left-2.5 rounded-md bg-black/65 backdrop-blur-md border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-gray-300">
                      Hidden
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-4 pb-3 flex flex-col gap-2.5">
                  <div>
                    <h3 className="text-[15px] font-bold text-white tracking-tight leading-tight line-clamp-1">
                      {ing.name.en}
                    </h3>
                    {ing.name.ta && (
                      <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">
                        {ing.name.ta}
                      </p>
                    )}
                  </div>

                  {(ing.category || ing.subCategory) && (
                    <div className="flex flex-wrap gap-1.5">
                      {ing.category && (
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-[#e74c3c]/10 text-[#ff8a7e] border border-[#e74c3c]/25 px-1.5 py-0.5 rounded">
                          {ing.category.name.en}
                        </span>
                      )}
                      {ing.subCategory && (
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/12 px-1.5 py-0.5 rounded">
                          {ing.subCategory.name.en}
                        </span>
                      )}
                    </div>
                  )}

                  {ing.nutrition?.calories && (
                    <p className="text-[11px] text-gray-500 font-medium">
                      <span className="text-amber-400">🔥</span> {ing.nutrition.calories} kcal
                      {ing.nutrition.protein ? <> <span className="text-gray-600">·</span> {ing.nutrition.protein}g protein</> : null}
                    </p>
                  )}

                  {ing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ing.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-500 font-medium">
                          #{tag}
                        </span>
                      ))}
                      {ing.tags.length > 3 && (
                        <span className="text-[10px] text-gray-600 font-medium">+{ing.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer — flush edit strip, no own border */}
                <button
                  onClick={() => openModal(ing)}
                  className="group/edit relative w-full border-t border-white/[0.06] py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5"
                >
                  Edit
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover/edit:translate-x-0.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && (
            <SmartPagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              pageSize={pageSize}
              onPageChange={(page) => updateUrl({ page })}
              onPageSizeChange={(size, page) => updateUrl({ limit: size, page })}
              itemLabel="ingredients"
            />
          )}
        </>
      )}

      {/* Add/Edit Modal — dark premium theme */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#141414] to-[#0a0a0a] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Top hairline highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />
            {/* Soft red glow corner */}
            <div className="pointer-events-none absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#e74c3c]/[0.06] blur-3xl" />

            {/* Modal Header */}
            <div className="relative px-6 py-5 border-b border-white/[0.06] flex justify-between items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
                  <span className="h-1 w-6 bg-gradient-to-r from-[#e74c3c] to-transparent" />
                  {editingId ? "Edit" : "New"}
                </div>
                <h3 className="font-black text-xl text-white tracking-tight">
                  {editingId ? "Edit Ingredient" : "Add Ingredient"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">Fill in the ingredient details below</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.16] text-gray-500 hover:text-white transition-all text-lg"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="relative p-6 space-y-5">
              {/* Visibility */}
              {editingId && (
                <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl px-4 py-3.5">
                  <div>
                    <p className="text-sm font-bold text-white">Visibility</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formIsActive ? "Visible to users in the app" : "Hidden from users"}
                    </p>
                  </div>
                  <Toggle
                    checked={formIsActive}
                    onChange={setFormIsActive}
                    label={formIsActive ? "Active" : "Inactive"}
                  />
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-2">Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:border-[#e74c3c]/35 hover:bg-white/[0.04] transition-all overflow-hidden relative"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="preview" className="w-full h-44 object-cover" />
                      {/* Bottom fade + replace hint */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-2 right-2 px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-gray-300 rounded-md border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to replace
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500 group-hover:text-[#ff8a7e] transition-colors">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-[10px] text-gray-600 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Name (English)*</label>
                  <input
                    type="text" value={form.nameEn} onChange={f("nameEn")} required
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                    placeholder="e.g. Tomato"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Name (Tamil)</label>
                  <input
                    type="text" value={form.nameTa} onChange={f("nameTa")}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                    placeholder="e.g. தக்காளி"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Description (EN)</label>
                  <textarea
                    value={form.descEn} onChange={f("descEn")} rows={2}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-none"
                    placeholder="Brief description..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Description (TA)</label>
                  <textarea
                    value={form.descTa} onChange={f("descTa")} rows={2}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-none"
                    placeholder="சுருக்கமான விவரம்..."
                  />
                </div>
              </div>

              {/* Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Category*</label>
                  <select
                    value={form.categoryId} onChange={f("categoryId")} required
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%2210%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23888%22%20stroke-width=%223%22><polyline%20points=%226%209%2012%2015%2018%209%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center] pr-9"
                  >
                    <option value="" className="bg-[#141414]">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id} className="bg-[#141414]">{c.name.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Sub-Category</label>
                  <select
                    value={form.subCategoryId} onChange={f("subCategoryId")}
                    disabled={!form.categoryId || subCategories.length === 0}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-white outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all appearance-none disabled:opacity-40 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%2210%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23888%22%20stroke-width=%223%22><polyline%20points=%226%209%2012%2015%2018%209%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center] pr-9"
                  >
                    <option value="" className="bg-[#141414]">None</option>
                    {subCategories.map(c => (
                      <option key={c._id} value={c._id} className="bg-[#141414]">{c.name.en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nutrition */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-2">Nutrition <span className="text-gray-600 normal-case font-medium tracking-normal">(per 100g)</span></label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { key: "calories" as const, label: "Calories", unit: "kcal" },
                    { key: "protein" as const, label: "Protein", unit: "g" },
                    { key: "carbs" as const, label: "Carbs", unit: "g" },
                    { key: "fat" as const, label: "Fat", unit: "g" },
                    { key: "fiber" as const, label: "Fiber", unit: "g" },
                    { key: "iron" as const, label: "Iron", unit: "mg" },
                    { key: "calcium" as const, label: "Calcium", unit: "mg" },
                    { key: "vitaminA" as const, label: "Vit A", unit: "µg" },
                    { key: "vitaminC" as const, label: "Vit C", unit: "mg" },
                  ].map(({ key, label, unit }) => (
                    <div key={key}>
                      <label className="block text-[10px] text-gray-500 mb-1 font-medium">{label} <span className="text-gray-600">({unit})</span></label>
                      <input
                        type="number" min="0" step="0.1" value={form[key]} onChange={f(key)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">% Daily Value <span className="text-gray-600 normal-case font-medium tracking-normal">(for the rich nutrition card)</span></p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: "dvIron" as const, label: "Iron" },
                      { key: "dvCalcium" as const, label: "Calcium" },
                      { key: "dvVitaminA" as const, label: "Vit A" },
                      { key: "dvVitaminC" as const, label: "Vit C" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-[10px] text-gray-500 mb-1 font-medium">{label}</label>
                        <div className="relative">
                          <input
                            type="number" min="0" max="500" value={form[key]} onChange={f(key)}
                            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 pr-6 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                            placeholder="0"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─────── Extended fields for the rich detail page ─────── */}
              <details className="rounded-lg border border-white/[0.08] bg-white/[0.02]" open>
                <summary className="cursor-pointer select-none px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-gray-300 hover:text-white">
                  Rich detail-page fields
                  <span className="ml-2 text-gray-500 normal-case font-medium tracking-normal text-[11px]">— shown on the user-facing ingredient page</span>
                </summary>
                <div className="px-4 pb-5 pt-1 space-y-5">

                  {/* Origin + Status + Premium */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Origin Country</label>
                      <input
                        type="text" value={form.originCountry} onChange={f("originCountry")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                        placeholder="India"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Origin State</label>
                      <input
                        type="text" value={form.originState} onChange={f("originState")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                        placeholder="(optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Status</label>
                      <select
                        value={form.status} onChange={f("status")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                      >
                        <option value="fresh-available" className="bg-[#141414]">Fresh &amp; Available</option>
                        <option value="seasonal" className="bg-[#141414]">Seasonal</option>
                        <option value="limited" className="bg-[#141414]">Limited</option>
                        <option value="out-of-stock" className="bg-[#141414]">Out of Stock</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Premium</label>
                      <div className="flex items-center gap-2 py-2">
                        <Toggle checked={formIsPremium} onChange={setFormIsPremium} />
                        <span className="text-xs text-gray-400">{formIsPremium ? "Marked Premium" : "Regular"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Season — availability + best-months toggle row */}
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-start">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Season Availability</label>
                      <select
                        value={form.seasonAvailability} onChange={f("seasonAvailability")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                      >
                        <option value="year-round" className="bg-[#141414]">Year Round</option>
                        <option value="seasonal" className="bg-[#141414]">Seasonal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Best Months <span className="text-gray-600 normal-case font-medium tracking-normal">(toggle the months this is at peak)</span></label>
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
                        {MONTH_LABELS.map((label, idx) => {
                          const monthNum = idx + 1;
                          const active = formBestMonths.includes(monthNum);
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => {
                                setFormBestMonths((prev) =>
                                  active ? prev.filter((m) => m !== monthNum) : [...prev, monthNum]
                                );
                              }}
                              className={`rounded-md py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                                active
                                  ? "bg-emerald-500/25 text-emerald-200 border border-emerald-500/40"
                                  : "bg-white/[0.02] text-gray-500 border border-white/[0.08] hover:text-gray-300 hover:border-white/[0.18]"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Why it's special */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Why It's Special (EN)</label>
                      <textarea
                        rows={2} value={form.whySpecialEn} onChange={f("whySpecialEn")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-y"
                        placeholder="A 1-2 sentence highlight shown in the green sticky note."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Why It's Special (TA)</label>
                      <textarea
                        rows={2} value={form.whySpecialTa} onChange={f("whySpecialTa")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-y"
                        placeholder="(optional)"
                      />
                    </div>
                  </div>

                  {/* Chef's Tip */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px] gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Chef's Tip (EN)</label>
                      <textarea
                        rows={2} value={form.chefTipEn} onChange={f("chefTipEn")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-y"
                        placeholder="Quote shown in the Chef's Tip card."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Chef's Tip (TA)</label>
                      <textarea
                        rows={2} value={form.chefTipTa} onChange={f("chefTipTa")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-y"
                        placeholder="(optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Attributed to</label>
                      <input
                        type="text" value={form.chefTipBy} onChange={f("chefTipBy")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                        placeholder="Namma Samayal Chef"
                      />
                    </div>
                  </div>

                  {/* How to Store */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">How to Store (EN)</label>
                      <textarea
                        rows={2} value={form.howToStoreEn} onChange={f("howToStoreEn")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-y"
                        placeholder="Storage instructions shown in the How to Store card."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">How to Store (TA)</label>
                      <textarea
                        rows={2} value={form.howToStoreTa} onChange={f("howToStoreTa")}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all resize-y"
                        placeholder="(optional)"
                      />
                    </div>
                  </div>

                  {/* Quick benefits — one per line */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Quick Benefits <span className="text-gray-600 normal-case font-medium tracking-normal">(one per line — shown on the pink sticky note)</span></label>
                    <textarea
                      rows={3} value={form.quickBenefits} onChange={f("quickBenefits")}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-gray-700 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all font-mono"
                      placeholder={"Rich in iron\nSupports immunity\nGood for eye health"}
                    />
                  </div>

                  {/* Substitutes picker */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
                      Substitutes
                      <span className="text-gray-600 normal-case font-medium tracking-normal"> ({formSubstituteIds.length} selected{allIngredients.length ? ` of ${allIngredients.length}` : ""})</span>
                    </label>
                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2 max-h-48 overflow-y-auto">
                      {allIngredients.length === 0 ? (
                        <p className="text-xs text-gray-500 p-2">Loading ingredient list…</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                          {allIngredients
                            .filter((i) => i._id !== editingId)
                            .map((i) => {
                              const checked = formSubstituteIds.includes(i._id);
                              return (
                                <label
                                  key={i._id}
                                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
                                    checked
                                      ? "bg-emerald-500/15 text-emerald-200"
                                      : "text-gray-300 hover:bg-white/[0.04]"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      setFormSubstituteIds((prev) =>
                                        checked ? prev.filter((id) => id !== i._id) : [...prev, i._id]
                                      );
                                    }}
                                    className="accent-emerald-500"
                                  />
                                  <span className="truncate">{i.name?.en}</span>
                                </label>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </details>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">Tags</label>
                <input
                  type="text" value={form.tags} onChange={f("tags")}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#e74c3c]/45 focus:bg-white/[0.04] transition-all"
                  placeholder="vegan, spicy, gluten-free (comma separated)"
                />
                {form.tags.trim() && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.tags.split(",").map(t => t.trim()).filter(Boolean).map((tag, i) => (
                      <span key={`${tag}-${i}`} className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-[#e74c3c]/10 text-[#ff8a7e] border border-[#e74c3c]/25 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.02] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.18] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="group flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_28px_-8px_rgba(231,76,60,0.55)] hover:shadow-[0_12px_36px_-8px_rgba(231,76,60,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all"
                >
                  {modalLoading ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      {editingId ? "Update Ingredient" : "Create Ingredient"}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:translate-x-0.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Ingredients;
