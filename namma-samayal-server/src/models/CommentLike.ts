import { Model, Schema, Types, model } from "mongoose";

/**
 * A single "like" of a comment by a user. The compound unique index enforces
 * one like per (comment, user) pair, so likes are idempotent at the DB level —
 * a double-like attempt fails with a duplicate-key error rather than inflating
 * the count. The denormalized `Comment.likesCount` is kept in sync by the
 * like/unlike controllers.
 */
export interface ICommentLike {
  comment: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type CommentLikeModel = Model<ICommentLike>;

const commentLikeSchema = new Schema<ICommentLike, CommentLikeModel>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

commentLikeSchema.index({ comment: 1, user: 1 }, { unique: true });
// Fast lookup of "which of these comments did this user like?"
commentLikeSchema.index({ user: 1, comment: 1 });

const CommentLike = model<ICommentLike, CommentLikeModel>(
  "CommentLike",
  commentLikeSchema,
);

export default CommentLike;
