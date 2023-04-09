"use client"

import { FC, useEffect, useState } from "react"
import { UserCircleIcon, XMarkIcon } from "@heroicons/react/24/solid"

import { CounterLogo, SignOutIcon } from "@/app/icons";
import ChainDropDownMenu from "./ChainDropDownMenu";
import { useWalletSelector } from "@/app/context/WalletSelectorContext";


const NavBar: FC = () => {
    const { selector, modal, accountId } = useWalletSelector();

    const isConnected = !!accountId
    const accountIdShortForm = accountId?.substring(0, 2)

    function connectHandler() {
        modal.show()
    }

    async function signOutHandler() {
        const wallet = await selector.wallet()
        await wallet.signOut()
    }


    return (
        <nav className="flex justify-between items-center p-3">
            <CounterLogo className="w-8 fill-white" />
            <div className="flex items-center">
                <ChainDropDownMenu />

                {!isConnected && <button
                    className="text-white focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center ml-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                    onClick={connectHandler}>
                    CONNECT
                </button>}

                {isConnected && <button
                    className="cursor-pointer relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-blue-300"
                    type="button"
                    data-drawer-target="profile-drawer"
                    data-drawer-show="profile-drawer"
                    data-drawer-placement="bottom"
                    aria-controls="profile-drawer">
                    <span className="font-medium text-white">{accountIdShortForm}</span>
                    {/* {!!!accountIdShortForm && <UserCircleIcon className="h-10"/>} */}
                </button>}

                <div id="profile-drawer"
                    className="fixed -translate-x-full bottom-0 left-0 right-0 z-40 w-full h-[calc(100vh-64px)] p-4 overflow-y-auto transition-transform bg-gray-900"
                    tabIndex={-1}
                    aria-hidden="true"
                    aria-labelledby="drawer-bottom-label">

                    <div className="flex flex-row">
                        <h5 id="drawer-bottom-label"
                            className="inline-flex items-center mb-4 text-base font-semibold text-gray-400">
                            <div className="mr-2 relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600">
                                <span className="font-medium text-white">{accountIdShortForm}</span>
                                {/* {!!!accountIdShortForm && <UserCircleIcon className="h-10"/>} */}
                            </div>
                            {accountId}
                        </h5>
                        <div className="flex-1"></div>
                        <button type="button"
                            onClick={signOutHandler}
                            data-drawer-hide="profile-drawer"
                            aria-controls="profile-drawer"
                            className="border focus:ring-4 focus:outline-none h-9 w-9 font-medium bg-gray-600 hover:bg-gray-700 rounded-full text-sm p-2.5 text-center inline-flex items-center hover:text-white focus:ring-blue-800">
                            <SignOutIcon className="w-4 h-4 fill-white" />
                            <span className="sr-only">Sign Out</span>
                        </button>
                    </div>

                    <p className="max-w-lg mb-6 text-sm text-gray-400">COUNTER smart contract runs on NEAR protocol</p>
                </div>
            </div>
        </nav>
    )

}

export default NavBar
