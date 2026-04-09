"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AuthPromptModal from "@/components/auth/AuthPromptModal";

type AuthModalPageProps = {
  mode: "signIn" | "signUp";
  redirectUrl?: string;
};

export default function AuthModalPage({
  mode,
  redirectUrl,
}: AuthModalPageProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const nextUrl = redirectUrl || (mode === "signUp" ? "/nodes/new" : "/nodes");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    router.replace(nextUrl);
  }, [isLoaded, isSignedIn, nextUrl, router]);

  return (
    <div className="min-h-screen bg-black">
      <div id="clerk-captcha" className="min-h-[1px]" aria-hidden="true" />
      <AuthPromptModal
        open
        mode={mode}
        redirectUrl={redirectUrl}
        onClose={() => router.push("/nodes")}
      />
    </div>
  );
}
