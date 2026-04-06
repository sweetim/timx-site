"use client"

import classNames from "classnames"

import Image from "next/image"
import type { FC } from "react"

const blobShapes = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "30% 60% 70% 40% / 50% 60% 30% 60%",
  "70% 30% 50% 50% / 40% 70% 30% 60%",
  "40% 60% 50% 50% / 70% 40% 60% 30%",
  "50% 50% 40% 60% / 30% 50% 70% 50%",
  "55% 45% 65% 35% / 45% 55% 35% 65%",
]

export type ProfileLinkProps = {
  imageUrl: string
  linkUrl: string
  isRounded?: boolean
  index?: number
}

const ProfileLink: FC<ProfileLinkProps> = ({
  imageUrl,
  linkUrl,
  isRounded,
  index = 0,
}) => {
  isRounded = isRounded ?? true

  const clickHandler = (linkUrl: string) => {
    window.open(linkUrl)
  }

  const hoverRadius = blobShapes[index % blobShapes.length]

  const imageShapeClass = classNames({
    "text-blue-700 hover:bg-neutral-300 focus:ring-3 focus:outline-none focus:ring-blue-300 font-medium p-2.5 text-center inline-flex items-center": true,
    "rounded-full": isRounded,
    "rounded-lg": !isRounded,
  })

  return (
    <div>
      <button
        type="button"
        onClick={() => clickHandler(linkUrl)}
        className={imageShapeClass}
        style={
          isRounded
            ? ({ "--hover-radius": hoverRadius } as React.CSSProperties)
            : undefined
        }
        onMouseEnter={(event) => {
          if (isRounded) event.currentTarget.style.borderRadius = hoverRadius
        }}
        onMouseLeave={(event) => {
          if (isRounded) event.currentTarget.style.borderRadius = "9999px"
        }}
      >
        <Image
          src={imageUrl}
          height={36}
          width={36}
          alt={linkUrl}
        />
      </button>
    </div>
  )
}

export default ProfileLink
