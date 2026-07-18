import type { ImageItem } from "../types"

export const MAX_CANVAS_DIMENSION = 16384

export function loadImageFile(
  file: File,
  index: number,
): Promise<ImageItem | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({
        id: `${file.name}-${file.lastModified}-${index}-${Date.now()}`,
        file,
        originalUrl: url,
        element: image,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    image.src = url
  })
}

export function getDrawParams(
  image: HTMLImageElement,
  frameWidth: number,
  frameHeight: number,
) {
  const scale = Math.min(
    frameWidth / image.naturalWidth,
    frameHeight / image.naturalHeight,
  )
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  const x = (frameWidth - width) / 2
  const y = (frameHeight - height) / 2

  return { x, y, width, height }
}

export function stitchImages({
  images,
  frameWidth,
  frameHeight,
  imageSpacing,
  direction,
  backgroundColor,
}: {
  images: ImageItem[]
  frameWidth: number
  frameHeight: number
  imageSpacing: number
  direction: "horizontal" | "vertical"
  backgroundColor: string | null
}): Promise<Blob | null> {
  return new Promise((resolve) => {
    const totalSpacing = Math.max(0, images.length - 1) * imageSpacing
    const canvas = document.createElement("canvas")
    canvas.width =
      direction === "horizontal"
        ? frameWidth * images.length + totalSpacing
        : frameWidth
    canvas.height =
      direction === "horizontal"
        ? frameHeight
        : frameHeight * images.length + totalSpacing

    if (
      canvas.width > MAX_CANVAS_DIMENSION
      || canvas.height > MAX_CANVAS_DIMENSION
    ) {
      resolve(null)
      return
    }

    const context = canvas.getContext("2d")

    if (!context) {
      resolve(null)
      return
    }

    if (backgroundColor !== null) {
      context.fillStyle = backgroundColor
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    for (let index = 0; index < images.length; index++) {
      const item = images[index]
      const frameX =
        direction === "horizontal" ? index * (frameWidth + imageSpacing) : 0
      const frameY =
        direction === "horizontal" ? 0 : index * (frameHeight + imageSpacing)
      const params = getDrawParams(item.element, frameWidth, frameHeight)

      context.drawImage(
        item.element,
        frameX + params.x,
        frameY + params.y,
        params.width,
        params.height,
      )
    }

    canvas.toBlob(resolve, "image/png")
  })
}
