import Image from "next/image";
import Link from "next/link";
import { renderTextWithUnderline } from "lib/renderTextWithUnderline";

export default function Hero({
  title,
  subtitle,
  ctaText,
  ctaHref,
  image,
  imageCredit,
  imagePosition = "top",
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  image?: string | null;
  imageCredit?: string;
  imagePosition?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:grid md:grid-cols-2 md:gap-10 md:items-center">
        {image && (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none md:static md:order-2 md:opacity-100 md:flex md:items-center md:justify-center"
            {...(imageCredit ? { title: imageCredit } : {})}
          >
            <div className="relative w-full h-full max-w-2xl md:max-w-none md:w-full md:h-auto md:aspect-[5/4]">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                style={{ objectPosition: imagePosition }}
                priority
                fetchPriority="high"
              />
              <div
                className="absolute inset-0 bg-secondary mix-blend-multiply"
                style={{
                  WebkitMaskImage: `url(${image})`,
                  maskImage: `url(${image})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: imagePosition,
                  maskPosition: imagePosition,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
            </div>
          </div>
        )}
        <div className="relative text-center space-y-16 md:order-1 md:text-left">
          <h1
            className="text-4xl/tighter md:text-6xl font-extrabold tracking-tighter text-primary-foreground"
            style={{ textTransform: "none" }}
          >{title}</h1>
          {subtitle && (
            <p className="text-lg text-tertiary">{subtitle}</p>
          )}
          {ctaText && ctaHref && (
            <div>
              <Link
                href={ctaHref}
                className="inline-flex items-center rounded-none bg-accent px-6 py-3 text-accent-foreground font-medium hover:opacity-90 transition"
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
