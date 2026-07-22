import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Header from "components/Header";
import Footer from "components/Footer";
import ThemeProvider from "components/ThemeProvider";
import BackgroundImage from "components/BackgroundImage";
import { LocalBusinessSchema } from "components/StructuredData";
import NotificationBanner from "components/NotificationBanner";
import { getSiteConfig, getActiveColorPreset, validHexColor } from "lib/content";
import { playfair, nunitoSans } from "lib/fonts";
import Script from "next/script";

// Script to prevent flash of wrong theme (dark is default)
const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    }
  })();
`;

const siteConfig = getSiteConfig();
const activeColorPreset = getActiveColorPreset();
// Generate CSS variables from active color preset
const colorStyles = activeColorPreset ? `
  :root {
    --primary: ${validHexColor(activeColorPreset.primary, '#ffffff')};
    --secondary: ${validHexColor(activeColorPreset.secondary, '#967d62')};
    --accent: ${validHexColor(activeColorPreset.accent, '#a76b09')};
    --surface: ${validHexColor(activeColorPreset.surface, '#f5f0eb')};
    --deep: ${validHexColor(activeColorPreset.deep, '#3a3d45')};
  }
` : '';
const siteUrl = process.env.SITE_URL || "https://example.com";

// Analytics / ads IDs are per-site — configure via env so template clones
// don't inherit another site's tracking. When unset, the tags render nothing.
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID; // GA4, e.g. "G-XXXXXXXXXX"
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID; // e.g. "AW-000000000"
const googleAdsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL; // label after the slash

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  keywords: ["therapy", "counseling", "men's mental health", "anxiety", "depression", "existential therapy"],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.tagline,
  },
  icons: [],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunitoSans.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {googleAdsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} strategy="afterInteractive" />
            <Script id="google-ads-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsId}');
              function gtag_report_conversion(url) {
                var callback = function () {
                  if (typeof(url) != 'undefined') {
                    window.location = url;
                  }
                };
                gtag('event', 'conversion', {
                  ${googleAdsConversionLabel ? `'send_to': '${googleAdsId}/${googleAdsConversionLabel}',` : ""}
                  'event_callback': callback
                });
                return false;
              }
            `}</Script>
          </>
        )}
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {siteConfig.backgroundImage && (
          <link rel="preload" href={siteConfig.backgroundImage} as="image" />
        )}
        {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
<script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {colorStyles && <style dangerouslySetInnerHTML={{ __html: colorStyles }} />}
        <LocalBusinessSchema
          name={siteConfig.name}
          description={siteConfig.tagline}
          url={siteUrl}
        />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        {siteConfig.backgroundImage && (
          <BackgroundImage
            src={siteConfig.backgroundImage}
            overlay={siteConfig.backgroundOverlay}
            imageCredit={siteConfig.backgroundImageCredit}
          />
        )}
        <ThemeProvider>
          <NotificationBanner />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
