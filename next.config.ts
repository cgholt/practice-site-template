import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/faqs", destination: "/#faq", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
      { source: "/services", destination: "/", permanent: true },
      { source: "/services/:slug", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
