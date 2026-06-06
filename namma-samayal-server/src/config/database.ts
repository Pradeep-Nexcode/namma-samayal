import mongoose from "mongoose";

import config from "./config.js";
import { logger } from "../utils/logger.js";

export const connectDB = async (): Promise<void> => {
  try {
    const options: mongoose.ConnectOptions = {};
    
    // In development mode, bypass TLS certificate validation issues which are 
    // common when connecting to MongoDB Atlas from restrictive networks or outdated Node.js environments
    if (config.nodeEnv !== "production") {
      options.tlsAllowInvalidCertificates = true;
    }

    const conn = await mongoose.connect(config.mongodbUri, options);

    logger.info("MongoDB connected", {
      host: conn.connection.host,
      name: conn.connection.name,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    logger.error("Database connection error", { message });
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB disconnected");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown disconnect error";
    logger.error("Error disconnecting from MongoDB", { message });
  }
};
