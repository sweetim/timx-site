"use client"

import { FC, useEffect, useState } from "react"
import { COUNTER_ENTRY_FEE, MIN_GAS_FEE, MethodName, getValue } from "../contract";
import { useWalletSelector } from "@/app/context/WalletSelectorContext";
import { CounterLogo } from "@/app/icons";
import IconDropDown from "@/app/modules/common/IconDropDown";

const NavBar: FC = () => {
    const { selector, modal, accountId } = useWalletSelector();

    function connectHandler() {
        modal.show()
    }

    async function signOutHandler() {
        const wallet = await selector.wallet()
        await wallet.signOut()
    }

    return (
        <nav>
            <div className="flex justify-between items-center p-3">
                <CounterLogo className="w-8 fill-white" />
                <div className="flex items-center">
                    <IconDropDown />
                    <button
                        className="text-white focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center ml-2 mb-2 mt-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
                        onClick={connectHandler}>
                        CONNECT
                    </button>
                    <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={signOutHandler}>Sign Out</button>
                </div>
            </div>
        </nav>
    )

}

export default NavBar
