"use client"

import { FC } from "react"

import { CounterLogo } from "@/app/icons";
import { useWalletSelector } from "@/app/context/WalletSelectorContext";

import ProfileDrawerButton from "./ProfileDrawerButton";
import ChainDrawerButton from "./ChainDrawerButton";

const NavBar: FC = () => {
    const { modal, accountId } = useWalletSelector()

    const isConnected = !!accountId

    function connectHandler() {
        modal.show()
    }

    return (
        <nav className="flex justify-between items-center p-3">
            <CounterLogo className="w-8 fill-white" />

            <div className="flex items-center">
                <ChainDrawerButton />

                {!isConnected && <button
                    className="text-white focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center ml-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                    onClick={connectHandler}>
                    CONNECT
                </button>}

                {isConnected && <ProfileDrawerButton />}
            </div>
        </nav>
    )
}

export default NavBar
