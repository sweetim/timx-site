import "@near-wallet-selector/modal-ui/styles.css";

import { NavBar } from "@/app/modules/counter/components"
import { WalletSelectorContextProvider } from "@/app/context/WalletSelectorContext";

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
