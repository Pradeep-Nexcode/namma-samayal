"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AtSign, CheckCircle2, Loader2, XCircle } from "lucide-react";

import {
  AuthCard,
  AuthField,
  AuthSubmitButton,
} from "@/components/auth/AuthCard";
import { resendVerification, verifyEmail } from "@/features/auth/services/authApi";

type Status = "verifying" | "success" | "error" | "missing";

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "missing");
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token || hasRun.current) return;
    hasRun.current = true;

    verifyEmail(token)
      .then((msg) => {
        setStatus("success");
        setMessage(msg);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Verification link is invalid or has expired.",
        );
      });
  }, [token]);

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault();
    setResendMsg("");

    if (!email) {
      setResendMsg("Please enter your email address.");
      return;
    }

    try {
      setResending(true);
      const msg = await resendVerification(email.trim());
      setResendMsg(msg);
    } catch (err) {
      setResendMsg(
        err instanceof Error ? err.message : "Failed to resend. Try again.",
      );
    } finally {
      setResending(false);
    }
  };

  if (status === "verifying") {
    return (
      <AuthCard title="Verifying…" subtitle="Hang tight while we confirm your email.">
        <div className="flex items-center gap-3 text-stone-700">
          <Loader2 className="h-6 w-6 animate-spin text-[#e74c3c]" />
          <span className="font-body text-[15px]">Checking your link…</span>
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard
        title="You're verified!"
        subtitle="Your account is now active. Welcome to the kitchen 🍛"
      >
        <div className="flex items-start gap-3 mb-6">
          <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
          <p className="font-body text-[14px] text-stone-700">{message}</p>
        </div>
        <Link href="/auth/login">
          <AuthSubmitButton>Go to Sign In</AuthSubmitButton>
        </Link>
      </AuthCard>
    );
  }

  // error or missing token → show resend option
  return (
    <AuthCard
      title="Link not valid"
      subtitle="This verification link is invalid or has expired. Enter your email to get a fresh one."
    >
      <div className="flex items-start gap-3 mb-6">
        <XCircle className="h-7 w-7 shrink-0 text-rose-600" />
        <p className="font-body text-[14px] text-stone-700">
          {status === "missing"
            ? "No verification token was found in this link."
            : message}
        </p>
      </div>

      <form onSubmit={handleResend} className="space-y-4">
        <AuthField
          id="resend-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={AtSign}
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <AuthSubmitButton disabled={resending}>
          {resending ? "Sending…" : "Resend verification email"}
        </AuthSubmitButton>
        {resendMsg && (
          <p className="font-body text-[13px] text-stone-700 font-semibold">
            {resendMsg}
          </p>
        )}
      </form>

      <p className="mt-5 font-body text-[14px] text-stone-700">
        Already verified?{" "}
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
