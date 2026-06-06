import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosConfig";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface Category { _id: string; name: { en: string } }
interface Ingredient { _id: string; name: { en: string }; imageUrl?: string }

interface RecipeIngredientRow { ingredient: string; quantity: string; unit: string }
interface StepRow { step: number; descEn: string; descTa: string }
interface SectionRow { type: string; titleEn: string; titleTa: string; steps: StepRow[]; isCollapsed?: boolean }

interface RecipeFormData {
  dishNameEn: string; dishNameTa: string;
  descEn: string; descTa: string;
  specialityEn: string; specialityTa: string;
  country: string; state: string; region: string; city: string;
  categoryId: string; subCategoryId: string;
  difficulty: "easy" | "medium" | "hard";
  prepTime: string; cookingTime: string; totalTime: string; servings: string;
  tags: string;
  source: "manual" | "youtube" | "blog" | "ai";
  isPublic: boolean;
  // SEO section — what users see in the app + search engines
  seoTitleEn: string; seoTitleTa: string;
  seoDescEn: string; seoDescTa: string;
  seoKeywords: string; // comma-separated in the form
}

const EMPTY_FORM: RecipeFormData = {
  dishNameEn: "", dishNameTa: "",
  descEn: "", descTa: "",
  specialityEn: "", specialityTa: "",
  country: "India", state: "", region: "", city: "",
  categoryId: "", subCategoryId: "",
  difficulty: "medium",
  prepTime: "", cookingTime: "", totalTime: "", servings: "",
  tags: "",
  source: "manual",
  isPublic: true,
  seoTitleEn: "", seoTitleTa: "",
  seoDescEn: "", seoDescTa: "",
  seoKeywords: "",
};

interface RecipeModalProps {
  editingRecipe?: any;
  onClose: () => void;
  onSaved: () => void;
}

const TABS = ["Basic Info", "SEO", "Location", "Ingredients", "Steps", "Media"] as const;
type Tab = typeof TABS[number];

