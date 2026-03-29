"use client";

import { useEffect, useState } from "react";
import type { GeminiModelOption } from "@/types/gemini-model";

export function useGeminiModels() {
  const [models, setModels] = useState<GeminiModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const res = await fetch("/api/gemini/models", {
          method: "GET",
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result?.error || "Failed to fetch Gemini models.");
        }

        if (!cancelled) {
          setModels(result.models ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch Gemini models."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    models,
    isLoading,
    error,
  };
}