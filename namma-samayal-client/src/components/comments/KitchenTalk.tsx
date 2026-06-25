"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Ban,
  ChevronDown,
  ListFilter,
  Loader2,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import {
  createComment,
  deleteComment,
  getRecipeComments,
  updateComment,
} from "@/features/comment/services/commentApi";
import { getUserProfile } from "@/features/auth/services/authApi";
import { getAuthToken } from "@/utils/authToken";
import type { Comment, CommentPagination, CommentSort } from "@/types/comment";
import { CommentCard } from "./CommentCard";
import { CommentComposer } from "./CommentComposer";

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string | null;
  isAdmin: boolean;
}

interface KitchenTalkProps {
  recipeId: string;
  recipeAuthorId?: string | null;
}

const SORT_LABELS: Record<CommentSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
};

export function KitchenTalk({ recipeId, recipeAuthorId }: KitchenTalkProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [pagination, setPagination] = useState<CommentPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<CommentSort>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const [user, setUser] = useState<CurrentUser | null>(null);
  const isLoggedIn = typeof window !== "undefined" && !!getAuthToken();
  const composerRef = useRef<HTMLDivElement>(null);

  // Load current user (for avatar, ownership, admin) when signed in.
  useEffect(() => {
    if (!getAuthToken()) return;
    let active = true;
    getUserProfile()
      .then((u) => {
        if (!active) return;
        setUser({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`.trim() || u.username,
          avatar: u.profileImage,
          isAdmin: u.role === "admin",
        });
      })
      .catch(() => {
        /* not signed in / token invalid — comment read-only */
      });
    return () => {
      active = false;
    };
  }, []);

  const fetchComments = useCallback(
    async (nextSort: CommentSort) => {
      setLoading(true);
      setError("");
      try {
        const res = await getRecipeComments(recipeId, { page: 1, sort: nextSort });
        setComments(res.data);
        setCount(res.count);
        setPagination(res.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load comments.");
      } finally {
        setLoading(false);
      }
    },
    [recipeId],
  );

  useEffect(() => {
    fetchComments(sort);
  }, [fetchComments, sort]);

  const loadMore = async () => {
    if (!pagination || pagination.page >= pagination.pages) return;
    setLoadingMore(true);
    try {
      const res = await getRecipeComments(recipeId, {
        page: pagination.page + 1,
        sort,
      });
      setComments((prev) => [...prev, ...res.data]);
      setPagination(res.pagination);
      setCount(res.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more.");
    } finally {
      setLoadingMore(false);
    }
  };

  /* ─── Mutations (optimistic local state) ─── */

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const created = await createComment({
        recipeId,
        content: newComment.trim(),
      });
      setComments((prev) =>
        sort === "newest" ? [created, ...prev] : [...prev, created],
      );
      setCount((c) => c + 1);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (
    topLevelId: string,
    parentCommentId: string,
    content: string,
  ) => {
    const created = await createComment({
      recipeId,
      content,
      parentComment: parentCommentId,
    });
    setComments((prev) =>
      prev.map((c) =>
        c._id === topLevelId
          ? {
              ...c,
              repliesCount: c.repliesCount + 1,
              replies: [...(c.replies ?? []), created],
            }
          : c,
      ),
    );
    setCount((n) => n + 1);
  };

  const handleEdit = async (id: string, content: string) => {
    const updated = await updateComment(id, content);
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === id) return { ...c, ...updated };
        if (c.replies?.some((r) => r._id === id)) {
          return {
            ...c,
            replies: c.replies.map((r) => (r._id === id ? { ...r, ...updated } : r)),
          };
        }
        return c;
      }),
    );
  };

  const handleDelete = async (id: string) => {
    await deleteComment(id);
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === id) {
          return { ...c, isDeleted: true, content: "[deleted]", user: null };
        }
        if (c.replies?.some((r) => r._id === id)) {
          return {
            ...c,
            repliesCount: Math.max(0, c.repliesCount - 1),
            replies: c.replies.map((r) =>
              r._id === id
                ? { ...r, isDeleted: true, content: "[deleted]", user: null }
                : r,
            ),
          };
        }
        return c;
      }),
    );
    setCount((n) => Math.max(0, n - 1));
  };

  const hasMore = !!pagination && pagination.page < pagination.pages;

  return (
    <section className="mt-12 rounded-2xl bg-[#fbf7ef] border border-stone-200 p-5 md:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-title-hw text-[26px] font-bold text-stone-900">
            🍲 Kitchen Talk{" "}
            <span className="text-[#c0392b]">({count})</span>
          </h2>
          <p className="font-body text-[14px] text-stone-500">
            Share your cooking experience, tips, and love ❤️
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 font-body text-[13.5px] text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <ListFilter className="h-4 w-4 text-stone-400" />
            {SORT_LABELS[sort]}
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </button>
          {sortOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setSortOpen(false)}
                aria-hidden
                tabIndex={-1}
              />
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                {(Object.keys(SORT_LABELS) as CommentSort[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSort(key);
                      setSortOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left font-body text-[13.5px] hover:bg-stone-50 ${
                      sort === key ? "text-[#c0392b] font-semibold" : "text-stone-700"
                    }`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body: composer + list (left) / guidelines (right) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div>
          {/* Composer */}
          <div ref={composerRef}>
            {isLoggedIn ? (
              <CommentComposer
                avatarUrl={user?.avatar}
                avatarName={user?.name}
                value={newComment}
                onChange={setNewComment}
                onSubmit={handlePost}
                submitting={posting}
              />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-6 text-center">
                <p className="font-body text-[14px] text-stone-600">
                  Join the conversation —{" "}
                  <Link
                    href="/auth/login"
                    className="font-title-hw font-bold text-[#c0392b] hover:text-[#a02b1f]"
                  >
                    sign in
                  </Link>{" "}
                  to share your thoughts.
                </p>
              </div>
            )}
          </div>

          {/* List */}
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-stone-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-body text-[14px]">Loading comments…</span>
              </div>
            ) : error ? (
              <p className="py-6 text-center font-body text-[14px] text-rose-600">
                {error}
              </p>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <MessagesSquare className="h-9 w-9 text-stone-300" />
                <p className="font-title-hw text-[18px] font-bold text-stone-700">
                  No comments yet
                </p>
                <p className="font-body text-[13.5px] text-stone-400">
                  Be the first to start the Kitchen Talk!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="rounded-2xl border border-stone-200 bg-white p-4 md:p-5"
                  >
                    <CommentCard
                      comment={comment}
                      topLevelId={comment._id}
                      depth="top"
                      currentUserId={user?.id ?? null}
                      isAdmin={user?.isAdmin ?? false}
                      recipeAuthorId={recipeAuthorId}
                      currentUserAvatar={user?.avatar}
                      currentUserName={user?.name}
                      onReply={handleReply}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 font-title-hw text-[14px] font-bold text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-60"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Load more comments
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Guidelines sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-stone-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#d99b2e]" />
            <h3 className="font-title-hw text-[16px] font-bold text-stone-900">
              Community Guidelines
            </h3>
          </div>
          <ul className="space-y-3.5">
            <GuidelineItem
              icon={<BadgeCheck className="h-4 w-4 text-emerald-500" />}
              title="Be respectful and kind"
              desc="We're all here to learn and share."
            />
            <GuidelineItem
              icon={<Ban className="h-4 w-4 text-[#d99b2e]" />}
              title="No spam or promotions"
              desc="Let's keep Kitchen Talk clean."
            />
            <GuidelineItem
              icon={<Sparkles className="h-4 w-4 text-[#c0392b]" />}
              title="Stay on topic"
              desc="Talk about the recipe please!"
            />
          </ul>
          <Link
            href="/community-guidelines"
            className="mt-4 inline-block font-title-hw text-[13.5px] font-bold text-[#c0392b] hover:text-[#a02b1f] transition-colors"
          >
            Read full guidelines →
          </Link>
        </aside>
      </div>
    </section>
  );
}

function GuidelineItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="font-ui text-[13px] font-semibold text-stone-800">{title}</p>
        <p className="font-body text-[12px] text-stone-500">{desc}</p>
      </div>
    </li>
  );
}
