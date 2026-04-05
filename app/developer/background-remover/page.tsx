import type { Metadata } from "next"
import BackgroundRemover from "../_components/background-remover"

export const metadata: Metadata = {
  title: "Background Remover",
  description:
    "Remove the background from any image using AI — entirely in your browser",
}

export default function BackgroundRemoverPage() {
  return <BackgroundRemover />
}
