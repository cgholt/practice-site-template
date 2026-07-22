import { FAQ } from "lib/content";

export default function FAQSection({
  title,
  items,
}: {
  title?: string;
  items: FAQ[];
}) {
  return (
    <section >
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-semibold text-primary-foreground">
          {title || "Frequently asked questions"}
        </h2>
        {/* <div className="mt-1 h-1 w-16 bg-accent rounded" /> */}
        <div className="mt-8 divide-y divide-border">
          {items.map((f) => (
            <details key={f.question} className="group rounded-none px-5 py-4 ">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-foreground hover:opacity-90 transition">
                  {f.question}
                </h3>
                <span className="text-tertiary group-open:rotate-180 transition">
                  ▾
                </span>
              </summary>
              <div
                className="mt-3 text-tertiary [&_p]:mb-2 pl-8"
                dangerouslySetInnerHTML={{ __html: f.answer }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
