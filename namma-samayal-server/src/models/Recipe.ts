import { HydratedDocument, Schema, Types, model } from "mongoose";

interface IText {
  en: string;
  ta?: string;
}

interface ILocation {
  country: string;
  state?: string;
  region?: string;
  city?: string;
}

interface IRecipeIngredient {
  ingredient: Types.ObjectId;
  ingredientSnapshot?: IText; // Added for snapshot
  quantity?: string;
  unit?: string;
}

interface IStep {
  step?: number;
  description: IText;
}

interface ISection {
  type: string;
  title?: IText;
  steps: IStep[];
}

interface IRating {
  user: Types.ObjectId;
  rating: number;
}

interface ISeo {
  title?: IText;          // user-facing bilingual display title + SEO <title>
  description?: IText;    // bilingual meta description (~155 chars each)
  keywords?: string[];    // SEO keywords / search terms
}

export interface IRecipe {
  dishName: IText;
  slug: string;
  title?: string;         // legacy plain string title (kept for backwards-compat; superseded by seo.title)
  seo?: ISeo;
  location: ILocation;
  description: IText;
  ingredients: IRecipeIngredient[];
  steps: IStep[];
  sections?: ISection[];
  speciality?: IText;
  prepTime?: number;
  cookingTime?: number;
  totalTime?: number;
  servings?: number;
  difficulty: "easy" | "medium" | "hard";
  category?: Types.ObjectId;
  subCategory?: Types.ObjectId;
  imageUrl?: string | null;
  tags: string[];
  createdBy: Types.ObjectId;
  isPublic: boolean;
  isApproved: boolean;
  ratings: IRating[];
  averageRating: number;
  source: "manual" | "youtube" | "blog" | "ai";
  recipeSource?: {
    type: "youtube" | "blog" | "other";
    url: string;
  };
  searchKeywords?: string[];
  aiGenerated?: boolean;
  aiReviewed?: boolean;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type RecipeDocument = HydratedDocument<IRecipe>;

const textSchema = new Schema<IText>(
  {
    en: { type: String, required: true },
    ta: { type: String },
  },
  { _id: false },
);

const recipeSchema = new Schema<IRecipe>(
  {
    dishName: { type: textSchema, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    seo: {
      title: { type: textSchema },
      description: { type: textSchema },
      keywords: { type: [String], default: undefined },
    },
    location: {
      country: { type: String, required: true },
      state: String,
      region: String,
      city: String,
    },
    description: {
      type: textSchema,
      required: true,
    },
    ingredients: [
      {
        ingredient: {
          type: Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        ingredientSnapshot: {
          type: textSchema,
        },
        quantity: String,
        unit: String,
      },
    ],
    steps: [
      {
        step: Number,
        description: { type: textSchema, required: true },
      },
    ],
    sections: [
      {
        type: { type: String, required: true },
        title: { type: textSchema },
        steps: [
          {
            step: Number,
            description: { type: textSchema, required: true },
          },
        ],
      },
    ],
    speciality: textSchema,
    prepTime: Number,
    cookingTime: Number,
    totalTime: Number,
    servings: Number,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    ratings: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ["manual", "youtube", "blog", "ai"],
      default: "manual",
    },
    recipeSource: {
      type: {
        type: String,
        enum: ["youtube", "blog", "other"],
      },
      url: String,
    },
    searchKeywords: {
      type: [String],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiReviewed: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true },
);

recipeSchema.pre("validate", function (next) {
  if (!this.slug && this.dishName?.en) {
    this.slug = this.dishName.en.toLowerCase().trim().replace(/\s+/g, "-");
  }

  next();
});

recipeSchema.index({
  "dishName.en": "text",
  "description.en": "text",
  "seo.title.en": "text",
  "seo.description.en": "text",
});
recipeSchema.index({ slug: 1 }, { unique: true });
recipeSchema.index({ isPublic: 1, isApproved: 1, createdAt: -1 });
recipeSchema.index({ createdBy: 1, createdAt: -1 });
recipeSchema.index({ "ingredients.ingredient": 1 });
recipeSchema.index({ category: 1, subCategory: 1 });
recipeSchema.index({ "location.country": 1, "location.state": 1 });
recipeSchema.index({ averageRating: -1 });

const Recipe = model<IRecipe>("Recipe", recipeSchema);

export default Recipe;
