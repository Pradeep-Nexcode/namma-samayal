import dotenv from "dotenv";

dotenv.config();

export type NodeEnv = "development" | "production" | "test";

export interface AppConfig {
  port: number;
  nodeEnv: NodeEnv;
  jwtSecret: string;
  jwtExpire: string;
  frontendUrl: string;
  adminUrl: string;
  mongodbUri: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  socialkitApiKey: string;
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRequiredEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const nodeEnv = (process.env.NODE_ENV ?? "development") as NodeEnv;

const config: AppConfig = {
  port: parseNumber(process.env.PORT, 5000),
  nodeEnv,
  jwtSecret: getRequiredEnv(
    "JWT_SECRET",
    nodeEnv === "production"
      ? undefined
      : "dev-jwt-secret-change-this-in-production",
  ),
  jwtExpire: process.env.JWT_EXPIRE ?? "7d",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:5173",
  mongodbUri: process.env.MONGODB_AI_EDITOR || getRequiredEnv(
    "MONGODB_URI",
    nodeEnv === "production" ? undefined : "mongodb://127.0.0.1:27017/namma-samayal",
  ),
  cloudinaryCloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMaxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  socialkitApiKey: process.env.SOCIALKIT_API_KEY ?? "",
};

export default config;
