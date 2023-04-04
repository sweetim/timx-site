"use client"

import { getRecordsLength, getValue, queryAllRecords, queryRecords } from "@/app/modules/counter/contract"
import { useWalletSelector } from "@/app/context/WalletSelectorContext"
import { useEffect } from "react"

export default function Counter() {
    const { selector, modal, accounts, accountId } = useWalletSelector()

    // useEffect(() => {
    //     async function readContract() {

    //         const records = await queryAllRecords()
    //         const value = await getValue()
    //         const recordsLength = await getRecordsLength()
    //         const partial = await queryRecords(1, 2)

    //     }

    // }, [])

    function connectWalletHandler() {
        modal.show()
    }

    return (
        <div>
            <p>hah</p>
            <p>{accountId}</p>
            <p>{JSON.stringify(accounts)}</p>
            <button onClick={connectWalletHandler}>Connect Wallet</button>
        </div>
    )
}
