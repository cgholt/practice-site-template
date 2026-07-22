import { renderTextWithUnderline } from "lib/renderTextWithUnderline";

export default function Quote({
  text,
  author,
  highlight,
}: {
  text?: string;
  author?: string;
  highlight?: string;
}) {
  if (!text) return null;

  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24 text-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 260 90"
          className="mx-auto h-14 w-auto md:h-20 text-accent -scale-y-100"
          fill="currentColor"
        >
          <path d="M130,55 C130,35 140,20 158,14 C178,7 200,10 214,22 C222,29 226,38 222,45 C219,50 212,51 208,46 C205,42 207,37 211,36 C207,30 196,27 186,30 C170,35 160,48 158,62 C157,70 152,76 144,76 C136,76 130,68 130,58 Z" />
          <path d="M130,55 C130,35 120,20 102,14 C82,7 60,10 46,22 C38,29 34,38 38,45 C41,50 48,51 52,46 C55,42 53,37 49,36 C53,30 64,27 74,30 C90,35 100,48 102,62 C103,70 108,76 116,76 C124,76 130,68 130,58 Z" />
        </svg>
        <p className="mt-2 font-[family-name:var(--font-playfair)] text-xl md:text-3xl italic leading-snug text-primary">
          {highlight ? renderTextWithUnderline(text, highlight) : text}
        </p>
        {author && (
          <p
            className="mt-6 text-sm md:text-base uppercase tracking-widest"
            style={{ color: "color-mix(in srgb, var(--accent) 65%, black)" }}
          >
            &mdash; {author}
          </p>
        )}
      </div>
    </section>
  );
}
