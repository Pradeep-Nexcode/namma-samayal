import { Server } from "node:http";

import app from "./app.js";
import config from "./config/config.js";
import { connectDB } from "./config/database.js";
import { logger } from "./utils/logger.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info("Server started", {
        environment: config.nodeEnv,
        port: config.port,
      });
    });

    registerProcessHandlers(server);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown startup error";
    logger.error("Failed to start server", { message });
    process.exit(1);
  }
};

const registerProcessHandlers = (server: Server): void => {
  process.on("unhandledRejection", (reason: unknown) => {
    logger.error("Unhandled promise rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
    });

    server.close(() => {
      process.exit(1);
    });
  });

  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught exception", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on("SIGTERM", () => {
    logger.warn("SIGTERM received, shutting down gracefully");
    server.close(() => {
      logger.info("HTTP server closed");
    });
  });
};

void startServer();
