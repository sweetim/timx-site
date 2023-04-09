"use client"

import { FC, useEffect, useState } from "react"
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid"
import { COUNTER_ENTRY_FEE, MIN_GAS_FEE, MethodName, getValue } from "../contract";
import { useWalletSelector } from "@/app/context/WalletSelectorContext";

const ActionCounter: FC = () => {
    const { selector, accountId } = useWalletSelector();

    const [value, setValue] = useState<string>("")

    const isVisible = !!accountId

    useEffect(() => {
        getValue().then(setValue)
    }, []);

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
                className="border focus:ring-4 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-blue-500 text-blue-500 hover:text-white focus:ring-blue-800 hover:bg-blue-500">
                <PlusIcon className="w-6" />
                <span className="sr-only">Increment</span>
            </button>}

            <h1 className="m-6 text-9xl	font-extrabold text-white">
                {value}
            </h1>

            {isVisible && <button
                onClick={decrementHandler}
                type="button"
                className="border focus:ring-4 focus:outline-none font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center border-blue-500 text-blue-500 hover:text-white focus:ring-blue-800 hover:bg-blue-500">
                <MinusIcon className="w-6" />
                <span className="sr-only">Decrement</span>
            </button>}
        </div>
    )

}

export default ActionCounter
