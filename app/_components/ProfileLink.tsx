import clsx from "clsx"

import Image from "next/image"
import type { CSSProperties, FC } from "react"

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
  label: string
  isRounded?: boolean
  index?: number
}

const ProfileLink: FC<ProfileLinkProps> = ({
  imageUrl,
  linkUrl,
  label,
  isRounded,
  index = 0,
}) => {
  const rounded = isRounded ?? true

  const hoverRadius = blobShapes[index % blobShapes.length]

  const imageShapeClass = clsx({
    "text-blue-700 hover:bg-neutral-300 focus:ring-3 focus:outline-none focus:ring-blue-300 font-medium p-2.5 text-center inline-flex items-center transition-[background-color,border-radius,box-shadow] duration-200": true,
    "profile-link-rounded rounded-full": rounded,
    "rounded-lg": !rounded,
  })

  return (
    <div>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={imageShapeClass}
        style={
          rounded
            ? ({ "--hover-radius": hoverRadius } as CSSProperties)
            : undefined
        }
      >
        <Image
          src={imageUrl}
          height={36}
          width={36}
          alt={label}
        />
      </a>
    </div>
  )
}

export default ProfileLink
