import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import { AppError } from "../utils/appError.js";

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  const message = errors
    .array()
    .map((item) => item.msg)
    .join(", ");

  next(new AppError(message || "Validation failed", 400));
};
