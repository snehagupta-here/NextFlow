"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SSOCallbackPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/nodes";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-[#171717]">
      <div id="clerk-captcha" className="min-h-[1px]" aria-hidden="true" />
      <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white px-5 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <LoaderCircle size={18} className="animate-spin text-[#3f6df6]" />
        <span className="text-sm font-medium">Completing sign in...</span>
      </div>
      <AuthenticateWithRedirectCallback
        signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
        signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
        continueSignUpUrl={`/sign-up?redirect_url=${encodeURIComponent(
          redirectUrl
        )}`}
        signInFallbackRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}
