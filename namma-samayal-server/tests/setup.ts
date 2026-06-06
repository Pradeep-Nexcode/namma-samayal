import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "@jest/globals";
const TEST_DB_URI =
  process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017/namma_samayal_jest";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = TEST_DB_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "test-cloud-name";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? "test-api-key";
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "test-api-secret";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(collections.map(async (collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
