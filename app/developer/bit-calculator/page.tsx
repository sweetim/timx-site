import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
import BitCalculator from "./_components/bit-calculator"

export const metadata: Metadata = {
  title: "Bit Calculator — Free Online Tool",
  description:
    "Perform bitwise operations (AND, OR, XOR, NOT, shifts) on hex, decimal, and binary values with a visual bit grid. Compare values bit-by-bit in 8, 16, 32, or 64 bit widths.",
  alternates: { canonical: "https://timx.co/developer/bit-calculator" },
  openGraph: {
    title: "Bit Calculator — Free Online Tool",
    description:
      "Perform bitwise operations (AND, OR, XOR, NOT, shifts) on hex, decimal, and binary values with a visual bit grid.",
    url: "https://timx.co/developer/bit-calculator",
  },
}

export default function BitCalculatorPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          {
            name: "Bit Calculator",
            url: "https://timx.co/developer/bit-calculator",
          },
        ]}
      />
      <WebApplicationJsonLd
        name="Bit Calculator"
        description="Perform bitwise operations (AND, OR, XOR, NOT, shifts) on hex, decimal, and binary values with a visual bit grid."
        url="https://timx.co/developer/bit-calculator"
        applicationCategory="DeveloperApplication"
        featureList={[
          "AND, OR, XOR, NOT, and left/right shift operators",
          "Visual bit grid grouped by nibble with hex labels",
          "8, 16, 32, and 64 bit widths",
          "Synced hex, decimal, and binary inputs",
          "Toggle individual bits by clicking cells",
        ]}
      />
      <BitCalculator />
      <ToolSeoContent
        id="bit-calculator-seo"
        heading="Free Online Bit Calculator"
        description="Use the Bit Calculator to combine hex, decimal, and binary values with AND, OR, XOR, NOT, and shift operators. Values are shown as an aligned bit grid grouped by nibble, so you can compare operands and results bit-by-bit. Choose 8, 16, 32, or 64 bit widths and toggle individual bits directly. All processing runs in your browser."
        features={[
          "Apply AND, OR, XOR, and NOT plus left and right shifts to two operands.",
          "See every value as an aligned binary grid with hex nibble labels for instant hex-to-binary comparison.",
          "Work in 8, 16, 32, or 64 bit widths with synced hex, decimal, and binary inputs.",
          "Toggle any bit by clicking its cell, with differing bits highlighted between operands.",
        ]}
      />
    </>
  )
}
