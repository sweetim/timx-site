"use client"

import { FC, useEffect, useState } from "react"
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid"
import { COUNTER_ENTRY_FEE, MIN_GAS_FEE, MethodName, getValue } from "../contract";
import { useWalletSelector } from "@/app/context/WalletSelectorContext";

const ActionCounter: FC = () => {
    const { selector, accountId } = useWalletSelector();

    const [value, setValue] = useState<string>("")
    const [isVisible, setIsVisble] = useState(false)

    useEffect(() => {
        getValue().then(setValue)
    }, []);

    useEffect(() => {
        setIsVisble(!!accountId)
    }, [accountId])

    async function signAndSendTransaction(methodName: string) {
        if (!accountId) {
            return;
        }

        const wallet = await selector.wallet();

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
        <div className="flex flex-col justify-center items-center mb-3 mt-10">
            {isVisible && <button
                onClick={incrementHandler}
                type="button"
                className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                <PlusIcon className="w-6" />
                <span className="sr-only">Increment</span>
            </button>}

            <h1 className="m-6 text-9xl	font-extrabold text-white">
                {value}
            </h1>

            {isVisible && <button
                onClick={decrementHandler}
                type="button"
                className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                <MinusIcon className="w-6" />
                <span className="sr-only">Decrement</span>
            </button>}
        </div>
    )

}

export default ActionCounter
