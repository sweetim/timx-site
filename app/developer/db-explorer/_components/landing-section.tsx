import {
  FileJson,
  History,
  LayoutGrid,
  ListOrdered,
  ShieldCheck,
  Terminal,
} from "lucide-react"

const features = [
  {
    icon: LayoutGrid,
    title: "Browse tables",
    description:
      "Browse all tables in a SQLite database with row counts.",
  },
  {
    icon: ListOrdered,
    title: "View data",
    description:
      "View table data with pagination (100 rows per page).",
  },
  {
    icon: Terminal,
    title: "Run queries",
    description:
      "Run custom SQL queries with table and column autocomplete.",
  },
  {
    icon: FileJson,
    title: "Inspect cells",
    description:
      "Inspect cell values with JSON, JSONL, and Markdown highlighting.",
  },
  {
    icon: ShieldCheck,
    title: "Browser-only",
    description:
      "Entirely client-side — no data is uploaded to any server.",
  },
  {
    icon: History,
    title: "Recent files",
    description:
      "Quickly reopen recently used databases with one click.",
  },
]

export function LandingSection() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-semibold text-dev-text mb-2">
        SQLite DB Explorer
      </h1>
      <p className="text-dev-text-secondary text-sm mb-8">
        Browse SQLite database files in your browser. View tables, inspect rows,
        and run SQL queries.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-dev-border bg-dev-surface p-4"
          >
            <feature.icon className="size-5 text-dev-link mx-auto mb-2" />
            <h2 className="text-sm font-semibold text-dev-text mb-1">
              {feature.title}
            </h2>
            <p className="text-xs text-dev-text-secondary leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
