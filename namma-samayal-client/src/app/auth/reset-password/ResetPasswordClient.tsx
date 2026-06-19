"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";

import {
  AuthCard,
  AuthField,
  AuthSubmitButton,
} from "@/components/auth/AuthCard";
import { resetPassword } from "@/features/auth/services/authApi";

export function ResetPasswordClient() {
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid. Please request a new one.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard
        title="Password reset!"
        subtitle="Your password has been updated successfully."
      >
        <div className="flex items-start gap-3 mb-6">
          <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
          <p className="font-body text-[14px] text-stone-700">
            You can now sign in with your new password.
          </p>
        </div>
        <Link href="/auth/login">
          <AuthSubmitButton>Go to Sign In</AuthSubmitButton>
        </Link>
      </AuthCard>
    );
  }

  if (!token) {
    return (
      <AuthCard
        title="Invalid link"
        subtitle="This password reset link is missing or invalid."
      >
        <Link href="/auth/forgot-password">
          <AuthSubmitButton>Request a new link</AuthSubmitButton>
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password you'll remember."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="password"
          label="New Password"
          type="password"
          placeholder="********"
          icon={Lock}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <AuthField
          id="confirm"
          label="Confirm Password"
          type="password"
          placeholder="********"
          icon={Lock}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <AuthSubmitButton disabled={submitting}>
          {submitting ? "Saving…" : "Reset password"}
        </AuthSubmitButton>
        {error && (
          <p className="font-body text-[13px] text-rose-600 font-semibold">
            {error}
          </p>
        )}
      </form>

      <p className="mt-5 font-body text-[14px] text-stone-700">
        Back to{" "}
        <Link
          href="/auth/login"
          className="font-title-hw font-bold text-[#e74c3c] hover:text-[#c0392b] transition-colors"
        >
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}
