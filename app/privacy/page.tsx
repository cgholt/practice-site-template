import { Metadata } from "next";
import { getPrivacyPolicy } from "lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for our therapy practice website.",
};

export default function PrivacyPage() {
  const privacy = getPrivacyPolicy();

  return (
    <main className="bg-primary">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-primary-foreground">
          {privacy.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date(privacy.lastUpdated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div
          className="prose-content mt-8 prose prose-invert prose-headings:text-primary-foreground prose-p:text-tertiary prose-a:text-accent prose-strong:text-primary-foreground max-w-none"
          dangerouslySetInnerHTML={{ __html: privacy.content }}
        />
      </div>
    </main>
  );
}
