import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 bg-primary">
      <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">404</h1>
      <p className="mt-4 text-lg text-tertiary">Page not found</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-accent-foreground font-medium hover:opacity-90 transition"
      >
        Go home
      </Link>
    </main>
  );
}
