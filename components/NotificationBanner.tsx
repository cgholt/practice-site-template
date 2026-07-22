import Link from "next/link";
import { getBanner } from "lib/content";

export default function NotificationBanner() {
  const banner = getBanner();

  if (!banner.enabled) return null;

  const style: React.CSSProperties = {};
  if (banner.backgroundColor) style.backgroundColor = banner.backgroundColor;
  if (banner.textColor) style.color = banner.textColor;

  return (
    <div
      className={`${!banner.backgroundColor ? "bg-secondary" : ""} ${!banner.textColor ? "text-slate-800" : ""} text-center py-2 px-4 text-sm font-medium`}
      style={style}
    >
      {banner.text}{" "}
      <Link href={banner.linkHref} className="underline hover:opacity-80">
        {banner.linkText}
      </Link>
    </div>
  );
}
