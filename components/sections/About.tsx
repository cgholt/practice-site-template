import Image from "next/image";

export default function About({
  title,
  content,
  image,
  imageCredit,
}: {
  title?: string;
  content: string;
  image?: string | null;
  imageCredit?: string;
}) {
  return (
    <section >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid md:grid-cols-2 overflow-hidden">
          {image && (
            <div
              className="relative aspect-[3/4] md:aspect-auto md:min-h-[320px]"
              {...(imageCredit ? { title: imageCredit } : {})}
            >
              <Image
                src={image}
                alt={title || "About"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
          )}
          <div
            className={`p-10 md:p-14 flex flex-col justify-center ${
              image ? "" : "md:col-span-2 max-w-2xl mx-auto"
            }`}
          >
            <h2 className="text-2xl font-semibold text-primary-foreground">
              {title || "About Me"}
            </h2>
            <div className="mt-1 h-1 w-16 bg-accent rounded" />
            <div
              className="prose-content mt-6 text-tertiary leading-relaxed space-y-4 [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
