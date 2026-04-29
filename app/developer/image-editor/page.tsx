import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import EditorInfoContent from "./_components/editor-info-content"
import ImageEditor from "./_components/image-editor"

export const metadata: Metadata = {
  title: "Image Editor — Free Online Tool",
  description:
    "Edit images in your browser: remove backgrounds, crop images, and stitch mobile screenshots into aligned landing page assets.",
  alternates: { canonical: "https://timx.co/developer/image-editor" },
  openGraph: {
    title: "Image Editor — Free Online Tool",
    description:
      "Remove backgrounds, crop images, and stitch aligned mobile screenshots in your browser.",
    url: "https://timx.co/developer/image-editor",
    images: [opengraph.src],
  },
}

export default function ImageEditorPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="Image Editor"
        description="Remove backgrounds, crop images, and stitch mobile screenshots in your browser"
        url="https://timx.co/developer/image-editor"
        applicationCategory="MultimediaApplication"
        featureList={[
          "Remove image backgrounds locally",
          "Crop images with aspect ratio presets",
          "Stitch mobile screenshots",
          "Export edited images as PNG",
        ]}
      />
      <ImageEditor infoContent={<EditorInfoContent />} />
    </>
  )
}
