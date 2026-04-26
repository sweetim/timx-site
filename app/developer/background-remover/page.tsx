import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import BackgroundRemover from "../_components/background-remover"

export const metadata: Metadata = {
  title: "Background Remover — Free AI Tool",
  description:
    "Remove the background from any image using AI — entirely in your browser. No uploads, no sign-up, no data sent to any server.",
  alternates: { canonical: "https://timx.co/developer/background-remover" },
  openGraph: {
    title: "Background Remover — Free AI Tool",
    description:
      "Remove the background from any image using AI — entirely in your browser. No uploads, no sign-up.",
    url: "https://timx.co/developer/background-remover",
    images: [{ url: "https://timx.co/opengraph.webp" }],
  },
}

export default function BackgroundRemoverPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="Background Remover"
        description="Remove the background from any image using AI — entirely in your browser"
        url="https://timx.co/developer/background-remover"
        applicationCategory="MultimediaApplication"
      />
      <BackgroundRemover />
    </>
  )
}
