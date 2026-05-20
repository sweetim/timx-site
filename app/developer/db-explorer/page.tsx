import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
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
    images: ["/db-explorer-og.jpg"],
  },
}

export default function DbExplorerPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "DB Explorer", url: "https://timx.co/developer/db-explorer" },
        ]}
      />
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
      <ToolSeoContent
        id="db-explorer-seo"
        heading="SQLite DB Explorer"
        description="Use the SQLite DB Explorer to open SQLite database files in the browser, browse tables, inspect rows, and run SQL queries without uploading the database to a server. It is useful for debugging local app data, exports, and development databases."
        features={[
          "Open .db, .sqlite, and .sqlite3 files locally in the browser.",
          "Browse tables, row counts, and paginated records.",
          "Run SQL queries with table and column autocomplete.",
        ]}
      />
    </>
  )
}
