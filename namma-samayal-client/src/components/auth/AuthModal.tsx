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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={handleClose}
    >
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          aria-label={`Close ${mode} modal`}
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/45 p-2 text-white/80 transition hover:bg-black/70 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
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
