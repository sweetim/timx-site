import { FC } from "react"

import { SignOutIcon } from "@/app/icons"
import { useWalletSelector } from "@/app/context/WalletSelectorContext"

const ProfileDrawerButton: FC = () => {
    const { selector, accountId } = useWalletSelector()

    const accountIdShortForm = accountId?.substring(0, 2)

    async function signOutHandler() {
        const wallet = await selector.wallet()
        await wallet.signOut()
    }

    return (
        <>
            <button
                className="cursor-pointer relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-blue-300"
                type="button"
                data-drawer-target="profile-drawer"
                data-drawer-show="profile-drawer"
                data-drawer-placement="bottom"
                aria-controls="profile-drawer">
                <span className="font-medium text-white">{accountIdShortForm}</span>
            </button>

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
        </>
    )
}

export default ProfileDrawerButton
