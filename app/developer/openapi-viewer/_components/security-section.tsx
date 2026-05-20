import { Lock } from "lucide-react"
import type { OpenApiSecurityRequirement, OpenApiSecurityScheme } from "./types"

function getSchemeLabel(scheme: OpenApiSecurityScheme): string {
  switch (scheme.type) {
    case "http":
      return scheme.scheme === "bearer"
        ? `Bearer${scheme.bearerFormat ? ` (${scheme.bearerFormat})` : ""}`
        : (scheme.scheme ?? "http")
    case "apiKey":
      return `ApiKey (${scheme.in ?? "header"})`
    case "oauth2":
      return "OAuth 2.0"
    case "openIdConnect":
      return "OpenID Connect"
  }
}

function SecurityBadge({
  scheme,
  name,
}: {
  scheme: OpenApiSecurityScheme
  name: string
}) {
  return (
    <div
      key={name}
      className="flex items-center gap-1.5 text-xs text-dev-text-secondary"
    >
      <Lock
        size={10}
        className="shrink-0"
      />
      <span className="font-mono text-dev-accent-purple">{name}</span>
      <span className="text-dev-text-secondary">
        ({getSchemeLabel(scheme)})
      </span>
    </div>
  )
}

function SecuritySchemesList({
  schemes,
}: {
  schemes: Record<string, OpenApiSecurityScheme>
}) {
  const entries = Object.entries(schemes)
  if (entries.length === 0) return null
  return (
    <div className="space-y-0.5">
      {entries.map(([name, scheme]) => (
        <SecurityBadge
          key={name}
          scheme={scheme}
          name={name}
        />
      ))}
    </div>
  )
}

function SecuritySection({
  security,
  securitySchemes,
  specSecurity,
}: {
  security: OpenApiSecurityRequirement[] | undefined
  securitySchemes: Record<string, OpenApiSecurityScheme> | undefined
  specSecurity: OpenApiSecurityRequirement[] | undefined
}) {
  const effectiveSecurity = security ?? specSecurity
  if (
    !effectiveSecurity
    || effectiveSecurity.length === 0
    || !securitySchemes
  ) {
    return null
  }

  const resolved = effectiveSecurity.flatMap((req, requirementIndex) =>
    Object.entries(req)
      .filter(([name]) => name in securitySchemes)
      .map(([name, scopes]) => ({
        name,
        requirementIndex,
        scheme: securitySchemes[name],
        scopes,
      })),
  )

  if (resolved.length === 0) return null

  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium text-dev-text-secondary uppercase tracking-wider mb-2">
        Authorization
      </h4>
      <div className="space-y-1.5">
        {resolved.map(({ name, requirementIndex, scheme, scopes }) => (
          <div
            key={`${requirementIndex}-${name}`}
            className="flex items-start gap-2 text-sm"
          >
            <Lock
              size={14}
              className="shrink-0 mt-0.5 text-dev-accent-purple"
            />
            <div>
              <span className="font-mono text-dev-accent-purple">{name}</span>
              <span className="text-dev-text-secondary ml-1.5">
                {getSchemeLabel(scheme)}
              </span>
              {scheme.description && (
                <p className="text-xs text-dev-text-secondary mt-0.5">
                  {scheme.description}
                </p>
              )}
              {scopes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {scopes.map((scope) => (
                    <span
                      key={scope}
                      className="text-[10px] font-mono bg-dev-inset px-1.5 py-0.5 rounded text-dev-text-secondary"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { SecurityBadge, SecuritySchemesList, SecuritySection }
