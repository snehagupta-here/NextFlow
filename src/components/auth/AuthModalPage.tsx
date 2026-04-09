"use client";

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
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black">
      <AuthPromptModal
        open
        mode={mode}
        redirectUrl={redirectUrl}
        onClose={() => router.push("/nodes")}
      />
    </div>
  );
}
