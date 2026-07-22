export function renderTextWithUnderline(text: string, word: string) {
  const parts = text.split(new RegExp(`(${word})`, "i"));
  return parts.map((part, i) =>
    part.toLowerCase() === word.toLowerCase() ? (
      <span key={i} className="relative inline-block">
        {part}
        <span
          aria-hidden="true"
          className="absolute left-0 top-[1.15em] w-full h-3 bg-accent pointer-events-none select-none"
          style={{
            WebkitMaskImage: "url(/images/decorations/underline-living.png)",
            maskImage: "url(/images/decorations/underline-living.png)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />
      </span>
    ) : (
      part
    )
  );
}
