import type { Metadata } from "next"
import ImageCropper from "./_components/image-cropper"

export const metadata: Metadata = {
  title: "Image Cropper",
  description:
    "Crop images with configurable aspect ratios and anchor modes. Everything runs locally in your browser.",
}

export default function ImageCropperPage() {
  return <ImageCropper />
}
