"use client"

import { FC, useEffect, useState } from "react"
import { Mali } from 'next/font/google';

import { useWalletSelector } from "@/app/context/WalletSelectorContext"
import { COUNTER_ENTRY_FEE, CounterRecord, MIN_GAS_FEE, MethodName, queryAllRecords, getValue } from "../contract"

import Timeline from "./Timeline"
import Loading from "@/app/components/Loading";

const patrickHand = Mali({
    weight: '400',
    subsets: ["latin"],
})

const Counter: FC = () => {
    const [records, setRecords] = useState<Array<CounterRecord>>([])
    const [value, setValue] = useState<string>("")

    const { selector, modal, accountId } = useWalletSelector()

    useEffect(() => {
        queryAllRecords().then(setRecords)
    }, [])

    useEffect(() => {
        getValue().then(setValue)
    }, [])

    function connectHandler() {
        modal.show()
    }

    async function signOutHandler() {
        const wallet = await selector.wallet()
        await wallet.signOut()
    }

    async function signAndSendTransaction(methodName: string) {
        if (!accountId) {
            return;
        }

        const wallet = await selector.wallet()

        return await wallet.signAndSendTransaction({
            signerId: accountId,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName,
                        args: {},
                        gas: MIN_GAS_FEE,
                        deposit: COUNTER_ENTRY_FEE,
                    },
                },
            ],
        })
    }

    async function incrementHandler() {
        signAndSendTransaction(MethodName.Increment)
    }

    async function decrementHandler() {
        signAndSendTransaction(MethodName.Decrement)
    }

    return (
        <div className={`${patrickHand.className}`}>
            <nav>
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">{accountId}</span>
                    <div className="flex items-center">
                        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={connectHandler}>CONNECT</button>
                        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={signOutHandler}>Sign Out</button>
                    </div>
                </div>
            </nav>

            <div className="flex flex-row">
                <div className="grid grid-cols-1 gap-4 w-full md:grid-cols-2">
                    <div className="flex flex-col justify-center items-center mb-3 mt-10">
                        <button onClick={incrementHandler} type="button" className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="sr-only">Increment</span>
                        </button>

                        <h1 className="m-6 text-9xl	font-extrabold text-white">
                            {value}
                        </h1>

                        <button onClick={decrementHandler} type="button" className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                            </svg>
                            <span className="sr-only">Decrement</span>
                        </button>
                    </div>
                    <div className="pl-6 overflow-auto">
                        <Timeline records={records} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Counter
