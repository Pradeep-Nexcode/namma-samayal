import { Model, Schema, Types, model } from "mongoose";

/**
 * A refresh-token session. We store only the SHA-256 HASH of the refresh token
 * (the raw token lives in the user's httpOnly cookie), so a DB leak can't be
 * used to mint sessions. The DB is the source of truth for refresh validity —
 * deleting a session instantly revokes it (logout / rotation / reuse).
 */
export interface IUserSession {
  user: Types.ObjectId;
  tokenHash: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type UserSessionModel = Model<IUserSession>;

const userSessionSchema = new Schema<IUserSession, UserSessionModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL index — MongoDB auto-removes a session once expiresAt passes.
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserSession = model<IUserSession, UserSessionModel>(
  "UserSession",
  userSessionSchema,
);

export default UserSession;
