import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { AppError } from "./appError.js";
import { logger } from "./logger.js";

interface MongoDuplicateError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

const toOperationalError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof MongooseError.CastError) {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
  }

  if (error instanceof MongooseError.ValidationError) {
    const messages = Object.values(error.errors).map((item) => item.message);
    return new AppError(`Invalid input data. ${messages.join(". ")}`, 400);
  }

  const mongoError = error as MongoDuplicateError;

  if (mongoError?.code === 11000 && mongoError.keyValue) {
    const [field, value] = Object.entries(mongoError.keyValue)[0] ?? ["field", "value"];
    return new AppError(`Duplicate ${field}: ${String(value)}. Please use another value.`, 400);
  }

  if (error instanceof Error && error.name === "JsonWebTokenError") {
    return new AppError("Invalid token. Please login again.", 401);
  }

  if (error instanceof Error && error.name === "TokenExpiredError") {
    return new AppError("Your token has expired. Please login again.", 401);
  }

  return new AppError("Something went wrong", 500);
};

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const error = toOperationalError(err);
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    logger.error("Request error", {
      statusCode: error.statusCode,
      message: error.message,
      stack: err instanceof Error ? err.stack : undefined,
    });

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: {
        stack: err instanceof Error ? err.stack : undefined,
      },
    });
    return;
  }

  if (error.statusCode >= 500) {
    logger.error("Unexpected server error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
