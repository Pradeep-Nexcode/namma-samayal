import cloudinary from "../config/cloudinary.js";
import { logger } from "./logger.js";

const CLOUDINARY_UPLOAD_MARKER = "/upload/";
const VERSION_PREFIX = /^v\d+$/;

export const extractPublicId = (imageUrl: string): string | null => {
  try {
    const parsedUrl = new URL(imageUrl);
    const uploadSplit = parsedUrl.pathname.split(CLOUDINARY_UPLOAD_MARKER);

    if (uploadSplit.length < 2 || !uploadSplit[1]) {
      return null;
    }

    const pathSegments = uploadSplit[1].split("/").filter(Boolean);

    while (pathSegments.length > 0 && !VERSION_PREFIX.test(pathSegments[0])) {
      pathSegments.shift();
    }

    if (pathSegments.length > 0 && VERSION_PREFIX.test(pathSegments[0])) {
      pathSegments.shift();
    }

    if (pathSegments.length === 0) {
      return null;
    }

    const withExtension = pathSegments.join("/");
    return decodeURIComponent(withExtension.replace(/\.[^.]+$/, ""));
  } catch {
    return null;
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId) {
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

    if (result.result !== "ok" && result.result !== "not found") {
      logger.warn("Cloudinary image deletion response", {
        publicId,
        result: result.result,
      });
    }
  } catch (error: unknown) {
    logger.error("Failed to delete image from Cloudinary", {
      publicId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteImageByUrl = async (imageUrl?: string | null): Promise<void> => {
  if (!imageUrl) {
    return;
  }

  const publicId = extractPublicId(imageUrl);

  if (!publicId) {
    logger.warn("Unable to extract Cloudinary publicId from URL", { imageUrl });
    return;
  }

  await deleteImage(publicId);
};
