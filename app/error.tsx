"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 bg-primary">
      <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">Something went wrong</h1>
      <p className="mt-4 text-lg text-tertiary">
        We encountered an error loading this page.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-accent-foreground font-medium hover:opacity-90 transition"
      >
        Try again
      </button>
    </main>
  );
}
