import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";
import { AppError } from "../utils/appError.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "namma-samayal",
    allowed_formats: ALLOWED_FORMATS,
    resource_type: "image",
  }),
});

const uploader = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError("Only jpg, jpeg, png and webp images are allowed", 400));
      return;
    }

    cb(null, true);
  },
});

const isNumericKey = (value: string): boolean => /^\d+$/.test(value);

const parseBodyValue = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return value;
    }
  }

  return value;
};

const keyToSegments = (key: string): string[] =>
  key
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

const setDeepValue = (target: Record<string, unknown>, key: string, value: unknown): void => {
  const segments = keyToSegments(key);

  if (segments.length === 0) {
    return;
  }

  let current: Record<string, unknown> | unknown[] = target;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLast = index === segments.length - 1;
    const nextSegment = segments[index + 1];

    if (Array.isArray(current)) {
      const currentIndex = Number(segment);

      if (!Number.isInteger(currentIndex)) {
        return;
      }

      if (isLast) {
        current[currentIndex] = value;
        return;
      }

      if (current[currentIndex] === undefined || current[currentIndex] === null) {
        current[currentIndex] = isNumericKey(nextSegment) ? [] : {};
      }

      const next = current[currentIndex];

      if (typeof next !== "object" || next === null) {
        return;
      }

      current = next as Record<string, unknown> | unknown[];
      continue;
    }

    if (isLast) {
      current[segment] = value;
      return;
    }

    if (current[segment] === undefined || current[segment] === null) {
      current[segment] = isNumericKey(nextSegment) ? [] : {};
    }

    const next = current[segment];

    if (typeof next !== "object" || next === null) {
      return;
    }

    current = next as Record<string, unknown> | unknown[];
  }
};

const normalizeMultipartBody = (req: Request): void => {
  if (!req.body || typeof req.body !== "object") {
    return;
  }

  const entries = Object.entries(req.body as Record<string, unknown>);
  const normalizedBody: Record<string, unknown> = {};

  for (const [key, rawValue] of entries) {
    const value = parseBodyValue(rawValue);
    setDeepValue(normalizedBody, key, value);
  }

  req.body = normalizedBody;
};

const handleUploadError = (error: unknown, next: NextFunction): void => {
  if (!error) {
    next();
    return;
  }

  if (error instanceof AppError) {
    next(error);
    return;
  }

  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Image size should be less than or equal to 2MB", 400));
      return;
    }

    next(new AppError(`Upload failed: ${error.message}`, 400));
    return;
  }

  if (error instanceof Error) {
    next(new AppError(`Upload failed: ${error.message}`, 400));
    return;
  }

  next(new AppError("Upload failed", 400));
};

export const uploadSingle = (fieldName: string) => {
  const middleware = uploader.single(fieldName);

  return (req: Request, res: Response, next: NextFunction): void => {
    middleware(req, res, (error: unknown) => {
      if (!error) {
        normalizeMultipartBody(req);
      }

      handleUploadError(error, next);
    });
  };
};

export const uploadMultiple = (fieldName: string, maxCount = 5) => {
  const middleware = uploader.array(fieldName, maxCount);

  return (req: Request, res: Response, next: NextFunction): void => {
    middleware(req, res, (error: unknown) => {
      if (!error) {
        normalizeMultipartBody(req);
      }

      handleUploadError(error, next);
    });
  };
};
