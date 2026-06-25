import { Types } from "mongoose";

export interface CommentUser {
  _id: Types.ObjectId | string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}

/** Shape of a populated, lean Comment as it comes back from Mongoose. */
export interface RawComment {
  _id: Types.ObjectId | string;
  content: string;
  user: CommentUser | null;
  parentComment: Types.ObjectId | string | null;
  replyTo: CommentUser | null;
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicComment {
  _id: string;
  content: string;
  user: CommentUser | null;
  /** Display name this reply @mentions (when replying to another reply). */
  replyToName: string | null;
  likesCount: number;
  /** Whether the requesting user has liked this comment (false if anonymous). */
  likedByMe: boolean;
  repliesCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies?: PublicComment[];
}

/** Serialize one comment, masking soft-deleted ones (content + author hidden). */
const displayName = (u: CommentUser | null): string | null => {
  if (!u) return null;
  const full = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return full || u.username;
};

export const serializeComment = (
  c: RawComment,
  likedSet?: Set<string>,
): PublicComment => ({
  _id: String(c._id),
  content: c.isDeleted ? "[deleted]" : c.content,
  user: c.isDeleted ? null : c.user,
  replyToName: displayName(c.replyTo),
  likesCount: c.likesCount,
  likedByMe: likedSet?.has(String(c._id)) ?? false,
  repliesCount: c.repliesCount,
  isEdited: c.isEdited,
  isDeleted: c.isDeleted,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

/**
 * Build a 2-level tree: each top-level comment gets a flat `replies` array.
 * Replies are already normalized to point at their top-level parent at write
 * time, so this is a single group-by, no recursion needed.
 *
 * `likedSet` (optional) is the set of comment ids the requesting user has
 * liked — used to flag `likedByMe`.
 */
export const buildCommentTree = (
  topLevel: RawComment[],
  replies: RawComment[],
  likedSet?: Set<string>,
): PublicComment[] => {
  const repliesByParent = new Map<string, PublicComment[]>();

  for (const reply of replies) {
    const parentId = String(reply.parentComment);
    const list = repliesByParent.get(parentId) ?? [];
    list.push(serializeComment(reply, likedSet));
    repliesByParent.set(parentId, list);
  }

  return topLevel.map((comment) => ({
    ...serializeComment(comment, likedSet),
    replies: repliesByParent.get(String(comment._id)) ?? [],
  }));
};
