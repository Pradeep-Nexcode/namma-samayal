"use client";

import { ImageIcon, Smile } from "lucide-react";

/* ─── Avatar with initials fallback ─── */
export function CommentAvatar({
  src,
  name,
  size = 40,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name ?? "User"}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-rose-200 font-title-hw font-bold text-stone-700"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </span>
  );
}

interface CommentComposerProps {
  avatarUrl?: string | null;
  avatarName?: string | null;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  /** Compact mode (reply/edit): hides the image/emoji bar, smaller avatar. */
  compact?: boolean;
  maxLength?: number;
}

export function CommentComposer({
  avatarUrl,
  avatarName,
  value,
  onChange,
  onSubmit,
  submitting = false,
  placeholder = "Share your thoughts about this recipe…",
  submitLabel = "Post Comment",
  onCancel,
  autoFocus = false,
  compact = false,
  maxLength = 500,
}: CommentComposerProps) {
  const over = value.length > maxLength;
  const canSubmit = value.trim().length > 0 && !over && !submitting;

  return (
    <div
      className={`rounded-2xl border-2 border-stone-200 bg-white ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex gap-3">
        <CommentAvatar
          src={avatarUrl}
          name={avatarName}
          size={compact ? 32 : 40}
        />
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={compact ? 2 : 3}
            className="w-full resize-none border-0 bg-transparent font-body text-[14px] text-stone-900 placeholder-stone-400 outline-none"
          />
          <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2.5">
            <div className="flex items-center gap-1.5">
              {!compact && (
                <>
                  <button
                    type="button"
                    title="Add a photo (coming soon)"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                  >
                    <ImageIcon className="h-[18px] w-[18px]" />
                  </button>
                  <button
                    type="button"
                    title="Add an emoji (coming soon)"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                  >
                    <Smile className="h-[18px] w-[18px]" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`font-body text-[12px] ${
                  over ? "text-rose-600 font-semibold" : "text-stone-400"
                }`}
              >
                {value.length} / {maxLength}
              </span>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="font-title-hw text-[14px] font-bold text-stone-500 hover:text-stone-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="rounded-lg bg-[#c0392b] px-4 py-2 font-title-hw text-[14px] font-bold text-white transition-colors hover:bg-[#a02b1f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Posting…" : submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
