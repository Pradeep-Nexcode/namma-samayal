"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Comment } from "@/types/comment";
import { timeAgo } from "@/utils/timeAgo";
import { CommentAvatar, CommentComposer } from "./CommentComposer";

interface CommentCardProps {
  comment: Comment;
  /** Top-level comment id this card belongs to (its own id when top-level). */
  topLevelId: string;
  depth: "top" | "reply";
  currentUserId: string | null;
  isAdmin: boolean;
  recipeAuthorId?: string | null;
  currentUserAvatar?: string | null;
  currentUserName?: string | null;
  onReply: (topLevelId: string, parentCommentId: string, content: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CommentCard({
  comment,
  topLevelId,
  depth,
  currentUserId,
  isAdmin,
  recipeAuthorId,
  currentUserAvatar,
  currentUserName,
  onReply,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likesCount);
  const [showReplies, setShowReplies] = useState(
    (comment.replies?.length ?? 0) <= 2,
  );

  const replies = comment.replies ?? [];
  const isOwner = !!currentUserId && comment.user?._id === currentUserId;
  const isAuthor = !!recipeAuthorId && comment.user?._id === recipeAuthorId;
  const name = comment.user
    ? `${comment.user.firstName} ${comment.user.lastName}`.trim() ||
      comment.user.username
    : "Unknown";

  const toggleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => c + (prev ? -1 : 1));
      return !prev;
    });
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await onReply(topLevelId, comment._id, replyText.trim());
      setReplyText("");
      setReplying(false);
      setShowReplies(true);
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async () => {
    if (!editText.trim()) return;
    setBusy(true);
    try {
      await onEdit(comment._id, editText.trim());
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  // Deleted comments keep their slot (so replies survive) but show a placeholder.
  if (comment.isDeleted) {
    return (
      <div className={depth === "reply" ? "" : "py-2"}>
        <p className="font-body text-[13.5px] italic text-stone-400 px-1 py-2">
          This comment was deleted.
        </p>
        {depth === "top" && replies.length > 0 && (
          <RepliesBlock>
            {replies.map((reply) => (
              <CommentCard
                key={reply._id}
                comment={reply}
                topLevelId={topLevelId}
                depth="reply"
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                recipeAuthorId={recipeAuthorId}
                currentUserAvatar={currentUserAvatar}
                currentUserName={currentUserName}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </RepliesBlock>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        depth === "reply"
          ? "rounded-xl bg-stone-50 border border-stone-100 p-3.5"
          : ""
      }
    >
      <div className="flex gap-3">
        <CommentAvatar
          src={comment.user?.profileImage}
          name={name}
          size={depth === "reply" ? 34 : 40}
        />
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2">
            <span className="font-title-hw text-[15px] font-bold text-stone-900">
              {name}
            </span>
            {isAuthor && (
              <span className="rounded-md bg-[#c0392b] px-1.5 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-white">
                Author
              </span>
            )}
            <span className="font-body text-[12px] text-stone-400">
              {timeAgo(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="font-body text-[11px] text-stone-300">(edited)</span>
            )}
          </div>

          {/* Body / edit form */}
          {editing ? (
            <div className="mt-2">
              <CommentComposer
                compact
                avatarUrl={currentUserAvatar}
                avatarName={currentUserName}
                value={editText}
                onChange={setEditText}
                onSubmit={submitEdit}
                submitting={busy}
                submitLabel="Save"
                onCancel={() => {
                  setEditing(false);
                  setEditText(comment.content);
                }}
                placeholder="Edit your comment…"
              />
            </div>
          ) : (
            <p className="mt-1 font-body text-[14px] leading-relaxed text-stone-700 break-words">
              {comment.replyToName && (
                <span className="font-semibold text-[#c0392b]">
                  @{comment.replyToName}{" "}
                </span>
              )}
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!editing && (
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={toggleLike}
                className="flex items-center gap-1.5 font-ui text-[13px] text-stone-500 hover:text-[#c0392b] transition-colors"
              >
                <Heart
                  className={`h-[15px] w-[15px] ${
                    liked ? "fill-[#c0392b] text-[#c0392b]" : ""
                  }`}
                />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>

              <button
                type="button"
                onClick={() => setReplying((r) => !r)}
                className="flex items-center gap-1.5 font-ui text-[13px] text-stone-500 hover:text-stone-900 transition-colors"
              >
                <MessageCircle className="h-[15px] w-[15px]" />
                Reply
              </button>

              {(isOwner || isAdmin) && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-[16px] w-[16px]" />
                  </button>
                  {menuOpen && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden
                        tabIndex={-1}
                      />
                      <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(true);
                              setMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 font-body text-[13px] text-stone-700 hover:bg-stone-50"
                          >
                            <Pencil className="h-[14px] w-[14px]" /> Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onDelete(comment._id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 font-body text-[13px] text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-[14px] w-[14px]" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reply form */}
          {replying && (
            <div className="mt-3">
              <CommentComposer
                compact
                autoFocus
                avatarUrl={currentUserAvatar}
                avatarName={currentUserName}
                value={replyText}
                onChange={setReplyText}
                onSubmit={submitReply}
                submitting={busy}
                submitLabel="Reply"
                onCancel={() => {
                  setReplying(false);
                  setReplyText("");
                }}
                placeholder={`Reply to ${name}…`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies (top-level only) */}
      {depth === "top" && replies.length > 0 && (
        <div className="mt-3 pl-6">
          {replies.length > 2 && (
            <button
              type="button"
              onClick={() => setShowReplies((s) => !s)}
              className="mb-2 flex items-center gap-1.5 font-title-hw text-[13.5px] font-bold text-[#c0392b] hover:text-[#a02b1f] transition-colors"
            >
              {showReplies ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showReplies
                ? "Hide replies"
                : `View all ${replies.length} replies`}
            </button>
          )}
          {showReplies && (
            <RepliesBlock>
              {replies.map((reply) => (
                <CommentCard
                  key={reply._id}
                  comment={reply}
                  topLevelId={topLevelId}
                  depth="reply"
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  recipeAuthorId={recipeAuthorId}
                  currentUserAvatar={currentUserAvatar}
                  currentUserName={currentUserName}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </RepliesBlock>
          )}
        </div>
      )}
    </div>
  );
}

/** Left-bordered container that visually groups replies under a comment. */
function RepliesBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-l-2 border-stone-100 pl-4">{children}</div>
  );
}
