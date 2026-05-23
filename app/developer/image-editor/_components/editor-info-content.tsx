export default function EditorInfoContent() {
  return (
    <section className="bg-dev-canvas">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-dev-text mb-4">
          Free Online Image Editor
        </h2>
        <p className="text-dev-text-secondary mb-6 leading-relaxed">
          A browser-based image editor with tools for removing backgrounds,
          cropping images, stitching mobile screenshots, scaling, generating
          favicon .ico files, and exporting to different formats. All processing
          happens locally — your images never leave your device.
        </p>

        <h3 className="text-lg font-semibold text-dev-text mb-3">Tools</h3>
        <ul className="list-disc list-inside text-dev-text-secondary mb-6 space-y-1.5">
          <li>
            <strong className="text-dev-text">Background Remover</strong> —
            Remove image backgrounds using an AI model that runs in a Web
            Worker. Process multiple images concurrently.
          </li>
          <li>
            <strong className="text-dev-text">Crop</strong> — Crop images with
            aspect ratio presets (1:1, 4:3, 16:9, and more). Choose center or
            edge anchor modes.
          </li>
          <li>
            <strong className="text-dev-text">Stitcher</strong> — Stack multiple
            screenshots into aligned frames with consistent sizing and
            configurable spacing. Export as a single PNG.
          </li>
          <li>
            <strong className="text-dev-text">Scale</strong> — Resize images by
            percentage or explicit width and height. Lock or unlock the aspect
            ratio for proportional or freeform scaling.
          </li>
          <li>
            <strong className="text-dev-text">Export</strong> — Convert images
            to PNG, JPEG, WebP, or ICO favicon. Adjust quality for lossy formats
            and choose from standard favicon sizes (16×16 to 256×256) for ICO
            exports. See the resulting file size before downloading.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-dev-text mb-3">How to Use</h3>
        <ol className="list-decimal list-inside text-dev-text-secondary space-y-1.5">
          <li>
            Select a tool from the left rail (Background Remover, Crop,
            Stitcher, Scale, or Export)
          </li>
          <li>
            Upload an image by dropping it on the canvas, pasting from
            clipboard, or browsing
          </li>
          <li>Apply edits using the controls in the right panel</li>
          <li>Download the result as PNG, JPEG, WebP, or ICO</li>
        </ol>
      </div>
    </section>
  )
}
