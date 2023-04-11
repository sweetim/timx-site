"use client"

import { FC, useEffect, useState, useRef } from "react"
import { ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/24/solid"

import { CounterLogo, NearLogo, SignOutIcon } from "@/app/icons";
import { useWalletSelector } from "@/app/context/WalletSelectorContext";

import { Drawer, DrawerOptions } from "flowbite"

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

    const [supportedChains, setSupportedChains] = useState([
        {
            name: "mainnet",
            logo: <NearLogo className="mr-2 fill-white w-4" />,
            isSelected: false
        },
        {
            name: "testnet",
            logo: <NearLogo className="mr-2 fill-pink-600 w-4" />,
            isSelected: true
        }
    ])

    function selectedChainHandler(chainName: string) {
        setSupportedChains(prev => {
            return prev.map((item) => {
                item.isSelected = item.name === chainName
                return item
            })
        })

        chainDrawer?.hide()
    }

    const renderSupportedChains = supportedChains
        .map(chain => {
            return (
                <li key={chain.name} className="hover:bg-gray-600 hover:text-white">
                    <button type="button" className="w-full" onClick={ev => selectedChainHandler(chain.name)}>
                        <div className="flex flex-row items-center p-4">
                            {chain.logo}
                            <span className="flex-1 flex justify-start">
                                {chain.name}
                            </span>
                            {chain.isSelected && <CheckCircleIcon className="fill-slate-300 w-7 h-7" />}
                        </div>
                    </button>
                </li>
            )
        })

    const renderSelectedChainLogo = supportedChains
        .filter(({ isSelected }) => isSelected)
        .pop()
        ?.logo

    const chainDrawerRef = useRef(null)
    const [chainDrawer, setChainDrawer] = useState<Drawer | null>(null)

    useEffect(() => {
        const options: DrawerOptions = {
            placement: "bottom",
            backdrop: true,
            bodyScrolling: false,
            edge: false,
        }

        setChainDrawer(new Drawer(chainDrawerRef.current, options))
    }, [chainDrawerRef])

    function chainDrawerClickHandler() {
        chainDrawer?.show()
    }

    return (
        <nav className="flex justify-between items-center p-3">
            <CounterLogo className="w-8 fill-white" />

            <div className="flex items-center">
                <button onClick={chainDrawerClickHandler}
                    className="mr-2 text-white rounded-lg text-sm px-2 py-2 text-center inline-flex items-center hover:bg-slate-700"
                    type="button">
                    {renderSelectedChainLogo}
                    <ChevronDownIcon className="w-4 h-4" />
                </button>

                <div ref={chainDrawerRef}
                    className="rounded-2xl border-t-2 border-blue-300 translate-y-full fixed bottom-0 left-0 z-40 w-full overflow-y-auto transition-transform bg-zinc-900"
                    tabIndex={1}
                    aria-labelledby="chain-drawer-bottom-label">
                    <ul
                        className="text-lg text-gray-200"
                        aria-labelledby="chain-drawer-drop-down">
                        { renderSupportedChains }
                    </ul>
                </div>

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
                </button>}

                <div id="profile-drawer"
                    className="rounded-2xl border-t-2 border-blue-300 translate-y-full fixed bottom-0 left-0 z-40 w-full h-[calc(100svh-4rem)] p-4 overflow-y-auto transition-transform bg-zinc-900"
                    tabIndex={1}
                    aria-labelledby="drawer-bottom-label">

                    <div className="flex flex-row">
                        <h5 id="drawer-bottom-label"
                            className="inline-flex items-center mb-4 text-base font-semibold text-gray-400">
                            <div className="mr-2 relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600">
                                <span className="font-medium text-white">{accountIdShortForm}</span>
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
