import "@near-wallet-selector/modal-ui/styles.css";

import { Metadata } from "next";

import { NavBar } from "@/app/modules/counter/components"
import { WalletSelectorContextProvider } from "@/app/context/WalletSelectorContext";

export const metadata: Metadata = {
    title: "counter",
    description: "counter - near dapp",
    icons: {
        icon: {
            url: "/counter.svg",
            type: "image/svg"
        }
    },
    openGraph: {
        title: "counter",
        description: "counter - near dapp",
        url: "https://timx.co/counter",
        siteName: "counter",
        images: [
            {
                url: "https://timx.co/counter.svg",
                width: 64,
                height: 64,
            },
        ],
        locale: "en-US",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <WalletSelectorContextProvider>
            <div className="bg-slate-800 h-full flex flex-col overflow-hidden">
                <NavBar />
                <div className="flex-grow overflow-y-auto">
                    {children}
                </div>
            </div>
        </WalletSelectorContextProvider>
    )
}
