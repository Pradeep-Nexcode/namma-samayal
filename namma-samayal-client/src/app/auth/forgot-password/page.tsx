"use client";

import Link from "next/link";
import { useState } from "react";
import { AtSign, MailCheck } from "lucide-react";

import {
  AuthCard,
  AuthField,
  AuthSubmitButton,
} from "@/components/auth/AuthCard";
import { forgotPassword } from "@/features/auth/services/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setSubmitting(true);
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="If an account exists for that email, we've sent a password reset link."
      >
        <div className="flex items-start gap-3 mb-6">
          <MailCheck className="h-7 w-7 shrink-0 text-emerald-600" />
          <p className="font-body text-[14px] text-stone-700">
            The link expires in 1 hour. Don't forget to check your spam folder.
          </p>
        </div>
        <Link href="/auth/login">
          <AuthSubmitButton>Back to Sign In</AuthSubmitButton>
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="No worries — enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={AtSign}
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <AuthSubmitButton disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </AuthSubmitButton>
        {error && (
          <p className="font-body text-[13px] text-rose-600 font-semibold">
            {error}
          </p>
        )}
      </form>

      <p className="mt-5 font-body text-[14px] text-stone-700">
        Remembered it?{" "}
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
