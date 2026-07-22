"use client";

import { useEffect, useRef } from "react";

export default function BackgroundImage({
  src,
  overlay = 50,
  imageCredit,
}: {
  src: string;
  overlay?: number;
  imageCredit?: string;
}) {
  const bgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updatePosition = () => {
      if (!bgRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bgRef.current.style.backgroundPosition = `center ${percent}%`;
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 -z-10 bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${src})` }}
      {...(imageCredit ? { title: imageCredit } : {})}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlay / 100})` }}
      />
    </div>
  );
}
