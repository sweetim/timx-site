import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import ImageResizer from "./_components/image-resizer"

export const metadata: Metadata = {
  title: "Image Resizer — Free Online Tool",
  description:
    "Resize multiple images to the same dimensions for a consistent look. Choose cover, contain, or stretch modes. Everything runs locally in your browser.",
  alternates: { canonical: "https://timx.co/developer/image-resizer" },
  openGraph: {
    title: "Image Resizer — Free Online Tool",
    description:
      "Resize multiple images to the same dimensions for a consistent look. Everything runs locally in your browser.",
    url: "https://timx.co/developer/image-resizer",
    images: [opengraph.src],
  },
}

export default function ImageResizerPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="Image Resizer"
        description="Resize multiple images to the same dimensions for a consistent look"
        url="https://timx.co/developer/image-resizer"
        applicationCategory="MultimediaApplication"
      />
      <ImageResizer />
    </>
  )
}
