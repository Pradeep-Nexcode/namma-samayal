import { HydratedDocument, Model, Schema, Types, model } from "mongoose";

export interface IComment {
  recipe: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  /**
   * Top-level comments: null. Replies: the TOP-LEVEL ancestor comment (we
   * normalize reply-to-a-reply up to the top-level parent at write time, so
   * nesting stays 2 levels — YouTube-style).
   */
  parentComment: Types.ObjectId | null;
  /** When replying to another reply, the user being @mentioned. */
  replyTo: Types.ObjectId | null;
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  /** Moderation: "hidden" comments are filtered out of public listings. */
  status: "active" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

type CommentModel = Model<IComment>;
export type CommentDocument = HydratedDocument<IComment>;

const commentSchema = new Schema<IComment, CommentModel>(
  {
    recipe: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Top-level comments for a recipe, newest first.
commentSchema.index({ recipe: 1, parentComment: 1, createdAt: -1 });
// Replies of a given top-level comment, oldest first.
commentSchema.index({ parentComment: 1, createdAt: 1 });

const Comment = model<IComment, CommentModel>("Comment", commentSchema);

export default Comment;
