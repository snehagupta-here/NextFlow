"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { Mail, Shield, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type AuthPromptModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "signIn" | "signUp";
  redirectUrl?: string;
};

function AppleMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16.365 12.19c.028 3.072 2.695 4.095 2.724 4.108-.023.072-.426 1.46-1.4 2.894-.841 1.238-1.714 2.47-3.089 2.496-1.35.025-1.784-.8-3.329-.8-1.545 0-2.027.775-3.305.825-1.326.05-2.336-1.325-3.184-2.559-1.731-2.505-3.053-7.079-1.278-10.162.881-1.531 2.455-2.5 4.164-2.525 1.301-.025 2.53.875 3.329.875.799 0 2.297-1.082 3.872-.923.66.028 2.513.266 3.704 2.008-.096.06-2.212 1.289-2.208 3.763ZM14.571 5.27c.707-.857 1.184-2.05 1.055-3.24-1.02.042-2.257.68-2.989 1.537-.654.757-1.227 1.97-1.073 3.129 1.138.088 2.3-.58 3.007-1.426Z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.34-2.04 3.06l3.3 2.55c1.92-1.77 3.03-4.38 3.03-7.5 0-.72-.06-1.41-.18-2.07H12Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.3-2.55c-.92.62-2.09.99-3.31.99-2.55 0-4.7-1.72-5.47-4.03l-3.41 2.63A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#4A90E2"
        d="M6.53 13.97A5.99 5.99 0 0 1 6.22 12c0-.68.11-1.34.31-1.97L3.12 7.4A10 10 0 0 0 2 12c0 1.62.39 3.15 1.12 4.6l3.41-2.63Z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.98c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.95 2.95 14.69 2 12 2 8.09 2 4.72 4.24 3.12 7.4l3.41 2.63c.77-2.31 2.92-4.05 5.47-4.05Z"
      />
    </svg>
  );
}

export default function AuthPromptModal({
  open,
  onClose,
  mode = "signUp",
  redirectUrl,
}: AuthPromptModalProps) {
  const clerk = useClerk();
  const { isLoaded, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const title =
    mode === "signUp" ? "Sign up to generate for free" : "Welcome back";
  const heroImageUrl =
    mode === "signUp"
      ? "https://optim-images.krea.ai/https---s-krea-ai-moved-images-d178f504-e8f8-4352-ac90-0b8d7b9bed77-png-1024.webp"
      : "https://optim-images.krea.ai/https---s-krea-ai-moved-images-42f6a29e-aef6-48ab-b5e8-9dcb1006a062-png-1024.webp";

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !isMounted) return null;

  const redirectComplete =
    redirectUrl || searchParams.get("redirect_url") || pathname || "/nodes";
  const callbackUrl = `/sso-callback?redirect_url=${encodeURIComponent(
    redirectComplete
  )}&mode=${mode}`;
  const alternateModeHref = `${
    mode === "signUp" ? "/sign-in" : "/sign-up"
  }?redirect_url=${encodeURIComponent(redirectComplete)}`;

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsSubmitting(true);

    try {
      if (mode === "signUp") {
        if (!isSignUpLoaded || !signUp) return;

        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: callbackUrl,
          redirectUrlComplete: redirectComplete,
          continueSignIn: true,
          continueSignUp: true,
        });
        return;
      }

      if (!isLoaded || !signIn) return;

      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: callbackUrl,
        redirectUrlComplete: redirectComplete,
        continueSignIn: true,
        continueSignUp: true,
      });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const handleEmailContinue = () => {
    if (mode === "signUp") {
      clerk.openSignUp({
        fallbackRedirectUrl: redirectComplete,
        forceRedirectUrl: redirectComplete,
      });
      return;
    }

    clerk.openSignIn({
      fallbackRedirectUrl: redirectComplete,
      forceRedirectUrl: redirectComplete,
    });
  };

  const handleSSO = () => {
    if (mode === "signUp") {
      clerk.openSignUp({
        fallbackRedirectUrl: redirectComplete,
        forceRedirectUrl: redirectComplete,
      });
      return;
    }

    clerk.openSignIn({
      fallbackRedirectUrl: redirectComplete,
      forceRedirectUrl: redirectComplete,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[840px] overflow-hidden rounded-[22px] bg-white shadow-[0_28px_100px_rgba(0,0,0,0.42)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/18 text-white transition hover:bg-black/28"
          aria-label="Close sign in modal"
        >
          <X size={20} />
        </button>

        <div className="flex w-full flex-col px-5 py-6 md:w-[48%] md:px-6">
          <h2 className="mx-auto max-w-[255px] text-center text-[30px] font-semibold leading-[1.1] tracking-[-0.05em] text-black">
            {title}
          </h2>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => void handleOAuth("oauth_google")}
              disabled={isSubmitting}
              className="relative inline-flex h-[52px] items-center justify-center gap-3 rounded-[16px] border-[3px] border-[#3f6df6] bg-black px-4 text-[14px] font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute right-3 top-[-14px] rounded-full bg-[#3f6df6] px-2.5 py-1 text-[11px] font-semibold text-white">
                Last Used
              </span>
              <GoogleMark />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => void handleOAuth("oauth_apple")}
              disabled={isSubmitting}
              className="inline-flex h-[46px] items-center justify-center gap-3 rounded-[14px] bg-black px-4 text-[14px] font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <AppleMark />
              Continue with Apple
            </button>

            <button
              type="button"
              onClick={handleSSO}
              disabled={isSubmitting}
              className="inline-flex h-[46px] items-center justify-center gap-3 rounded-[14px] bg-black px-4 text-[14px] font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Shield size={20} />
              Single Sign-On (SSO)
            </button>
          </div>

          <div className="py-4 text-center text-[12px] font-medium text-black/35">
            OR
          </div>

          <div className="mb-3 min-h-[1px]" aria-hidden="true" />

          <label className="flex h-[50px] items-center gap-3 rounded-[16px] border border-black/15 bg-[#f3f3f3] px-4">
            <Mail size={20} className="text-black/55" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full bg-transparent text-[14px] text-black outline-none placeholder:text-black/65"
            />
          </label>

          <button
            type="button"
            onClick={handleEmailContinue}
            disabled={isSubmitting}
            className="mt-3 inline-flex h-[50px] items-center justify-center rounded-[16px] bg-[#dce7ff] text-[15px] font-semibold text-[#4f8cff] transition hover:bg-[#d3e1ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue
          </button>

          <p className="mt-3.5 text-center text-[11px] leading-5 text-black/65">
            By continuing, you agree to NextFlow&apos;s{" "}
            <span className="text-[#5a8cff]">Terms of Use</span> &{" "}
            <span className="text-[#5a8cff]">Privacy Policy</span>.
          </p>

          <p className="mt-3 text-center text-[12px] leading-5 text-black/70">
            {mode === "signUp" ? "Already have an account?" : "Don’t have an account?"}{" "}
            <Link
              href={alternateModeHref}
              className="font-medium text-[#5a8cff] transition hover:text-[#3f6df6]"
            >
              {mode === "signUp" ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>

        <div className="relative hidden md:block md:w-[60%]">
          <img
            src={heroImageUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
