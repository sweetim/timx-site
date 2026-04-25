import type { Metadata } from "next"
import ImageCropper from "./_components/image-cropper"

export const metadata: Metadata = {
  title: "Image Cropper",
  description:
    "Crop images from the center by dragging to select your desired area",
}

export default function ImageCropperPage() {
  return <ImageCropper />
}
