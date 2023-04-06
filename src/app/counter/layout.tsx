import "@near-wallet-selector/modal-ui/styles.css";

import { WalletSelectorContextProvider } from "@/app/context/WalletSelectorContext"
import { getRecordsLength, getValue, queryAllRecords, queryRecords } from "@/app/modules/counter/contract"

export const revalidate = 1

export default async function RootLayout({ children,
}: {
    children: React.ReactNode
}) {
    const records = await queryAllRecords()
    const value = await getValue()
    const recordsLength = await getRecordsLength()
    const partial = await queryRecords(1, 2)

    return (
        <html lang="en">
            <body>
                <h2>counter</h2>
                <p>{value}</p>
                <p>{recordsLength}</p>
                <p>{JSON.stringify(records)}</p>
                <p>partial</p>
                <p>{JSON.stringify(partial)}</p>
                <WalletSelectorContextProvider>
                    {children}
                </WalletSelectorContextProvider>
            </body>
        </html>
    )
}
