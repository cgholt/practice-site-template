import { Testimonial } from "lib/content";

export default function Testimonials({
  title,
  items,
}: {
  title?: string;
  items: Testimonial[];
}) {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-secondary-foreground">
          {title || "What clients say"}
        </h2>
        <div className="mt-1 h-1 w-16 bg-accent rounded" />
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t, index) => (
            <figure
              key={`${t.name}-${index}`}
              className="rounded-xl border border-border bg-primary p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center ring-2 ring-tertiary">
                  <span className="text-lg font-medium text-accent">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <figcaption>
                  <div className="font-medium text-primary-foreground">{t.name}</div>
                </figcaption>
              </div>
              <blockquote className="mt-4 text-tertiary">
                <span className="text-accent text-xl">&ldquo;</span>
                {t.quote}
                <span className="text-accent text-xl">&rdquo;</span>
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
