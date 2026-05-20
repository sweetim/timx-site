import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import DbExplorer from "./_components/db-explorer"
import { LandingSection } from "./_components/landing-section"

export const metadata: Metadata = {
  title: "SQLite DB Explorer — Free Online Tool",
  description:
    "Browse SQLite database files in your browser. View tables, inspect rows, and run SQL queries — no uploads, everything runs locally.",
  alternates: { canonical: "https://timx.co/developer/db-explorer" },
  openGraph: {
    title: "SQLite DB Explorer — Free Online Tool",
    description:
      "Browse SQLite database files in your browser. View tables, inspect rows, and run SQL queries locally.",
    url: "https://timx.co/developer/db-explorer",
    images: [opengraph.src],
  },
}

export default function DbExplorerPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="SQLite DB Explorer"
        description="Browse SQLite database files in your browser. View tables, inspect rows, and run SQL queries."
        url="https://timx.co/developer/db-explorer"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Browse SQLite database tables",
          "View table rows with pagination",
          "Run custom SQL queries",
          "Entirely client-side — no data leaves your machine",
        ]}
      />
      <DbExplorer landingContent={<LandingSection />} />
    </>
  )
}
