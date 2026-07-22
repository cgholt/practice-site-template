import { getSiteConfig } from "lib/content";
import HeaderNav from "components/HeaderNav";

export default function Header() {
  const siteConfig = getSiteConfig();

  return (
    <header className="border-b border-secondary">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <HeaderNav siteConfig={siteConfig} />
      </nav>
    </header>
  );
}
