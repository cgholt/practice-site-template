export function LocalBusinessSchema({
  name,
  description,
  url,
}: {
  name: string;
  description?: string;
  url?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MentalHealthBusiness",
    name,
    description,
    url,
    priceRange: "$$",
    // Add these when available:
    // address: { "@type": "PostalAddress", streetAddress: "", addressLocality: "", addressRegion: "", postalCode: "" },
    // telephone: "",
    // email: "",
    // image: "",
    // openingHours: "Mo-Fr 09:00-17:00",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
