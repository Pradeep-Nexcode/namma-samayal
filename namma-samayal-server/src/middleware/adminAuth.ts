import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import config from "../config/config.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

interface TokenPayload extends JwtPayload {
  id: string;
}

/**
 * Strict admin-only middleware (uses Admin model, not User model).
 * Used for admin panel APIs.
 */
export const adminAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(new AppError("No token provided", 401));
  }

  const token = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.split(" ")[1]
    : authorizationHeader;

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

    if (!decoded?.id) {
      return next(new AppError("Invalid token", 401));
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return next(new AppError("Admin access required", 403));
    }

    // @ts-ignore
    req.user = {
      id: admin._id.toString(),
      role: "admin",
      email: admin.email,
    };
    // @ts-ignore
    req.admin = admin;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
});

/**
 * Flexible middleware: accepts both registered users (User model) AND admin panel users (Admin model).
 * Sets req.user for downstream controllers to use ownership checks.
 * Used for routes where both users and admins are allowed (e.g. create/update recipe).
 */
export const userOrAdminAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.split(" ")[1]
    : authorizationHeader;

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }

  if (!decoded?.id) {
    return next(new AppError("Invalid token", 401));
  }

  // Try User first
  const user = await User.findById(decoded.id).select("_id role email isActive");
  if (user) {
    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated", 401));
    }
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    return next();
  }

  // Try Admin next
  const admin = await Admin.findById(decoded.id);
  if (admin) {
    // @ts-ignore
    req.user = {
      id: admin._id.toString(),
      role: "admin",
      email: admin.email,
    };
    // @ts-ignore
    req.admin = admin;
    return next();
  }

  return next(new AppError("User not found", 401));
});
