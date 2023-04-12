"use client"

import { FC, useEffect, useRef, useState } from "react"
import { Drawer, DrawerOptions } from "flowbite"

import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/solid"

import { NearLogo } from "@/app/icons"

const ChainDrawerButton: FC = () => {
    const chainDrawerRef = useRef(null)

    const [chainDrawer, setChainDrawer] = useState<Drawer | null>(null)
    const [supportedChains, setSupportedChains] = useState([
        {
            name: "mainnet",
            color:"white",
            isSelected: false
        },
        {
            name: "testnet",
            color: "pink",
            isSelected: true
        }
    ])

    useEffect(() => {
        const options: DrawerOptions = {
            placement: "bottom",
            backdrop: true,
            bodyScrolling: false,
            edge: false,
        }

        setChainDrawer(new Drawer(chainDrawerRef.current, options))
    }, [chainDrawerRef])

    const renderSupportedChains = supportedChains
        .map(chain => {
            return (
                <li key={chain.name} className="hover:bg-gray-600 hover:text-white">
                    <button type="button" className="w-full" onClick={ev => selectedChainHandler(chain.name)}>
                        <div className="flex flex-row items-center p-4">
                            <NearLogo className={`mr-2 fill-${chain.color}-600 w-4`} />
                            <span className="flex-1 flex justify-start">
                                {chain.name}
                            </span>
                            {chain.isSelected && <CheckCircleIcon className="fill-slate-300 w-7 h-7" />}
                        </div>
                    </button>
                </li>
            )
        })

    const renderSelectedChainColor = supportedChains
        .filter(({ isSelected }) => isSelected)
        .pop()
        ?.color

    function selectedChainHandler(chainName: string) {
        setSupportedChains(prev => {
            return prev.map(item => ({ ...item, isSelected: item.name === chainName }))
        })

        chainDrawer?.hide()
    }

    function chainDrawerClickHandler() {
        chainDrawer?.show()
    }

    return (
        <>
            <button onClick={chainDrawerClickHandler}
                className="mr-2 text-white rounded-lg text-sm px-2 py-2 text-center inline-flex items-center hover:bg-slate-700"
                type="button">
                <NearLogo className={`mr-2 fill-${renderSelectedChainColor}-600 w-4`} />
                <ChevronDownIcon className="w-4 h-4" />
            </button>

            <div ref={chainDrawerRef}
                className="rounded-2xl border-t-2 border-blue-300 translate-y-full fixed bottom-0 left-0 z-40 w-full overflow-y-auto transition-transform bg-zinc-900"
                tabIndex={1}
                aria-labelledby="chain-drawer-bottom-label">
                <ul
                    className="text-lg text-gray-200"
                    aria-labelledby="chain-drawer-drop-down">
                    {renderSupportedChains}
                </ul>
            </div>
        </>
    )
}

export default ChainDrawerButton
