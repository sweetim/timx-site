import type { OpenApiOperation } from "./types"

function ParamTable({
  params,
  title,
}: {
  params: OpenApiOperation["parameters"]
  title: string
}) {
  if (!params || params.length === 0) return null
  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium text-dev-text-secondary uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dev-border">
              <th className="text-left py-1.5 pr-3 text-dev-text-secondary font-medium text-xs">
                Name
              </th>
              <th className="text-left py-1.5 pr-3 text-dev-text-secondary font-medium text-xs">
                In
              </th>
              <th className="text-left py-1.5 pr-3 text-dev-text-secondary font-medium text-xs">
                Required
              </th>
              <th className="text-left py-1.5 pr-3 text-dev-text-secondary font-medium text-xs">
                Description
              </th>
              <th className="text-left py-1.5 text-dev-text-secondary font-medium text-xs">
                Schema
              </th>
            </tr>
          </thead>
          <tbody>
            {params.map((param) => (
              <tr
                key={`${param.location}-${param.name}`}
                className="border-b border-dev-border/50"
              >
                <td className="py-1.5 pr-3 font-mono text-dev-accent-blue">
                  {param.name}
                </td>
                <td className="py-1.5 pr-3 text-dev-text-secondary">
                  {param.location}
                </td>
                <td className="py-1.5 pr-3">
                  {param.required ? (
                    <span className="text-dev-accent-red text-xs">Yes</span>
                  ) : (
                    <span className="text-dev-text-secondary text-xs">No</span>
                  )}
                </td>
                <td className="py-1.5 pr-3 text-dev-text max-w-xs truncate">
                  {param.description || "—"}
                </td>
                <td className="py-1.5">
                  {param.schema ? (
                    <span className="font-mono text-xs text-dev-syntax-number">
                      {(param.schema as Record<string, unknown>).type as string}
                    </span>
                  ) : (
                    <span className="text-dev-text-secondary">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { ParamTable }
