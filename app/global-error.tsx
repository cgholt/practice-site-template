"use client";

import { useEffect } from "react";
import "./globals.css";

// next/font loaders can't run in global-error.tsx (Next.js requires this file to be
// a Client Component, and font loaders are Server Component-only), so the fonts are
// loaded via a plain <link> and wired into the same --font-playfair/--font-nunito
// vars that app/globals.css already keys its font-family rules off of.
const fontVarStyle = {
  "--font-playfair": "'Playfair Display', serif",
  "--font-nunito": "'Nunito Sans', sans-serif",
} as React.CSSProperties;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en" style={fontVarStyle}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#181619] text-white">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
          <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-4 text-lg text-gray-400">
            We encountered an unexpected error.
          </p>
          <button
            onClick={reset}
            className="mt-8 inline-flex items-center rounded-lg bg-[#a76b09] px-6 py-3 text-white font-medium hover:opacity-90 transition"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
