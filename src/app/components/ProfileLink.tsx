"use client";

import { FC } from "react";

import Image from "next/image";
import classNames from "classnames";

export type ProfileLinkProps = {
    imageUrl: string;
    linkUrl: string;
    isRounded?: boolean;
}

const ProfileLink: FC<ProfileLinkProps> = ({ imageUrl, linkUrl, isRounded }) => {
    isRounded = isRounded ?? true

    const clickHandler = (linkUrl: string) => {
        window.open(linkUrl);
    };

    const imageShapeClass = classNames({
        "text-blue-700 hover:bg-neutral-300 focus:ring-3 focus:outline-none focus:ring-blue-300 font-medium p-2.5 text-center inline-flex items-center": true,
        "rounded-full": isRounded,
        "rounded-lg": !isRounded
    })

    return (
        <div>
            <button type="button"
                onClick={() => clickHandler(linkUrl)}
                className={imageShapeClass}>
                 <Image
                    src={imageUrl}
                    height={36}
                    width={36}
                    alt={linkUrl}
                />
            </button>

        </div>
    );
}

export default ProfileLink;
