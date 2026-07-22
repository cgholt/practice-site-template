import { Endorsement } from "lib/content";

export default function Endorsements({
  title,
  items,
}: {
  title?: string;
  items: Endorsement[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-primary-foreground">
          {title || "Professional Endorsements"}
        </h2>
        <div className="mt-1 h-1 w-16 bg-accent rounded" />
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {items.map((e, index) => (
            <figure
              key={`${e.name}-${index}`}
              className="rounded-xl border border-border bg-secondary p-6"
            >
              <blockquote className="text-tertiary">
                <span className="text-accent text-xl">&ldquo;</span>
                {e.quote}
                <span className="text-accent text-xl">&rdquo;</span>
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center ring-2 ring-accent">
                  <span className="text-sm font-medium text-accent">
                    {e.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-secondary-foreground">{e.name}</div>
                  <div className="text-sm text-muted-foreground">{e.credentials}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
