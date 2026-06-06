import { FilterQuery, Model, Types } from "mongoose";

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const slugify = (value: string): string => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "item";
};

interface SlugOptions {
  excludeId?: string | Types.ObjectId;
}

export const generateUniqueSlug = async <T extends { slug: string }>(
  model: Model<T>,
  value: string,
  options: SlugOptions = {},
): Promise<string> => {
  const baseSlug = slugify(value);

  const existingBase = await model.exists({
    slug: baseSlug,
    ...(options.excludeId ? { _id: { $ne: options.excludeId } } : {}),
  } as FilterQuery<T>);

  if (!existingBase) {
    return baseSlug;
  }

  const regex = new RegExp(`^${escapeRegex(baseSlug)}-(\\d+)$`);

  const similarSlugs = await model
    .find(
      {
        slug: { $regex: `^${escapeRegex(baseSlug)}(-\\d+)?$` },
        ...(options.excludeId ? { _id: { $ne: options.excludeId } } : {}),
      } as FilterQuery<T>,
      { slug: 1, _id: 0 },
    )
    .lean();

  const suffixes = similarSlugs
    .map((item) => {
      const match = regex.exec(item.slug);
      return match ? Number(match[1]) : 0;
    })
    .filter((num) => Number.isFinite(num));

  const maxSuffix = suffixes.length ? Math.max(...suffixes) : 0;
  return `${baseSlug}-${maxSuffix + 1}`;
};
