export type PersonJsonLdProps = {
  name: string
  url: string
  jobTitle: string
  description: string
  image?: string
  knowsAbout?: string[]
  sameAs: string[]
}

export type WebApplicationJsonLdProps = {
  name: string
  description: string
  url: string
  applicationCategory: string
  featureList?: string[]
}

export function PersonJsonLd({
  name,
  url,
  jobTitle,
  description,
  image,
  knowsAbout,
  sameAs,
}: PersonJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    jobTitle,
    description,
    image,
    knowsAbout,
    sameAs,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function WebApplicationJsonLd({
  name,
  description,
  url,
  applicationCategory,
  featureList,
}: WebApplicationJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory,
    featureList,
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
