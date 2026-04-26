import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

import ProfileLink, { type ProfileLinkProps } from "./ProfileLink"

export type ProfileProps = {
  title: string
  description: string
  location: string
  imageUrl: string
  linkUrl: ProfileLinkProps[]
}

const Profile: FC<ProfileProps> = (props) => {
  const renderLinkUrl = props.linkUrl.map((props, i) => (
    <ProfileLink
      key={`${props.imageUrl}`}
      index={i}
      {...props}
    />
  ))

  return (
    <div className="text-center">
      <div className="flex justify-center">
        <Link href="/developer">
          <Image
            className="p-1.5 blob-splash content-center"
            src={props.imageUrl}
            width={160}
            height={160}
            alt="Tim — developer portrait"
          />
        </Link>
      </div>
      <h1 className="text-5xl p-5">{props.title}</h1>
      <p className="text-slate-900">{props.description}</p>
      <p className="text-slate-900">{props.location}</p>
      <div className="mt-10 ml-3 mr-3 grid grid-cols-5 gap-6">
        {renderLinkUrl}
      </div>
    </div>
  )
}

export default Profile
