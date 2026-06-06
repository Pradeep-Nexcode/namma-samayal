import { Schema, Types, model } from "mongoose";

interface IText {
  en: string;
  ta?: string;
}

export interface ICategory {
  name: IText;
  slug: string;
  parent?: Types.ObjectId | null;
  level: number;
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

const categorySchema = new Schema<ICategory>(
  {
    name: { type: textSchema, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ "name.en": "text", "name.ta": "text" });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ level: 1 });

categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name?.en) {
    this.slug = this.name.en.toLowerCase().trim().replace(/\s+/g, "-");
  }

  if (!this.parent) {
    this.level = 0;
  }

  next();
});

const Category = model<ICategory>("Category", categorySchema);

export default Category;
