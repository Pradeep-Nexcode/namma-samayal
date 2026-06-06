import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import config from "../config/config.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

interface TokenPayload extends JwtPayload {
  id: string;
}

const auth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new AppError("Access denied. No token provided.", 401));
  }

  const token = authorizationHeader.split(" ")[1];
  const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

  if (!decoded?.id) {
    return next(new AppError("Invalid token.", 401));
  }

  const user = await User.findById(decoded.id).select("_id role email isActive");

  if (!user || !user.isActive) {
    return next(new AppError("User not found or inactive.", 401));
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  next();
});

export default auth;

export const authorize = (...roles: Array<"user" | "admin">) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Not authenticated", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to perform this action", 403));
      return;
    }

    next();
  };
};
