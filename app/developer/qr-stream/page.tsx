import type { Metadata } from "next"
import {
  BreadcrumbListJsonLd,
  WebApplicationJsonLd,
} from "@/app/_components/json-ld"
import { ToolSeoContent } from "../_components/seo-content"
import QrStream from "./_components/qr-stream"

export const metadata: Metadata = {
  title: "QR Stream — File Transfer via QR Codes",
  description:
    "Encode any file into a stream of QR code frames and play them like a video, or scan the stream with a camera or recorded video to rebuild the file. Runs entirely in your browser.",
  alternates: { canonical: "https://timx.co/developer/qr-stream" },
  openGraph: {
    title: "QR Stream — File Transfer via QR Codes",
    description:
      "Encode files into QR code streams and decode them back with a camera or video, entirely in your browser.",
    url: "https://timx.co/developer/qr-stream",
  },
}

export default function QrStreamPage() {
  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: "https://timx.co" },
          { name: "Developer Tools", url: "https://timx.co/developer" },
          { name: "QR Stream", url: "https://timx.co/developer/qr-stream" },
        ]}
      />
      <WebApplicationJsonLd
        name="QR Stream"
        description="Encode files into QR code streams and decode them back with a camera or video"
        url="https://timx.co/developer/qr-stream"
        applicationCategory="DeveloperApplication"
        featureList={[
          "Split files into QR code frames",
          "Play QR streams with adjustable frame rate",
          "Export QR streams as WebM video",
          "Scan QR streams with a live camera",
          "Decode QR streams from video files",
        ]}
      />
      <QrStream />
      <ToolSeoContent
        id="qr-stream-seo"
        heading="File Transfer via QR Code Streams"
        description="Use the QR Stream tool to send small files across an air gap: the encoder splits a file into QR code frames played like a video, and the decoder scans them with a live camera or from a recorded video file to reassemble the original file. All processing runs in your browser so the file never touches a server."
        features={[
          "Encode any file into a looping QR code stream with adjustable frame rate.",
          "Export the QR stream as a WebM video to play on another device.",
          "Scan the stream with a live camera and collect frames until the file is complete.",
          "Decode a recorded video of a QR stream and replay it to catch missed frames.",
        ]}
      />
    </>
  )
}
