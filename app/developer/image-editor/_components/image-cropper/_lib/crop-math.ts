import { match } from "ts-pattern"
import { MIN_CROP } from "../constants"
import type { CropRect, DragState } from "../types"

export function getImageDisplayDimensions(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
) {
  const scale = Math.min(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
    1,
  )
  return {
    displayWidth: Math.floor(imageWidth * scale),
    displayHeight: Math.floor(imageHeight * scale),
    scale,
  }
}

export function getInitialCrop(
  displayWidth: number,
  displayHeight: number,
  aspectRatio: number | null,
): CropRect {
  const maxW = displayWidth * 0.6
  const maxH = displayHeight * 0.6

  let width: number
  let height: number

  if (aspectRatio === null) {
    width = maxW
    height = maxH
  } else {
    if (maxW / maxH > aspectRatio) {
      height = maxH
      width = height * aspectRatio
    } else {
      width = maxW
      height = width / aspectRatio
    }
  }

  return {
    x: (displayWidth - width) / 2,
    y: (displayHeight - height) / 2,
    width,
    height,
  }
}

export function clampCrop(
  crop: CropRect,
  maxX: number,
  maxY: number,
  ratio: number | null,
): CropRect {
  let { x, y, width, height } = crop

  if (ratio !== null) {
    if (width / ratio > maxY) {
      height = maxY
      width = height * ratio
    } else {
      height = width / ratio
    }
    if (height * ratio > maxX) {
      width = maxX
      height = width / ratio
    }
  }

  width = Math.max(MIN_CROP, Math.min(width, maxX))
  height = Math.max(MIN_CROP, Math.min(height, maxY))
  x = Math.max(0, Math.min(x, maxX - width))
  y = Math.max(0, Math.min(y, maxY - height))
  return { x, y, width, height }
}

export function clampCropKeepCenter(
  crop: CropRect,
  centerX: number,
  centerY: number,
  maxX: number,
  maxY: number,
  ratio: number | null,
): CropRect {
  let { width, height } = crop

  const maxWidth = Math.floor(Math.min(centerX, maxX - centerX) * 2)
  const maxHeight = Math.floor(Math.min(centerY, maxY - centerY) * 2)

  if (ratio === null) {
    width = Math.max(MIN_CROP, Math.min(width, maxWidth))
    height = Math.max(MIN_CROP, Math.min(height, maxHeight))
  } else {
    const targetWidth = width / ratio > height ? height * ratio : width
    const maxRatioWidth = Math.min(maxWidth, maxHeight * ratio)

    width = Math.min(Math.max(MIN_CROP, targetWidth), maxRatioWidth)
    height = width / ratio
  }

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  }
}

export function applyAspectRatio(
  crop: CropRect,
  ratio: number | null,
): CropRect {
  if (ratio === null) return crop
  const cx = crop.x + crop.width / 2
  const cy = crop.y + crop.height / 2
  const currentRatio = crop.width / crop.height
  if (currentRatio > ratio) {
    const newWidth = crop.height * ratio
    return {
      x: cx - newWidth / 2,
      y: crop.y,
      width: newWidth,
      height: crop.height,
    }
  }
  const newHeight = crop.width / ratio
  return {
    x: crop.x,
    y: cy - newHeight / 2,
    width: crop.width,
    height: newHeight,
  }
}

export function computeEdgeResize(
  dragType: DragState["type"],
  dx: number,
  dy: number,
  sc: CropRect,
  ratio: number | null,
): CropRect {
  let { x, y, width, height } = sc

  match(dragType)
    .with("se", () => {
      width += dx
      height += dy
    })
    .with("sw", () => {
      x += dx
      width -= dx
      height += dy
    })
    .with("ne", () => {
      width += dx
      y += dy
      height -= dy
    })
    .with("nw", () => {
      x += dx
      y += dy
      width -= dx
      height -= dy
    })
    .with("e", () => {
      width += dx
    })
    .with("w", () => {
      x += dx
      width -= dx
    })
    .with("s", () => {
      height += dy
    })
    .with("n", () => {
      y += dy
      height -= dy
    })
    .with("move", () => {})
    .exhaustive()

  if (ratio !== null) {
    const newH = width / ratio
    if (dragType === "n" || dragType === "nw" || dragType === "ne") {
      y = y + height - newH
    }
    height = newH
  }

  return { x, y, width, height }
}

export function computeCenterResize(
  dragType: DragState["type"],
  dx: number,
  dy: number,
  sc: CropRect,
  ratio: number | null,
): CropRect {
  const cx = sc.x + sc.width / 2
  const cy = sc.y + sc.height / 2

  const isLeft = dragType === "nw" || dragType === "w" || dragType === "sw"
  const isTop = dragType === "nw" || dragType === "n" || dragType === "ne"

  const expandX = isLeft ? -dx : dx
  const expandY = isTop ? -dy : dy

  if (ratio === null) {
    const newW = Math.max(MIN_CROP, sc.width + expandX * 2)
    const newH = Math.max(MIN_CROP, sc.height + expandY * 2)
    return { x: cx - newW / 2, y: cy - newH / 2, width: newW, height: newH }
  }

  const signedDist =
    Math.abs(expandX) > Math.abs(expandY) ? expandX : expandY * ratio
  const newW = Math.max(MIN_CROP, sc.width + signedDist * 2)
  const newH = Math.max(MIN_CROP, newW / ratio)
  return { x: cx - newW / 2, y: cy - newH / 2, width: newW, height: newH }
}

export function clampEdgeCrop(
  crop: CropRect,
  dragType: DragState["type"],
  maxX: number,
  maxY: number,
  ratio: number | null,
): CropRect {
  if (dragType === "move") return clampCrop(crop, maxX, maxY, ratio)

  let left = crop.x
  let top = crop.y
  let right = crop.x + crop.width
  let bottom = crop.y + crop.height

  left = Math.max(0, Math.min(left, maxX))
  top = Math.max(0, Math.min(top, maxY))
  right = Math.max(0, Math.min(right, maxX))
  bottom = Math.max(0, Math.min(bottom, maxY))

  let width = right - left
  let height = bottom - top

  if (ratio !== null && width > 0 && height > 0) {
    const isLeftFixed =
      dragType !== "nw" && dragType !== "w" && dragType !== "sw"
    const isTopFixed =
      dragType !== "nw" && dragType !== "n" && dragType !== "ne"

    if (width / height > ratio) {
      const newWidth = height * ratio
      if (isLeftFixed) {
        right = left + newWidth
      } else {
        left = right - newWidth
      }
    } else if (width / height < ratio) {
      const newHeight = width / ratio
      if (isTopFixed) {
        bottom = top + newHeight
      } else {
        top = bottom - newHeight
      }
    }
    width = right - left
    height = bottom - top
  }

  width = Math.max(MIN_CROP, width)
  height = Math.max(MIN_CROP, height)

  return { x: left, y: top, width, height }
}

export function getCursorForHandle(type: DragState["type"]) {
  return match(type)
    .with("move", () => "move" as const)
    .with("nw", () => "nw-resize" as const)
    .with("ne", () => "ne-resize" as const)
    .with("sw", () => "sw-resize" as const)
    .with("se", () => "se-resize" as const)
    .with("n", () => "n-resize" as const)
    .with("s", () => "s-resize" as const)
    .with("e", () => "e-resize" as const)
    .with("w", () => "w-resize" as const)
    .exhaustive()
}
