import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import config from "../config/config.js";
import User from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

interface TokenPayload extends JwtPayload {
  id: string;
}

/**
 * Like `auth`, but never rejects. If a valid access token is present, it
 * populates `req.user`; otherwise the request continues anonymously. Used for
 * public endpoints that personalize their response when logged in (e.g.
 * marking `likedByMe` on comments).
 */
const optionalAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (header?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          header.split(" ")[1],
          config.jwtSecret,
        ) as TokenPayload;

        if (decoded?.id) {
          const user = await User.findById(decoded.id).select(
            "_id role email isActive",
          );
          if (user && user.isActive) {
            req.user = {
              id: user._id.toString(),
              role: user.role,
              email: user.email,
            };
          }
        }
      } catch {
        // Invalid/expired token → stay anonymous, don't error.
      }
    }

    next();
  },
);

export default optionalAuth;
