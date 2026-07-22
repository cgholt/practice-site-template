"use client";

import Script from "next/script";

export default function PsychologyTodayBadge() {
  return (
    <div className="flex justify-center">
      <a
        href="https://www.psychologytoday.com/profile/1676487"
        className="sx-verified-seal"
      />
      <Script
        src="https://member.psychologytoday.com/verified-seal.js"
        data-badge="17"
        data-id="1676487"
        data-code="aHR0cHM6Ly93d3cucHN5Y2hvbG9neXRvZGF5LmNvbS9hcGkvdmVyaWZpZWQtc2VhbC9zZWFscy8xNy9wcm9maWxlLzE2NzY0ODc/Y2FsbGJhY2s9c3hjYWxsYmFjaw=="
        strategy="afterInteractive"
      />
    </div>
  );
}
