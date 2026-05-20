type HeadingLevel = "h1" | "h2"

export type ToolSeoContentProps = {
  id: string
  heading: string
  description: string
  features: readonly string[]
  headingLevel?: HeadingLevel
}

export function ToolSeoContent({
  id,
  heading,
  description,
  features,
  headingLevel = "h2",
}: ToolSeoContentProps) {
  const HeadingTag = headingLevel
  const SubheadingTag = headingLevel === "h1" ? "h2" : "h3"

  return (
    <section
      className="sr-only"
      aria-labelledby={id}
    >
      <HeadingTag id={id}>{heading}</HeadingTag>
      <p>{description}</p>
      <SubheadingTag>What this tool helps with</SubheadingTag>
      <ul>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </section>
  )
}