const RecipeModal = ({ editingRecipe, onClose, onSaved }: RecipeModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Basic Info");
  const [form, setForm] = useState<RecipeFormData>({ ...EMPTY_FORM });
  const [ingredients, setIngredients] = useState<RecipeIngredientRow[]>([
    { ingredient: "", quantity: "", unit: "" }
  ]);
  const [sections, setSections] = useState<SectionRow[]>([
    { type: "preparation", titleEn: "Preparation", titleTa: "", steps: [{ step: 1, descEn: "", descTa: "" }] }
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<Ingredient[]>([]);
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState<Record<number, string>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEscapeKey(true, onClose);

  const [draggableSectionIdx, setDraggableSectionIdx] = useState<number | null>(null);
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);
  
  const [draggableStepInfo, setDraggableStepInfo] = useState<{sIdx: number, stepIdx: number} | null>(null);
  const [draggedStepInfo, setDraggedStepInfo] = useState<{sIdx: number, stepIdx: number} | null>(null);

  const isEdit = !!editingRecipe;

  useEffect(() => {
    fetchCategories();
    fetchIngredientOptions();
  }, []);

  useEffect(() => {
    if (editingRecipe) {
      setForm({
        dishNameEn: editingRecipe.dishName?.en || "",
        dishNameTa: editingRecipe.dishName?.ta || "",
        descEn: editingRecipe.description?.en || "",
        descTa: editingRecipe.description?.ta || "",
        specialityEn: editingRecipe.speciality?.en || "",
        specialityTa: editingRecipe.speciality?.ta || "",
        country: editingRecipe.location?.country || "India",
        state: editingRecipe.location?.state || "",
        region: editingRecipe.location?.region || "",
        city: editingRecipe.location?.city || "",
        categoryId: editingRecipe.category?._id || "",
        subCategoryId: editingRecipe.subCategory?._id || "",
        difficulty: editingRecipe.difficulty || "medium",
        prepTime: String(editingRecipe.prepTime || ""),
        cookingTime: String(editingRecipe.cookingTime || ""),
        totalTime: String(editingRecipe.totalTime || ""),
        servings: String(editingRecipe.servings || ""),
        tags: (editingRecipe.tags || []).join(", "),
        source: editingRecipe.source || "manual",
        isPublic: editingRecipe.isPublic ?? true,
        seoTitleEn: editingRecipe.seo?.title?.en || "",
        seoTitleTa: editingRecipe.seo?.title?.ta || "",
        seoDescEn: editingRecipe.seo?.description?.en || "",
        seoDescTa: editingRecipe.seo?.description?.ta || "",
        seoKeywords: (editingRecipe.seo?.keywords || editingRecipe.searchKeywords || []).join(", "),
      });
      const ingRows = (editingRecipe.ingredients || []).map((i: any) => ({
        ingredient: i.ingredient?._id || i.ingredient || "",
        quantity: i.quantity || "",
        unit: i.unit || "",
      }));
      setIngredients(ingRows.length ? ingRows : [{ ingredient: "", quantity: "", unit: "" }]);
      
      if (editingRecipe.sections && editingRecipe.sections.length > 0) {
        setSections(editingRecipe.sections.map((sec: any) => ({
          type: sec.type || "cooking",
          titleEn: sec.title?.en || "",
          titleTa: sec.title?.ta || "",
          steps: (sec.steps || []).map((s: any, idx: number) => ({
            step: s.step || idx + 1,
            descEn: s.description?.en || "",
            descTa: s.description?.ta || "",
          }))
        })));
      } else if (editingRecipe.steps && editingRecipe.steps.length > 0) {
        // Fallback for old recipes
        setSections([{
          type: "cooking",
          titleEn: "Cooking Process",
          titleTa: "சமைக்கும் முறை",
          steps: editingRecipe.steps.map((s: any, idx: number) => ({
            step: s.step || idx + 1,
            descEn: s.description?.en || "",
            descTa: s.description?.ta || "",
          }))
        }]);
      } else {
        setSections([{ type: "preparation", titleEn: "Preparation", titleTa: "", steps: [{ step: 1, descEn: "", descTa: "" }] }]);
      }
      
      setImagePreview(editingRecipe.imageUrl || "");
    }
  }, [editingRecipe]);

  useEffect(() => {
    if (form.categoryId) fetchSubCategories(form.categoryId);
    else setSubCategories([]);
  }, [form.categoryId]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories?level=0&limit=100");
      if (res.data.success) setCategories(res.data.data);
    } catch {}
  };

  const fetchSubCategories = async (catId: string) => {
    try {
      const res = await axiosInstance.get(`/categories/${catId}/subcategories`);
      if (res.data.success) setSubCategories(res.data.data);
    } catch {}
  };

  const fetchIngredientOptions = async () => {
    setIsFetchingIngredients(true);
    try {
      const res = await axiosInstance.get("/ingredients?limit=3000&includeInactive=false");
      if (res.data.success) setIngredientOptions(res.data.data);
    } catch {} finally {
      setIsFetchingIngredients(false);
    }
  };

  const f = (key: keyof RecipeFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  // Ingredients
  const addIngredient = () => setIngredients(p => [...p, { ingredient: "", quantity: "", unit: "" }]);
  const removeIngredient = (i: number) => setIngredients(p => p.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, key: keyof RecipeIngredientRow, val: string) =>
    setIngredients(p => p.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

  // Filtered ingredient dropdown
  const filteredIngredients = (idx: number) => {
    const q = ingredientSearch[idx] || "";
    if (!q) return ingredientOptions.slice(0, 20);
    return ingredientOptions.filter(i => i.name.en.toLowerCase().includes(q.toLowerCase())).slice(0, 15);
  };

  // Sections & Steps
  const addSection = () => setSections(p => [...p, { type: "cooking", titleEn: "", titleTa: "", steps: [{ step: 1, descEn: "", descTa: "" }] }]);
  const removeSection = (sIdx: number) => setSections(p => p.filter((_, idx) => idx !== sIdx));
  const updateSection = (sIdx: number, key: keyof SectionRow, val: any) => 
    setSections(p => p.map((sec, idx) => idx === sIdx ? { ...sec, [key]: val } : sec));

  const addStep = (sIdx: number) => setSections(p => p.map((sec, idx) => idx === sIdx ? { ...sec, steps: [...sec.steps, { step: sec.steps.length + 1, descEn: "", descTa: "" }] } : sec));
  const removeStep = (sIdx: number, stepIdx: number) => setSections(p => p.map((sec, idx) => {
    if (idx !== sIdx) return sec;
    const newSteps = sec.steps.filter((_, i) => i !== stepIdx).map((s, i) => ({ ...s, step: i + 1 }));
    return { ...sec, steps: newSteps };
  }));
  const updateStep = (sIdx: number, stepIdx: number, key: keyof Omit<StepRow, "step">, val: string) =>
    setSections(p => p.map((sec, idx) => {
      if (idx !== sIdx) return sec;
      const newSteps = sec.steps.map((step, i) => i === stepIdx ? { ...step, [key]: val } : step);
      return { ...sec, steps: newSteps };
    }));

  const handleSectionDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSectionIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleSectionDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSectionIdx === null || draggedSectionIdx === index) return;
    setSections(p => {
      const arr = [...p];
      const item = arr.splice(draggedSectionIdx, 1)[0];
      arr.splice(index, 0, item);
      return arr;
    });
    setDraggedSectionIdx(null);
  };

  const handleStepDragStart = (e: React.DragEvent, sIdx: number, stepIdx: number) => {
    e.stopPropagation();
    setDraggedStepInfo({ sIdx, stepIdx });
    e.dataTransfer.effectAllowed = "move";
  };
  const handleStepDrop = (e: React.DragEvent, sIdx: number, stepIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedStepInfo || draggedStepInfo.sIdx !== sIdx || draggedStepInfo.stepIdx === stepIdx) {
      setDraggedStepInfo(null);
      return;
    }
    setSections(p => p.map((sec, i) => {
      if (i !== sIdx) return sec;
      const arr = [...sec.steps];
      const item = arr.splice(draggedStepInfo.stepIdx, 1)[0];
      arr.splice(stepIdx, 0, item);
      return { ...sec, steps: arr.map((s, idx) => ({ ...s, step: idx + 1 })) };
    }));
    setDraggedStepInfo(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const validate = () => {
    if (!form.dishNameEn.trim()) return "Dish name (English) is required.";
    if (!form.descEn.trim()) return "Description (English) is required.";
    if (!form.country.trim()) return "Country is required.";
    if (ingredients.some(i => !i.ingredient)) return "Please select an ingredient for all rows.";
    if (sections.length === 0) return "At least one section is required.";
    for (const sec of sections) {
      if (!sec.titleEn.trim()) return "All sections must have an English title.";
      if (sec.steps.some(s => !s.descEn.trim())) return "All steps must have an English description.";
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true); setError("");

    try {
      const formData = new FormData();
      formData.append("dishName[en]", form.dishNameEn);
      if (form.dishNameTa) formData.append("dishName[ta]", form.dishNameTa);
      formData.append("description[en]", form.descEn);
      if (form.descTa) formData.append("description[ta]", form.descTa);
      if (form.specialityEn) formData.append("speciality[en]", form.specialityEn);
      if (form.specialityTa) formData.append("speciality[ta]", form.specialityTa);
      formData.append("location[country]", form.country);
      if (form.state) formData.append("location[state]", form.state);
      if (form.region) formData.append("location[region]", form.region);
      if (form.city) formData.append("location[city]", form.city);
      if (form.categoryId) formData.append("category", form.categoryId);
      if (form.subCategoryId) formData.append("subCategory", form.subCategoryId);
      formData.append("difficulty", form.difficulty);
      if (form.prepTime) formData.append("prepTime", form.prepTime);
      if (form.cookingTime) formData.append("cookingTime", form.cookingTime);
      if (form.totalTime) formData.append("totalTime", form.totalTime);
      if (form.servings) formData.append("servings", form.servings);
      formData.append("source", form.source);
      formData.append("isPublic", String(form.isPublic));
      form.tags.split(",").map(t => t.trim()).filter(Boolean).forEach(t => formData.append("tags[]", t));

      // SEO section — bilingual user-facing title + meta description + keywords
      if (form.seoTitleEn.trim()) formData.append("seo[title][en]", form.seoTitleEn.trim());
      if (form.seoTitleTa.trim()) formData.append("seo[title][ta]", form.seoTitleTa.trim());
      if (form.seoDescEn.trim()) formData.append("seo[description][en]", form.seoDescEn.trim());
      if (form.seoDescTa.trim()) formData.append("seo[description][ta]", form.seoDescTa.trim());
      form.seoKeywords.split(",").map(k => k.trim()).filter(Boolean).forEach(k => formData.append("seo[keywords][]", k));

      ingredients.forEach((ing, i) => {
        formData.append(`ingredients[${i}][ingredient]`, ing.ingredient);
        if (ing.quantity) formData.append(`ingredients[${i}][quantity]`, ing.quantity);
        if (ing.unit) formData.append(`ingredients[${i}][unit]`, ing.unit);
      });

      sections.forEach((sec, sIdx) => {
        formData.append(`sections[${sIdx}][type]`, sec.type);
        formData.append(`sections[${sIdx}][title][en]`, sec.titleEn);
        if (sec.titleTa) formData.append(`sections[${sIdx}][title][ta]`, sec.titleTa);
        
        sec.steps.forEach((step, stepIdx) => {
          formData.append(`sections[${sIdx}][steps][${stepIdx}][step]`, String(step.step));
          formData.append(`sections[${sIdx}][steps][${stepIdx}][description][en]`, step.descEn);
          if (step.descTa) formData.append(`sections[${sIdx}][steps][${stepIdx}][description][ta]`, step.descTa);
        });
      });

      if (imageFile) formData.append("image", imageFile);

      if (isEdit) {
        await axiosInstance.put(`/recipes/${editingRecipe._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/recipes", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  };

  const tabComplete: Record<Tab, boolean> = {
    "Basic Info": !!(form.dishNameEn && form.descEn),
    "SEO":        !!(form.seoTitleEn && form.seoDescEn),
    "Location":   !!(form.country),
    "Ingredients": ingredients.some(i => i.ingredient),
    "Steps":      sections.some(sec => sec.titleEn && sec.steps.some(s => s.descEn)),
    "Media":      true,
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#141414] to-[#0a0a0a] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top hairline highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />
        {/* Soft red corner glow */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#e74c3c]/[0.06] blur-3xl" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#e74c3c]">
              <span className="h-1 w-6 bg-gradient-to-r from-[#e74c3c] to-transparent" />
              {isEdit ? "Edit" : "New"}
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">{isEdit ? "Edit Recipe" : "Create New Recipe"}</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">Fill in the details across all sections below</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.16] text-gray-500 hover:text-white transition-all"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Bar */}
        <div className="relative flex border-b border-white/[0.06] px-6 overflow-x-auto">
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-1.5 px-3 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#e74c3c] text-white"
                    : "border-transparent text-gray-500 hover:text-gray-200"
                }`}
              >
                {tabComplete[tab] && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                {tab}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="relative mx-6 mt-4 flex items-center gap-2 text-sm text-[#ff8a7e] bg-[#e74c3c]/[0.08] border border-[#e74c3c]/30 rounded-xl px-4 py-3 font-medium">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSave} className="relative">
          <div className="p-6 space-y-4 min-h-[380px]">

            {/* ─── BASIC INFO ─── */}
            {activeTab === "Basic Info" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Dish Name (English)*</label>
                    <input value={form.dishNameEn} onChange={f("dishNameEn")} required placeholder="e.g. Chicken Biryani" className="input" />
                  </div>
                  <div>
                    <label className="label">Dish Name (Tamil)</label>
                    <input value={form.dishNameTa} onChange={f("dishNameTa")} placeholder="e.g. சிக்கன் பிரியாணி" className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Description (English)*</label>
                    <textarea value={form.descEn} onChange={f("descEn")} required rows={3} placeholder="Brief description of the dish..." className="input resize-none" />
                  </div>
                  <div>
                    <label className="label">Description (Tamil)</label>
                    <textarea value={form.descTa} onChange={f("descTa")} rows={3} placeholder="விவரம்..." className="input resize-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Speciality (EN) - What makes it special?</label>
                    <textarea value={form.specialityEn} onChange={f("specialityEn")} placeholder="e.g. Dum cooked overnight" className="input min-h-[100px] resize-y" />
                  </div>
                  <div>
                    <label className="label">Speciality (TA) - What makes it special?</label>
                    <textarea value={form.specialityTa} onChange={f("specialityTa")} placeholder="சிறப்பு..." className="input min-h-[100px] resize-y" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="label">Category</label>
                    <select value={form.categoryId} onChange={f("categoryId")} className="input">
                      <option value="">None</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name.en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Sub-Category</label>
                    <select value={form.subCategoryId} onChange={f("subCategoryId")} disabled={!form.categoryId} className="input">
                      <option value="">None</option>
                      {subCategories.map(c => <option key={c._id} value={c._id}>{c.name.en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Difficulty</label>
                    <select value={form.difficulty} onChange={f("difficulty")} className="input">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Source</label>
                    <select value={form.source} onChange={f("source")} className="input">
                      <option value="manual">✍️ Manual</option>
                      <option value="youtube">▶️ YouTube</option>
                      <option value="blog">📝 Blog</option>
                      <option value="ai">🤖 AI</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="label">Prep Time (mins)</label>
                    <input type="number" min="0" value={form.prepTime} onChange={f("prepTime")} placeholder="15" className="input" />
                  </div>
                  <div>
                    <label className="label">Cook Time (mins)</label>
                    <input type="number" min="1" value={form.cookingTime} onChange={f("cookingTime")} placeholder="30" className="input" />
                  </div>
                  <div>
                    <label className="label">Total Time (mins)</label>
                    <input type="number" min="1" value={form.totalTime} onChange={f("totalTime")} placeholder="45" className="input" />
                  </div>
                  <div>
                    <label className="label">Servings</label>
                    <input type="number" min="1" value={form.servings} onChange={f("servings")} placeholder="4" className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="label">Tags (comma separated)</label>
                    <input value={form.tags} onChange={f("tags")} placeholder="spicy, vegan, quick" className="input" />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl px-4 py-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      onClick={() => setForm(p => ({ ...p, isPublic: !p.isPublic }))}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isPublic ? "bg-[#e74c3c]" : "bg-white/15"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all ${form.isPublic ? "left-5" : "left-0.5"}`} />
                    </div>
                    <span className="text-sm font-bold text-white">Make recipe public</span>
                  </label>
                  <span className="text-xs text-gray-500 font-medium">Public recipes are visible to all users after approval.</span>
                </div>
              </div>
            )}

            {/* ─── SEO ─── */}
            {activeTab === "SEO" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#e74c3c]/25 bg-[#e74c3c]/[0.06] backdrop-blur-xl px-4 py-3 text-xs text-gray-400 leading-relaxed">
                  <p className="inline-flex items-center gap-2 font-black uppercase tracking-[0.18em] text-[10px] text-[#ff8a7e] mb-1.5">
                    <span className="h-1 w-5 bg-gradient-to-r from-[#e74c3c] to-transparent" />
                    What goes here
                  </p>
                  <p>
                    The <b className="text-white">SEO Title</b> is what users see in the app (cards, detail page) and what Google indexes.
                    Keep it short, common-name first, and SEO-friendly. The <b className="text-white">SEO Description</b> is the meta description
                    (~150 chars) shown in Google results and previews. <b className="text-white">Keywords</b> help search inside the app and on engines.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">SEO Title (English)*</label>
                    <input
                      value={form.seoTitleEn}
                      onChange={f("seoTitleEn")}
                      maxLength={100}
                      placeholder="e.g. Meen Kuzhambu (Tamil Fish Curry)"
                      className="input"
                    />
                    <span className="text-xs text-gray-400">{form.seoTitleEn.length}/100 — recommended ≤ 70</span>
                  </div>
                  <div>
                    <label className="label">SEO Title (Tamil)</label>
                    <input
                      value={form.seoTitleTa}
                      onChange={f("seoTitleTa")}
                      maxLength={100}
                      placeholder="e.g. மீன் குழம்பு"
                      className="input"
                    />
                    <span className="text-xs text-gray-400">{form.seoTitleTa.length}/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">SEO Description (English)</label>
                    <textarea
                      value={form.seoDescEn}
                      onChange={f("seoDescEn")}
                      rows={3}
                      maxLength={300}
                      placeholder="Short ~150-character meta description for Google previews and app cards."
                      className="input resize-none"
                    />
                    <span className="text-xs text-gray-400">{form.seoDescEn.length}/300 — recommended ≤ 160</span>
                  </div>
                  <div>
                    <label className="label">SEO Description (Tamil)</label>
                    <textarea
                      value={form.seoDescTa}
                      onChange={f("seoDescTa")}
                      rows={3}
                      maxLength={300}
                      placeholder="குறுகிய ~150 எழுத்து விளக்கம்..."
                      className="input resize-none"
                    />
                    <span className="text-xs text-gray-400">{form.seoDescTa.length}/300</span>
                  </div>
                </div>

                <div>
                  <label className="label">SEO Keywords (comma-separated)</label>
                  <textarea
                    value={form.seoKeywords}
                    onChange={f("seoKeywords")}
                    rows={3}
                    placeholder="e.g. meen kuzhambu, fish curry, tamil fish curry, மீன் குழம்பு, erode meen kuzhambu"
                    className="input resize-none"
                  />
                  <span className="text-xs text-gray-400">
                    {form.seoKeywords.split(",").map(k => k.trim()).filter(Boolean).length} keyword(s)
                    — mix English + Tamil + searched dish names
                  </span>
                </div>
              </div>
            )}

            {/* ─── LOCATION ─── */}
            {activeTab === "Location" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Specify where this recipe originates from.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Country*</label>
                    <input value={form.country} onChange={f("country")} required placeholder="India" className="input" />
                  </div>
                  <div>
                    <label className="label">State / Province</label>
                    <input value={form.state} onChange={f("state")} placeholder="Tamil Nadu" className="input" />
                  </div>
                  <div>
                    <label className="label">Region</label>
                    <input value={form.region} onChange={f("region")} placeholder="Chettinad" className="input" />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input value={form.city} onChange={f("city")} placeholder="Karaikudi" className="input" />
                  </div>
                </div>
              </div>
            )}

            {/* ─── INGREDIENTS ─── */}
            {activeTab === "Ingredients" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium">Add all ingredients with quantity and unit.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={fetchIngredientOptions}
                      disabled={isFetchingIngredients}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-white/[0.10] bg-white/[0.02] px-3 py-1.5 rounded-lg hover:bg-white/[0.06] hover:border-white/[0.18] hover:text-white transition-all disabled:opacity-50"
                    >
                      {isFetchingIngredients ? (
                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      ) : "↻"} Refresh
                    </button>
                    <button type="button" onClick={addIngredient} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ff8a7e] border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] px-3 py-1.5 rounded-lg hover:bg-[#e74c3c]/[0.15] hover:border-[#e74c3c]/45 hover:text-white transition-all">
                      + Add Row
                    </button>
                  </div>
                </div>

                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 px-1">
                  <div className="col-span-6">Ingredient*</div>
                  <div className="col-span-3">Quantity</div>
                  <div className="col-span-2">Unit</div>
                </div>

                {ingredients.map((row, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6 relative">
                      <input
                        value={ingredientSearch[i] !== undefined ? ingredientSearch[i] : (ingredientOptions.find(o => o._id === row.ingredient)?.name.en || "")}
                        onChange={e => {
                          setIngredientSearch(p => ({ ...p, [i]: e.target.value }));
                          updateIngredient(i, "ingredient", "");
                        }}
                        placeholder="Search ingredient..."
                        className="input text-sm"
                      />
                      {ingredientSearch[i] !== undefined && ingredientSearch[i] !== "" && !row.ingredient && (
                        <div className="absolute top-full left-0 right-0 z-20 rounded-xl border border-white/[0.10] bg-[#141414] backdrop-blur-xl shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8)] mt-1 max-h-40 overflow-y-auto">
                          {filteredIngredients(i).length === 0 ? (
                            <p className="text-xs text-gray-500 px-3 py-2 font-medium">No ingredients found</p>
                          ) : filteredIngredients(i).map(opt => (
                            <button
                              key={opt._id}
                              type="button"
                              onClick={() => {
                                updateIngredient(i, "ingredient", opt._id);
                                setIngredientSearch(p => { const n = { ...p }; delete n[i]; return n; });
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-2"
                            >
                              {opt.imageUrl && <img src={opt.imageUrl} className="w-5 h-5 rounded-full object-cover" />}
                              {opt.name.en}
                            </button>
                          ))}
                        </div>
                      )}
                      {row.ingredient && !ingredientSearch[i] && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            ✓ {ingredientOptions.find(o => o._id === row.ingredient)?.name.en}
                          </span>
                          <button type="button" onClick={() => { updateIngredient(i, "ingredient", ""); setIngredientSearch(p => ({ ...p, [i]: "" })); }} className="text-gray-500 hover:text-[#ff8a7e] transition-colors text-sm">×</button>
                        </div>
                      )}
                    </div>
                    <div className="col-span-3">
                      <input value={row.quantity} onChange={e => updateIngredient(i, "quantity", e.target.value)} placeholder="2" className="input text-sm" />
                    </div>
                    <div className="col-span-2">
                      <input value={row.unit} onChange={e => updateIngredient(i, "unit", e.target.value)} placeholder="cups" className="input text-sm" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {ingredients.length > 1 && (
                        <button type="button" onClick={() => removeIngredient(i)} className="text-gray-600 hover:text-[#ff8a7e] transition-colors text-lg leading-none">×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── STEPS / SECTIONS ─── */}
            {activeTab === "Steps" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium">Group cooking steps into sections (e.g. Preparation, Cooking, Tips).</p>
                  <button type="button" onClick={addSection} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ff8a7e] border border-[#e74c3c]/30 bg-[#e74c3c]/[0.08] px-3 py-1.5 rounded-lg hover:bg-[#e74c3c]/[0.15] hover:border-[#e74c3c]/45 hover:text-white transition-all">
                    + Add Section
                  </button>
                </div>

                {sections.map((sec, sIdx) => (
                  <div 
                    key={sIdx} 
                    draggable={draggableSectionIdx === sIdx}
                    onDragStart={(e) => handleSectionDragStart(e, sIdx)}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => handleSectionDrop(e, sIdx)}
                    onDragEnd={() => setDraggedSectionIdx(null)}
                    className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 space-y-4 transition-all ${draggedSectionIdx === sIdx ? 'opacity-40 scale-[0.98]' : ''}`}
                  >
                    {/* Section Header */}
                    <div className="flex flex-col gap-3 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            onMouseEnter={() => setDraggableSectionIdx(sIdx)}
                            onMouseLeave={() => setDraggableSectionIdx(null)}
                            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white p-1 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                          </div>
                          <select
                            value={sec.type}
                            onChange={e => updateSection(sIdx, "type", e.target.value)}
                            className="input !w-auto !py-1 !text-xs !font-bold !uppercase !tracking-wider"
                          >
                            <option value="preparation">Preparation</option>
                            <option value="cooking">Cooking Process</option>
                            <option value="masala">Spice Grinding</option>
                            <option value="tempering">Tempering</option>
                            <option value="final">Final Texture</option>
                            <option value="tips">Tips & Notes</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateSection(sIdx, "isCollapsed", !sec.isCollapsed)}
                            className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                          >
                            {sec.isCollapsed ? (
                              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg> Expand</>
                            ) : (
                              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg> Collapse</>
                            )}
                          </button>
                          {sections.length > 1 && (
                            <button type="button" onClick={() => removeSection(sIdx)} className="text-[10px] font-bold uppercase tracking-wider text-[#ff8a7e] hover:text-white transition-colors">Remove</button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pl-8">
                        <input value={sec.titleEn} onChange={e => updateSection(sIdx, "titleEn", e.target.value)} placeholder="Section Title (EN) e.g. Preparation" className="input" required />
                        <input value={sec.titleTa} onChange={e => updateSection(sIdx, "titleTa", e.target.value)} placeholder="Section Title (TA) e.g. தயாரிப்பு" className="input" />
                      </div>
                    </div>

                    {/* Section Steps */}
                    {!sec.isCollapsed && (
                      <div className="space-y-3 pl-8">
                      {sec.steps.map((step, stepIdx) => (
                        <div
                          key={stepIdx}
                          draggable={draggableStepInfo?.sIdx === sIdx && draggableStepInfo?.stepIdx === stepIdx}
                          onDragStart={(e) => handleStepDragStart(e, sIdx, stepIdx)}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => handleStepDrop(e, sIdx, stepIdx)}
                          onDragEnd={() => setDraggedStepInfo(null)}
                          className={`rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-3 space-y-2 relative transition-all ${draggedStepInfo?.sIdx === sIdx && draggedStepInfo?.stepIdx === stepIdx ? 'opacity-40 scale-[0.98]' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                onMouseEnter={() => setDraggableStepInfo({ sIdx, stepIdx })}
                                onMouseLeave={() => setDraggableStepInfo(null)}
                                className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-white transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff8a7e]">Step {step.step}</span>
                            </div>
                            {sec.steps.length > 1 && (
                              <button type="button" onClick={() => removeStep(sIdx, stepIdx)} className="text-gray-500 hover:text-[#ff8a7e] transition-colors text-sm">✕</button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 pl-6">
                            <textarea
                              value={step.descEn}
                              onChange={e => updateStep(sIdx, stepIdx, "descEn", e.target.value)}
                              rows={2}
                              placeholder="Step description (EN)..."
                              className="input resize-none"
                              required
                            />
                            <textarea
                              value={step.descTa}
                              onChange={e => updateStep(sIdx, stepIdx, "descTa", e.target.value)}
                              rows={2}
                              placeholder="படி விளக்கம் (TA)..."
                              className="input resize-none"
                            />
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => addStep(sIdx)} className="w-full py-2 border border-dashed border-white/15 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:border-[#e74c3c]/40 hover:text-[#ff8a7e] hover:bg-[#e74c3c]/[0.04] transition-all">
                        + Add Step to {sec.titleEn || "Section"}
                      </button>
                    </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ─── MEDIA ─── */}
            {activeTab === "Media" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 font-medium">Upload a cover image for the recipe.</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:border-[#e74c3c]/35 hover:bg-white/[0.04] transition-all overflow-hidden relative"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="preview" className="w-full h-64 object-cover" />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-gray-300 rounded-md border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to replace
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 group-hover:text-[#ff8a7e] transition-colors">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-sm font-bold text-white">Click to upload recipe image</p>
                      <p className="text-[11px] mt-1 text-gray-600">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }} className="text-[10px] font-bold uppercase tracking-wider text-[#ff8a7e] hover:text-white transition-colors">
                    × Remove image
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            )}
          </div>

          {/* Footer */}
          {/* Footer — dot tab indicator + prev/next + submit */}
          <div className="relative flex items-center justify-between px-6 py-4 bg-black/30 border-t border-white/[0.06]">
            <div className="flex gap-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  title={tab}
                  className={`h-2 rounded-full transition-all ${
                    activeTab === tab
                      ? "w-5 bg-[#e74c3c]"
                      : tabComplete[tab]
                      ? "w-2 bg-emerald-400"
                      : "w-2 bg-white/15"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {TABS.indexOf(activeTab) > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) - 1])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.02] px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.18] transition-all"
                >
                  ← Back
                </button>
              )}
              {TABS.indexOf(activeTab) < TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) + 1])}
                  className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-white/[0.10] to-white/[0.04] border border-white/[0.16] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:from-white/[0.14] hover:to-white/[0.06] hover:border-white/[0.24] transition-all"
                >
                  Next
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:translate-x-0.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#e74c3c] to-[#c0392b] px-6 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_8px_28px_-8px_rgba(231,76,60,0.55)] hover:shadow-[0_12px_36px_-8px_rgba(231,76,60,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      {isEdit ? "Update Recipe" : "Create Recipe"}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:translate-x-0.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeModal;
