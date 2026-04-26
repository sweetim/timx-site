import type { Metadata } from "next"
import { WebApplicationJsonLd } from "@/app/_components/json-ld"
import opengraph from "@/app/opengraph.jpg"
import ImageCropper from "./_components/image-cropper"

export const metadata: Metadata = {
  title: "Image Cropper — Free Online Tool",
  description:
    "Crop images with configurable aspect ratios and anchor modes. Everything runs locally in your browser — no uploads needed.",
  alternates: { canonical: "https://timx.co/developer/image-cropper" },
  openGraph: {
    title: "Image Cropper — Free Online Tool",
    description:
      "Crop images with configurable aspect ratios and anchor modes. Everything runs locally in your browser.",
    url: "https://timx.co/developer/image-cropper",
    images: [opengraph.src],
  },
}

export default function ImageCropperPage() {
  return (
    <>
      <WebApplicationJsonLd
        name="Image Cropper"
        description="Crop images with configurable aspect ratios and anchor modes"
        url="https://timx.co/developer/image-cropper"
        applicationCategory="MultimediaApplication"
      />
      <ImageCropper />
    </>
  )
}
