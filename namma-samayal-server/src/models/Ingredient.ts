import { Schema, Types, model } from "mongoose";

interface IText {
  en: string;
  ta?: string;
}

interface INutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
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
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
