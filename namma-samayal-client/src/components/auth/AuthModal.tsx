"use client";

import { AuthFormLayout } from "@/components/auth/AuthFormLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthMode = "register" | "login";

interface AuthModalProps {
  mode: AuthMode;
}

export default function AuthModal({ mode }: AuthModalProps) {
  const router = useRouter();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/55 p-3 backdrop-blur-md sm:p-6"
      onClick={handleClose}
    >
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          aria-label={`Close ${mode} modal`}
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="h-4 w-4"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <AuthFormLayout mode={mode} />
      </div>
    </div>
  );
}
