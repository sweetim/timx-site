"use client"

import { FC, useEffect, useState } from "react"
import { useWalletSelector } from "@/app/context/WalletSelectorContext"
import { COUNTER_ENTRY_FEE, CounterRecord, MIN_GAS_FEE, MethodName, queryAllRecords, getValue } from "../contract"

import Timeline from "./Timeline"

const Counter: FC = () => {
    const [records, setRecords] = useState<Array<CounterRecord>>([])
    const [value, setValue] = useState<string>("abs")

    const { selector, modal, accounts, accountId } = useWalletSelector()

    useEffect(() => {
        queryAllRecords().then(setRecords)
    }, [])

    useEffect(() => {
        getValue().then(setValue)
    }, [])

    function connectWalletHandler() {
        modal.show()
    }

    async function signOutHandler() {
        const wallet = await selector.wallet()
        await wallet.signOut()
    }

    async function incrementHandler() {
        const wallet = await selector.wallet()

        await wallet.signAndSendTransaction({
            signerId: accountId!,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: MethodName.Increment,
                        args: {},
                        gas: MIN_GAS_FEE,
                        deposit: COUNTER_ENTRY_FEE.toString(),
                    },
                },
            ],
        })
    }

    async function decrementHandler() {
        const wallet = await selector.wallet()

        await wallet.signAndSendTransaction({
            signerId: accountId!,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: MethodName.Decrement,
                        args: {},
                        gas: MIN_GAS_FEE,
                        deposit: COUNTER_ENTRY_FEE.toString(),
                    },
                },
            ],
        })
    }

    return (
        <div className="bg-white dark:bg-slate-800 h-screen">
            <nav className="bg-white border-gray-200 dark:bg-gray-900">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
                    <a href="https://flowbite.com" className="flex items-center">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">counter</span>
                    </a>
                    <div className="flex items-center">
                        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={connectWalletHandler}>Connect Wallet</button>
                        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={signOutHandler}>Sign Out</button>
                    </div>
                </div>
            </nav>

            <div className="flex justify-center items-center h-screen">
                <button onClick={incrementHandler} type="button" className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="sr-only">Increment</span>
                </button>

                <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                    {value}
                </h1>

                <button onClick={decrementHandler} type="button" className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                    </svg>
                    <span className="sr-only">Decrement</span>
                </button>

                <Timeline records={records} />

            </div>

        </div>
    )
}

export default Counter
