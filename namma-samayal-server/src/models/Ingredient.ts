import { Schema, Types, model } from "mongoose";

interface IText {
  en: string;
  ta?: string;
}

interface INutritionDailyValue {
  iron?: number;
  calcium?: number;
  vitaminA?: number;
  vitaminC?: number;
}

interface INutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  iron?: number;
  calcium?: number;
  vitaminA?: number;
  vitaminC?: number;
  dailyValue?: INutritionDailyValue;
}

interface IOrigin {
  country?: string;
  state?: string;
}

type ISeasonAvailability = "year-round" | "seasonal";

interface ISeason {
  availability?: ISeasonAvailability;
  // Months are 1-12 (Jan = 1). Used by the Seasonal Availability dot row.
  bestMonths?: number[];
}

type IIngredientStatus =
  | "fresh-available"
  | "seasonal"
  | "limited"
  | "out-of-stock";

interface IChefTip {
  en?: string;
  ta?: string;
  attributedTo?: string;
}

interface ISubstituteNote {
  // Each key is an Ingredient _id (as a string) — short attributes for the substitutes carousel.
  texture?: string;
  flavor?: string;
  cookingTime?: string;
  notes?: string;
}

export interface IIngredient {
  name: IText;
  slug: string;
  category: Types.ObjectId;
  subCategory?: Types.ObjectId;
  description?: IText;
  imageUrl?: string;
  nutrition?: INutrition;
  tags: string[];
  isActive: boolean;

  // ─── Extended fields for the rich detail page ───
  origin?: IOrigin;
  season?: ISeason;
  status?: IIngredientStatus;
  isPremium?: boolean;
  whySpecial?: IText;
  chefTip?: IChefTip;
  howToStore?: IText;
  quickBenefits?: IText[];
  substitutes?: Types.ObjectId[];
  substituteNotes?: Map<string, ISubstituteNote>;

  createdAt: Date;
  updatedAt: Date;
}

const textSchema = new Schema<IText>(
  {
    en: { type: String, required: true, trim: true },
    ta: { type: String, trim: true },
  },
  { _id: false },
);

// Like textSchema but `en` is NOT required (use for optional rich fields)
const optionalTextSchema = new Schema<IText>(
  {
    en: { type: String, trim: true },
    ta: { type: String, trim: true },
  },
  { _id: false },
);

const dailyValueSchema = new Schema<INutritionDailyValue>(
  {
    iron: Number,
    calcium: Number,
    vitaminA: Number,
    vitaminC: Number,
  },
  { _id: false },
);

const nutritionSchema = new Schema<INutrition>(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    iron: Number,
    calcium: Number,
    vitaminA: Number,
    vitaminC: Number,
    dailyValue: dailyValueSchema,
  },
  { _id: false },
);

const originSchema = new Schema<IOrigin>(
  {
    country: { type: String, trim: true },
    state: { type: String, trim: true },
  },
  { _id: false },
);

const seasonSchema = new Schema<ISeason>(
  {
    availability: {
      type: String,
      enum: ["year-round", "seasonal"],
      default: "year-round",
    },
    bestMonths: {
      type: [Number],
      validate: {
        validator: (arr: number[]) =>
          Array.isArray(arr) && arr.every((m) => m >= 1 && m <= 12),
        message: "bestMonths must contain integers between 1 and 12",
      },
      default: [],
    },
  },
  { _id: false },
);

const chefTipSchema = new Schema<IChefTip>(
  {
    en: { type: String, trim: true },
    ta: { type: String, trim: true },
    attributedTo: { type: String, trim: true },
  },
  { _id: false },
);

const substituteNoteSchema = new Schema<ISubstituteNote>(
  {
    texture: { type: String, trim: true },
    flavor: { type: String, trim: true },
    cookingTime: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const ingredientSchema = new Schema<IIngredient>(
  {
    name: {
      type: textSchema,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    description: textSchema,
    imageUrl: String,
    nutrition: nutritionSchema,
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ─── Extended fields ───
    origin: originSchema,
    season: seasonSchema,
    status: {
      type: String,
      enum: ["fresh-available", "seasonal", "limited", "out-of-stock"],
      default: "fresh-available",
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
    whySpecial: optionalTextSchema,
    chefTip: chefTipSchema,
    howToStore: optionalTextSchema,
    quickBenefits: {
      type: [optionalTextSchema],
      default: [],
    },
    substitutes: {
      type: [Schema.Types.ObjectId],
      ref: "Ingredient",
      default: [],
    },
    substituteNotes: {
      type: Map,
      of: substituteNoteSchema,
      default: undefined,
    },
  },
  { timestamps: true },
);

ingredientSchema.index({ "name.en": "text", "description.en": "text" });
ingredientSchema.index({ category: 1, subCategory: 1, isActive: 1 });
ingredientSchema.index({ slug: 1 }, { unique: true });

ingredientSchema.pre("validate", function (next) {
  if (!this.slug && this.name?.en) {
    this.slug = this.name.en.toLowerCase().trim().replace(/\s+/g, "-");
  }

  next();
});

const Ingredient = model<IIngredient>("Ingredient", ingredientSchema);

export default Ingredient;
