"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { loginUser, registerUser } from "@/features/auth/services/authApi";

type AuthMode = "register" | "login";

interface AuthFormLayoutProps {
  mode: AuthMode;
}

export function AuthFormLayout({ mode }: AuthFormLayoutProps) {
  const isRegister = mode === "register";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (isRegister && (!form.username || !form.firstName || !form.lastName)) {
      setError("First name, last name and username are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isRegister) {
        await registerUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await loginUser({
          email: form.email.trim(),
          password: form.password,
        });
      }

      window.location.href = "/";
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative grid w-full max-w-[920px] overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-card)] shadow-2xl shadow-black/60 md:grid-cols-2">
      <div className="relative hidden min-h-[600px] md:block">
        <Image
          src="/images/main-hero.png"
          alt="South Indian meal"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.76))]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(231,76,60,0.28),transparent_60%)]" />

        <div className="absolute bottom-8 left-8 right-8 rounded-xl border border-white/15 bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-xs tracking-[0.18em] text-[#F4C430] uppercase">
            Namma Samayal
          </p>
          <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white">
            Authentic Tamil recipes, ingredients and traditions in one place.
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-10">
        <div className="mb-8 flex items-center rounded-xl border border-white/10 bg-[var(--color-card)] p-1">
          <Link
            href="/auth/login"
            className={`w-1/2 rounded-lg px-4 py-2 text-center text-sm font-medium transition ${
              !isRegister
                ? "bg-[#E74C3C] text-slate-900 dark:text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className={`w-1/2 rounded-lg px-4 py-2 text-center text-sm font-medium transition ${
              isRegister
                ? "bg-[#E74C3C] text-slate-900 dark:text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign Up
          </Link>
        </div>

        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {isRegister
            ? "Start your Namma Samayal journey today."
            : "Sign in to continue exploring Tamil flavors."}
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  placeholder="John"
                  className="w-full rounded-lg border border-white/10 bg-[var(--color-elevated)] px-4 py-3 text-slate-900 dark:text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  placeholder="Doe"
                  className="w-full rounded-lg border border-white/10 bg-[var(--color-elevated)] px-4 py-3 text-slate-900 dark:text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/40"
                />
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-[var(--color-elevated)] px-4 py-3 text-slate-900 dark:text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/40"
            />
          </div>

          {isRegister ? (
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm text-zinc-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={form.username}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, username: event.target.value }))
                }
                placeholder="yourname"
                className="w-full rounded-lg border border-white/10 bg-[var(--color-elevated)] px-4 py-3 text-slate-900 dark:text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/40"
              />
            </div>
          ) : null}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="********"
              className="w-full rounded-lg border border-white/10 bg-[var(--color-elevated)] px-4 py-3 text-slate-900 dark:text-white placeholder:text-zinc-500 outline-none transition focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/40"
            />
          </div>

          {isRegister ? (
            <label className="mt-1 flex items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[var(--color-elevated)] accent-[#E74C3C]"
              />
              <span>I agree to terms and conditions</span>
            </label>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-[var(--color-elevated)] accent-[#E74C3C]"
                />
                <span>Remember me</span>
              </label>
              <Link href="#" className="text-[#E74C3C] hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#E74C3C] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white transition duration-200 hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : isRegister ? "Sign Up" : "Sign In"}
          </button>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </form>

        <p className="mt-6 text-sm text-zinc-400">
          {isRegister ? "Already have an account? " : "New to Namma Samayal? "}
          <Link
            href={isRegister ? "/auth/login" : "/auth/register"}
            className="font-medium text-[#E74C3C] hover:underline"
          >
            {isRegister ? "Sign In" : "Create Account"}
          </Link>
        </p>
      </div>
    </section>
  );
}
