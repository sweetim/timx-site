"use client"

import { FC, useEffect, useMemo, useRef, useState } from "react"

import { SignOutIcon } from "@/app/icons"
import { useWalletSelector } from "@/app/context/WalletSelectorContext"
import { CounterFTMetaData, counterFTBalanceOf, counterFTMetadata } from "../contract"
import Image from "next/image"
import { Tabs, Drawer } from "flowbite"
import type { TabsOptions, TabsInterface, TabItem, DrawerOptions, DrawerInterface } from "flowbite";

const ProfileDrawerButton: FC = () => {
    const { selector, accountId } = useWalletSelector()

    const accountIdShortForm = accountId?.substring(0, 2)

    async function signOutHandler() {
        const wallet = await selector.wallet()
        await wallet.signOut()
    }

    const profileDrawerRef = useRef(null)

    const [profileDrawer, setProfileDrawer] = useState<Drawer | null>(null)

    useEffect(() => {
        const options: DrawerOptions = {
            placement: "bottom",
            backdrop: true,
            bodyScrolling: false,
            edge: false,
        }

        setProfileDrawer(new Drawer(profileDrawerRef.current, options))
    }, [profileDrawerRef])

    function profileButtonHandler() {
        profileDrawer?.show()
    }

    const tokensTabButtonRef = useRef(null)
    const tokensDivRef = useRef(null)
    const nftTabButtonRef = useRef(null)
    const nftDivRef = useRef(null)
    const [tabs, setTabs] = useState<TabsInterface | null>(null)

    useEffect(() => {
        if (tokensDivRef && tokensTabButtonRef && nftDivRef && nftTabButtonRef) {
            const tabElements: TabItem[] = [
                {
                    id: "tokens",
                    triggerEl: tokensTabButtonRef.current!,
                    targetEl: tokensDivRef.current!,
                },
                {
                    id: "nft",
                    triggerEl: nftTabButtonRef.current!,
                    targetEl: nftDivRef.current!,
                }
            ]

            const options: TabsOptions = {
                defaultTabId: 'tokens',
                activeClasses: 'text-white hover:text-gray-300',
                inactiveClasses: 'text-gray-400 hover:text-gray-300',
            }

            setTabs(new Tabs(tabElements, options))

        }
    }, [tokensDivRef, tokensTabButtonRef, nftDivRef, nftTabButtonRef])


    const [ ftMetadata, setFTMetadata ] = useState<CounterFTMetaData | null>(null)
    useEffect(() => {
        counterFTMetadata().then((metadata) => setFTMetadata(metadata))
    }, [])

    const [ ftBalance, setFTBalance] = useState("")

    useEffect(() => {
        if (accountId) {
            counterFTBalanceOf(accountId).then(balance => setFTBalance(balance))
        }
    }, [accountId])

    return (
        <>
            <button
                className="cursor-pointer relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-blue-300"
                onClick={profileButtonHandler}
                type="button"
                aria-controls="profile-drawer">
                <span className="font-medium text-white">{accountIdShortForm}</span>
            </button>

            <div className="rounded-2xl border-t-2 border-blue-300 translate-y-full fixed bottom-0 left-0 z-40 w-full h-[calc(100svh-4rem)] p-4 overflow-y-auto transition-transform bg-zinc-900"
                ref={profileDrawerRef}
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

                <div>
                    <ul className="flex flex-wrap text-md font-medium text-center text-white" role="tablist">
                        <li className="mr-2" role="presentation">
                            <button className="inline-block p-4"
                                ref={tokensTabButtonRef}
                                type="button"
                                role="tab"
                                aria-controls="profile"
                                aria-selected="false">Tokens</button>
                        </li>
                        <li className="mr-2" role="presentation">
                            <button className="inline-block p-4"
                                ref={nftTabButtonRef}
                                type="button"
                                role="tab"
                                aria-controls="dashboard"
                                aria-selected="false">NFT</button>
                        </li>
                    </ul>
                </div>
                <div>
                    <div className="hidden p-2"
                        ref={tokensDivRef}
                        role="tabpanel"
                        aria-labelledby="profile-tab">

                        <ul className="max-w divide-y divide-gray-700">
                            {ftMetadata?.icon && <li className="pb-3 sm:pb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <Image className="w-8 h-8 rounded-full bg-gray-600 p-1"
                                            width={32}
                                            height={32}
                                            src={ftMetadata.icon || ""}
                                            alt={ftMetadata?.name || ""}/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-white">
                                            {ftMetadata?.symbol}
                                        </p>
                                        <p className="text-sm truncate text-gray-400">
                                            {ftMetadata?.name}
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center text-base font-semibold text-white">
                                        {ftBalance}
                                    </div>
                                </div>
                            </li>}
                        </ul>

                    </div>
                    <div className="hidden p-2"
                        ref={nftDivRef}
                        role="tabpanel"
                        aria-labelledby="dashboard-tab">
                        <p className="text-sm text-gray-400">nft</p>
                    </div>
                </div>

                {/* <p className="max-w-lg mb-6 text-sm text-gray-400">COUNTER smart contract runs on NEAR protocol</p> */}
            </div>
        </>
    )
}

export default ProfileDrawerButton
