import type { Metadata } from "next"
import { BreadcrumbListJsonLd, WebApplicationJsonLd } from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
import EditorInfoContent from "./_components/editor-info-content"
import ImageEditor from "./_components/image-editor"

export const metadata: Metadata = {
  title: "Image Editor — Free Online Tool",
  description:
    "Edit images in your browser: remove backgrounds, crop images, scale by percentage or dimensions, and stitch mobile screenshots into aligned landing page assets.",
  alternates: { canonical: "https://timx.co/developer/image-editor" },
  openGraph: {
    title: "Image Editor — Free Online Tool",
    description:
      "Remove backgrounds, crop images, scale by percentage or dimensions, and stitch aligned mobile screenshots in your browser.",
    url: "https://timx.co/developer/image-editor",
    images: ["/image-editor-og.jpg"],
  },
}

export default function ImageEditorPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "Image Editor", url: "https://timx.co/developer/image-editor" },
        ]}
      />
      <WebApplicationJsonLd
        name="Image Editor"
        description="Remove backgrounds, crop images, scale images, and stitch mobile screenshots in your browser"
        url="https://timx.co/developer/image-editor"
        applicationCategory="MultimediaApplication"
        featureList={[
          "Remove image backgrounds locally",
          "Crop images with aspect ratio presets",
          "Scale images by percentage or dimensions",
          "Stitch mobile screenshots",
          "Export edited images as PNG",
        ]}
      />
      <ToolSeoContent
        id="image-editor-seo"
        heading="Free Online Image Editor"
        description="Edit images in the browser without uploading files. Remove backgrounds with local AI processing, crop images with aspect ratio presets, scale by percentage or dimensions, and stitch mobile screenshots into presentation-ready assets."
        features={[
          "Remove image backgrounds locally in a Web Worker.",
          "Crop images with freeform and common aspect ratio presets.",
          "Scale images by percentage or explicit width and height.",
          "Stitch multiple screenshots horizontally or vertically and export PNG, JPEG, or WebP files.",
        ]}
      />
      <ImageEditor infoContent={<EditorInfoContent />} />
    </>
  )
}
