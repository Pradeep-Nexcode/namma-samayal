export interface CommentUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}

export interface Comment {
  _id: string;
  content: string;
  user: CommentUser | null;
  /** Display name this reply @mentions (when replying to another reply). */
  replyToName: string | null;
  likesCount: number;
  /** Whether the current user has liked this comment. */
  likedByMe: boolean;
  repliesCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CommentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CommentsResponse {
  success: boolean;
  count: number;
  data: Comment[];
  pagination: CommentPagination;
}

export type CommentSort = "newest" | "oldest";
